import crypto from 'crypto';
import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// Cryptographic pepper for verifying passcode rule digests without storing plaintext suffixes
const RULE_PEPPER = 'txgcalc-clinical-rule-pepper-v2.1.9';
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  crypto.createHash('sha256').update(`${RULE_PEPPER}-hmac-session-key`).digest('hex');

const computeRuleDigest = (role: 'premium' | 'expert', suffix: string): string =>
  crypto.createHmac('sha256', RULE_PEPPER).update(`${role}:${suffix}`).digest('hex');

// Precomputed HMAC-SHA256 digests so plaintext suffix rules do not appear in source code
const EXPECTED_RULE_DIGESTS: Record<'premium' | 'expert', string> = {
  premium: process.env.PREMIUM_PASSCODE_SUFFIX
    ? computeRuleDigest('premium', process.env.PREMIUM_PASSCODE_SUFFIX)
    : 'eb404ba673888d261dc580156d3f44b5a2865c2974b829cf9157c3e4a0b92892',
  expert: process.env.EXPERT_PASSCODE_SUFFIX
    ? computeRuleDigest('expert', process.env.EXPERT_PASSCODE_SUFFIX)
    : 'fbd4e320c4834ee71b3a8caffe8e3e2814e2321a5483b525eb16ba7762c87cb6',
};

interface SessionPayload {
  role: 'premium' | 'expert';
  iat: number;
  exp: number;
  nonce: string;
}

const signSessionToken = (role: 'premium' | 'expert'): string => {
  const payload: SessionPayload = {
    role,
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    nonce: crypto.randomBytes(12).toString('hex'),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encodedPayload)
    .digest('base64url');
  return `${encodedPayload}.${signature}`;
};

const verifySessionToken = (token?: string | null): SessionPayload | null => {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encodedPayload, providedSig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  const sigBufA = Buffer.from(providedSig, 'utf8');
  const sigBufB = Buffer.from(expectedSig, 'utf8');
  if (sigBufA.length !== sigBufB.length || !crypto.timingSafeEqual(sigBufA, sigBufB)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    ) as SessionPayload;
    if (!payload || (payload.role !== 'premium' && payload.role !== 'expert')) return null;
    if (typeof payload.exp !== 'number' || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
};

// Brute-force & probing protection per client IP
interface RateLimitRecord {
  failures: number;
  lockedUntil: number;
  lastAttempt: number;
}
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 10 * 60 * 1000; // 10 minutes
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const rateLimitMap = new Map<string, RateLimitRecord>();

const getClientKey = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = Array.isArray(forwarded)
    ? forwarded[0]
    : typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : req.socket.remoteAddress || 'unknown';
  return ip;
};

const uniformDelay = (minMs = 340, maxMs = 540): Promise<void> => {
  const delay = minMs + crypto.randomInt(0, maxMs - minMs);
  return new Promise((resolve) => setTimeout(resolve, delay));
};

// Protected clinical assets mapped to opaque resource keys
const PROTECTED_RESOURCES: Record<
  string,
  { relPath: string; contentType: string; expertOnly?: boolean }
> = {
  'gp-atlas': { relPath: 'public/atlas.pdf', contentType: 'application/pdf' },
  'dbac-male': { relPath: 'public/Male.pdf', contentType: 'application/pdf' },
  'dbac-female': { relPath: 'public/Female Atlas.pdf', contentType: 'application/pdf' },
  'sauve-method': { relPath: 'public/Sauvegrain 01.jpg', contentType: 'image/jpeg' },
  'sauve-boy': { relPath: 'public/Sauve Boy Result.png', contentType: 'image/png' },
  'sauve-girl': { relPath: 'public/Sauve Girl Result.png', contentType: 'image/png' },
  'sig-expert': {
    relPath: 'public/assets/aistudio/IMG_8037_5c4ef58d.jpeg',
    contentType: 'image/jpeg',
    expertOnly: true,
  },
};

