const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Docx logo scale
code = code.replace(
  /const scale = Math\.min\(60 \/ img\.height, 150 \/ img\.width\);/,
  'const scale = Math.min(150 / img.height, 350 / img.width);'
);

// 2. PDF logo size
code = code.replace(
  /<img src="\/logo\.png" style="max-height: 15mm; object-fit: contain;" onerror="this\.style\.display='none'" \/>/,
  '<img src="/logo.png" style="max-width: 50%; max-height: 35mm; object-fit: contain;" onerror="this.style.display=\\\'none\\\'" />'
);

// 3. Login spacing
const targetLogin = `<div className="text-center space-y-2 flex flex-col items-center">
              <img src="/logo.png" alt="Logo" className="h-24 sm:h-32 w-auto object-contain mb-4" onError={(e) => e.currentTarget.style.display = 'none'} />
              <p className="text-zinc-500 text-sm">Vui lòng đăng nhập để sử dụng ứng dụng</p>
            </div>`;

const replacementLogin = `<div className="text-center flex flex-col items-center">
              <img src="/logo.png" alt="Logo" className="h-24 sm:h-32 w-auto object-contain mb-1" onError={(e) => e.currentTarget.style.display = 'none'} />
              <p className="text-zinc-500 text-sm mt-2">Vui lòng đăng nhập để sử dụng ứng dụng</p>
            </div>`;

code = code.replace(targetLogin, replacementLogin);

fs.writeFileSync('src/App.tsx', code);