// Direct public URL paths that must be blocked from unauthenticated/direct browser scraping
const BLOCKED_DIRECT_PATHS = new Set([
  '/atlas.pdf',
  '/male.pdf',
  '/female atlas.pdf',
  '/sauvegrain 01.jpg',
  '/sauve boy result.png',
  '/sauve girl result.png',
  '/assets/aistudio/img_8037_5c4ef58d.jpeg',
]);

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '64kb' }));

  // Global security headers
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    next();
  });

  // Block direct unauthenticated access to protected clinical files & source maps
  app.use((req: Request, res: Response, next: NextFunction) => {
    const decodedPath = decodeURIComponent(req.path).toLowerCase();
    if (
      BLOCKED_DIRECT_PATHS.has(decodedPath) ||
      decodedPath.endsWith('.map')
    ) {
      res.status(403).json({ error: 'Direct resource inspection is forbidden.' });
      return;
    }
    next();
  });

  // POST /api/auth/verify - Constant-time rule verification with brute-force lockout
  app.post('/api/auth/verify', async (req: Request, res: Response) => {
    const clientKey = getClientKey(req);
    const now = Date.now();
    const record = rateLimitMap.get(clientKey) || {
      failures: 0,
      lockedUntil: 0,
      lastAttempt: now,
    };

    if (record.lockedUntil > now) {
      await uniformDelay();
      const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      res.status(429).json({
        ok: false,
        locked: true,
        remainingSeconds,
        error: `Tạm khóa do nhập sai nhiều lần. Vui lòng thử lại sau ${remainingSeconds} giây.`,
      });
      return;
    }

    if (now - record.lastAttempt > ATTEMPT_WINDOW_MS) {
      record.failures = 0;
    }
    record.lastAttempt = now;

    await uniformDelay();

    const { tab, passcode } = req.body || {};
    const role: 'premium' | 'expert' = tab === 'expert' ? 'expert' : 'premium';
    const rawCode = typeof passcode === 'string' ? passcode.trim() : '';

    let isValid = false;
    if (rawCode.length >= 2 && rawCode.length <= 64) {
      const candidateSuffix = rawCode.slice(-2);
      const candidateDigest = computeRuleDigest(role, candidateSuffix);
      const expectedDigest = EXPECTED_RULE_DIGESTS[role];

      const bufA = Buffer.from(candidateDigest, 'hex');
      const bufB = Buffer.from(expectedDigest, 'hex');
      if (bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)) {
        isValid = true;
      }
    }

    if (!isValid) {
      record.failures += 1;
      if (record.failures >= MAX_FAILED_ATTEMPTS) {
        record.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      }
      rateLimitMap.set(clientKey, record);
      const remainingAttempts = Math.max(0, MAX_FAILED_ATTEMPTS - record.failures);
      res.status(401).json({
        ok: false,
        remainingAttempts,
        locked: record.lockedUntil > Date.now(),
        error:
          remainingAttempts > 0
            ? `Mã truy cập không hợp lệ (còn ${remainingAttempts} lần thử).`
            : 'Tạm khóa truy cập 10 phút do nhập sai quá 5 lần.',
      });
      return;
    }

    rateLimitMap.delete(clientKey);
    const token = signSessionToken(role);
    res.json({
      ok: true,
      role,
      token,
    });
  });

  // GET /api/auth/session - Verify HMAC session token integrity
  app.get('/api/auth/session', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const token =
      typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7).trim()
        : null;
    const payload = verifySessionToken(token);
    if (!payload) {
      res.status(401).json({ authenticated: false });
      return;
    }
    res.json({
      authenticated: true,
      role: payload.role,
    });
  });

  // GET /api/resource/:key - Stream protected clinical resources only to authenticated sessions
  app.get('/api/resource/:key', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const clientMarker = req.headers['x-txg-client'];
    const token =
      typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7).trim()
        : null;
    const payload = verifySessionToken(token);

    if (!payload || clientMarker !== 'TxgCalc-2.1.9') {
      res.status(403).json({ error: 'Unauthorized resource access.' });
      return;
    }

    const resourceKey = req.params.key;
    const resourceConfig = PROTECTED_RESOURCES[resourceKey];
    if (!resourceConfig) {
      res.status(404).json({ error: 'Resource not found.' });
      return;
    }

    if (resourceConfig.expertOnly && payload.role !== 'expert') {
      res.status(403).json({ error: 'Insufficient role privilege.' });
      return;
    }

    const absFilePath = path.resolve(__dirname, resourceConfig.relPath);
    if (!fs.existsSync(absFilePath)) {
      res.status(404).json({ error: 'Resource file missing.' });
      return;
    }

    res.setHeader('Content-Type', resourceConfig.contentType);
    res.setHeader('Cache-Control', 'private, no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const stream = fs.createReadStream(absFilePath);
    stream.on('error', () => {
      if (!res.headersSent) {
        res.status(500).end();
      }
    });
    stream.pipe(res);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TxgCalc secure server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
