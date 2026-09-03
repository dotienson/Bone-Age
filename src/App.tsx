import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Copy, Check, CheckCheck, Info, Languages, User, FileText, Search, Lock, Camera, Upload, Eye, EyeOff, X, RotateCcw, LogOut, ChevronDown, Download, FileType, Dog, BookOpen, Contrast, Columns, FlipHorizontal, FlipVertical } from 'lucide-react';
import { Document as DocxDocument, Packer, Paragraph, TextRun, AlignmentType, SectionType, BorderStyle, PageBorderDisplay, PageBorderOffsetFrom, Table, TableRow, TableCell, WidthType, VerticalAlign, UnderlineType, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import { Document, Page, pdfjs } from 'react-pdf';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot, AreaChart, Area, ReferenceArea } from 'recharts';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from './utils/cropImage';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ATLAS_DATA, AtlasEntry } from './data';
import { DBAC_DATA_BOY } from './dbac_data';
import { DBAC_DATA_GIRL } from './dbac_data_girl';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const MagnifiablePage = ({ pageNumber, width, isActive, cropTopTwoThirds }: { pageNumber: number, width: number, isActive: boolean, cropTopTwoThirds?: boolean }) => {
  const ZOOM_LEVEL = 2;
  const LOUPE_SIZE = 220;
  const containerRef = useRef<HTMLDivElement>(null);
  const loupeRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isActive || !containerRef.current || !loupeRef.current || !innerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    loupeRef.current.style.opacity = '1';
    loupeRef.current.style.visibility = 'visible';
    loupeRef.current.style.display = 'block';
    
    loupeRef.current.style.left = `${x - LOUPE_SIZE / 2}px`;
    loupeRef.current.style.top = `${y - LOUPE_SIZE / 2}px`;
    
    innerRef.current.style.left = `${-x * ZOOM_LEVEL + LOUPE_SIZE / 2}px`;
    innerRef.current.style.top = `${-y * ZOOM_LEVEL + LOUPE_SIZE / 2}px`;
  };

  const handleMouseLeave = () => {
    if (loupeRef.current) {
      loupeRef.current.style.opacity = '0';
      loupeRef.current.style.visibility = 'hidden';
      loupeRef.current.style.display = 'none';
    }
  };

  return (
    <div 
      className={`relative ${isActive ? 'cursor-none' : ''} ${cropTopTwoThirds ? 'overflow-hidden' : ''} flex-shrink-0 touch-none`}
      style={cropTopTwoThirds ? { height: width * 1.35 * 0.67, width } : { width }}
      ref={containerRef}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onTouchStart={handleMouseMove}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseLeave}
      onTouchCancel={handleMouseLeave}
    >
      <Page 
        pageNumber={pageNumber} 
        renderTextLayer={false}
        renderAnnotationLayer={false}
        width={width}
        className={`bg-white ${isActive ? 'cursor-none' : ''}`}
      />
      {isActive && (
        <div
          ref={loupeRef}
          className="absolute pointer-events-none border-2 border-emerald-500 rounded-xl overflow-hidden shadow-2xl z-50 bg-white"
          style={{
            opacity: 0,
            visibility: 'hidden',
            width: LOUPE_SIZE,
            height: LOUPE_SIZE,
            transition: 'opacity 0.1s ease',
          }}
        >
          <div
            ref={innerRef}
            style={{
              position: 'absolute',
              willChange: 'left, top',
            }}
          >
            <Page 
              pageNumber={pageNumber} 
              renderTextLayer={false}
              renderAnnotationLayer={false}
              width={width * ZOOM_LEVEL}
              className="bg-white pointer-events-none"
            />
          </div>
          <svg 
            className="absolute top-1/2 left-1/2 w-[25px] h-[25px] -translate-x-1/2 translate-y-0 text-red-600 drop-shadow-[0_0_5px_rgba(220,38,38,1)] pointer-events-none animate-pulse mt-[2px]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinejoin="round" d="M12 2 L22 22 L2 22 Z" />
          </svg>
        </div>
      )}
    </div>
  );
};

const MagnifiableImage = ({ src, isActive }: { src: string, isActive: boolean }) => {
  const ZOOM_LEVEL = 2;
  const LOUPE_SIZE = 200;
  const imgRef = useRef<HTMLImageElement>(null);
  const loupeRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isActive || !imgRef.current || !loupeRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    loupeRef.current.style.display = 'block';
    loupeRef.current.style.left = `${x - LOUPE_SIZE / 2}px`;
    loupeRef.current.style.top = `${y - LOUPE_SIZE / 2}px`;
    loupeRef.current.style.backgroundSize = `${imgRef.current.clientWidth * ZOOM_LEVEL}px ${imgRef.current.clientHeight * ZOOM_LEVEL}px`;
    loupeRef.current.style.backgroundPosition = `-${x * ZOOM_LEVEL - LOUPE_SIZE / 2}px -${y * ZOOM_LEVEL - LOUPE_SIZE / 2}px`;
  };

  const handleMouseLeave = () => {
    if (loupeRef.current) {
      loupeRef.current.style.display = 'none';
    }
  };

  return (
    <div 
      className={`relative inline-block max-w-full max-h-[800px] ${isActive ? 'cursor-none' : ''} touch-none`}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onTouchStart={handleMouseMove}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseLeave}
      onTouchCancel={handleMouseLeave}
    >
      <img
        ref={imgRef}
        src={src}
        alt="Patient X-ray"
        className={`max-w-full max-h-[800px] object-contain rounded-xl border border-white/10 bg-black ${isActive ? 'cursor-none' : ''}`}
      />
      {isActive && (
        <div
          ref={loupeRef}
          className="absolute pointer-events-none border-2 border-emerald-500 rounded-xl shadow-2xl z-50 bg-no-repeat bg-[#111]"
          style={{
            display: 'none',
            width: LOUPE_SIZE,
            height: LOUPE_SIZE,
            backgroundImage: `url(${src})`,
          }}
        >
          <svg 
            className="absolute top-1/2 left-1/2 w-[25px] h-[25px] -translate-x-1/2 translate-y-0 text-red-600 drop-shadow-[0_0_5px_rgba(220,38,38,1)] pointer-events-none animate-pulse mt-[2px]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinejoin="round" d="M12 2 L22 22 L2 22 Z" />
          </svg>
        </div>
      )}
    </div>
  );
};

type PatientRecord = {
  id: string;
  patientName: string;
  patientId: string;
  realAgeYears: number;
  realAgeMonths: number;
  gender: 'boy' | 'girl';
  clinicalReason: string;
  examDate: string;
  boneAge1: string; // Glisanz-Osman
  boneAge2: string; // Gaskin et al
  createdAt: number;
};

const capitalizeNameWords = (str: string) => {
  return str.split(/\s+/).map(word => {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
};

const BRUSH_DATA_BOY = [
  { ageM: 3, sd: 0.69 },
  { ageM: 6, sd: 1.13 },
  { ageM: 9, sd: 1.43 },
  { ageM: 12, sd: 1.97 },
  { ageM: 18, sd: 3.52 },
  { ageM: 24, sd: 3.92 },
  { ageM: 30, sd: 4.52 },
  { ageM: 36, sd: 5.08 },
  { ageM: 42, sd: 5.40 },
  { ageM: 48, sd: 6.66 },
  { ageM: 54, sd: 8.36 },
  { ageM: 60, sd: 8.79 },
  { ageM: 72, sd: 9.17 },
  { ageM: 84, sd: 8.91 },
  { ageM: 96, sd: 9.10 },
  { ageM: 108, sd: 9.00 },
  { ageM: 120, sd: 9.79 },
  { ageM: 132, sd: 10.09 },
  { ageM: 144, sd: 10.38 },
  { ageM: 156, sd: 10.44 },
  { ageM: 168, sd: 10.72 },
  { ageM: 180, sd: 11.32 },
  { ageM: 192, sd: 12.86 },
  { ageM: 204, sd: 13.05 }
];

const BRUSH_DATA_GIRL = [
  { ageM: 3, sd: 0.72 },
  { ageM: 6, sd: 1.16 },
  { ageM: 9, sd: 1.36 },
  { ageM: 12, sd: 1.77 },
  { ageM: 18, sd: 3.49 },
  { ageM: 24, sd: 4.64 },
  { ageM: 30, sd: 5.37 },
  { ageM: 36, sd: 5.97 },
  { ageM: 42, sd: 7.48 },
  { ageM: 48, sd: 8.98 },
  { ageM: 54, sd: 10.73 },
  { ageM: 60, sd: 11.65 },
  { ageM: 72, sd: 10.23 },
  { ageM: 84, sd: 9.64 },
  { ageM: 96, sd: 10.23 },
  { ageM: 108, sd: 10.74 },
  { ageM: 120, sd: 11.73 },
  { ageM: 132, sd: 11.94 },
  { ageM: 144, sd: 10.24 },
  { ageM: 156, sd: 10.67 },
  { ageM: 168, sd: 11.30 },
  { ageM: 180, sd: 9.23 },
  { ageM: 192, sd: 7.31 }
];

const BX_CHINA05_CORRECTIONS = [
  { age: 2.0, boy: 0.0, girl: -0.2 },
  { age: 2.5, boy: -0.1, girl: -0.2 },
  { age: 3.0, boy: -0.2, girl: 0.1 },
  { age: 3.5, boy: -0.2, girl: 0.3 },
  { age: 4.0, boy: -0.1, girl: 0.4 },
  { age: 4.5, boy: -0.0, girl: 0.4 },
  { age: 5.0, boy: 0.0, girl: 0.3 },
  { age: 5.5, boy: 0.1, girl: 0.1 },
  { age: 6.0, boy: 0.2, girl: -0.1 },
  { age: 6.5, boy: 0.3, girl: -0.1 },
  { age: 7.0, boy: 0.5, girl: 0.2 },
  { age: 7.5, boy: 0.6, girl: 0.3 },
  { age: 8.0, boy: 0.5, girl: 0.2 },
  { age: 8.5, boy: 0.4, girl: 0.1 },
  { age: 9.0, boy: 0.3, girl: -0.0 },
  { age: 9.5, boy: 0.2, girl: -0.1 },
  { age: 10.0, boy: 0.1, girl: -0.1 },
  { age: 10.5, boy: 0.0, girl: -0.2 },
  { age: 11.0, boy: -0.1, girl: -0.2 },
  { age: 11.5, boy: -0.2, girl: -0.3 },
  { age: 12.0, boy: -0.4, girl: -0.5 },
  { age: 12.5, boy: -0.5, girl: -0.6 },
  { age: 13.0, boy: -0.4, girl: -0.7 },
  { age: 13.5, boy: -0.4, girl: -0.8 },
  { age: 14.0, boy: -0.4, girl: -0.9 },
  { age: 14.5, boy: -0.5, girl: -1.0 },
  { age: 15.0, boy: -0.7, girl: -1.2 },
  { age: 15.5, boy: -0.9, girl: -1.2 },
  { age: 16.0, boy: -1.0, girl: -1.1 },
  { age: 16.5, boy: -1.1, girl: -1.1 },
  { age: 17.0, boy: -1.2, girl: -1.2 }
];

function getBxChina05Age(baDecimal: number, gender: 'boy' | 'girl') {
  if (baDecimal < 2.0) {
    return baDecimal + BX_CHINA05_CORRECTIONS[0][gender];
  }
  if (baDecimal >= 17.0) {
    return baDecimal + BX_CHINA05_CORRECTIONS[BX_CHINA05_CORRECTIONS.length - 1][gender];
  }
  
  for (let i = 0; i < BX_CHINA05_CORRECTIONS.length - 1; i++) {
    const lower = BX_CHINA05_CORRECTIONS[i];
    const upper = BX_CHINA05_CORRECTIONS[i + 1];
    if (baDecimal >= lower.age && baDecimal <= upper.age) {
      const fraction = (baDecimal - lower.age) / (upper.age - lower.age);
      const correction = lower[gender] + fraction * (upper[gender] - lower[gender]);
      return baDecimal + correction;
    }
  }
  return baDecimal;
}

const getInitialDraft = () => {
  try {
    const auth = localStorage.getItem('boneAgeAuth');
    const key = auth === 'expert' ? 'dualGP_draft_state_expert' : 'dualGP_draft_state_premium';
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return {};
};

const generateNormalDistributionData = () => {
  const data = [];
  for (let i = -4; i <= 4; i += 0.1) {
    const x = Number(i.toFixed(1));
    const y = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-(x * x) / 2);
    data.push({ x, y });
  }
  return data;
};

const NormalDistributionChart = ({ zScores }: { zScores: { name: string, z: number, color: string }[] }) => {
  const data = useMemo(() => generateNormalDistributionData(), []);
  
  const minZ = Math.min(...zScores.map(z => z.z), -4);
  const maxZ = Math.max(...zScores.map(z => z.z), 4);
  const domainMin = Math.floor(minZ) - 0.5;
  const domainMax = Math.ceil(maxZ) + 0.5;
  const range = domainMax - domainMin;
  const getPercent = (val: number) => `${((val - domainMin) / range) * 100}%`;
  
  return (
    <div className="w-full mt-2">
      {/* Desktop View: Bell Curve */}
      <div className="hidden md:block w-full h-56 mx-auto mb-6 max-w-2xl">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 30, bottom: 0, left: 30 }}>
            {/* Shaded area for -2 to +2 Z-score */}
            {/* @ts-ignore */}
            <ReferenceArea x1={-2} x2={2} fill="#ecfdf5" fillOpacity={1} />
            
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
            <XAxis 
              dataKey="x" 
              type="number" 
              domain={[domainMin, domainMax]} 
              ticks={[-4, -3, -2, -1, 0, 1, 2, 3, 4].filter(t => t >= domainMin && t <= domainMax)} 
              tick={{ fontSize: 13, fill: '#64748b' }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
              dy={10}
            />
            <YAxis hide />
            <Tooltip 
              formatter={(value: any, name: any) => {
                if (name === 'Phân bố bình thường') return [Number(value).toFixed(3), 'Xác suất'];
                return null;
              }}
              labelFormatter={(label) => `Z = ${label}`}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Area type="monotone" dataKey="y" name="Phân bố bình thường" stroke="#94a3b8" fill="none" strokeWidth={3} />
            
            <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="3 3" />
            <ReferenceLine x={-2} stroke="#10b981" strokeDasharray="3 3" label={{ value: '-2SD', position: 'top', fill: '#059669', fontSize: 13, fontWeight: 'bold' }} />
            <ReferenceLine x={2} stroke="#10b981" strokeDasharray="3 3" label={{ value: '+2SD', position: 'top', fill: '#059669', fontSize: 13, fontWeight: 'bold' }} />
            
            {zScores.map((zObj, idx) => (
              <ReferenceLine 
                  key={`line-${idx}`}
                  x={zObj.z} 
                  stroke={zObj.color} 
                  strokeWidth={2.5} 
              />
            ))}
            {zScores.map((zObj, idx) => (
              <ReferenceDot 
                key={`dot-${idx}`} 
                x={zObj.z} 
                y={(1 / Math.sqrt(2 * Math.PI)) * Math.exp(-(zObj.z * zObj.z) / 2)} 
                r={6} 
                fill={zObj.color} 
                stroke="white" 
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Mobile View: 1D Line */}
      <div className="md:hidden mt-8 mb-10 mx-2">
        <div className="w-full relative h-12">
          {/* Main axis line */}
          <div className="absolute top-1/2 left-0 w-full h-1.5 bg-gray-200 -mt-[3px] rounded-full" />
          
          {/* -2 to +2 shaded zone */}
          <div 
             className="absolute top-1/2 h-1.5 bg-[#d1fae5] -mt-[3px] opacity-80" 
             style={{ 
               left: getPercent(-2), 
               width: `${(4 / range) * 100}%` 
             }} 
          />
          
          {/* Ticks */}
          {[-4, -3, -2, -1, 0, 1, 2, 3, 4].filter(t => t >= domainMin && t <= domainMax).map(tick => (
            <div key={`tick-${tick}`} className="absolute top-1/2 w-[2px] h-3 bg-gray-400 -mt-1.5" style={{ left: getPercent(tick) }}>
              <span className="absolute top-5 left-1/2 -translate-x-1/2 text-[11px] text-gray-500 font-medium">{tick}</span>
              {Math.abs(tick) === 2 && (
                <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs font-bold text-emerald-600 whitespace-nowrap">
                  {tick > 0 ? '+2SD' : '-2SD'}
                </span>
              )}
            </div>
          ))}
          
          {/* ZScores Dots */}
          {zScores.map((zObj, idx) => (
            <div 
              key={`mob-z-${idx}`} 
              className="absolute top-1/2 z-10 w-[18px] h-[18px] rounded-full shadow-sm" 
              style={{ left: `calc(${getPercent(zObj.z)} - 9px)`, backgroundColor: zObj.color, border: '3px solid white', marginTop: '-9px' }}
            />
          ))}
        </div>
      </div>

      {/* Legend & Annotation */}
      <div className="mt-2 flex flex-col items-center gap-3">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {zScores.map(zObj => (
            <div key={zObj.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: zObj.color }} />
              <span className="text-sm font-semibold text-zinc-700">{zObj.name} (Z = {zObj.z.toFixed(2)})</span>
            </div>
          ))}
        </div>
        <p className="text-[13px] text-zinc-500 text-center mt-1 italic max-w-md">
          Z-Score dựa vào Brush data, Stanford<br className="sm:hidden" />(Greulich & Pyle, 1959)
        </p>
      </div>
    </div>
  );
};

// We get the draft once per component mount
export default function App() {
  const initialDraft = useMemo(() => getInitialDraft(), []);
  
  const [realAgeYears, setRealAgeYears] = useState<number>(initialDraft.realAgeYears ?? 0);
  const [realAgeMonths, setRealAgeMonths] = useState<number>(initialDraft.realAgeMonths ?? 0);
  const [isAgeManuallySet, setIsAgeManuallySet] = useState<boolean>(initialDraft.isAgeManuallySet ?? false);
  const [gender, setGender] = useState<'boy' | 'girl'>(initialDraft.gender ?? 'girl');
  const currentDbacData = gender === 'boy' ? DBAC_DATA_BOY : DBAC_DATA_GIRL;
  const [copied, setCopied] = useState(false);
  const [finalAgeYears, setFinalAgeYears] = useState<number | ''>(initialDraft.finalAgeYears ?? '');
  const [finalAgeMonths, setFinalAgeMonths] = useState<number | ''>(initialDraft.finalAgeMonths ?? '');
  const [clinicalReason, setClinicalReason] = useState<string>(initialDraft.clinicalReason ?? 'Đánh giá tăng trưởng');
  const clinicalOptions = ['Sàng lọc dậy thì sớm', 'Đánh giá tăng trưởng', 'Đánh giá bệnh lý', 'Lý do khác'];
  const [isMagnifierActive, setIsMagnifierActive] = useState(false);
  const [isXrayMagnifierActive, setIsXrayMagnifierActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [xrayImage, setXrayImage] = useState<string | null>(null);
  const [unprocessedXrayImage, setUnprocessedXrayImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [aspect, setAspect] = useState<number>(1);
  const [originalAspect, setOriginalAspect] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isXrayVisible, setIsXrayVisible] = useState(true);
  const [isGpVisible, setIsGpVisible] = useState(true);
  const [isGaskinVisible, setIsGaskinVisible] = useState(true);

  const [isPatientConfirmed, setIsPatientConfirmed] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [exportAction, setExportAction] = useState<'docx' | 'pdf' | 'reset' | null>(null);
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  const [patientName, setPatientName] = useState(() => {
    if (initialDraft.patientName) return initialDraft.patientName;
    const auth = localStorage.getItem('boneAgeAuth');
    if (auth === 'premium' || auth === 'expert') {
      const d = new Date();
      const hhmm = `${d.getHours().toString().padStart(2, '0')}${d.getMinutes().toString().padStart(2, '0')}`;
      return `Ẩn danh ${hhmm}`;
    }
    return '';
  });
  const [patientId, setPatientId] = useState(() => {
    if (initialDraft.patientId) return initialDraft.patientId;
    const auth = localStorage.getItem('boneAgeAuth');
    if (auth === 'premium' || auth === 'expert') {
      const d = new Date();
      const ddmmyyyy = `${d.getDate().toString().padStart(2, '0')}${(d.getMonth()+1).toString().padStart(2, '0')}${d.getFullYear()}`;
      return `TA ${ddmmyyyy}`;
    }
    return '';
  });
  const [dob, setDob] = useState<string>(initialDraft.dob ?? '');
  const [examDate, setExamDate] = useState(() => {
    if (initialDraft.examDate) return initialDraft.examDate;
    const d = new Date();
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  });
  const [showRef, setShowRef] = useState(false);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isExpertMode, setIsExpertMode] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [loginTab, setLoginTab] = useState<'premium' | 'expert'>(initialDraft.loginTab ?? 'premium');
  
  const [dbacIndex, setDbacIndex] = useState(0);
  const [dbacSelections, setDbacSelections] = useState<Record<string, 'yes' | 'maybe' | 'no'>>(initialDraft.dbacSelections ?? {});
  const [dbacOtherFeatures, setDbacOtherFeatures] = useState<string>(initialDraft.dbacOtherFeatures ?? '');
  const [dbacBoneAgeYears, setDbacBoneAgeYears] = useState<number | ''>(initialDraft.dbacBoneAgeYears ?? '');
  const [dbacBoneAgeMonths, setDbacBoneAgeMonths] = useState<number | ''>(initialDraft.dbacBoneAgeMonths ?? '');
  const [hasAbnormality, setHasAbnormality] = useState<boolean>(initialDraft.hasAbnormality ?? false);
  const [abnormalityDetails, setAbnormalityDetails] = useState<string>(initialDraft.abnormalityDetails ?? '');
  const [dbacNumPages, setDbacNumPages] = useState<number | null>(null);
  const [dbacPageNumber, setDbacPageNumber] = useState<number>(1);
  const [isDbacMagnifierActive, setIsDbacMagnifierActive] = useState(false);
  
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const atlas1Ref = useRef<HTMLDivElement>(null);
  const atlas2Ref = useRef<HTMLDivElement>(null);
  const [activeAtlasView, setActiveAtlasView] = useState<1 | 2 | null>(null);
  const [vicenteViewMode, setVicenteViewMode] = useState<'single' | 'duet' | 'compare'>('single');

  const [patientRecords, setPatientRecords] = useState<PatientRecord[]>(() => {
    const auth = localStorage.getItem('boneAgeAuth');
    const key = auth === 'expert' ? 'dualGP_patients_expert' : 'dualGP_patients_premium';
    const saved = localStorage.getItem(key);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  useEffect(() => {
    const key = isExpertMode ? 'dualGP_patients_expert' : 'dualGP_patients_premium';
    localStorage.setItem(key, JSON.stringify(patientRecords));
  }, [patientRecords, isExpertMode]);

  const handleSavePatient = () => {
    const record: PatientRecord = {
      id: Date.now().toString(),
      patientName,
      patientId,
      realAgeYears,
      realAgeMonths,
      gender,
      clinicalReason,
      examDate,
      boneAge1: expertBoneAgeYears !== '' ? `${expertBoneAgeYears} tuổi ${expertBoneAgeMonths || 0} tháng` : '',
      boneAge2: dbacBoneAgeYears !== '' ? `${dbacBoneAgeYears} tuổi ${dbacBoneAgeMonths || 0} tháng` : '',
      createdAt: Date.now()
    };
    setPatientRecords(prev => [record, ...prev]);
  };

  const handleDeleteRecord = (id: string) => {
    setPatientRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleExportRecords = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(patientRecords, null, 2));
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    const fileName = `Du lieu Tuoi xuong ${hours}h${minutes} ${day}-${month}-${year} ProBA.json`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportRecords = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          setPatientRecords(prev => {
            const combined = [...prev, ...imported];
            const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
            return unique.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          });
        } else {
          alert('Sai định dạng file backup.');
        }
      } catch (err) {
        alert('Lỗi khi đọc file backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset input
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target === atlas1Ref.current) setActiveAtlasView(1);
          if (entry.target === atlas2Ref.current) setActiveAtlasView(2);
        } else {
          setActiveAtlasView(prev => {
            if (prev === 1 && entry.target === atlas1Ref.current) return null;
            if (prev === 2 && entry.target === atlas2Ref.current) return null;
            return prev;
          });
        }
      });
    }, { threshold: 0.5 });
    
    if (atlas1Ref.current) observer.observe(atlas1Ref.current);
    if (atlas2Ref.current) observer.observe(atlas2Ref.current);
    
    return () => observer.disconnect();
  }, [isExpertMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        if (activeAtlasView === 1 && pageNumber > 1) {
          e.preventDefault();
          setPageNumber(p => p - 1);
        } else if (activeAtlasView === 2 && dbacPageNumber > 1) {
          e.preventDefault();
          setDbacPageNumber(p => p - 1);
          setDbacIndex(prev => Math.max(0, prev - 1));
        }
      } else if (e.key === 'ArrowRight') {
        if (activeAtlasView === 1 && numPages && pageNumber < numPages) {
          e.preventDefault();
          setPageNumber(p => p + 1);
        } else if (activeAtlasView === 2 && dbacNumPages && dbacPageNumber < dbacNumPages) {
          e.preventDefault();
          setDbacPageNumber(p => p + 1);
          setDbacIndex(prev => Math.min(currentDbacData.length - 1, prev + 1));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeAtlasView, pageNumber, numPages, dbacPageNumber, dbacNumPages, gender]);

  useEffect(() => {
    const savedAuth = localStorage.getItem('boneAgeAuth');
    if (savedAuth === 'premium') {
      setIsAuthenticated(true);
      setIsExpertMode(false);
    } else if (savedAuth === 'expert') {
      setIsAuthenticated(true);
      setIsExpertMode(true);
    }
  }, []);
  
  const [expertBoneAgeYears, setExpertBoneAgeYears] = useState<number | ''>(initialDraft.expertBoneAgeYears ?? '');
  const [expertBoneAgeMonths, setExpertBoneAgeMonths] = useState<number | ''>(initialDraft.expertBoneAgeMonths ?? '');
  const [sauvegrainScore1, setSauvegrainScore1] = useState<number | ''>(initialDraft.sauvegrainScore1 ?? '');
  const [sauvegrainScore2, setSauvegrainScore2] = useState<number | ''>(initialDraft.sauvegrainScore2 ?? '');
  const [sauvegrainScore3, setSauvegrainScore3] = useState<number | ''>(initialDraft.sauvegrainScore3 ?? '');
  const [sauvegrainScore4, setSauvegrainScore4] = useState<number | ''>(initialDraft.sauvegrainScore4 ?? '');
  const [sauvegrainAgeYears, setSauvegrainAgeYears] = useState<number | ''>(initialDraft.sauvegrainAgeYears ?? '');
  const [sauvegrainAgeMonths, setSauvegrainAgeMonths] = useState<number | ''>(initialDraft.sauvegrainAgeMonths ?? '');
  const [isSauvegrainVisible, setIsSauvegrainVisible] = useState<boolean>(false);
  const [xrayDate, setXrayDate] = useState<string>(() => {
    if (initialDraft.xrayDate) return initialDraft.xrayDate;
    const d = new Date();
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  });
  const [xrayLocation, setXrayLocation] = useState<string>(initialDraft.xrayLocation ?? 'BVĐK Tâm Anh');
  const [xrayQuality, setXrayQuality] = useState<string>(initialDraft.xrayQuality ?? 'Đạt');

  const [pendingAdminChange, setPendingAdminChange] = useState<{updater: Function, newValue: any} | null>(null);

  const confirmAdminChange = () => {
    if (pendingAdminChange) {
      pendingAdminChange.updater(pendingAdminChange.newValue);
      setExpertBoneAgeYears('');
      setExpertBoneAgeMonths('');
      setDbacSelections({});
      setDbacBoneAgeYears('');
      setDbacBoneAgeMonths('');
      setDbacOtherFeatures('');
      setHasAbnormality(false);
      setAbnormalityDetails('');
      setFinalAgeYears('');
      setFinalAgeMonths('');
      setSauvegrainScore1('');
      setSauvegrainScore2('');
      setSauvegrainScore3('');
      setSauvegrainScore4('');
      setSauvegrainAgeYears('');
      setSauvegrainAgeMonths('');
      setPendingAdminChange(null);
    }
  };

  const cancelAdminChange = () => {
    setPendingAdminChange(null);
  };

  const handleAdminChangeAttempt = (newValue: any, updater: Function) => {
    const hasResults = expertBoneAgeYears !== '' || Object.keys(dbacSelections).length > 0 || (typeof dbacBoneAgeYears === 'number' && dbacBoneAgeYears >= 0) || dbacBoneAgeYears !== '' || sauvegrainAgeYears !== '';
    if (hasResults) {
      setPendingAdminChange({ updater, newValue });
    } else {
      updater(newValue);
    }
  };

  useEffect(() => {
    if (dob.length === 10 && examDate.length === 10) {
      const partsDob = dob.split('/');
      const partsExam = examDate.split('/');
      if (partsDob.length === 3 && partsExam.length === 3) {
        const d1 = new Date(Number(partsDob[2]), Number(partsDob[1]) - 1, Number(partsDob[0]));
        const d2 = new Date(Number(partsExam[2]), Number(partsExam[1]) - 1, Number(partsExam[0]));
        if (!isNaN(d1.getTime()) && !isNaN(d2.getTime()) && d2 >= d1) {
          let months = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
          if (d2.getDate() < d1.getDate()) {
            months--;
          }
          if (months >= 0) {
            let y = Math.floor(months / 12);
            if (y > 19) y = 19;
            setRealAgeYears(y);
            setRealAgeMonths(months % 12);
          }
        }
      }
    }
  }, [dob, examDate]);
  
  useEffect(() => {
    const draft = {
      realAgeYears,
      realAgeMonths,
      isAgeManuallySet,
      gender,
      finalAgeYears,
      finalAgeMonths,
      clinicalReason,
      patientName,
      patientId,
      dob,
      examDate,
      loginTab,
      dbacSelections,
      dbacOtherFeatures,
      dbacBoneAgeYears,
      dbacBoneAgeMonths,
      hasAbnormality,
      abnormalityDetails,
      expertBoneAgeYears,
      expertBoneAgeMonths,
      sauvegrainScore1,
      sauvegrainScore2,
      sauvegrainScore3,
      sauvegrainScore4,
      sauvegrainAgeYears,
      sauvegrainAgeMonths,
      xrayDate,
      xrayLocation,
      xrayQuality
    };
    if (isAuthenticated) {
      const key = isExpertMode ? 'dualGP_draft_state_expert' : 'dualGP_draft_state_premium';
      localStorage.setItem(key, JSON.stringify(draft));
    }
  }, [
    realAgeYears,
    realAgeMonths,
    isAgeManuallySet,
    gender,
    finalAgeYears,
    finalAgeMonths,
    clinicalReason,
    patientName,
    patientId,
    dob,
    examDate,
    loginTab,
    dbacSelections,
    dbacOtherFeatures,
    dbacBoneAgeYears,
    dbacBoneAgeMonths,
    hasAbnormality,
    abnormalityDetails,
    expertBoneAgeYears,
    expertBoneAgeMonths,
    sauvegrainScore1,
    sauvegrainScore2,
    sauvegrainScore3,
    sauvegrainScore4,
    sauvegrainAgeYears,
    sauvegrainAgeMonths,
    xrayDate,
    xrayLocation,
    xrayQuality,
    isAuthenticated,
    isExpertMode
  ]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    let formattedDate = val;
    if (val.length > 4) {
      formattedDate = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`;
    } else if (val.length > 2) {
      formattedDate = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setXrayDate(formattedDate);
  };
  
  const qualityOptions = ['Đạt', 'Tốt', 'Kém', 'Ảnh chụp', 'Tư thế không tối ưu'];

  const handlePasscodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPasscode(val);
    if (loginTab === 'premium' && val.endsWith('11')) {
      localStorage.setItem('boneAgeAuth', 'premium');
      window.location.reload();
    } else if (loginTab === 'expert' && val.endsWith('99')) {
      localStorage.setItem('boneAgeAuth', 'expert');
      window.location.reload();
    }
  };

    const getDbacParsedData = () => {
      const yesFeatures: string[] = [];
      const noFeatures: string[] = [];
      let summaryText = '';
      if (dbacBoneAgeYears !== '') {
        Object.entries(dbacSelections).forEach(([key, val]) => {
          const [mIdx, fIdx] = key.split('-').map(Number);
          const milestone = currentDbacData[mIdx];
          const feature = milestone.features[fIdx];
          if (val === 'yes') yesFeatures.push(`${feature} [${milestone.label}]`);
          if (val === 'maybe') yesFeatures.push(`${feature} [${milestone.label}] [chưa rõ ràng]`);
          if (val === 'no') noFeatures.push(`${feature} [${milestone.label}]`);
        });
        if (dbacOtherFeatures.trim()) {
          yesFeatures.push(dbacOtherFeatures.trim());
        }
        const grouped: Record<number, { val: 'yes'|'maybe'|'no' }[]> = {};
        Object.entries(dbacSelections).forEach(([key, val]) => {
          const [mIdx] = key.split('-').map(Number);
          if (!grouped[mIdx]) grouped[mIdx] = [];
          grouped[mIdx].push({ val: val as 'yes' | 'maybe' | 'no' });
        });
        const summaryParts: string[] = [];
        Object.entries(grouped).forEach(([mIdxStr, items]) => {
          const mIdx = Number(mIdxStr);
          const milestone = currentDbacData[mIdx];
          if (items.length === milestone.features.length) {
            const yesCount = items.filter(x => x.val === 'yes' || x.val === 'maybe').length;
            summaryParts.push(`${yesCount}/${milestone.features.length} tiêu chuẩn mốc ${milestone.label}`);
          }
        });
        if (summaryParts.length > 0) {
           summaryText = `Phim tuổi xương của trẻ có ${summaryParts.join('; ')}.`;
        }
      }
      return { yesFeatures, noFeatures, summaryText };
    };

  const getZScoreChartSVGString = (zScores?: {name: string, z: number, color: string}[]) => {
    if (!zScores || zScores.length === 0) return '';
    const width = 500;
    const height = 220;
    const padding = { top: 20, right: 30, bottom: 110, left: 30 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;
    
    const minZ = -4;
    const maxZ = 4;
    const range = maxZ - minZ;
    
    const getX = (z: number) => padding.left + ((z - minZ) / range) * innerWidth;
    const getY = (z: number) => {
      const val = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-(z * z) / 2);
      const maxVal = 1 / Math.sqrt(2 * Math.PI);
      return padding.top + innerHeight - (val / maxVal) * innerHeight;
    };

    const points = [];
    for (let z = minZ; z <= maxZ; z += 0.1) {
      points.push(`${getX(z)},${getY(z)}`);
    }
    points.push(`${getX(maxZ)},${getY(maxZ)}`);
    const pathData = `M ${points.join(' L ')}`;
    
    const fillPoints = [];
    fillPoints.push(`${getX(-2)},${padding.top + innerHeight}`);
    for (let z = -2; z <= 2; z += 0.1) {
      fillPoints.push(`${getX(z)},${getY(z)}`);
    }
    fillPoints.push(`${getX(2)},${getY(2)}`);
    fillPoints.push(`${getX(2)},${padding.top + innerHeight}`);
    const fillPathData = `M ${fillPoints.join(' L ')} Z`;

    const ticks = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
    const escapeXML = (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const ticksHtml = ticks.map(tick => `
      <line x1="${getX(tick)}" y1="${padding.top + innerHeight}" x2="${getX(tick)}" y2="${padding.top + innerHeight + 5}" stroke="#000" stroke-width="1.5" />
      <text x="${getX(tick)}" y="${padding.top + innerHeight + 17}" text-anchor="middle" font-size="11" font-weight="bold" fill="#000" font-family="Arial, sans-serif">${tick}</text>
      ${Math.abs(tick) === 2 ? `<text x="${getX(tick)}" y="${padding.top + innerHeight + 30}" text-anchor="middle" font-size="12" font-weight="bold" fill="#000" font-family="Arial, sans-serif">${tick > 0 ? '+2SD' : '-2SD'}</text>` : ''}
    `).join('');

    let dotsHtml = zScores.map((zObj) => {
      const x = getX(zObj.z);
      const y = getY(zObj.z);
      const isGaskin = zObj.name === 'Gaskin';
      if (isGaskin) {
        return `
          <circle cx="${x}" cy="${y}" r="6.5" fill="#fff" stroke="#000" stroke-width="2.5" />
        `;
      }
      return `
        <circle cx="${x}" cy="${y}" r="6.5" fill="#000" stroke="none" />
      `;
    }).join('');

    const axisHtml = `<line x1="${padding.left}" y1="${padding.top + innerHeight}" x2="${padding.left + innerWidth}" y2="${padding.top + innerHeight}" stroke="#000" stroke-width="1.5" />`;

    let dropLinesHtml = zScores.map((zObj) => {
      const x = getX(zObj.z);
      const y = getY(zObj.z);
      return `<line x1="${x}" y1="${y}" x2="${x}" y2="${padding.top + innerHeight}" stroke="#666" stroke-width="1.5" stroke-dasharray="3,3" />`;
    }).join('');
    
    const baseLegendY = padding.top + innerHeight + 50;
    
    const legendHtml = zScores.map((zObj, idx) => {
      const isGaskin = zObj.name === 'Gaskin';
      const curLegendY = baseLegendY + (idx * 20);
      const startX = (width / 2) - 80; // center manually
      const iconSvg = isGaskin 
        ? `<circle cx="${startX + 10}" cy="${curLegendY - 4}" r="5" fill="#fff" stroke="#000" stroke-width="2.5"/>`
        : `<circle cx="${startX + 10}" cy="${curLegendY - 4}" r="5.5" fill="#000" stroke="none"/>`;
      return `
        ${iconSvg}
        <text x="${startX + 22}" y="${curLegendY}" font-size="12" font-weight="bold" fill="#000" font-family="Arial, sans-serif">${escapeXML(zObj.name)} (Z = ${zObj.z.toFixed(2)})</text>
      `;
    }).join('');

    const footerY = baseLegendY + (zScores.length * 20) + 10;
    const footerHtml = `<text x="${width/2}" y="${footerY}" text-anchor="middle" font-size="11" fill="#444" font-style="italic" font-family="Arial, sans-serif">Z-Score dựa vào Brush data, Stanford (Greulich &amp; Pyle, 1959)</text>`;

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background-color: white; font-family: Arial, sans-serif;">
        <defs>
          <pattern id="diagonalHatch" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#000" stroke-width="1" stroke-opacity="0.2" />
          </pattern>
        </defs>
        <path d="${fillPathData}" fill="url(#diagonalHatch)" />
        ${axisHtml}
        ${ticksHtml}
        <path d="${pathData}" fill="none" stroke="#000" stroke-width="2" />
        ${dropLinesHtml}
        ${dotsHtml}
        ${legendHtml}
        ${footerHtml}
      </svg>
    `;
  };

  const svgToPngUint8Array = async (svgString: string, width: number, height: number): Promise<Uint8Array> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width * 2; // high res
        canvas.height = height * 2;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            reject(new Error("No context")); return;
        }
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0);
        
        try {
          const dataUrl = canvas.toDataURL('image/png');
          const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
          const binaryStr = window.atob(base64Data);
          const len = binaryStr.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
              bytes[i] = binaryStr.charCodeAt(i);
          }
          resolve(bytes);
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const handleExportWord = async () => {
    if (!isExpertMode) return;
    
    handleSavePatient();
    
    // Parse findings
    const dbacPopulated = dbacBoneAgeYears !== '';
    const { yesFeatures, noFeatures, summaryText } = getDbacParsedData();
    const devZ = getDeviationAndZScore();
    const sauvegrainPopulated = sauvegrainAgeYears !== '';

    let logoData: Uint8Array | null = null;
    let logoDimensions = { width: 100, height: 50 };
    try {
      const resp = await fetch('/logo.png');
      if (resp.ok) {
        const buffer = await resp.arrayBuffer();
        if (buffer.byteLength > 0) {
          logoData = new Uint8Array(buffer);
          
          // Get natural dimensions
          const blob = new Blob([buffer], { type: 'image/png' });
          const url = URL.createObjectURL(blob);
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = url;
          });
          const scale = Math.min(150 / img.height, 350 / img.width);
          logoDimensions = {
            width: Math.round(img.width * scale),
            height: Math.round(img.height * scale)
          };
          URL.revokeObjectURL(url);
        }
      }
    } catch (e) {
      console.error("Failed to fetch logo for docx:", e);
    }


    let devZPngBuffer: Uint8Array | null = null;
    if (devZ && devZ.zScores && devZ.zScores.length > 0) {
      try {
        const svgStr = getZScoreChartSVGString(devZ.zScores);
        if (svgStr) {
          devZPngBuffer = await svgToPngUint8Array(svgStr, 500, 220);
        }
      } catch (err) {
        console.error("Failed to generate PNG for docx:", err);
      }
    }

    const doc = new DocxDocument({
      sections: [{
        properties: {
          type: SectionType.CONTINUOUS,
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
            borders: {
              pageBorders: {
                display: PageBorderDisplay.ALL_PAGES,
                offsetFrom: PageBorderOffsetFrom.PAGE,
              },
              pageBorderTop: { style: BorderStyle.SINGLE, size: 12, color: "000000", space: 24 },
              pageBorderRight: { style: BorderStyle.SINGLE, size: 12, color: "000000", space: 24 },
              pageBorderBottom: { style: BorderStyle.SINGLE, size: 12, color: "000000", space: 24 },
              pageBorderLeft: { style: BorderStyle.SINGLE, size: 12, color: "000000", space: 24 },
            }
          }
        },
        children: [

          ...(logoData ? [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new ImageRun({
                  data: logoData,
                  transformation: logoDimensions,
                  type: "png"
                })
              ],
              spacing: { after: 200 }
            })
          ] : []),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "KẾT QUẢ PHÂN TÍCH CHUYÊN SÂU TUỔI XƯƠNG", bold: true, size: 36, font: "Arial" })
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Bằng phương pháp Greulich & Pyle với 2 Atlas", size: 24, font: "Arial" })
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Gilsanz & Ratib (Springer, 2004, 2011) và Gaskin (Oxford, 2011)", size: 24, font: "Arial", italics: true })
            ],
            spacing: { after: 400 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Tên khách hàng: ${patientName || '........................................'}`, size: 24, font: "Arial", bold: true }),
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Mã khách hàng: ${patientId || '........................................'}`, size: 24, font: "Arial" }),
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Tuổi thực tế (CA) tại ngày chụp: ${realAgeYears} tuổi ${realAgeMonths} tháng (${(realAgeYears + realAgeMonths / 12).toFixed(2)} tuổi)`, size: 24, font: "Arial" }),
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Hình thái xương sơ bộ: ${hasAbnormality ? `Bất thường${abnormalityDetails ? ` (${abnormalityDetails})` : ''}` : 'Chưa ghi nhận bất thường hình thái'}`, size: 24, font: "Arial" }),
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Ngày khám: ${examDate || '........................................'}`, size: 24, font: "Arial" }),
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Lý do đánh giá (Lâm sàng): ${clinicalReason || '........................................'}`, size: 24, font: "Arial" }),
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Chất lượng phim: ${xrayQuality || 'Đạt'}`, size: 24, font: "Arial" }),
            ],
            spacing: { after: 400 }
          }),
          
          // Inject exact conclusion
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    verticalAlign: VerticalAlign.CENTER,
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Atlas tham chiếu", bold: true, size: 24, font: "Arial" })] })],
                  }),
                  new TableCell({
                    verticalAlign: VerticalAlign.CENTER,
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Kết quả đánh giá", bold: true, size: 24, font: "Arial" })] })],
                  }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    verticalAlign: VerticalAlign.CENTER,
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "V.Gilsanz và O.Ratib", size: 24, font: "Arial" })] })],
                  }),
                  new TableCell({
                    verticalAlign: VerticalAlign.CENTER,
                    children: [
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [
                        new TextRun({ text: expertBoneAgeYears !== '' ? `${expertBoneAgeYears} tuổi ${expertBoneAgeMonths || 0} tháng` : '-', size: 24, font: "Arial", bold: true, color: "800020" }),
                        new TextRun({ text: " ± 0.5", size: 20, font: "Arial", color: "666666" })
                      ] })
                    ],
                  }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    verticalAlign: VerticalAlign.CENTER,
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Cree M. Gaskin và cộng sự", size: 24, font: "Arial" })] })],
                  }),
                  new TableCell({
                    verticalAlign: VerticalAlign.CENTER,
                    children: [
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [
                        new TextRun({ text: dbacPopulated ? `${dbacBoneAgeYears} tuổi ${dbacBoneAgeMonths || 0} tháng` : '-', size: 24, font: "Arial", bold: true, color: "800020" }),
                        new TextRun({ text: " ± 0.5", size: 20, font: "Arial", color: "666666" })
                      ] })
                    ],
                  }),
                ]
              }),
              ...(((realAgeYears >= 9 && realAgeYears <= 13 && gender === 'girl') || (realAgeYears >= 11 && realAgeYears <= 15 && gender === 'boy')) ? [
                new TableRow({
                  children: [
                    new TableCell({
                      verticalAlign: VerticalAlign.CENTER,
                      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Sauvegrain (Diméglio cải tiến)", size: 24, font: "Arial" })] })],
                    }),
                    new TableCell({
                      verticalAlign: VerticalAlign.CENTER,
                      children: [
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [
                          new TextRun({ text: sauvegrainPopulated ? `${sauvegrainAgeYears} tuổi ${sauvegrainAgeMonths || 0} tháng` : '-', size: 24, font: "Arial", bold: true, color: "800020" })
                        ] })
                      ],
                    }),
                  ]
                })
              ] : [])
            ]
          }),
          new Paragraph({ text: "", spacing: { after: 200 } }),
          new Paragraph({
            children: [new TextRun({ text: "KẾT QUẢ:", bold: true, size: 24, font: "Arial" })],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [new TextRun({ text: "Áp dụng phương pháp Greulich - Pyle, bác sĩ lâm sàng so sánh và đánh giá thấy mức độ cốt hoá trung bình của các xương cổ - bàn - ngón tay phù hợp với kết quả sau:", size: 24, font: "Arial" })],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "- Tuổi xương ước tính: ", size: 24, font: "Arial" }),
              new TextRun({ text: expertBoneAgeYears !== '' ? `${expertBoneAgeYears} tuổi ${expertBoneAgeMonths || 0} tháng` : '-', size: 24, font: "Arial", bold: true, color: "800020" }),
              new TextRun({ text: " ± 0.5 tuổi (Tham chiếu theo: Atlas Kỹ thuật số của V.Gilsanz và O.Ratib, Springer, ISBN-13: 978-3642237621).", size: 24, font: "Arial" })
            ],
            spacing: { after: 100 }
          }),
          ...(dbacPopulated ? [
            new Paragraph({
              children: [
                new TextRun({ text: "- Tuổi xương ước tính: ", size: 24, font: "Arial" }),
                new TextRun({ text: `${dbacBoneAgeYears} tuổi ${dbacBoneAgeMonths || 0} tháng`, size: 24, font: "Arial", bold: true, color: "800020" }),
                new TextRun({ text: ` ± 0.5 tuổi (Tham chiếu theo: Atlas Thực tế chuẩn hoá của C.M. Gaskin et al., sử dụng mốc cốt hoá cổ điển của Brush Foundation, OUP, ISBN-10: 0199782059). ${summaryText ? summaryText + ' ' : ''}${(yesFeatures.length > 0 || noFeatures.length > 0) ? 'Cụ thể như sau:' : ''}`.trimEnd(), size: 24, font: "Arial" })
              ],
              spacing: { after: 100 }
            }),
            (() => {
              const baDecimal = Number(dbacBoneAgeYears) + Number(dbacBoneAgeMonths || 0) / 12;
              const bxAge = getBxChina05Age(baDecimal, gender);
              const bxYears = Math.floor(bxAge);
              const bxMonths = Math.round((bxAge - bxYears) * 12);
              const bxFormatted = bxMonths === 12 ? `${bxYears + 1} tuổi 0 tháng` : `${bxYears} tuổi ${bxMonths} tháng`;
              return new Paragraph({
                children: [
                  new TextRun({ text: "- Tuổi xương quy đổi theo trẻ em châu Á đương thời (BX-China05): ", size: 24, font: "Arial" }),
                  new TextRun({ text: bxFormatted, size: 24, font: "Arial", bold: true, color: "800020" }),
                  new TextRun({ text: " (Zhang, Thodberg et al. 2013)", size: 24, font: "Arial" })
                ],
                spacing: { after: 100 }
              });
            })(),
            ...(yesFeatures.length > 0 ? [
              new Paragraph({
                children: [new TextRun({ text: "+ Các dấu hiệu được ghi nhận:", size: 24, font: "Arial", bold: true })],
                spacing: { after: 100 }
              }),
              ...yesFeatures.map(f => new Paragraph({
                children: [new TextRun({ text: `  ${f}`, size: 24, font: "Arial" })],
                spacing: { after: 100 }
              }))
            ] : []),
            ...(noFeatures.length > 0 ? [
              new Paragraph({
                children: [
                   new TextRun({ text: "+ Hiện ", size: 24, font: "Arial", bold: true }),
                   new TextRun({ text: "chưa thấy rõ", size: 24, font: "Arial", bold: true, underline: { type: UnderlineType.SINGLE } }),
                   new TextRun({ text: " các dấu hiệu sau:", size: 24, font: "Arial", bold: true })
                ],
                spacing: { after: 100 }
              }),
              ...noFeatures.map(f => new Paragraph({
                children: [new TextRun({ text: `  ${f}`, size: 24, font: "Arial" })],
                spacing: { after: 100 }
              }))
            ] : []),
            ...(hasAbnormality ? [
              new Paragraph({
                children: [new TextRun({ text: `+ Bất thường hình thái xương: Có`, size: 24, font: "Arial", bold: true })],
                spacing: { after: 100 }
              }),
              ...(abnormalityDetails ? [new Paragraph({
                children: [new TextRun({ text: `  Chi tiết: ${abnormalityDetails}`, size: 24, font: "Arial" })],
                spacing: { after: 100 }
              })] : [])
            ] : [])
          ] : []),
          ...(sauvegrainPopulated ? [
            new Paragraph({
              children: [
                new TextRun({ text: `- Dựa theo phương pháp đánh giá tuổi xương dựa trên khớp khuỷu tay trái của Sauvegrain (Diméglio cải tiến), tuổi xương của trẻ hiện tương đương `, size: 24, font: "Arial" }),
                new TextRun({ text: `${sauvegrainAgeYears} tuổi${sauvegrainAgeMonths ? ` ${sauvegrainAgeMonths} tháng` : ''}`, size: 24, font: "Arial", bold: true, color: "800020" }),
                new TextRun({ text: ` (tổng điểm = ${(sauvegrainScore1 || 0) + (sauvegrainScore2 || 0) + (sauvegrainScore3 || 0) + (sauvegrainScore4 || 0)}).`, size: 24, font: "Arial" }),
              ],
              spacing: { after: 100 }
            })
          ] : []),
          ...(devZ ? [
            new Paragraph({ text: "", spacing: { after: 100 } }),
            ...devZ.diffText.split('\n').map(line => new Paragraph({
              children: [new TextRun({ text: line, size: 24, font: "Arial", bold: true })],
              spacing: { after: 100 }
            })),
            new Paragraph({
              children: [new TextRun({ text: devZ.significanceText, size: 24, font: "Arial", bold: true })],
              spacing: { after: 100 }
            })
          ] : []),
          ...(devZPngBuffer ? [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new ImageRun({
                  data: devZPngBuffer,
                  transformation: {
                    width: 500,
                    height: 220,
                  },
                  type: "png",
                })
              ],
              spacing: { before: 200, after: 200 }
            })
          ] : []),
          new Paragraph({ text: "", spacing: { after: 100 } }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [new TextRun({ text: "Lưu ý: Kết quả trên do bác sĩ lâm sàng trực tiếp đánh giá và có thể có sai số nhất định tuỳ thuộc vào người phiên giải cũng như hệ thống tham chiếu được áp dụng. Tuổi xương mang giá trị tham khảo và cần được biện luận kết hợp với diễn tiến lâm sàng của từng bệnh nhân cụ thể.", size: 24, font: "Arial", italics: true })],
            spacing: { after: 100 }
          }),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          new Paragraph({
             alignment: AlignmentType.RIGHT,
             children: [
                new TextRun({ text: "Bác sĩ chuyên khoa đánh giá", size: 24, font: "Arial", italics: true })
             ],
             spacing: { after: 1200 }
          }),
          new Paragraph({
             alignment: AlignmentType.RIGHT,
             children: [
                new TextRun({ text: "ThS.BS. Đỗ Tiến Sơn", size: 24, font: "Arial", bold: true })
             ],
             spacing: { after: 100 }
          }),
          new Paragraph({
             alignment: AlignmentType.RIGHT,
             children: [
                new TextRun({ text: `Ngày đánh giá: ${new Date().toLocaleDateString('vi-VN')}`, size: 24, font: "Arial" })
             ],
             spacing: { after: 400 }
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [new TextRun({ text: "Tài liệu tham chiếu:", size: 16, font: "Arial", bold: true })],
            spacing: { before: 400, after: 100 }
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [new TextRun({ text: "1. Bunch, P. M., Altes, T. A., McIlhenny, J., Patrie, J., & Gaskin, C. M. (2017). Skeletal development of the hand and wrist: digital bone age companion-a suitable alternative to the Greulich and Pyle atlas for bone age assessment?. Skeletal radiology, 46(6), 785–793.", size: 16, font: "Arial" })],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [new TextRun({ text: "2. Gilsanz V, Ratib O. Hand bone age a digital atlas of skeletal maturity. New York: Springer; 2011; Second Edition.", size: 16, font: "Arial" })],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [new TextRun({ text: "3. Martin, D. D., Wit, J. M., Hochberg, Z., Sävendahl, L., van Rijn, R. R., Fricke, O., Cameron, N., Caliebe, J., Hertel, T., Kiepe, D., Albertsson-Wikland, K., Thodberg, H. H., Binder, G., & Ranke, M. B. (2011). The use of bone age in clinical practice - part 1. Hormone research in paediatrics, 76(1), 1–9. https://doi.org/10.1159/000329372", size: 16, font: "Arial" })],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [new TextRun({ text: "4. Greulich WW, Pyle SI. Radiographic Atlas of Skeletal Development of the Hand and Wrist, 2nd ed. Stanford, CA: Stanford University Press and London, UK: Oxford University Press, 1959.", size: 16, font: "Arial" })],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [new TextRun({ text: "5. Zhang, Shao-Yan et al. “Automated determination of bone age in a modern chinese population.” ISRN radiology vol. 2013 874570. 25 Feb. 2013, doi:10.5402/2013/874570", size: 16, font: "Arial" })],
            spacing: { after: 200 }
          })
        ]
      }]
    });

    Packer.toBlob(doc).then(blob => {
      const namePart = patientName.trim() || 'Ten KH';
      const idPart = patientId.trim() || 'ID';
      const dobPart = dob.trim().replace(/\//g, '') || 'NgaySinh';
      const agePart = `${realAgeYears}y${realAgeMonths}m`;
      const datePart = (xrayDate || '').replace(/\//g, '');
      const d = new Date();
      const timePart = `${d.getHours().toString().padStart(2, '0')}h${d.getMinutes().toString().padStart(2, '0')}`;
      saveAs(blob, `${namePart} ${idPart} ${dobPart} ${agePart} ${datePart} ${timePart} Dr Son.docx`);
    });
  };

  const handleExportPdf = () => {
    if (!isExpertMode) return;
    handleSavePatient();
    
    // Parse findings
    const dbacPopulated = dbacBoneAgeYears !== '';
    const { yesFeatures, noFeatures, summaryText } = getDbacParsedData();
    const devZ = getDeviationAndZScore();
    const sauvegrainPopulated = sauvegrainAgeYears !== '';

    const renderZScoreChartHTML = (zScores?: {name: string, z: number, color: string}[]) => {
      const svgStr = getZScoreChartSVGString(zScores);
      if (!svgStr) return '';
      return `
        <div style="margin-top: 5mm; margin-bottom: 5mm; text-align:center;">
          <div style="width:100%; max-width:500px; margin:0 auto;">
            ${svgStr}
          </div>
        </div>
      `;
    };

    // Create printable HTML
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to print PDF.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ket qua Tuoi xuong - ${patientName}</title>
        <style>
          @page {
            size: A4;
            margin: 10mm 12mm;
          }
          body {
            font-family: Arial, sans-serif;
            line-height: 1.25;
            color: #000;
            margin: 0;
            padding: 0;
            font-size: 11.5pt;
          }
          .content-box {
            padding: 2mm 0;
            box-sizing: border-box;
          }
          h1 {
            text-align: center;
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 3mm;
          }
          .subtitle {
            text-align: center;
            font-size: 10.5pt;
            margin-bottom: 4mm;
          }
          .subtitle i { font-style: italic; }
          .mb-1 { margin-bottom: 1.5mm; }
          .mb-3 { margin-bottom: 3mm; }
          .mb-5 { margin-bottom: 4mm; }
          .font-bold { font-weight: bold; }
          .text-red { color: #800020; font-weight: bold; }
          .text-gray { color: #666; font-size: 10pt; }
          .underline { text-decoration: underline; font-weight: bold; }
          .signature-section {
            text-align: right;
            margin-top: 10mm;
          }

          /* Tùy chỉnh Header lặp lại trên mỗi trang in */
          table.print-wrapper {
            width: 100%;
            border-collapse: collapse;
            border: none;
          }
          thead.print-header {
            display: table-header-group;
          }
          .print-header-content {
            border-bottom: 1px solid #ccc;
            padding-bottom: 2mm;
            margin-bottom: 4mm;
            font-size: 10pt;
            color: #555;
            width: 100%;
          }
          .header-table {
            width: 100%;
            border: none;
            border-collapse: collapse;
          }
          .header-table td {
            padding: 0;
            vertical-align: bottom;
          }
        </style>
      </head>
      <body>
        <table class="print-wrapper">
          <thead class="print-header">
            <tr>
              <td>
                <div class="print-header-content">
                  <table class="header-table">
                    <tr>
                      <td colspan="3" style="text-align: center; padding-bottom: 5mm;">
                        <img src="/logo.png" style="max-width: 50%; max-height: 35mm; object-fit: contain;" onerror="this.style.display=\'none\'" />
                      </td>
                    </tr>
                    <tr>
                      <td style="text-align: left; width: 40%;"><strong>Khách hàng:</strong> ${patientName || '....................'}</td>
                      <td style="text-align: center; width: 30%;"><strong>ID:</strong> ${patientId || '....................'}</td>
                      <td style="text-align: right; width: 30%;"><strong>Ngày chụp:</strong> ${examDate || '....................'}</td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div class="content-box">
                  <h1>KẾT QUẢ PHÂN TÍCH CHUYÊN SÂU TUỔI XƯƠNG</h1>
                  <div class="subtitle">
                    Bằng phương pháp Greulich & Pyle với 2 Atlas<br/>
                    <i>Gilsanz & Ratib (Springer, 2004, 2011) và Gaskin (Oxford, 2011)</i>
                  </div>

                  <div class="mb-1"><span class="font-bold">Tên khách hàng:</span> ${patientName || '........................................'}</div>
                  <div class="mb-1">Mã khách hàng: ${patientId || '........................................'}</div>
          <div class="mb-1">Tuổi thực tế (CA) tại ngày chụp: ${realAgeYears} tuổi ${realAgeMonths} tháng (${(realAgeYears + realAgeMonths / 12).toFixed(2)} tuổi)</div>
          <div class="mb-1">Hình thái xương sơ bộ: ${hasAbnormality ? `Bất thường${abnormalityDetails ? ` (${abnormalityDetails})` : ''}` : 'Chưa ghi nhận bất thường hình thái'}</div>
          <div class="mb-1">Ngày khám: ${examDate || '........................................'}</div>
          <div class="mb-1">Lý do đánh giá (Lâm sàng): ${clinicalReason || '........................................'}</div>
          <div class="mb-5">Chất lượng phim: ${xrayQuality || 'Đạt'}</div>

          <div class="mb-1 font-bold">KẾT QUẢ:</div>
          <div class="mb-3">Áp dụng phương pháp Greulich - Pyle, bác sĩ lâm sàng so sánh và đánh giá thấy mức độ cốt hoá trung bình của các xương cổ - bàn - ngón tay phù hợp với kết quả sau:</div>
          
          <div class="mb-1">- Tuổi xương ước tính: ${expertBoneAgeYears !== '' ? `<span class="text-red">${expertBoneAgeYears} tuổi ${expertBoneAgeMonths || 0} tháng</span>` : '-'} ± 0.5 tuổi (Tham chiếu theo: Atlas Kỹ thuật số của V.Gilsanz và O.Ratib, Springer, ISBN-13: 978-3642237621).</div>
          
          ${dbacPopulated ? `
          <div class="mb-1">- Tuổi xương ước tính: <span class="text-red">${dbacBoneAgeYears} tuổi ${dbacBoneAgeMonths || 0} tháng</span> ± 0.5 tuổi (Tham chiếu theo: Atlas Thực tế chuẩn hoá của C.M. Gaskin et al., sử dụng mốc cốt hoá cổ điển của Brush Foundation, OUP, ISBN-10: 0199782059). ${summaryText ? summaryText + ' ' : ''}${(yesFeatures.length > 0 || noFeatures.length > 0) ? 'Cụ thể như sau:' : ''}</div>
          ${(() => {
            const baDecimal = Number(dbacBoneAgeYears) + Number(dbacBoneAgeMonths || 0) / 12;
            const bxAge = getBxChina05Age(baDecimal, gender);
            const bxYears = Math.floor(bxAge);
            const bxMonths = Math.round((bxAge - bxYears) * 12);
            const bxFormatted = bxMonths === 12 ? `${bxYears + 1} tuổi 0 tháng` : `${bxYears} tuổi ${bxMonths} tháng`;
            return `<div class="mb-1">- Tuổi xương quy đổi theo trẻ em châu Á đương thời (BX-China05): <span class="text-red">${bxFormatted}</span> (Zhang, Thodberg et al. 2013)</div>`;
          })()}
          
          ${yesFeatures.length > 0 ? `
            <div class="mb-1 font-bold">+ Các dấu hiệu được ghi nhận:</div>
            ${yesFeatures.map(f => `<div class="mb-1" style="padding-left: 20px;">${f}</div>`).join('')}
          ` : ''}

          ${noFeatures.length > 0 ? `
            <div class="mb-1">+ Hiện <span class="underline">chưa thấy rõ</span> các dấu hiệu sau:</div>
            ${noFeatures.map(f => `<div class="mb-1" style="padding-left: 20px;">${f}</div>`).join('')}
          ` : ''}

          ${hasAbnormality ? `
            <div class="mb-1 font-bold">+ Bất thường hình thái xương: Có</div>
            ${abnormalityDetails ? `<div class="mb-1" style="padding-left: 20px;">Chi tiết: ${abnormalityDetails}</div>` : ''}
          ` : ''}
          ` : ''}

          ${sauvegrainPopulated ? `
            <div class="mb-3">- Dựa theo phương pháp đánh giá tuổi xương dựa trên khớp khuỷu tay trái của Sauvegrain (Diméglio cải tiến), tuổi xương của trẻ hiện tương đương <span class="text-red">${sauvegrainAgeYears} tuổi${sauvegrainAgeMonths ? ` ${sauvegrainAgeMonths} tháng` : ''}</span> (tổng điểm = ${(sauvegrainScore1 || 0) + (sauvegrainScore2 || 0) + (sauvegrainScore3 || 0) + (sauvegrainScore4 || 0)}).</div>
          ` : ''}

          ${devZ ? `
            <div class="mb-1 font-bold" style="margin-top: 5mm;">${devZ.diffText.replace(/\n/g, '<br/>')}</div>
            <div class="mb-3 font-bold">${devZ.significanceText}</div>
            ${renderZScoreChartHTML(devZ.zScores)}
          ` : ''}

          <div class="mb-5" style="text-align: justify; font-style: italic;">Lưu ý: Kết quả trên do bác sĩ lâm sàng trực tiếp đánh giá và có thể có sai số nhất định tuỳ thuộc vào người phiên giải cũng như hệ thống tham chiếu được áp dụng. Tuổi xương mang giá trị tham khảo và cần được biện luận kết hợp với diễn tiến lâm sàng của từng bệnh nhân cụ thể.</div>

          <div class="signature-section">
            <div style="font-style: italic; margin-bottom: 20mm;">Bác sĩ chuyên khoa đánh giá</div>
            <div class="font-bold">ThS.BS. Đỗ Tiến Sơn</div>
            <div style="margin-top: 2mm;">Ngày đánh giá: ${new Date().toLocaleDateString('vi-VN')}</div>
          </div>
          
          <div style="margin-top: 10mm; font-size: 8pt; text-align: justify; border-top: 1px solid #ccc; padding-top: 2mm;">
            <div style="font-weight: bold; margin-bottom: 2mm;">Tài liệu tham chiếu:</div>
            <div style="margin-bottom: 1mm;">1. Bunch, P. M., Altes, T. A., McIlhenny, J., Patrie, J., & Gaskin, C. M. (2017). Skeletal development of the hand and wrist: digital bone age companion-a suitable alternative to the Greulich and Pyle atlas for bone age assessment?. Skeletal radiology, 46(6), 785–793.</div>
            <div style="margin-bottom: 1mm;">2. Gilsanz V, Ratib O. Hand bone age a digital atlas of skeletal maturity. New York: Springer; 2011; Second Edition.</div>
            <div style="margin-bottom: 1mm;">3. Martin, D. D., Wit, J. M., Hochberg, Z., Sävendahl, L., van Rijn, R. R., Fricke, O., Cameron, N., Caliebe, J., Hertel, T., Kiepe, D., Albertsson-Wikland, K., Thodberg, H. H., Binder, G., & Ranke, M. B. (2011). The use of bone age in clinical practice - part 1. Hormone research in paediatrics, 76(1), 1–9. https://doi.org/10.1159/000329372</div>
            <div style="margin-bottom: 1mm;">4. Greulich WW, Pyle SI. Radiographic Atlas of Skeletal Development of the Hand and Wrist, 2nd ed. Stanford, CA: Stanford University Press and London, UK: Oxford University Press, 1959.</div>
            <div style="margin-bottom: 1mm;">5. Zhang, Shao-Yan et al. “Automated determination of bone age in a modern chinese population.” ISRN radiology vol. 2013 874570. 25 Feb. 2013, doi:10.5402/2013/874570</div>
          </div>
        </div>
              </td>
            </tr>
          </tbody>
        </table>
        <script>
          setTimeout(() => {
            window.print();
            window.onfocus = function () { window.close(); }
          }, 500);
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleLogout = () => {
    localStorage.removeItem('boneAgeAuth');
    window.location.reload();
  };

  const promptExportConfirm = (action: 'docx' | 'pdf' | 'reset') => {
    setExportAction(action);
    setShowExportConfirm(true);
  };

  const handleConfirmExportAction = () => {
    if (exportAction === 'docx') {
      handleExportWord();
    } else if (exportAction === 'pdf') {
      handleExportPdf();
    } else if (exportAction === 'reset') {
      handleReset();
    }
    setShowExportConfirm(false);
    setExportAction(null);
  };

  const handleReset = () => {
    setRealAgeYears(0);
    setRealAgeMonths(0);
    setIsAgeManuallySet(false);
    setGender('boy');
    setFinalAgeYears('');
    setFinalAgeMonths('');
    setExpertBoneAgeYears('');
    setExpertBoneAgeMonths('');
    setSauvegrainScore1('');
    setSauvegrainScore2('');
    setSauvegrainScore3('');
    setSauvegrainScore4('');
    setSauvegrainAgeYears('');
    setSauvegrainAgeMonths('');
    const d = new Date();
    setXrayDate(`${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`);
    setExamDate(`${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`);
    setXrayLocation('BVĐK Tâm Anh');
    setXrayQuality('Đạt');
    setDbacIndex(0);
    setDbacSelections({});
    setDbacBoneAgeYears('');
    setDbacBoneAgeMonths('');
    setDbacOtherFeatures('');
    setHasAbnormality(false);
    setAbnormalityDetails('');
    setDbacPageNumber(1);
    setCopied(false);
    
    const hhmm = `${d.getHours().toString().padStart(2, '0')}${d.getMinutes().toString().padStart(2, '0')}`;
    const ddmmyyyy = `${d.getDate().toString().padStart(2, '0')}${(d.getMonth()+1).toString().padStart(2, '0')}${d.getFullYear()}`;
    setPatientName(`Ẩn danh ${hhmm}`);
    setPatientId(`TA ${ddmmyyyy}`);
    
    setDob('');
    setIsPatientConfirmed(false);
    setShowConfirmPopup(false);
  };

  const capitalizeWords = (str: string) => {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768);
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  function onDbacDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setDbacNumPages(numPages);
  }

  // Total real age in months
  const totalRealAgeMonths = realAgeYears * 12 + realAgeMonths;

  // Find initial closest page when inputs change
  useEffect(() => {
    const filteredData = ATLAS_DATA.filter(d => d.gender === gender);
    let closestPage = filteredData[0].page;
    let minDiff = Math.abs(filteredData[0].ageMonths - totalRealAgeMonths);

    for (let i = 1; i < filteredData.length; i++) {
      const diff = Math.abs(filteredData[i].ageMonths - totalRealAgeMonths);
      if (diff < minDiff) {
        minDiff = diff;
        closestPage = filteredData[i].page;
      }
    }
    setPageNumber(closestPage);
    
    let cIndex = 0;
    if (currentDbacData && currentDbacData.length > 0) {
      let minD = Math.abs(currentDbacData[0].ageMonths - totalRealAgeMonths);
      for (let i = 1; i < currentDbacData.length; i++) {
        const d = Math.abs(currentDbacData[i].ageMonths - totalRealAgeMonths);
        if (d < minD) {
          minD = d;
          cIndex = i;
        }
      }
      setDbacIndex(cIndex);
      setDbacPageNumber(cIndex + 1);
    }
  }, [totalRealAgeMonths, gender]);

  const selectedEntry = useMemo(() => {
    return ATLAS_DATA.find(d => d.page === pageNumber) || null;
  }, [pageNumber]);

  const getConclusion = () => {
    if (finalAgeYears === '' || finalAgeMonths === '') {
      return '';
    }

    const totalFinalAgeMonths = Number(finalAgeYears) * 12 + Number(finalAgeMonths);
    const diffMonths = Math.abs(totalFinalAgeMonths - totalRealAgeMonths);
    const diffYears = Math.floor(diffMonths / 12);
    const remainingMonths = diffMonths % 12;
    
    let diffTextVi = '';
    let diffTextEn = '';

    if (diffMonths === 0) {
      diffTextVi = 'tương đương với tuổi thực';
      diffTextEn = 'equivalent to chronological age';
    } else {
      const isAdvanced = totalFinalAgeMonths > totalRealAgeMonths;
      const directionVi = isAdvanced ? 'tăng' : 'giảm';
      const directionEn = isAdvanced ? 'advanced by' : 'delayed by';
      
      const partsVi = [];
      const partsEn = [];
      
      if (diffYears > 0) {
        partsVi.push(`${diffYears} năm`);
        partsEn.push(`${diffYears} year${diffYears > 1 ? 's' : ''}`);
      }
      if (remainingMonths > 0) {
        partsVi.push(`${remainingMonths} tháng`);
        partsEn.push(`${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`);
      }
      
      diffTextVi = `(${directionVi} ${partsVi.join(' ')} so với tuổi thực)`;
      diffTextEn = `(${directionEn} ${partsEn.join(' ')} compared to chronological age)`;
    }

    const finalAgeTextVi = `${finalAgeYears} năm ${finalAgeMonths} tháng +/- 0,5 năm`;
    const finalAgeTextEn = `${finalAgeYears} years ${finalAgeMonths} months +/- 0.5 years`;

    const disclaimerVi = '\n\n* Lưu ý: Kết quả tuổi xương được BS. Đỗ Tiến Sơn đánh giá trực tiếp, chỉ có ý nghĩa khi được bác sĩ lâm sàng ứng dụng trong đánh giá, theo dõi trên từng trường hợp cụ thể.';
    
    return `Bằng phương pháp Greulich - Pyle, khi so với atlas của Vicente Gilsanz và Osman Ratib: Hand Bone Age - A Digital Atlas of Skeletal Maturity - Ấn bản thứ 2, NXB Springer cho thấy Tuổi xương hiện tại của trẻ tương đương ${finalAgeTextVi} ${diffTextVi}${disclaimerVi}`;
  };

  const getDeviationAndZScore = () => {
    const gpAgeMonths = expertBoneAgeYears !== '' ? Number(expertBoneAgeYears) * 12 + Number(expertBoneAgeMonths || 0) : 0;
    const dbacPopulated = dbacBoneAgeYears !== '';
    const dbacAgeMonths = dbacPopulated ? (dbacBoneAgeYears || 0) * 12 + (dbacBoneAgeMonths || 0) : 0;

    if (gpAgeMonths === 0 && dbacAgeMonths === 0) return null;

    const caMonths = realAgeYears * 12 + realAgeMonths;
    const caDecimal = caMonths / 12;

    const brushData = gender === 'boy' ? BRUSH_DATA_BOY : BRUSH_DATA_GIRL;
    let closestRow = brushData[0];
    let minDiff = Math.abs(caMonths - closestRow.ageM);
    for (const row of brushData) {
      const d = Math.abs(caMonths - row.ageM);
      if (d < minDiff) {
        minDiff = d;
        closestRow = row;
      }
    }

    const sd = closestRow.sd;
    const twoSd = 2 * sd;

    let diffText = '';
    let significanceText = '';
    let zScores: { name: string, z: number, color: string }[] = [];

    const formatSign = (val: number) => val > 0 ? `+${val.toFixed(1)}` : val.toFixed(1);

    if (gpAgeMonths > 0 && dbacAgeMonths > 0) {
      const gDec = gpAgeMonths / 12;
      const dbDec = dbacAgeMonths / 12;

      const diffGm = Math.abs(gDec - caDecimal) * 12;
      const diffDm = Math.abs(dbDec - caDecimal) * 12;

      const rawDiffGm = (gDec - caDecimal) * 12;
      const rawDiffDm = (dbDec - caDecimal) * 12;

      const zG = rawDiffGm / sd;
      const zD = rawDiffDm / sd;
      
      zScores = [
        { name: 'Gilsanz & Ratib', z: zG, color: '#3b82f6' },
        { name: 'Gaskin', z: zD, color: '#10b981' }
      ];

      const minZ = Math.min(zG, zD);
      const maxZ = Math.max(zG, zD);

      let opG = '~', opD = '~';
      if (diffGm > twoSd) opG = '>'; else if (diffGm < twoSd) opG = '<';
      if (diffDm > twoSd) opD = '>'; else if (diffDm < twoSd) opD = '<';

      if (gpAgeMonths === dbacAgeMonths) {
        diffText = `Delta (BA-CA) = ${formatSign(rawDiffGm)} tháng (đối chiếu 2 atlas) (${opG} 2SD)\nGiá trị 2SD theo tuổi = ${twoSd.toFixed(2)} tháng (Greulich & Pyle, 1959)`;
        const isSig = Math.abs(zG) > 2;
        if (isSig) {
          significanceText = `Kết luận: Tuổi xương ${zG > 0 ? 'tăng' : 'giảm'} có ý nghĩa lâm sàng (Z-score = ${zG.toFixed(2)}) (Greulich & Pyle, 1959).`;
        } else {
          significanceText = `Kết luận: Tuổi xương trong khoảng cho phép (Z-score = ${zG.toFixed(2)}) (Greulich & Pyle, 1959).`;
        }
      } else {
        diffText = `Delta (BA-CA) = ${formatSign(rawDiffGm)} tháng (so atlas Gilsanz & Ratib) (${opG} 2SD) và ${formatSign(rawDiffDm)} tháng (so atlas Gaskin) (${opD} 2SD)\nGiá trị 2SD theo tuổi = ${twoSd.toFixed(2)} tháng (Greulich & Pyle, 1959)`;

        const isSig = Math.abs(zG) > 2 || Math.abs(zD) > 2;
        const dirText = maxZ > 0 && minZ > 0 ? 'tăng' : (maxZ < 0 && minZ < 0 ? 'giảm' : 'thay đổi');
        if (isSig) {
          significanceText = `Kết luận: Tuổi xương ${dirText} có ý nghĩa lâm sàng (Z-score ~ ${minZ.toFixed(2)} đến ${maxZ.toFixed(2)}) (Greulich & Pyle, 1959).`;
        } else {
          significanceText = `Kết luận: Tuổi xương trong khoảng cho phép (Z-score ~ ${minZ.toFixed(2)} đến ${maxZ.toFixed(2)}) (Greulich & Pyle, 1959).`;
        }
      }
    } else {
      let maxBaMonths = gpAgeMonths > 0 ? gpAgeMonths : dbacAgeMonths;
      let maxAtlasName = gpAgeMonths > 0 ? 'Gilsanz & Ratib' : 'Gaskin';

      const maxBaDecimal = maxBaMonths / 12;
      const diffMonths = Math.abs(maxBaDecimal - caDecimal) * 12;
      const rawDiffMonths = (maxBaDecimal - caDecimal) * 12;

      const zScore = rawDiffMonths / sd;
      
      zScores = [
        { name: maxAtlasName, z: zScore, color: maxAtlasName === 'Gaskin' ? '#10b981' : '#3b82f6' }
      ];

      let op = '~';
      if (diffMonths > twoSd) op = '>';
      else if (diffMonths < twoSd) op = '<';

      diffText = `Delta (BA-CA) = ${formatSign(rawDiffMonths)} tháng (so atlas ${maxAtlasName}) (${op} 2SD)\nGiá trị 2SD theo tuổi = ${twoSd.toFixed(2)} tháng (Greulich & Pyle, 1959)`;
      
      if (Math.abs(zScore) > 2) {
        significanceText = `Kết luận: Tuổi xương ${rawDiffMonths > 0 ? 'tăng' : 'giảm'} có ý nghĩa lâm sàng (Z-score = ${zScore.toFixed(2)}) (Greulich & Pyle, 1959).`;
      } else {
        significanceText = `Kết luận: Tuổi xương trong khoảng cho phép (Z-score = ${zScore.toFixed(2)}) (Greulich & Pyle, 1959).`;
      }
    }

    let shortDeltaText = '';
    if (gpAgeMonths > 0 && dbacAgeMonths > 0) {
      if (gpAgeMonths === dbacAgeMonths) {
        const rawDiffGm = (gpAgeMonths / 12 - caDecimal) * 12;
        const zG = rawDiffGm / sd;
        const diffGm = Math.abs(gpAgeMonths / 12 - caDecimal) * 12;
        let opG = '~';
        if (diffGm > twoSd) opG = '>'; else if (diffGm < twoSd) opG = '<';
        
        shortDeltaText = `Delta (BA-CA) ~ ${formatSign(rawDiffGm)} tháng (${opG} 2SD GP) (Z-score ~ ${zG.toFixed(2)}).`;
      } else {
        const rawDiffGm = (gpAgeMonths / 12 - caDecimal) * 12;
        const rawDiffDm = (dbacAgeMonths / 12 - caDecimal) * 12;
        const minDiff = Math.min(rawDiffGm, rawDiffDm);
        const maxDiff = Math.max(rawDiffGm, rawDiffDm);
        const zG = rawDiffGm / sd;
        const zD = rawDiffDm / sd;
        const minZ = Math.min(zG, zD);
        const maxZ = Math.max(zG, zD);
        const maxDiffAbs = Math.max(Math.abs(rawDiffGm), Math.abs(rawDiffDm));
        const minDiffAbs = Math.min(Math.abs(rawDiffGm), Math.abs(rawDiffDm));
        let op = '~';
        if (minDiffAbs > twoSd) {
          op = '>';
        } else if (maxDiffAbs < twoSd) {
          op = '<';
        }

        shortDeltaText = `Delta (BA-CA) ~ từ ${formatSign(minDiff)} đến ${formatSign(maxDiff)} tháng (${op} 2SD GP) (Z-score ~ ${minZ.toFixed(2)} đến ${maxZ.toFixed(2)}).`;
      }
    } else if (gpAgeMonths > 0 || dbacAgeMonths > 0) {
      let maxBaMonths = gpAgeMonths > 0 ? gpAgeMonths : dbacAgeMonths;
      const rawDiffMonths = (maxBaMonths / 12 - caDecimal) * 12;
      const zScore = rawDiffMonths / sd;
      let op = '~';
      if (Math.abs(rawDiffMonths) > twoSd) op = '>';
      else if (Math.abs(rawDiffMonths) < twoSd) op = '<';

      shortDeltaText = `Delta (BA-CA) ~ ${formatSign(rawDiffMonths)} tháng (${op} 2SD GP) (Z-score ~ ${zScore.toFixed(2)}).`;
    }

    return { diffText, significanceText, zScores, shortDeltaText };
  };

  const getExpertConclusion = () => {
    if (expertBoneAgeYears === '') return '';
    const dateText = xrayDate ? xrayDate : '....';
    const locationText = xrayLocation ? xrayLocation : '....';
    const qualityText = xrayQuality ? xrayQuality : '...';
    
    const formattedBoneAge = expertBoneAgeYears !== '' ? `${expertBoneAgeYears} tuổi ${expertBoneAgeMonths || 0} tháng` : '-';
    
    let vText = `KẾT QUẢ PHIÊN GIẢI TUỔI XƯƠNG\nPhim chụp ngày ${dateText} tại ${locationText} (Chất lượng phim: ${qualityText})\nTuổi thực tế (CA) tại ngày chụp: ${realAgeYears} tuổi ${realAgeMonths} tháng (${(realAgeYears + realAgeMonths / 12).toFixed(2)} tuổi)\nHình thái xương sơ bộ: ${hasAbnormality ? `Bất thường${abnormalityDetails ? ` (${abnormalityDetails})` : ''}` : 'Chưa ghi nhận bất thường hình thái'}\nKẾT QUẢ:\n\nÁp dụng phương pháp Greulich - Pyle, bác sĩ lâm sàng so sánh và đánh giá thấy mức độ cốt hoá trung bình của các xương cổ - bàn - ngón tay phù hợp với kết quả sau:\n- Tuổi xương ước tính: ${formattedBoneAge} ± 0.5 tuổi (Tham chiếu theo: Atlas Kỹ thuật số của V.Gilsanz và O.Ratib, Springer, ISBN-13: 978-3642237621).`;

    const dbacPopulated = dbacBoneAgeYears !== '';
    if (dbacPopulated) {
      const { yesFeatures, noFeatures, summaryText } = getDbacParsedData();
      
      const dbacFormatted = `${dbacBoneAgeYears} tuổi ${dbacBoneAgeMonths || 0} tháng`;
      const baDecimal = Number(dbacBoneAgeYears) + Number(dbacBoneAgeMonths || 0) / 12;
      const bxAge = getBxChina05Age(baDecimal, gender);
      const bxYears = Math.floor(bxAge);
      const bxMonths = Math.round((bxAge - bxYears) * 12);
      const bxFormatted = bxMonths === 12 ? `${bxYears + 1} tuổi 0 tháng` : `${bxYears} tuổi ${bxMonths} tháng`;
      const bxText = `\n- Tuổi xương quy đổi theo trẻ em châu Á đương thời (BX-China05): ${bxFormatted} (Zhang, Thodberg et al. 2013)`;
      
      const vDbac = `\n- Tuổi xương ước tính: ${dbacFormatted} ± 0.5 tuổi (Tham chiếu theo: Atlas Thực tế chuẩn hoá của C.M. Gaskin et al., sử dụng mốc cốt hoá cổ điển của Brush Foundation, OUP, ISBN-10: 0199782059). ${summaryText ? summaryText + ' ' : ''}${(yesFeatures.length > 0 || noFeatures.length > 0) ? 'Cụ thể như sau:' : ''}`.trimEnd() + bxText;
      
      let details = '';
      if (yesFeatures.length > 0) {
        details += `\n+ Các dấu hiệu được ghi nhận: ${yesFeatures.join('; ')}`;
      }
      if (noFeatures.length > 0) {
        details += `\n+ Hiện chưa thấy rõ các dấu hiệu sau: ${noFeatures.join('; ')}`;
      }
      if (hasAbnormality) {
        details += `\n+ Bất thường hình thái xương: Có`;
        if (abnormalityDetails) {
            details += `\n  Chi tiết: ${abnormalityDetails}`;
        }
      }
      
      vText += vDbac + details;
    }

    const disclaimerVi = '\n\nLưu ý: Kết quả trên do bác sĩ lâm sàng trực tiếp đánh giá và có thể có sai số nhất định tuỳ thuộc vào người phiên giải cũng như hệ thống tham chiếu được áp dụng. Tuổi xương mang giá trị tham khảo và cần được biện luận kết hợp với diễn tiến lâm sàng của từng bệnh nhân cụ thể.';

    const devZ = getDeviationAndZScore();
    if (devZ) {
      vText += `\n\n${devZ.diffText}\n${devZ.significanceText}`;
    }

    return vText + disclaimerVi;
  };

  const renderExpertConclusionDisplay = () => {
    if (expertBoneAgeYears === '') return null;
    const dateText = xrayDate ? xrayDate : '....';
    const locationText = xrayLocation ? xrayLocation : '....';
    const qualityText = xrayQuality ? xrayQuality : '...';
    
    const formattedBoneAge = expertBoneAgeYears !== '' ? `${expertBoneAgeYears} tuổi ${expertBoneAgeMonths || 0} tháng` : '-';
    const dbacPopulated = dbacBoneAgeYears !== '';
    const dbacFormatted = dbacPopulated ? `${dbacBoneAgeYears} tuổi ${dbacBoneAgeMonths || 0} tháng` : '-';
    const sauvegrainPopulated = sauvegrainAgeYears !== '';
    const sauvegrainFormatted = sauvegrainPopulated ? `${sauvegrainAgeYears} tuổi ${sauvegrainAgeMonths || 0} tháng` : '-';

    const { yesFeatures, noFeatures, summaryText } = getDbacParsedData();

    return (
      <div className="space-y-4">
        <p className="font-bold whitespace-pre-wrap">KẾT QUẢ PHIÊN GIẢI TUỔI XƯƠNG</p>
        <p className="whitespace-pre-wrap">Phim chụp ngày {dateText} tại {locationText} (Chất lượng phim: {qualityText})<br/>Tuổi thực tế (CA) tại ngày chụp: {realAgeYears} tuổi {realAgeMonths} tháng ({(realAgeYears + realAgeMonths / 12).toFixed(2)} tuổi)<br/>Hình thái xương sơ bộ: {hasAbnormality ? `Bất thường${abnormalityDetails ? ` (${abnormalityDetails})` : ''}` : 'Chưa ghi nhận bất thường hình thái'}</p>
        <p className="mt-4 font-bold">KẾT QUẢ:</p>
        
        <div className="overflow-x-auto rounded-xl border border-zinc-300 bg-white shadow-sm mt-4 mb-6">
          <table className="w-full text-center text-sm text-zinc-800">
            <thead className="bg-[#800020]/10 border-b border-[#800020]/20">
              <tr>
                <th className="px-2 sm:px-4 py-3 font-semibold border-r border-[#800020]/20 text-[#800020]">Atlas tham chiếu</th>
                <th className="px-2 sm:px-4 py-3 font-semibold text-[#800020]">
                  <span className="hidden sm:inline">Kết quả đánh giá</span>
                  <span className="sm:hidden">Kết quả</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              <tr>
                <td className="px-2 sm:px-4 py-3 border-r border-zinc-200 align-middle">V.Gilsanz và O.Ratib</td>
                <td className="px-2 sm:px-4 py-3 align-middle whitespace-nowrap">
                  <span className="font-bold text-[#800020]">{expertBoneAgeYears !== '' ? formattedBoneAge : '-'}</span>
                  <span className="text-zinc-500 ml-1 font-medium">± 0.5</span>
                </td>
              </tr>
              <tr>
                <td className="px-2 sm:px-4 py-3 border-r border-zinc-200 align-middle">
                  <span className="hidden sm:inline">Cree M. Gaskin và cộng sự</span>
                  <span className="sm:hidden">Cree M. Gaskin</span>
                </td>
                <td className="px-2 sm:px-4 py-3 align-middle whitespace-nowrap">
                  <span className="font-bold text-[#800020]">{dbacPopulated ? dbacFormatted : '-'}</span>
                  <span className="text-zinc-500 ml-1 font-medium">± 0.5</span>
                </td>
              </tr>
              {((realAgeYears >= 9 && realAgeYears <= 13 && gender === 'girl') || (realAgeYears >= 11 && realAgeYears <= 15 && gender === 'boy')) && (
              <tr>
                <td className="px-2 sm:px-4 py-3 border-r border-zinc-200 align-middle">
                  Sauvegrain (Diméglio cải tiến)
                </td>
                <td className="px-2 sm:px-4 py-3 align-middle whitespace-nowrap">
                  <span className="font-bold text-[#800020]">{sauvegrainPopulated ? sauvegrainFormatted : '-'}</span>
                </td>
              </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="whitespace-pre-wrap">Áp dụng phương pháp Greulich - Pyle, bác sĩ lâm sàng so sánh và đánh giá thấy mức độ cốt hoá trung bình của các xương cổ - bàn - ngón tay phù hợp với kết quả sau:</p>
        <p className="whitespace-pre-wrap">- Tuổi xương ước tính: <span className="font-bold text-[#800020]">{formattedBoneAge}</span> ± 0.5 tuổi (Tham chiếu theo: Atlas Kỹ thuật số của V.Gilsanz và O.Ratib, Springer, ISBN-13: 978-3642237621).</p>
        
        {dbacPopulated && (
          <>
            <p className="whitespace-pre-wrap mt-2">- Tuổi xương ước tính: <span className="font-bold text-[#800020]">{dbacFormatted}</span> ± 0.5 tuổi (Tham chiếu theo: Atlas Thực tế chuẩn hoá của C.M. Gaskin et al., sử dụng mốc cốt hoá cổ điển của Brush Foundation, OUP, ISBN-10: 0199782059). {`${summaryText ? summaryText + ' ' : ''}${(yesFeatures.length > 0 || noFeatures.length > 0) ? 'Cụ thể như sau:' : ''}`.trimEnd()}</p>
            {(() => {
              const baDecimal = Number(dbacBoneAgeYears) + Number(dbacBoneAgeMonths || 0) / 12;
              const bxAge = getBxChina05Age(baDecimal, gender);
              const bxYears = Math.floor(bxAge);
              const bxMonths = Math.round((bxAge - bxYears) * 12);
              const bxFormatted = bxMonths === 12 ? `${bxYears + 1} tuổi 0 tháng` : `${bxYears} tuổi ${bxMonths} tháng`;
              return <p className="whitespace-pre-wrap mt-2">- Tuổi xương quy đổi theo trẻ em châu Á đương thời (BX-China05): <span className="font-bold text-[#800020]">{bxFormatted}</span> (Zhang, Thodberg et al. 2013)</p>;
            })()}
            {yesFeatures.length > 0 && (
              <div className="whitespace-pre-wrap pl-2 mt-2">
                <span className="font-semibold">+ Các dấu hiệu được ghi nhận:</span> {yesFeatures.join('; ')}
              </div>
            )}
            {noFeatures.length > 0 && (
              <div className="whitespace-pre-wrap pl-2 mt-2">
                <span className="font-semibold">+ Hiện chưa thấy rõ các dấu hiệu sau:</span> {noFeatures.join('; ')}
              </div>
            )}
            {hasAbnormality && (
              <div className="whitespace-pre-wrap pl-2 mt-2">
                <span className="font-semibold">+ Bất thường hình thái xương: Có</span>
                {abnormalityDetails && <div>  Chi tiết: {abnormalityDetails}</div>}
              </div>
            )}
          </>
        )}

        {sauvegrainPopulated && (
          <p className="whitespace-pre-wrap mt-2">- Dựa theo phương pháp đánh giá tuổi xương dựa trên khớp khuỷu tay trái của Sauvegrain (Diméglio cải tiến), tuổi xương của trẻ hiện tương đương <span className="font-bold text-[#800020]">{sauvegrainAgeYears} tuổi{sauvegrainAgeMonths ? ` ${sauvegrainAgeMonths} tháng` : ''}</span> (tổng điểm = {(sauvegrainScore1 || 0) + (sauvegrainScore2 || 0) + (sauvegrainScore3 || 0) + (sauvegrainScore4 || 0)}).</p>
        )}
        
        {(() => {
          const devZ = getDeviationAndZScore();
          if (!devZ) return null;
          const isSignificant = devZ.significanceText.includes('có ý nghĩa lâm sàng');
          return (
            <div className={`mt-4 p-4 rounded-xl border ${isSignificant ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
              <div className="flex items-center gap-2 mb-1">
                 {isSignificant ? <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> : <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                 <span className={`font-bold uppercase text-xs tracking-wider ${isSignificant ? 'text-amber-700' : 'text-emerald-700'}`}>
                   {isSignificant ? 'Bất thường / Chú ý' : 'Bình thường'}
                 </span>
              </div>
              <p className="font-semibold whitespace-pre-wrap">{devZ.diffText}</p>
              <p className="mt-1 font-medium">{devZ.significanceText}</p>
            </div>
          );
        })()}

        <p className="whitespace-pre-wrap mt-6 text-sm italic text-zinc-600 text-justify">Lưu ý: Kết quả trên do bác sĩ lâm sàng trực tiếp đánh giá và có thể có sai số nhất định tuỳ thuộc vào người phiên giải cũng như hệ thống tham chiếu được áp dụng. Tuổi xương mang giá trị tham khảo và cần được biện luận kết hợp với diễn tiến lâm sàng của từng bệnh nhân cụ thể.</p>
      </div>
    );
  };

  const copyToClipboard = () => {
    handleSavePatient();
    navigator.clipboard.writeText(isExpertMode ? getExpertConclusion() : getConclusion());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const t = {
    title: 'DualGP Dr. Son 2.0',
    realAge: 'Tuổi thực',
    finalBoneAge: 'Tuổi xương kết luận',
    years: 'Năm',
    months: 'Tháng',
    gender: 'Giới tính',
    boy: 'Nam',
    girl: 'Nữ',
    interpretingDoctor: 'Bác sĩ phiên giải',
    otherDoctor: 'BS khác',
    conclusion: 'Kết luận',
    copy: 'Sao chép',
    footer: 'BS. Đỗ Tiến Sơn TAHN',
    footerSub: 'Phát triển phục vụ thực hành lâm sàng',
    selectBoneAge: 'Đối chiếu nhanh tuổi xương theo atlas mẫu (Vicente Gilsanz và Osman Ratib)',
    expertAtlasTitle: 'Đối chiếu tuổi xương theo Atlas kĩ thuật số của Vicente Gilsanz và Osman Ratib',
    expertBoneAgeLabel: 'Tuổi xương:',
    xrayDateLabel: 'Ngày chụp phim',
    xrayLocationLabel: 'Nơi chụp',
    xrayQualityLabel: 'Chất lượng',
    page: 'Trang',
    of: 'trên',
    magnifier: 'Kính lúp',
    xrayTitle: 'X-quang của trẻ',
    uploadXray: 'Tải lên hoặc Chụp ảnh',
    xrayReminder: 'Hãy chụp thẳng; đủ sáng; với mũi ngón tay hướng lên trên',
    showXray: 'Hiện phim',
    hideXray: 'Ẩn phim',
  };

  const handleXrayUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUnprocessedXrayImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedArea: any, pixels: any) => {
    setCroppedAreaPixels(pixels);
  };

  const handleApplyCrop = async () => {
    if (unprocessedXrayImage && croppedAreaPixels) {
      const croppedImage = await getCroppedImg(unprocessedXrayImage, croppedAreaPixels, rotation, { horizontal: flipH, vertical: flipV });
      setXrayImage(croppedImage);
      setUnprocessedXrayImage(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
    }
  };

  const handleCancelCrop = () => {
    setUnprocessedXrayImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  const renderProgressIndicator = (baYears: number | '', baMonths: number | '') => {
    if (baYears === '' || realAgeYears === null || isNaN(Number(realAgeYears))) return null;
    const caMonths = Number(realAgeYears) * 12 + Number(realAgeMonths || 0);
    const totalBaMonths = Number(baYears) * 12 + Number(baMonths || 0);
    const diff = totalBaMonths - caMonths;
    const diffAbs = Math.abs(diff);
    
    let colorClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    let text = `Khớp CA (±0 tháng)`;
    let dotClass = 'bg-emerald-400';

    if (diff > 0) {
      colorClass = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      text = `Nhanh ${diffAbs} tháng`;
      dotClass = 'bg-amber-400';
    } else if (diff < 0) {
      colorClass = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      text = `Chậm ${diffAbs} tháng`;
      dotClass = 'bg-blue-400';
    }

    return (
      <div className={`px-3 py-1.5 rounded-lg border flex items-center justify-center gap-2 text-sm font-semibold whitespace-nowrap mt-4 sm:mt-0 ${colorClass}`}>
        <div className={`w-2 h-2 rounded-full animate-pulse ${dotClass}`} />
        {text}
      </div>
    );
  };

  const isStacked = isMobile || isPortrait;

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans selection:bg-emerald-500/30 ${gender === 'boy' ? 'bg-blue-900' : 'bg-pink-900'}`}>
      {!isAuthenticated && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-xl">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-zinc-100 max-w-md w-full mx-4 space-y-6">
            <div className="text-center flex flex-col items-center">
              <img src="/logo.png" alt="Logo" className="h-24 sm:h-32 w-auto object-contain mb-1" onError={(e) => e.currentTarget.style.display = 'none'} />
              <p className="text-zinc-500 text-sm mt-2">Vui lòng đăng nhập để sử dụng ứng dụng</p>
            </div>
            
            <div className="flex p-1 bg-zinc-100 rounded-xl border border-zinc-200 mb-6">
              <button 
                onClick={() => { setLoginTab('premium'); setPasscode(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${loginTab === 'premium' ? 'bg-emerald-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
              >
                Premium
              </button>
              <button 
                onClick={() => { setLoginTab('expert'); setPasscode(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${loginTab === 'expert' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
              >
                Expert
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Passcode</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={16} className="text-zinc-400" />
                  </div>
                  <input 
                    type="password" 
                    value={passcode}
                    onChange={handlePasscodeChange}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors tracking-widest"
                  />
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-zinc-100 text-center">
              <p className="text-sm text-zinc-500">
                Liên hệ <span className="font-semibold text-emerald-600">BS. Sơn</span> để có đăng ký truy cập.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-0 flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-tight text-emerald-600 flex items-center">
                <img src="/logo.png" alt="Logo" className="h-auto w-auto max-h-12 sm:max-h-16 max-w-[65vw] sm:max-w-[300px] mr-2 object-contain py-1" onError={(e) => { e.currentTarget.style.display = 'none'; if (e.currentTarget.nextElementSibling) e.currentTarget.nextElementSibling.classList.remove('hidden'); }} />
                <Dog size={32} className="mr-2 hidden" />
                {isAuthenticated && (
                  <span className={`hidden sm:inline-block ml-2 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${isExpertMode ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                    {isExpertMode ? 'PRO' : 'LITE'}
                  </span>
                )}
              </h1>
            </div>
          </div>
          <div className="flex gap-2">
            {isAuthenticated && (
              <>
                {isExpertMode && (
                  <>
                    <button 
                      onClick={handleSavePatient}
                      title="Lưu Case"
                      className="p-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors flex items-center justify-center"
                    >
                      <Copy size={18} />
                    </button>
                    <button 
                      onClick={handleExportWord}
                      title="Xuất Word"
                      className="p-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center justify-center"
                    >
                      <FileType size={18} />
                    </button>
                    <button 
                      onClick={handleExportPdf}
                      title="In / Xuất PDF"
                      className="p-1.5 rounded-full border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors flex items-center justify-center"
                    >
                      <FileText size={18} />
                    </button>
                  </>
                )}
                <button 
                  onClick={() => promptExportConfirm('reset')}
                  title="Tạo mới"
                  className="p-1.5 rounded-full border border-sky-200 bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors flex items-center justify-center"
                >
                  <RotateCcw size={18} />
                </button>
                <button 
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="p-1.5 rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center"
                >
                  <LogOut size={18} />
                </button>
              </>
            )}
          </div>
        </div>
        
      </header>

      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-8">
        {/* Input Section */}
        <section className="bg-zinc-800 p-4 sm:p-5 rounded-2xl border border-white/10 shadow-sm shrink-0 flex flex-col gap-3 sm:gap-4 w-full">
          <div className="grid grid-cols-2 lg:flex lg:flex-nowrap items-start gap-3 sm:gap-4 w-full">
            <div className="space-y-1.5 w-full lg:w-auto lg:flex-1 shrink-0">
              <label className="text-xs font-semibold text-zinc-400">{'Giới tính'}</label>
              <div className="flex p-1 bg-zinc-900 rounded-lg border border-white/10 h-[42px]">
                <button 
                  onClick={() => handleAdminChangeAttempt('boy', setGender)}
                  className={`flex-1 rounded-md text-sm font-medium transition-all ${gender === 'boy' ? 'bg-emerald-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  {'Nam'}
                </button>
                <button 
                  onClick={() => handleAdminChangeAttempt('girl', setGender)}
                  className={`flex-1 rounded-md text-sm font-medium transition-all ${gender === 'girl' ? 'bg-pink-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  {'Nữ'}
                </button>
              </div>
            </div>
            <div className="space-y-1.5 w-full lg:w-auto shrink-0" style={{ maxWidth: '140px' }}>
              <label className="text-xs font-semibold text-zinc-400 flex items-center justify-between">
                <span>{'Ngày sinh'}</span>
                {isAgeManuallySet && (
                  <button 
                    onClick={() => setIsAgeManuallySet(false)}
                    className="text-emerald-500 hover:text-emerald-400 text-[10px] flex items-center gap-1"
                  >
                    <Lock size={10} /> Mở khóa
                  </button>
                )}
              </label>
              <input type="text" placeholder="DD/MM/YYYY" value={dob} onChange={e => {
                let val = e.target.value.replace(/\D/g, '');
                if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2);
                if (val.length > 5) val = val.substring(0, 5) + '/' + val.substring(5, 9);
                handleAdminChangeAttempt(val, setDob);
              }} 
              disabled={isAgeManuallySet}
              onBlur={() => {
                if (dob.length === 8) {
                  const parts = dob.split('/');
                  if (parts.length === 3 && parts[2].length === 2) {
                    handleAdminChangeAttempt(`${parts[0]}/${parts[1]}/20${parts[2]}`, setDob);
                  }
                }
              }}
              className={`w-full bg-zinc-900 border border-white/10 text-white rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500 transition-colors text-base ${isAgeManuallySet ? 'opacity-50 cursor-not-allowed' : ''}`} maxLength={10} />
            </div>
            <div className="space-y-1.5 w-full lg:w-auto lg:flex-1 shrink-0">
              <label className="text-xs font-semibold text-zinc-400">{'Tuổi thực'} <span className="text-[10px] text-zinc-500 font-normal">({(realAgeYears + realAgeMonths / 12).toFixed(2)} tuổi)</span></label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input 
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={realAgeYears} 
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, '');
                      let num = val === '' ? 0 : Number(val);
                      if (num > 19) num = 19;
                      handleAdminChangeAttempt(num, (v: number) => {
                        setRealAgeYears(v);
                        setIsAgeManuallySet(true);
                        setDob('');
                      });
                    }}
                    className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500 transition-colors text-base"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">{'Năm'}</span>
                </div>
                <div className="flex-1">
                  <input 
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={realAgeMonths} 
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, '');
                      let num = val === '' ? 0 : Number(val);
                      if (num > 11) num = 11;
                      handleAdminChangeAttempt(num, (v: number) => {
                        setRealAgeMonths(v);
                        setIsAgeManuallySet(true);
                        setDob('');
                      });
                    }}
                    className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500 transition-colors text-base"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">{'Tháng'}</span>
                </div>
              </div>
            </div>
            {isExpertMode && (
              <>
                <div className="space-y-1.5 w-full lg:w-auto lg:flex-1 shrink-0">
                  <label className="text-xs font-semibold text-zinc-400">{'Ngày khám'}</label>
                  <input type="text" value={examDate} onChange={e => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2);
                    if (val.length > 5) val = val.substring(0, 5) + '/' + val.substring(5, 9);
                    handleAdminChangeAttempt(val, setExamDate);
                  }} 
                  onBlur={() => {
                    if (examDate.length === 8) {
                      const parts = examDate.split('/');
                      if (parts.length === 3 && parts[2].length === 2) {
                        handleAdminChangeAttempt(`${parts[0]}/${parts[1]}/20${parts[2]}`, setExamDate);
                      }
                    }
                  }}
                  className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 transition-colors text-base h-[42px]" maxLength={10} />
                </div>
                <div className="space-y-1.5 w-full lg:w-auto lg:flex-1 shrink-0">
                  <label className="text-xs font-semibold text-zinc-400">{'Ngày chụp phim'}</label>
                  <input type="text" value={xrayDate} onChange={handleDateChange} 
                  onBlur={() => {
                    if (xrayDate.length === 8) {
                      const parts = xrayDate.split('/');
                      if (parts.length === 3 && parts[2].length === 2) {
                        setXrayDate(`${parts[0]}/${parts[1]}/20${parts[2]}`);
                      }
                    }
                  }}
                  className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 transition-colors text-base h-[42px]"  maxLength={10} />
                </div>
                <div className="space-y-1.5 w-full lg:w-auto lg:flex-[1.2] shrink-0 col-span-2 lg:col-span-1">
                  <label className="text-xs font-semibold text-zinc-400">{'Lâm sàng'}</label>
                  <select value={clinicalReason} onChange={e => setClinicalReason(e.target.value)} className="w-full bg-zinc-900 text-white border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 transition-colors appearance-none text-base h-[42px]">
                    {clinicalOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>
          <div className="grid grid-cols-2 lg:flex lg:flex-nowrap items-start gap-3 sm:gap-4 w-full">
            <div className="space-y-1.5 w-full lg:w-auto lg:flex-[1.5] shrink-0 col-span-2 lg:col-span-1">
              <label className="text-xs font-semibold text-zinc-400">{'Tên khách hàng'}</label>
              <input type="text" value={patientName} onChange={e => handleAdminChangeAttempt(e.target.value, setPatientName)} onBlur={() => setPatientName(capitalizeNameWords(patientName))} className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 transition-colors text-base h-[42px]" />
            </div>
            <div className="space-y-1.5 w-full lg:w-auto lg:flex-[1] shrink-0">
              <label className="text-xs font-semibold text-zinc-400">{'Mã khách hàng'}</label>
              <input type="text" value={patientId} onChange={e => handleAdminChangeAttempt(e.target.value, setPatientId)} className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 transition-colors text-base h-[42px]" />
            </div>
            {isExpertMode && (
              <>
                <div className="space-y-1.5 w-full lg:w-auto lg:flex-[1.5] shrink-0">
                  <label className="text-xs font-semibold text-zinc-400">{'Nơi chụp'}</label>
                  <input type="text" value={xrayLocation} onChange={e => setXrayLocation(e.target.value)} className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 transition-colors text-base h-[42px]"  />
                </div>
                <div className="space-y-1.5 w-full lg:w-auto lg:flex-[1.2] shrink-0">
                  <label className="text-xs font-semibold text-zinc-400">{'Chất lượng'}</label>
                  <select value={xrayQuality} onChange={e => setXrayQuality(e.target.value)} className="w-full bg-zinc-900 text-white border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 transition-colors appearance-none text-base h-[42px]">
                    {qualityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Action to confirm patient */}
          {!isPatientConfirmed ? (
            <div className="mt-6 flex justify-center pb-2">
              <button 
                onClick={() => {
                  setShowConfirmPopup(true);
                }}
                disabled={(!dob.trim() && !isAgeManuallySet)}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Xác nhận & Bắt đầu phân tích
              </button>
            </div>
          ) : (
            <div className="mt-6 flex justify-center pb-2">
              <button
                onClick={() => setIsPatientConfirmed(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-sm transition-colors border border-white/10"
              >
                Sửa thông tin hành chính
              </button>
            </div>
          )}
        </section>

        {isPatientConfirmed && (
        <>
        {/* Atlas Comparison Section */}
        <section id="atlas-target" className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0" />
              <span className="hidden sm:inline">{isExpertMode ? 'Đối chiếu tuổi xương theo Atlas kĩ thuật số của Vicente Gilsanz và Osman Ratib' : 'Đối chiếu nhanh tuổi xương theo atlas mẫu (Vicente Gilsanz và Osman Ratib)'}</span>
              <span className="sm:hidden">So Atlas Vincente & Ratib</span>
            </h2>
            <div className="flex items-center gap-4">
              <button
                 onClick={() => setIsGpVisible(!isGpVisible)}
                 className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${!isGpVisible ? 'bg-zinc-800 text-zinc-300 border-zinc-600' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}
              >
                 {isGpVisible ? <EyeOff size={16} className="shrink-0" /> : <Eye size={16} className="shrink-0" />}
                 <span>{isGpVisible ? 'Ẩn' : 'Hiện'}</span>
              </button>
              {isGpVisible && isExpertMode && (
                <button
                  onClick={() => setVicenteViewMode(prev => prev === 'single' ? 'duet' : prev === 'duet' ? 'compare' : 'single')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors bg-white/10 border-white/20 hover:bg-white/20 text-white"
                >
                  {vicenteViewMode === 'single' ? <Eye size={16} className="shrink-0" /> : vicenteViewMode === 'duet' ? <BookOpen size={16} className="shrink-0" /> : <Columns size={16} className="shrink-0" />}
                  <span className="hidden sm:inline">{vicenteViewMode === 'single' ? 'Chế độ Single' : vicenteViewMode === 'duet' ? 'Chế độ Duet' : 'Chế độ Compare'}</span>
                  <span className="sm:hidden">{vicenteViewMode === 'single' ? 'Single' : vicenteViewMode === 'duet' ? 'Duet' : 'Compare'}</span>
                </button>
              )}
              {isGpVisible && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMagnifierActive(!isMagnifierActive)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${isMagnifierActive ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 'bg-white/10 border-white/20 hover:bg-white/20 text-white'}`}
                  >
                    <Search size={16} className="shrink-0" />
                    <span className="hidden sm:inline">{'Kính lúp'}</span>
                  </button>
                </div>
              )}
              {isGpVisible && (
                <div className="flex items-center gap-2 text-sm font-medium text-white/70">
                  {selectedEntry && (
                    <span className="bg-white/10 px-2 py-1 rounded-md">{selectedEntry.labelVi}</span>
                  )}
                </div>
              )}
              {isGpVisible && (
                <div className="flex gap-2">
                  <button 
                    disabled={pageNumber <= 1}
                    onClick={() => setPageNumber(prev => prev - 1)}
                    className="p-2 rounded-full border border-white/20 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    disabled={numPages ? pageNumber >= numPages : false}
                    onClick={() => setPageNumber(prev => prev + 1)}
                    className="p-2 rounded-full border border-white/20 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <AnimatePresence>
            {isGpVisible && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-6 overflow-hidden">
                <div ref={atlas1Ref} className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-[0_4px_20px_rgba(16,185,129,0.15)] bg-zinc-800 flex justify-center items-center sm:min-h-[600px] p-0 sm:p-4 md:p-8" style={{ perspective: 1200 }}>
            {numPages && (
              <>
                <button 
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber(prev => prev - 1)}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 sm:py-6 bg-black/40 text-white rounded-xl backdrop-blur-sm opacity-50 hover:opacity-100 hover:scale-105 active:scale-95 transition-all disabled:opacity-0"
                >
                  <ChevronLeft size={28} />
                </button>
                <button 
                  disabled={pageNumber >= numPages}
                  onClick={() => setPageNumber(prev => prev + 1)}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 sm:py-6 bg-black/40 text-white rounded-xl backdrop-blur-sm opacity-50 hover:opacity-100 hover:scale-105 active:scale-95 transition-all disabled:opacity-0"
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}
            <Document
              file="/atlas.pdf"
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex flex-col items-center gap-2 text-zinc-400">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium">Loading PDF...</span>
                </div>
              }
              error={
                <div className="flex flex-col items-center gap-2 text-zinc-400 p-8 text-center">
                  <FileText size={48} className="opacity-20" />
                  <p className="text-sm">
                    {'Không tìm thấy file atlas.pdf. Vui lòng đặt file atlas.pdf vào thư mục public của dự án.'}
                  </p>
                </div>
              }
            >
              <AnimatePresence mode="wait">
                {numPages && (
                  <motion.div
                    key={Math.min(pageNumber, numPages)}
                    initial={isStacked ? { opacity: 0 } : { opacity: 0, rotateY: 15, scale: 0.95 }}
                    animate={isStacked ? { opacity: 1 } : { opacity: 1, rotateY: 0, scale: 1 }}
                    exit={isStacked ? { opacity: 0 } : { opacity: 0, rotateY: -15, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className={`flex origin-center ${vicenteViewMode === 'compare' ? (isStacked ? 'flex-col w-full max-w-[600px] gap-4' : 'flex-row w-full max-w-[1200px] gap-4') : (vicenteViewMode === 'duet' && isStacked ? 'flex-col w-full max-w-[600px] gap-4 bg-transparent border-none' : 'shadow-2xl bg-white overflow-hidden rounded-xl border border-white/20')}`}
                    style={{ transformStyle: vicenteViewMode === 'duet' && !isStacked ? 'preserve-3d' : 'flat' }}
                  >
                    {vicenteViewMode === 'compare' ? (
                      <>
                        <div className={`relative ${isStacked ? 'w-full' : (xrayImage ? 'w-1/2' : 'flex-1 max-w-[800px]')} shrink-0 min-w-0 flex justify-center bg-white items-center overflow-hidden rounded-xl border border-white/20 shadow-2xl`}>
                          <MagnifiablePage 
                            pageNumber={Math.max(1, Math.min(pageNumber, numPages))} 
                            width={isStacked ? Math.min(600, window.innerWidth - 48) : Math.min(xrayImage ? 600 : 800, (window.innerWidth - 48) * (xrayImage ? 0.5 : 0.65))} 
                            isActive={isMagnifierActive} 
                            cropTopTwoThirds={isMobile ? true : !!xrayImage}
                          />
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1.5 rounded-lg text-sm font-medium z-10 backdrop-blur-md pointer-events-none whitespace-nowrap shadow-lg">
                            Mốc tham chiếu {selectedEntry?.labelVi}, {gender === 'boy' ? 'Nam' : 'Nữ'}
                          </div>
                        </div>
                        
                        <div className={`relative ${isStacked ? 'w-full' : (xrayImage ? 'w-1/2' : 'w-[300px] shrink-0')} min-w-0 flex justify-center items-center overflow-hidden group rounded-xl border border-white/20 shadow-2xl ${xrayImage ? 'bg-black' : 'border-dashed bg-zinc-800/20 backdrop-blur-xl min-h-[400px]'}`}>
                           {xrayImage ? (
                             <>
                               <MagnifiableImage src={xrayImage} isActive={isMagnifierActive} />
                               <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1.5 rounded-lg text-sm font-medium z-10 backdrop-blur-md pointer-events-none whitespace-nowrap shadow-lg">
                                 Phim chụp của trẻ
                               </div>
                               <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                 <label className="cursor-pointer p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg transition-colors">
                                   <Camera size={20} />
                                   <input type="file" accept="image/*" onChange={handleXrayUpload} className="hidden" />
                                 </label>
                                 <button onClick={() => setXrayImage(null)} className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-lg transition-colors">
                                   <X size={20} />
                                 </button>
                               </div>
                             </>
                           ) : (
                             <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-emerald-500/50 hover:bg-white/5 transition-all text-white/70 w-[80%] my-8">
                               <Camera size={48} className="mb-4 opacity-50" />
                               <span className="text-center font-medium">Tải lên X-quang của trẻ</span>
                               <span className="text-center text-sm opacity-50 mt-2">Nhấp để chọn ảnh chụp</span>
                               <input type="file" accept="image/*" onChange={handleXrayUpload} className="hidden" />
                             </label>
                           )}
                        </div>
                      </>
                    ) : vicenteViewMode === 'single' ? (
                      <div className="relative shadow-2xl rounded-xl overflow-hidden">
                        <MagnifiablePage 
                          pageNumber={Math.max(1, Math.min(pageNumber, numPages))} 
                          width={isMobile ? window.innerWidth - 20 : 800} 
                          isActive={isMagnifierActive} 
                          cropTopTwoThirds={true}
                        />
                      </div>
                    ) : (
                      <>
                        {/* Left Page */}
                        {(pageNumber % 2 === 0 ? pageNumber : pageNumber - 1) > 0 && (pageNumber % 2 === 0 ? pageNumber : pageNumber - 1) <= numPages ? (
                          <div className={`${isStacked ? 'shadow-2xl rounded-xl overflow-hidden mb-4' : 'border-r border-zinc-300'} relative bg-white`}>
                            {!isStacked && <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/10 to-transparent z-10 pointer-events-none" />}
                            <MagnifiablePage 
                              pageNumber={pageNumber % 2 === 0 ? pageNumber : pageNumber - 1} 
                              width={isStacked ? window.innerWidth - 20 : 500}
                              isActive={isMagnifierActive}
                              cropTopTwoThirds={isMobile ? true : false}
                            />
                          </div>
                        ) : (
                          <div style={{ width: isStacked ? window.innerWidth - 20 : 500 }} className={`bg-zinc-100 ${isStacked ? 'rounded-xl mb-4 h-[300px]' : ''}`} />
                        )}
                        
                        {/* Right Page */}
                        {(pageNumber % 2 === 0 ? pageNumber + 1 : pageNumber) <= numPages ? (
                          <div className={`${isStacked ? 'shadow-2xl rounded-xl overflow-hidden' : ''} relative bg-white`}>
                            {!isStacked && <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/10 to-transparent z-10 pointer-events-none" />}
                            <MagnifiablePage 
                              pageNumber={pageNumber % 2 === 0 ? pageNumber + 1 : pageNumber} 
                              width={isStacked ? window.innerWidth - 20 : 500}
                              isActive={isMagnifierActive}
                              cropTopTwoThirds={isMobile ? true : false}
                            />
                          </div>
                        ) : (
                          <div style={{ width: isStacked ? window.innerWidth - 20 : 500 }} className={`bg-zinc-100 ${isStacked ? 'rounded-xl h-[300px]' : ''}`} />
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Document>
          </div>

          {isExpertMode && (
            <div className="mt-6 bg-zinc-800/80 backdrop-blur-sm p-5 md:p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
              <div className="flex flex-col gap-1">
                <label className="text-sm md:text-base font-semibold text-white tracking-wide">{'Kết luận mốc tuổi xương (Vicente - Osman Atlas):'}</label>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={expertBoneAgeYears} 
                      onChange={e => {
                        let val = e.target.value.replace(/\D/g, '');
                        setExpertBoneAgeYears(val === '' ? '' : Number(val));
                      }} 
                      placeholder="0"
                      className="w-16 md:w-20 bg-zinc-900 border border-white/20 text-white rounded-xl px-3 py-3 focus:outline-none focus:border-indigo-500 hover:border-white/30 transition-all font-bold text-lg text-center shadow-inner" 
                    />
                    <span className="text-zinc-300">tuổi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={expertBoneAgeMonths} 
                      onChange={e => {
                        let val = e.target.value.replace(/\D/g, '');
                        setExpertBoneAgeMonths(val === '' ? '' : Number(val));
                      }} 
                      placeholder="0"
                      className="w-16 md:w-20 bg-zinc-900 border border-white/20 text-white rounded-xl px-3 py-3 focus:outline-none focus:border-indigo-500 hover:border-white/30 transition-all font-bold text-lg text-center shadow-inner" 
                    />
                    <span className="text-zinc-300">tháng</span>
                  </div>
                </div>
                {renderProgressIndicator(expertBoneAgeYears, expertBoneAgeMonths)}
              </div>
            </div>
          )}
          </motion.div>
          )}
          </AnimatePresence>
        </section>

        {/* DBAC Section */}
        {isExpertMode && currentDbacData.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shrink-0" />
                <span className="hidden sm:inline">Đối chiếu tuổi xương theo Atlas của Cree M. Gaskin và cộng sự</span>
                <span className="sm:hidden">So Atlas Gaskin et al.</span>
              </h2>
              <div className="flex items-center gap-4">
                <button
                   onClick={() => setIsGaskinVisible(!isGaskinVisible)}
                   className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${!isGaskinVisible ? 'bg-zinc-800 text-zinc-300 border-zinc-600' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}
                >
                   {isGaskinVisible ? <EyeOff size={16} className="shrink-0" /> : <Eye size={16} className="shrink-0" />}
                   <span>{isGaskinVisible ? 'Ẩn' : 'Hiện'}</span>
                </button>
                {isGaskinVisible && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsDbacMagnifierActive(!isDbacMagnifierActive)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${isDbacMagnifierActive ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-white/10 border-white/20 hover:bg-white/20 text-white'}`}
                    >
                      <Search size={16} className="shrink-0" />
                      <span className="hidden sm:inline">{'Kính lúp'}</span>
                    </button>
                  </div>
                )}
                {isGaskinVisible && (
                  <div className="flex items-center gap-2 text-sm font-medium text-white/70">
                    <span className="bg-white/10 px-2 py-1 rounded-md">{currentDbacData[dbacIndex]?.label || ''}</span>
                  </div>
                )}
                {isGaskinVisible && (
                  <div className="flex gap-2">
                    <button 
                      disabled={dbacPageNumber <= 1}
                      onClick={() => {
                        setDbacPageNumber(prev => {
                          const next = prev - 1;
                          if (next > 0 && next <= currentDbacData.length) {
                            setDbacIndex(next - 1);
                          }
                          return next;
                        });
                      }}
                      className="p-2 rounded-full border border-white/20 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      disabled={dbacNumPages ? dbacPageNumber >= dbacNumPages : false}
                      onClick={() => {
                        setDbacPageNumber(prev => {
                          const next = prev + 1;
                          if (next > 0 && next <= currentDbacData.length) {
                            setDbacIndex(next - 1);
                          }
                          return next;
                        });
                      }}
                      className="p-2 rounded-full border border-white/20 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <AnimatePresence>
            {isGaskinVisible && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-6 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div ref={atlas2Ref} className="relative rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-[0_4px_20px_rgba(99,102,241,0.15)] bg-zinc-800 flex justify-center items-center sm:min-h-[500px] p-0 sm:p-4 lg:p-8" style={{ perspective: 1200 }}>
                {dbacNumPages && (
                  <>
                    <button 
                      disabled={dbacPageNumber <= 1}
                      onClick={() => {
                        setDbacPageNumber(prev => prev - 1);
                        setDbacIndex(prev => Math.max(0, prev - 1));
                      }}
                      className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 sm:py-6 bg-black/40 text-white rounded-xl backdrop-blur-sm opacity-50 hover:opacity-100 hover:scale-105 active:scale-95 transition-all disabled:opacity-0"
                    >
                      <ChevronLeft size={28} />
                    </button>
                    <button 
                      disabled={dbacPageNumber >= dbacNumPages}
                      onClick={() => {
                        setDbacPageNumber(prev => prev + 1);
                        setDbacIndex(prev => Math.min(currentDbacData.length - 1, prev + 1));
                      }}
                      className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 sm:py-6 bg-black/40 text-white rounded-xl backdrop-blur-sm opacity-50 hover:opacity-100 hover:scale-105 active:scale-95 transition-all disabled:opacity-0"
                    >
                      <ChevronRight size={28} />
                    </button>
                  </>
                )}
              <Document
                file={gender === 'boy' ? '/Male.pdf' : '/Female Atlas.pdf'}
                  onLoadSuccess={onDbacDocumentLoadSuccess}
                  loading={
                    <div className="flex flex-col items-center gap-2 text-zinc-400">
                      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Loading PDF...</span>
                    </div>
                  }
                  error={
                    <div className="flex flex-col items-center gap-2 text-zinc-400 p-8 text-center">
                      <FileText size={48} className="opacity-20" />
                      <p className="text-sm">
                        {`Không tìm thấy file ${gender === 'boy' ? 'Male.pdf' : 'Female Atlas.pdf'}. Vui lòng đặt file vào thư mục public của dự án.`}
                      </p>
                    </div>
                  }
                >
                  <AnimatePresence mode="wait">
                    {dbacNumPages && (
                      <motion.div
                        key={Math.min(dbacPageNumber, dbacNumPages)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex shadow-2xl bg-white relative"
                      >
                        <MagnifiablePage 
                          pageNumber={Math.max(1, Math.min(dbacPageNumber, dbacNumPages))} 
                          width={isMobile ? window.innerWidth - 20 : 500} 
                          isActive={isDbacMagnifierActive} 
                          cropTopTwoThirds={false}
                        />
                        <div className="absolute bottom-1 left-0 right-0 text-center pointer-events-none z-10">
                          <span className="text-[10px] text-black/30 font-medium">Bản dịch của BS. Đỗ Tiến Sơn</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Document>
              </div>

              <div className="bg-zinc-800 p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-col h-full overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 pb-3 border-b border-white/10 gap-2">
                  <h3 className="text-white font-semibold text-sm sm:text-[15px]">
                    Mốc cốt hoá ứng với <span className="text-yellow-400">{currentDbacData[dbacIndex]?.label}</span> (<span className={gender === 'boy' ? 'text-blue-300' : 'text-pink-300'}>{gender === 'boy' ? 'nam' : 'nữ'}</span>)
                  </h3>
                  <div className="flex gap-2 shrink-0">
                    <button 
                      onClick={() => {
                        const newSels = { ...dbacSelections };
                        currentDbacData[dbacIndex].features.forEach((_, idx) => newSels[`${dbacIndex}-${idx}`] = 'yes');
                        setDbacSelections(newSels);
                      }}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                    >
                      All Có
                    </button>
                    <button 
                      onClick={() => {
                        const newSels = { ...dbacSelections };
                        currentDbacData[dbacIndex].features.forEach((_, idx) => newSels[`${dbacIndex}-${idx}`] = 'no');
                        setDbacSelections(newSels);
                      }}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                    >
                      All Không
                    </button>
                  </div>
                </div>
                <ul className="space-y-2 overflow-y-auto pr-2">
                  {currentDbacData[dbacIndex].features.map((feature, idx) => {
                    const sKey = `${dbacIndex}-${idx}`;
                    const val = dbacSelections[sKey];
                    return (
                      <li key={idx} className={`relative flex items-center justify-between gap-3 p-3 bg-zinc-900/50 rounded-xl border ${val ? 'border-white/5' : 'border-transparent'}`}>
                        {!val && <div className="absolute inset-0 rounded-xl border border-red-500/50 animate-pulse pointer-events-none" style={{ animationDuration: '2s' }}></div>}
                        <span className="text-zinc-200 text-[11px] sm:text-xs leading-relaxed flex-1 break-words">{feature}</span>
                        <div className="flex bg-zinc-950 p-1 rounded-lg border border-white/10 shrink-0 gap-1 ml-auto relative z-10">
                          <button
                            onClick={() => setDbacSelections(prev => {
                              if (prev[sKey] === 'yes') {
                                const next = { ...prev };
                                delete next[sKey];
                                return next;
                              }
                              return { ...prev, [sKey]: 'yes' };
                            })}
                            className={`flex items-center justify-center w-8 py-1.5 sm:w-9 rounded-md transition-all ${val === 'yes' ? 'bg-emerald-600 text-white shadow-sm' : 'text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800'}`}
                            title="Có"
                          >
                            <CheckCheck size={16} />
                          </button>
                          <button
                            onClick={() => setDbacSelections(prev => {
                              if (prev[sKey] === 'maybe') {
                                const next = { ...prev };
                                delete next[sKey];
                                return next;
                              }
                              return { ...prev, [sKey]: 'maybe' };
                            })}
                            className={`flex items-center justify-center w-8 py-1.5 sm:w-9 rounded-md transition-all ${val === 'maybe' ? 'bg-amber-500 text-white shadow-sm' : 'text-zinc-400 hover:text-amber-400 hover:bg-zinc-800'}`}
                            title="Nghi ngờ"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => setDbacSelections(prev => {
                              if (prev[sKey] === 'no') {
                                const next = { ...prev };
                                delete next[sKey];
                                return next;
                              }
                              return { ...prev, [sKey]: 'no' };
                            })}
                            className={`flex items-center justify-center w-8 py-1.5 sm:w-9 rounded-md transition-all ${val === 'no' ? 'bg-red-600 text-white shadow-sm' : 'text-zinc-400 hover:text-red-400 hover:bg-zinc-800'}`}
                            title="Không"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <div className="flex flex-col md:flex-col gap-6 mt-6">
              <div className="bg-zinc-800/80 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border border-white/10 shadow-xl space-y-4">
                <label className="text-base font-semibold text-white tracking-wide block">Tổng kết cụm mốc cốt hoá</label>
                {Object.entries(dbacSelections).length > 0 && (() => {
                  const grouped: Record<number, { fIdx: number, val: 'yes' | 'maybe' | 'no' }[]> = {};
                  Object.entries(dbacSelections).forEach(([key, val]) => {
                    const [mIdx, fIdx] = key.split('-').map(Number);
                    if (!grouped[mIdx]) grouped[mIdx] = [];
                    grouped[mIdx].push({ fIdx, val: val as 'yes' | 'maybe' | 'no' });
                  });
                  
                  const summaryParts: string[] = [];
                  Object.entries(grouped).forEach(([mIdxStr, items]) => {
                    const mIdx = Number(mIdxStr);
                    const milestone = currentDbacData[mIdx];
                    const yesCount = items.filter(x => x.val === 'yes' || x.val === 'maybe').length;
                    const totalCount = milestone.features.length;
                    summaryParts.push(`${yesCount}/${totalCount} tiêu chuẩn mốc ${milestone.label}`);
                  });
                  const summaryText = `Phim tuổi xương của trẻ có ${summaryParts.join('; ')}.`;
                  
                  // Auto-suggestion logic
                  let minEval = currentDbacData.length;
                  let maxEval = -1;
                  const scores = new Array(currentDbacData.length).fill(0);
                  const isEvaluated = new Array(currentDbacData.length).fill(false);
                  
                  for (let i = 0; i < currentDbacData.length; i++) {
                     const m = currentDbacData[i];
                     const total = m.features.length;
                     if (total === 0) continue;
                     
                     let yesCount = 0;
                     let maybeCount = 0;
                     let evaluated = false;
                     
                     for (let j = 0; j < total; j++) {
                        const val = dbacSelections[`${i}-${j}`];
                        if (val !== undefined) evaluated = true;
                        if (val === 'yes') yesCount++;
                        else if (val === 'maybe') maybeCount++;
                     }
                     
                     if (evaluated) {
                        isEvaluated[i] = true;
                        if (i < minEval) minEval = i;
                        if (i > maxEval) maxEval = i;
                        scores[i] = (yesCount + maybeCount * 0.5) / total;
                     }
                  }
                  
                  const rawScores = [...scores];
                  const rawIsEvaluated = [...isEvaluated];
                  
                  // NEW LOGIC: Advance the baseline if a higher milestone is significantly achieved (> 25%)
                  let activeMax = -1;
                  for (let i = currentDbacData.length - 1; i >= 0; i--) {
                     if (isEvaluated[i] && scores[i] > 0.25) {
                        activeMax = i;
                        break;
                     }
                  }
                  
                  if (activeMax > 0) {
                     for (let j = 0; j < activeMax; j++) {
                        scores[j] = 1;
                        isEvaluated[j] = true;
                     }
                     minEval = 0;
                  }
                  
                  let illogicalWarning = false;
                  for (let i = 1; i < currentDbacData.length - 1; i++) {
                     if (rawScores[i-1] > 0.6 && rawScores[i] < 0.2 && rawScores[i+1] > 0.2) {
                        illogicalWarning = true;
                        break;
                     }
                  }
                  
                  if (!illogicalWarning) {
                     for (let i = 0; i < currentDbacData.length; i++) {
                        if (rawIsEvaluated[i] && rawScores[i] < 0.5) {
                           for (let j = i + 1; j < currentDbacData.length; j++) {
                              if (rawIsEvaluated[j] && rawScores[j] > 0.2) {
                                 illogicalWarning = true;
                                 break;
                              }
                           }
                        }
                        if (illogicalWarning) break;
                     }
                  }
                  
                  let estimatedAgeMonths = 0;
                  let partialLabels: {label: string, score: number, isNext?: boolean}[] = [];
                  
                  if (maxEval !== -1) {
                     const startAge = minEval > 0 ? currentDbacData[minEval - 1].ageMonths : 0;
                     estimatedAgeMonths = startAge;
                     
                     for (let i = minEval; i <= maxEval; i++) {
                         const prevAge = i > 0 ? currentDbacData[i - 1].ageMonths : 0;
                         const currentAge = currentDbacData[i].ageMonths;
                         const delta = currentAge - prevAge;
                         const p = scores[i] || 0;
                         estimatedAgeMonths += p * delta;
                         
                         if (isEvaluated[i] && p > 0 && p < 1) {
                            partialLabels.push({ label: currentDbacData[i].label, score: p });
                         }
                     }
                     
                     if (scores[maxEval] > 0.25 && maxEval < currentDbacData.length - 1) {
                         const nextIdx = maxEval + 1;
                         partialLabels.push({ label: currentDbacData[nextIdx].label, score: 0, isNext: true });
                     } else {
                         const existing = partialLabels.find(pl => pl.label === currentDbacData[maxEval].label);
                         if (existing) {
                             existing.isNext = true;
                         } else {
                             partialLabels.push({ label: currentDbacData[maxEval].label, score: 0, isNext: true });
                         }
                     }
                  }

                  const estM = Math.round(estimatedAgeMonths);
                  const estYears = Math.floor(estM / 12);
                  const estMonths = estM % 12;
                  const estLabel = estM > 0 ? `${estYears} tuổi${estMonths > 0 ? ` ${estMonths} tháng` : ''}` : '';

                  return (
                    <div className="space-y-4">
                      {maxEval !== -1 && estM > 0 && (
                        <div className={`border rounded-xl p-4 ${illogicalWarning ? 'bg-amber-500/10 border-amber-500/30' : 'bg-indigo-500/10 border-indigo-500/30'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            {illogicalWarning ? <Info className="text-amber-400" size={20} /> : <CheckCheck className="text-indigo-400" size={20} />}
                            <h4 className={`font-semibold ${illogicalWarning ? "text-amber-300" : "text-indigo-300"}`}>
                              {illogicalWarning ? "Cảnh báo logic dữ liệu" : "Tự động đề xuất tuổi xương"}
                            </h4>
                          </div>
                          
                          {illogicalWarning ? (
                            <p className="text-amber-400/90 text-sm mt-1 mb-2">Vui lòng xem lại các dấu hiệu! Hệ thống phát hiện sự thiếu logic (có mốc chưa đạt nhưng lại đạt mốc cao hơn).</p>
                          ) : (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-1 gap-3">
                              <p className="text-white text-sm">
                                <span className="hidden sm:inline">Tuổi xương ước tính (không chính thức): <span className="font-bold text-lg text-emerald-400">{estLabel}</span></span>
                                <span className="sm:hidden block">
                                  Tuổi xương ước tính (không chính thức): <br />
                                  <span className="font-bold text-lg text-emerald-400 uppercase">{estLabel}</span>
                                </span>
                              </p>
                              <button
                                onClick={() => {
                                  setDbacBoneAgeYears(estYears);
                                  setDbacBoneAgeMonths(estMonths);
                                }}
                                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto"
                              >
                                <Check size={16} /> Chốt kết quả
                              </button>
                            </div>
                          )}
                          
                          {partialLabels.length > 0 && (
                             <div className="mt-4 space-y-3">
                               {partialLabels.map((pl, idx) => (
                                 <div key={idx}>
                                   <p className="text-zinc-300 text-sm flex items-center justify-between mb-1">
                                     <span>Tỉ lệ đạt tiêu chuẩn cho mốc {pl.label}:</span>
                                     <span className="font-medium text-xs" style={{ color: `hsl(${220 - pl.score * 220}, 80%, 65%)` }}>{Math.round(pl.score * 100)}%</span>
                                   </p>
                                   <div className="w-full bg-zinc-900 rounded-full h-2 relative overflow-hidden">
                                     <div className="h-2 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(255,255,255,0.2)]" style={{ width: `${Math.round(pl.score * 100)}%`, backgroundColor: `hsl(${220 - pl.score * 220}, 80%, 50%)` }}></div>
                                   </div>
                                   {pl.isNext && (
                                     <p className="text-amber-400 text-xs mt-2 italic flex items-center gap-1">
                                        <Info size={12} className="shrink-0"/> Vui lòng kiểm tra các dấu hiệu của mốc tuổi {pl.label}
                                     </p>
                                   )}
                                 </div>
                               ))}
                             </div>
                          )}
                        </div>
                      )}
                      
                      <p className="text-sm text-zinc-300 italic">{summaryText}</p>
                      {Object.keys(grouped).map(mIdxStr => {
                        const mIdx = Number(mIdxStr);
                        const milestone = currentDbacData[mIdx];
                        return (
                          <div key={mIdxStr} className="space-y-3">
                            <h4 className="text-sm font-bold text-indigo-300 bg-indigo-500/20 inline-block px-3 py-1 rounded-lg border border-indigo-500/30">Mốc {milestone.label}</h4>
                            <div className="space-y-2 pl-1">
                              {grouped[mIdx].map(({ fIdx, val }) => (
                                <div key={fIdx} className="flex items-start gap-3 text-sm">
                                  <span className={`shrink-0 w-14 text-center font-bold whitespace-nowrap px-2 py-0.5 rounded text-xs mt-0.5 ${val === 'yes' ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20' : val === 'maybe' ? 'text-amber-400 bg-amber-400/10 border border-amber-400/20' : 'text-red-400 bg-red-400/10 border border-red-400/20'}`}>{val === 'yes' ? 'Có' : val === 'maybe' ? 'Có' : 'Không'}</span>
                                  <span className="text-zinc-300 leading-relaxed text-base">{milestone.features[fIdx]}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
                <div className="pt-4 border-t border-white/10 mt-2">
                  <label className="text-sm font-medium text-white/70 block mb-2">Dấu hiệu khác (nếu có)</label>
                  <input 
                    type="text" 
                    value={dbacOtherFeatures} 
                    onChange={e => setDbacOtherFeatures(e.target.value)} 
                    className="w-full bg-zinc-900 border border-white/20 text-white rounded-lg px-4 py-2.5 text-base focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-zinc-600" 
                    placeholder="Nhập dấu hiệu xương ghi nhận thêm..." 
                  />
                </div>
              </div>

              <div className="bg-zinc-800/80 backdrop-blur-sm p-5 md:p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl w-full">
                <div className="flex flex-col gap-1">
                  <label className="text-sm md:text-base font-semibold text-white tracking-wide">{'Kết luận mốc tuổi xương (Gaskin Atlas):'}</label>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                  <div className="flex items-center gap-2">
                    <input 
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={dbacBoneAgeYears} 
                      onChange={e => {
                        let val = e.target.value.replace(/\D/g, '');
                        setDbacBoneAgeYears(val === '' ? '' : Number(val));
                      }} 
                      placeholder="0"
                      className="w-16 md:w-20 bg-zinc-900 border border-white/20 text-white rounded-xl px-3 py-3 focus:outline-none focus:border-indigo-500 hover:border-white/30 transition-all font-bold text-lg text-center shadow-inner" 
                    />
                    <span className="text-zinc-300">tuổi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={dbacBoneAgeMonths} 
                      onChange={e => {
                        let val = e.target.value.replace(/\D/g, '');
                        setDbacBoneAgeMonths(val === '' ? '' : Number(val));
                      }} 
                      placeholder="0"
                      className="w-16 md:w-20 bg-zinc-900 border border-white/20 text-white rounded-xl px-3 py-3 focus:outline-none focus:border-indigo-500 hover:border-white/30 transition-all font-bold text-lg text-center shadow-inner" 
                    />
                    <span className="text-zinc-300">tháng</span>
                  </div>
                  {renderProgressIndicator(dbacBoneAgeYears, dbacBoneAgeMonths)}
                </div>
              </div>
            </div>
            {/* Abnormal morphology Section */}
            <div className="bg-zinc-800/80 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between">
                <label className="text-sm sm:text-base font-semibold text-white tracking-wide">Bất thường hình thái xương:</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="abnormality"
                      checked={hasAbnormality === true} 
                      onChange={() => setHasAbnormality(true)}
                    />
                    <span className="text-zinc-200">Có</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="abnormality"
                      checked={hasAbnormality === false} 
                      onChange={() => {
                        setHasAbnormality(false);
                        setAbnormalityDetails('');
                      }}
                    />
                    <span className="text-zinc-200">Không</span>
                  </label>
                </div>
              </div>
              {hasAbnormality && (
                <div>
                  <textarea
                    value={abnormalityDetails}
                    onChange={e => setAbnormalityDetails(e.target.value)}
                    placeholder="Mô tả chi tiết các bất thường hình thái xương ghi nhận trên phim..."
                    className="w-full bg-zinc-900 border border-white/20 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-zinc-600 min-h-[80px] resize-y"
                  />
                </div>
              )}
            </div>
            </motion.div>
            )}
            </AnimatePresence>
          </section>
        )}

        {/* Sauvegrain Module */}
        {isExpertMode && ((realAgeYears >= 9 && realAgeYears <= 13 && gender === 'girl') || (realAgeYears >= 11 && realAgeYears <= 15 && gender === 'boy')) && (
          <section className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shrink-0" />
                Đối chiếu tuổi xương theo phương pháp Sauvegrain
              </h2>
              <button
                 onClick={() => setIsSauvegrainVisible(!isSauvegrainVisible)}
                 className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors bg-white/10 border-white/20 hover:bg-white/20 text-white"
              >
                 {isSauvegrainVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                 {isSauvegrainVisible ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
            
            <AnimatePresence>
            {isSauvegrainVisible && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-6"
              >
                <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-[0_4px_20px_rgba(99,102,241,0.15)] bg-zinc-800 flex flex-col lg:flex-row items-stretch min-h-[400px] p-4 md:p-8 gap-8">
                   
                   <div className="w-full lg:w-1/2 flex items-center justify-center">
                     {(sauvegrainScore1 !== '' && sauvegrainScore2 !== '' && sauvegrainScore3 !== '' && sauvegrainScore4 !== '') ? (
                       <div className="flex flex-col items-center w-full">
                         <p className="text-center text-sm font-medium text-zinc-400 mb-4">Bảng kết quả đối chiếu tuổi ({gender === 'boy' ? 'Nam' : 'Nữ'}):</p>
                         <img src={gender === 'boy' ? "/Sauve Boy Result.png" : "/Sauve Girl Result.png"} alt="Kết quả Sauvegrain" className="w-full max-w-xl object-contain rounded-lg" />
                       </div>
                     ) : (
                       <img src="/Sauvegrain 01.jpg" alt="Sauvegrain Methods" className="w-full max-w-xl object-contain rounded-lg" />
                     )}
                   </div>
                   
                   <div className="w-full lg:w-1/2 bg-zinc-900/80 backdrop-blur border border-white/10 p-6 sm:p-8 rounded-3xl text-white flex flex-col justify-center shadow-2xl">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                          <Check size={20} className="text-indigo-400" />
                        </div>
                        <h3 className="font-bold text-xl text-white">Chấm điểm Sauvegrain</h3>
                      </div>

                      <div className="flex-1 flex flex-col space-y-4">
                          <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-800/50 border border-white/5 hover:border-white/10 transition-colors gap-4">
                             <div className="flex flex-col flex-1 pr-2">
                               <span className="font-medium text-zinc-200 text-sm md:text-base break-words leading-snug">1. Lồi cầu ngoài & mỏm trên lồi cầu</span>
                             </div>
                             <input type="number" min="1" max="9" placeholder="1-9" value={sauvegrainScore1} onChange={e => { let v = e.target.value.replace(/\D/g, ''); if(v) { let n=Number(v); if(n>9)n=9; if(n<1)n=1; setSauvegrainScore1(n); } else setSauvegrainScore1(''); }} className="w-16 md:w-20 bg-zinc-950 border border-white/10 text-white rounded-xl px-2 py-3 focus:outline-none focus:border-indigo-500 transition-colors text-center font-bold text-base md:text-lg placeholder:text-zinc-600 placeholder:font-normal" />
                          </div>

                          <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-800/50 border border-white/5 hover:border-white/10 transition-colors gap-4">
                             <div className="flex flex-col flex-1 pr-2">
                               <span className="font-medium text-zinc-200 text-sm md:text-base break-words leading-snug">2. Ròng rọc thuộc xương cánh tay</span>
                             </div>
                             <input type="number" min="1" max="5" placeholder="1-5" value={sauvegrainScore2} onChange={e => { let v = e.target.value.replace(/\D/g, ''); if(v) { let n=Number(v); if(n>5)n=5; if(n<1)n=1; setSauvegrainScore2(n); } else setSauvegrainScore2(''); }} className="w-16 md:w-20 bg-zinc-950 border border-white/10 text-white rounded-xl px-2 py-3 focus:outline-none focus:border-indigo-500 transition-colors text-center font-bold text-base md:text-lg placeholder:text-zinc-600 placeholder:font-normal" />
                          </div>

                          <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-800/50 border border-white/5 hover:border-white/10 transition-colors gap-4">
                             <div className="flex flex-col flex-1 pr-2">
                               <span className="font-medium text-zinc-200 text-sm md:text-base break-words leading-snug">3. Mỏm khuỷu thuộc xương trụ</span>
                             </div>
                             <input type="number" min="1" max="7" placeholder="1-7" value={sauvegrainScore3} onChange={e => { let v = e.target.value.replace(/\D/g, ''); if(v) { let n=Number(v); if(n>7)n=7; if(n<1)n=1; setSauvegrainScore3(n); } else setSauvegrainScore3(''); }} className="w-16 md:w-20 bg-zinc-950 border border-white/10 text-white rounded-xl px-2 py-3 focus:outline-none focus:border-indigo-500 transition-colors text-center font-bold text-base md:text-lg placeholder:text-zinc-600 placeholder:font-normal" />
                          </div>

                          <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-800/50 border border-white/5 hover:border-white/10 transition-colors gap-4">
                             <div className="flex flex-col flex-1 pr-2">
                               <span className="font-medium text-zinc-200 text-sm md:text-base break-words leading-snug">4. Đầu trên xương quay</span>
                             </div>
                             <input type="number" min="1" max="6" placeholder="1-6" value={sauvegrainScore4} onChange={e => { let v = e.target.value.replace(/\D/g, ''); if(v) { let n=Number(v); if(n>6)n=6; if(n<1)n=1; setSauvegrainScore4(n); } else setSauvegrainScore4(''); }} className="w-16 md:w-20 bg-zinc-950 border border-white/10 text-white rounded-xl px-2 py-3 focus:outline-none focus:border-indigo-500 transition-colors text-center font-bold text-base md:text-lg placeholder:text-zinc-600 placeholder:font-normal" />
                          </div>
                      </div>
                      
                      <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                          <span className="font-medium text-lg text-zinc-400">Tổng điểm:</span>
                          <span className="text-indigo-400 font-bold text-3xl">{(sauvegrainScore1 || 0) + (sauvegrainScore2 || 0) + (sauvegrainScore3 || 0) + (sauvegrainScore4 || 0)}</span>
                      </div>
                   </div>
                </div>

                <div className="bg-zinc-800/80 backdrop-blur-sm p-5 md:p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl w-full text-white">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm md:text-base font-semibold tracking-wide">Kết luận tuổi xương khớp khuỷu (Sauvegrain):</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={sauvegrainAgeYears} 
                      onChange={e => {
                        let val = e.target.value.replace(/\D/g, '');
                        setSauvegrainAgeYears(val === '' ? '' : Number(val));
                      }} 
                      placeholder="0"
                      className="w-16 md:w-20 bg-zinc-900 border border-white/20 rounded-xl px-3 py-3 focus:outline-none focus:border-indigo-500 hover:border-white/30 transition-all font-bold text-lg text-center shadow-inner" 
                    />
                    <span className="text-zinc-300">tuổi</span>
                    <input 
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={sauvegrainAgeMonths} 
                      onChange={e => {
                        let val = e.target.value.replace(/\D/g, '');
                        setSauvegrainAgeMonths(val === '' ? '' : Number(val));
                      }} 
                      placeholder="0"
                      className="w-16 md:w-20 bg-zinc-900 border border-white/20 rounded-xl px-3 py-3 focus:outline-none focus:border-indigo-500 hover:border-white/30 transition-all font-bold text-lg text-center shadow-inner" 
                    />
                    <span className="text-zinc-300">tháng</span>
                  </div>
                </div>
              </motion.div>
            )}
            </AnimatePresence>
          </section>
        )}

        {/* X-ray Section */}
        {false && (
          <section className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
              <Camera size={20} className="text-emerald-400" />
              {'X-quang của trẻ'}
            </h2>
            <div className="flex items-center gap-4">
              {xrayImage && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsXrayMagnifierActive(!isXrayMagnifierActive)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${isXrayMagnifierActive ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 'bg-white/10 border-white/20 hover:bg-white/20 text-white'}`}
                  >
                    <Search size={16} className="shrink-0" />
                    <span className="hidden sm:inline">{'Kính lúp'}</span>
                  </button>
                </div>
              )}
              <button
                onClick={() => setIsXrayVisible(!isXrayVisible)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors text-sm font-medium border border-white/20"
              >
                {isXrayVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                {isXrayVisible ? 'Ẩn phim' : 'Hiện phim'}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isXrayVisible && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-6">
                  {!xrayImage ? (
                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-white/20 rounded-xl space-y-4">
                      <div className="p-4 bg-emerald-500/10 rounded-full">
                        <Upload size={32} className="text-emerald-500" />
                      </div>
                      <div className="text-center space-y-1 px-4">
                        <p className="text-white font-medium">{'Tải lên hoặc Chụp ảnh'}</p>
                      </div>
                      <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl transition-colors font-semibold shadow-lg shadow-emerald-900/20">
                        {'Tải lên hoặc Chụp ảnh'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleXrayUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="relative group flex justify-center items-center bg-black rounded-xl border border-white/10 overflow-hidden">
                      <MagnifiableImage src={xrayImage} isActive={isXrayMagnifierActive} />
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <label className="cursor-pointer p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg transition-colors">
                          <Camera size={20} />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleXrayUpload}
                            className="hidden"
                          />
                        </label>
                        <button
                          onClick={() => setXrayImage(null)}
                          className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-lg transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
        )}

        {/* Conclusion Section */}
        {isExpertMode && expertBoneAgeYears !== '' && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">{'Kết luận'}</h2>
              </div>
              <div className="p-4 md:p-6 bg-yellow-50 border border-yellow-200 rounded-2xl relative group">
                <div className="text-zinc-800 leading-relaxed font-sans text-sm md:text-base whitespace-pre-wrap">
                  {renderExpertConclusionDisplay()}
                </div>
              </div>
              
              {(() => {
                const devZ = getDeviationAndZScore();
                if (devZ && devZ.diffText && devZ.significanceText) {
                  const formattedBoneAge = expertBoneAgeYears !== '' ? `${expertBoneAgeYears} tuổi ${expertBoneAgeMonths || 0} tháng` : '-';
                  const dbacPopulated = dbacBoneAgeYears !== '';
                  let dbacFormatted = '-';
                  if (dbacPopulated) {
                    const baDecimal = Number(dbacBoneAgeYears) + Number(dbacBoneAgeMonths || 0) / 12;
                    const bxAge = getBxChina05Age(baDecimal, gender);
                    const bxYears = Math.floor(bxAge);
                    const bxMonths = Math.round((bxAge - bxYears) * 12);
                    const bxFormatted = bxMonths === 12 ? `${bxYears + 1} tuổi 0 tháng` : `${bxYears} tuổi ${bxMonths} tháng`;
                    dbacFormatted = `${dbacBoneAgeYears} tuổi ${dbacBoneAgeMonths || 0} tháng (Gaskin et al); ${bxFormatted} (BX-China05, Zhang et al)`;
                  }
                  const boneAgeSummary = `Áp dụng phương pháp GP với 2 atlas, bác sĩ lâm sàng ghi nhận tuổi xương ước tính: ${formattedBoneAge} (Gilsanz & Ratib); ${dbacFormatted}.`;
                  const shortText = `${boneAgeSummary} ${devZ.shortDeltaText}`;
                  return (
                    <div className="p-4 md:p-6 bg-indigo-50/10 border border-indigo-500/30 rounded-2xl relative group">
                      <div className="text-indigo-50 leading-relaxed font-sans text-sm md:text-base">
                        <span className="font-bold text-indigo-300 mr-2">Kết luận rút gọn:</span>
                        {shortText}
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(shortText);
                            alert('Đã sao chép kết luận rút gọn!');
                          }}
                          className="inline-flex items-center ml-2 p-1.5 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/40 rounded-md transition-colors shadow-sm align-middle"
                          title="Sao chép kết luận rút gọn"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 mt-5 pt-5 border-t border-indigo-500/20">
                        <button 
                          onClick={() => promptExportConfirm('docx')}
                          className="flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-blue-900/20"
                        >
                          <FileType size={16} className="mr-2" /> Xuất Word
                        </button>
                        <button 
                          onClick={() => promptExportConfirm('pdf')}
                          className="flex items-center px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-rose-900/20"
                        >
                          <FileText size={16} className="mr-2" /> Xuất PDF
                        </button>
                        <button 
                          onClick={() => promptExportConfirm('reset')}
                          className="flex items-center px-4 py-2.5 bg-zinc-600 hover:bg-zinc-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-zinc-900/20 md:ml-auto"
                        >
                          <RotateCcw size={16} className="mr-2" /> Reset ca nhập
                        </button>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Separate Card for Chart */}
              {(() => {
                const devZ = getDeviationAndZScore();
                if (devZ && devZ.zScores && devZ.zScores.length > 0) {
                  return (
                    <div className="mt-6 p-4 md:p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm">
                      <NormalDistributionChart zScores={devZ.zScores} />
                    </div>
                  );
                }
                return null;
              })()}
            </section>
          )}
        


        {/* Patient Records Dashboard */}
        {isExpertMode && (
          <section className="bg-zinc-800 p-4 sm:p-5 rounded-2xl border border-white/10 shadow-sm mt-8 space-y-4 overflow-hidden">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
              <h2 className="text-lg font-semibold text-white">Danh sách kết quả</h2>
              <div className="flex flex-wrap gap-2 w-full xl:w-auto">
                <button
                  onClick={handleSavePatient}
                  className="flex-1 xl:flex-none flex items-center justify-center px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors text-sm font-semibold shadow-lg shadow-emerald-900/10 min-w-0 sm:min-w-[140px]"
                >
                  <Copy size={16} className="inline sm:mr-1 -mt-0.5" /> <span className="hidden sm:inline">Lưu Case</span>
                </button>
                <button
                  onClick={handleExportRecords}
                  className="flex-1 xl:flex-none flex items-center justify-center px-3 sm:px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition-colors text-sm font-semibold shadow-lg shadow-sky-900/10 min-w-0 sm:min-w-[140px]"
                >
                  <Download size={16} className="inline sm:mr-1 -mt-0.5" /> <span className="hidden sm:inline">Sao lưu</span>
                </button>
                <label className="flex-1 xl:flex-none flex items-center justify-center px-3 sm:px-4 py-2 rounded-xl bg-zinc-600 hover:bg-zinc-500 text-white transition-colors text-sm font-semibold shadow-lg cursor-pointer text-center min-w-0 sm:min-w-[140px]">
                  <Upload size={16} className="inline sm:mr-1 -mt-0.5" /> <span className="hidden sm:inline">Khôi phục</span>
                  <input type="file" accept=".json" onChange={handleImportRecords} className="hidden" />
                </label>
              </div>
            </div>
            
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-zinc-900/30">
              <table className="w-full text-left text-sm text-zinc-300 min-w-[800px]">
                <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/80">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Khám</th>
                    <th className="px-4 py-3 font-semibold">Tên & ID</th>
                    <th className="px-4 py-3 font-semibold">Tuổi</th>
                    <th className="px-4 py-3 font-semibold">Giới tính</th>
                    <th className="px-4 py-3 font-semibold">Lý do</th>
                    <th className="px-4 py-3 font-semibold">Glisanz-Osman</th>
                    <th className="px-4 py-3 font-semibold">Gaskin et al</th>
                    <th className="px-4 py-3 font-semibold text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {patientRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-zinc-500 font-medium">
                        Chưa có ca bệnh lưu trữ.
                      </td>
                    </tr>
                  ) : (
                    patientRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-zinc-700/30 transition-colors group">
                        <td className="px-4 py-3 whitespace-nowrap text-zinc-400">{record.examDate}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-white/90">{record.patientName || '-'}</div>
                          <div className="text-[11px] text-zinc-500 tracking-wide font-mono mt-0.5">{record.patientId || '-'}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-white/80">{record.realAgeYears}y {record.realAgeMonths}m</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={record.gender === 'boy' ? 'text-blue-400' : 'text-pink-400'}>{record.gender === 'boy' ? 'Nam' : 'Nữ'}</span>
                        </td>
                        <td className="px-4 py-3"><span className="text-zinc-400 max-w-[150px] truncate block" title={record.clinicalReason}>{record.clinicalReason}</span></td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {record.boneAge1 ? <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-xs font-mono">{record.boneAge1}</span> : '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {record.boneAge2 ? <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-xs font-mono">{record.boneAge2}</span> : '-'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => {
                              if (window.confirm('Bạn có chắc chắn muốn xoá ca này không?')) {
                                handleDeleteRecord(record.id);
                              }
                            }}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-1.5 rounded-lg transition-colors"
                            title="Xoá ca này"
                          >
                            <X size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
        </>
        )}
      </main>

      {/* Reference Section */}
      {isExpertMode && (
        <section className="max-w-7xl mx-auto mt-8 border-t border-white/10 pt-6 px-4">
          <button 
            onClick={() => setShowRef(!showRef)}
            className="flex items-center justify-center w-full gap-2 text-zinc-400 hover:text-zinc-200 transition-colors text-sm font-medium"
          >
            <ChevronDown size={16} className={`transition-transform ${showRef ? 'rotate-180' : ''}`} />
            Tài liệu tham khảo và Nguyên lí đánh giá
          </button>
          
          <AnimatePresence>
            {showRef && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-4 bg-zinc-900/50 rounded-xl border border-white/5 space-y-3 text-xs md:text-sm text-zinc-400">
                  <p>1. Bunch, P. M., Altes, T. A., McIlhenny, J., Patrie, J., & Gaskin, C. M. (2017). Skeletal development of the hand and wrist: digital bone age companion-a suitable alternative to the Greulich and Pyle atlas for bone age assessment?. Skeletal radiology, 46(6), 785–793.</p>
                  <p>2. Gilsanz V, Ratib O. Hand bone age a digital atlas of skeletal maturity. New York: Springer; 2011; Second Edition.</p>
                  <p>3. Martin, D. D., Wit, J. M., Hochberg, Z., Sävendahl, L., van Rijn, R. R., Fricke, O., Cameron, N., Caliebe, J., Hertel, T., Kiepe, D., Albertsson-Wikland, K., Thodberg, H. H., Binder, G., & Ranke, M. B. (2011). The use of bone age in clinical practice - part 1. Hormone research in paediatrics, 76(1), 1–9. https://doi.org/10.1159/000329372</p>
                  <p>4. Greulich WW, Pyle SI. Radiographic Atlas of Skeletal Development of the Hand and Wrist, 2nd ed. Stanford, CA: Stanford University Press and London, UK: Oxford University Press, 1959.</p>
                  <p>5. Zhang, Shao-Yan et al. “Automated determination of bone age in a modern chinese population.” ISRN radiology vol. 2013 874570. 25 Feb. 2013, doi:10.5402/2013/874570</p>
                  <p>6. Diméglio, Alain (2005). Accuracy of the Sauvegrain Method in Determining Skeletal Age During Puberty. The Journal of Bone and Joint Surgery (American), 87(8), 1689–. doi:10.2106/JBJS.D.02418</p>

                  <div className="mt-6 space-y-3 text-[11px] md:text-xs text-zinc-500 pt-3 border-t border-white/5">
                    <p><strong>Atlas tuổi xương của Gilsanz và Ratib ["rượu mới bình mới"]:</strong> Hình ảnh "lý tưởng hóa" (idealized images) tạo ra bằng kĩ thuật số; Dựa trên quần thể trẻ em người da trắng (Caucasian) khỏe mạnh trong bối cảnh hiện đại (đầu những năm 2000). Các trẻ được lựa chọn đều có chỉ số cân nặng bình thường và các giai đoạn phát triển dậy thì (Tanner stage) hoàn toàn bình thường.</p>
                    <p><strong>Atlas tuổi xương của Gaskin ["bình mới rượu cũ"]:</strong> Chỉnh sửa kỹ thuật số từng phần xương (digitally edited standards); Nhóm tác giả của Gaskin đã lấy dữ liệu từ các phim chụp X-quang kỹ thuật số (CR/DR) chất lượng cao của bệnh nhi thời hiện đại (trước 2011). Với tiêu chí kế thừa trực tiếp hệ thống phân loại của G&P, dữ liệu nền tảng của Gaskin vẫn dựa trên tiêu chuẩn cốt hoá của nghiên cứu Brush Foundation (tiến hành từ 1931-1942 trên gần 1.000 trẻ em da trắng, thuộc tầng lớp trung lưu tại Ohio, Mỹ).</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}

      {showConfirmPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700/50 p-6 md:p-8 rounded-3xl shadow-2xl max-w-sm w-full relative">
            <h3 className="text-xl font-bold text-white mb-6 text-center">Xác nhận thông tin</h3>
            <div className="space-y-4 text-sm sm:text-base text-zinc-300">
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span>Khách hàng:</span>
                <span className="font-semibold text-white">{patientName || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span>Mã KH:</span>
                <span className="font-semibold text-white">{patientId || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2 mt-2 -mx-4 px-4 py-2 bg-yellow-500/10 text-yellow-300 rounded animate-pulse">
                <span>Giới tính:</span>
                <span className="font-bold">{gender === 'boy' ? 'Nam' : 'Nữ'}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span>Ngày sinh:</span>
                <span className="font-semibold text-white">{dob || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span>Ngày chụp:</span>
                <span className="font-semibold text-white">{xrayDate || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2 mt-2 -mx-4 px-4 py-2 bg-yellow-500/10 text-yellow-300 rounded animate-pulse">
                <span>Tuổi lúc chụp (CA):</span>
                <span className="font-bold">{realAgeYears} tuổi {realAgeMonths} tháng</span>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowConfirmPopup(false)}
                className="flex-1 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  setIsPatientConfirmed(true);
                  setShowConfirmPopup(false);
                  setTimeout(() => {
                    document.getElementById('atlas-target')?.scrollIntoView({ behavior: 'smooth' });
                  }, 200);
                }}
                className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors shadow-lg shadow-emerald-900/20"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {showExportConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700/50 p-6 md:p-8 rounded-3xl shadow-2xl max-w-sm sm:max-w-md w-full relative">
            <h3 className="text-xl font-bold text-white mb-6 text-center">Xác nhận thao tác</h3>
            {exportAction === 'reset' ? (
              <div className="text-center text-zinc-300 py-4">
                Bạn có chắc chắn muốn reset để tạo ca mới? Toàn bộ dữ liệu hiện tại sẽ bị xóa.
              </div>
            ) : (
              <div className="space-y-4 text-sm sm:text-base text-zinc-300">
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span>Khách hàng:</span>
                  <span className="font-semibold text-white truncate max-w-[200px] text-right">{patientName || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2 mt-2 -mx-4 px-4 py-2 bg-yellow-500/10 text-yellow-300 rounded animate-pulse">
                  <span>Tuổi lúc chụp (CA):</span>
                  <span className="font-bold text-right">{realAgeYears} tuổi {realAgeMonths} tháng</span>
                </div>
                <div className="border-b border-zinc-800 pb-2 flex flex-col space-y-1">
                  <span className="text-zinc-500 text-sm">Kết luận rút gọn:</span>
                  <span className="font-medium text-white break-words mt-1">
                    {(() => {
                      const devZ = getDeviationAndZScore();
                      if (!devZ) return '-';
                      const formattedBoneAge = expertBoneAgeYears !== '' ? `${expertBoneAgeYears} tuổi ${expertBoneAgeMonths || 0} tháng` : '-';
                      const dbacPopulated = dbacBoneAgeYears !== '';
                      let dbacFormatted = '-';
                      if (dbacPopulated) {
                        const baDecimal = Number(dbacBoneAgeYears) + Number(dbacBoneAgeMonths || 0) / 12;
                        const bxAge = getBxChina05Age(baDecimal, gender);
                        const bxYears = Math.floor(bxAge);
                        const bxMonths = Math.round((bxAge - bxYears) * 12);
                        const bxFormatted = bxMonths === 12 ? `${bxYears + 1} tuổi 0 tháng` : `${bxYears} tuổi ${bxMonths} tháng`;
                        dbacFormatted = `${dbacBoneAgeYears} tuổi ${dbacBoneAgeMonths || 0} tháng (Gaskin et al); ${bxFormatted} (BX-China05, Zhang et al)`;
                      }
                      const boneAgeSummary = `Áp dụng phương pháp GP với 2 atlas, bác sĩ lâm sàng ghi nhận tuổi xương ước tính: ${formattedBoneAge} (Gilsanz & Ratib); ${dbacFormatted}.`;
                      return `${boneAgeSummary} ${devZ.shortDeltaText}`;
                    })()}
                  </span>
                </div>
              </div>
            )}
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setShowExportConfirm(false);
                  setExportAction(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmExportAction}
                className={`flex-[1.5] px-4 py-2.5 rounded-xl text-white font-bold transition-colors shadow-lg ${
                  exportAction === 'docx' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20' :
                  exportAction === 'pdf' ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/20' :
                  'bg-zinc-600 hover:bg-zinc-500 shadow-zinc-900/20'
                }`}
              >
                {exportAction === 'docx' ? 'Xuất Word' :
                 exportAction === 'pdf' ? 'Xuất PDF' :
                 'Xác nhận Làm mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {pendingAdminChange && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-white/10 p-6 rounded-2xl max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-2">Tạo ca khám mới?</h3>
              <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                Thay đổi thông tin hành chính (giới tính, họ tên, ...) sẽ <strong className="text-white">làm mới ca khám và xoá kết quả đánh giá hiện tại</strong>. Bạn có chắc chắn muốn tiếp tục?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelAdminChange}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Huỷ bỏ
                </button>
                <button
                  onClick={confirmAdminChange}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-900/20"
                >
                  Đồng ý tạo ca mới
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Crop Modal */}
      {unprocessedXrayImage && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-black/90 backdrop-blur-md items-center justify-center p-4">
          <div className="relative w-full h-[50vh] sm:h-[60vh] max-w-4xl max-h-[800px] mb-4">
            <Cropper
              image={unprocessedXrayImage}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              onCropChange={setCrop}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              onMediaLoaded={(mediaSize) => setOriginalAspect(mediaSize.width / mediaSize.height)}
              transform={`translate(${crop.x}px, ${crop.y}px) rotate(${rotation}deg) scale(${zoom * (flipH ? -1 : 1)}, ${zoom * (flipV ? -1 : 1)})`}
            />
          </div>
          <div className="flex flex-col items-center gap-6 bg-zinc-900 p-6 rounded-2xl border border-white/10 shadow-2xl w-full max-w-md my-4 z-10">
            <h3 className="text-white font-semibold text-lg">Chỉnh sửa phim X-quang</h3>
            <div className="flex flex-col gap-4 w-full">
              <div className="flex items-center gap-4 w-full">
                <span className="text-white/70 text-sm font-medium w-20">Tỷ lệ</span>
                <div className="flex gap-2 flex-1 text-xs">
                  <button onClick={() => setAspect(1)} className={`py-1.5 px-2 flex-1 rounded-lg border transition-colors ${aspect === 1 ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-zinc-800 border-white/10 text-white hover:bg-zinc-700'}`}>1:1</button>
                  <button onClick={() => setAspect(3/4)} className={`py-1.5 px-2 flex-1 rounded-lg border transition-colors ${aspect === 3/4 ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-zinc-800 border-white/10 text-white hover:bg-zinc-700'}`}>3:4</button>
                  <button onClick={() => setAspect(4/3)} className={`py-1.5 px-2 flex-1 rounded-lg border transition-colors ${aspect === 4/3 ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-zinc-800 border-white/10 text-white hover:bg-zinc-700'}`}>4:3</button>
                  <button onClick={() => setAspect(originalAspect)} className={`py-1.5 px-2 flex-1 rounded-lg border transition-colors ${aspect === originalAspect ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-zinc-800 border-white/10 text-white hover:bg-zinc-700'}`}>Gốc</button>
                  <button onClick={() => setAspect(undefined as any)} className={`py-1.5 px-2 flex-1 rounded-lg border transition-colors ${aspect === undefined ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-zinc-800 border-white/10 text-white hover:bg-zinc-700'}`}>Tự do</button>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full">
                <span className="text-white/70 text-sm font-medium w-20">Lật</span>
                <div className="flex gap-2 flex-1">
                  <button onClick={() => setFlipH(!flipH)} className={`flex-1 py-1.5 rounded-lg border flex items-center justify-center gap-2 transition-colors ${flipH ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-zinc-800 border-white/10 text-white hover:bg-zinc-700'}`}>
                    <FlipHorizontal size={18} /> Lật ngang
                  </button>
                  <button onClick={() => setFlipV(!flipV)} className={`flex-1 py-1.5 rounded-lg border flex items-center justify-center gap-2 transition-colors ${flipV ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-zinc-800 border-white/10 text-white hover:bg-zinc-700'}`}>
                    <FlipVertical size={18} /> Lật dọc
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full">
                <span className="text-white/70 text-sm font-medium w-20">Xoay</span>
                <input
                  type="range"
                  value={rotation}
                  min={0}
                  max={360}
                  step={1}
                  aria-label="Xoay"
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="flex-1 accent-emerald-500"
                />
                <span className="text-white/50 text-xs w-8 text-right">{rotation}°</span>
              </div>
              <div className="flex items-center gap-4 w-full">
                <span className="text-white/70 text-sm font-medium w-20">Thu/phóng</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={4}
                  step={0.1}
                  aria-label="Thu/phóng"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 accent-emerald-500"
                />
                <span className="text-white/50 text-xs w-8 text-right">{zoom.toFixed(1)}x</span>
              </div>
            </div>
            <div className="flex gap-4 w-full mt-2">
              <button
                onClick={handleCancelCrop}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors border border-white/5"
              >
                Hủy
              </button>
              <button
                onClick={handleApplyCrop}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Check size={18} />
                Lưu & Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 pb-12 mt-12 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-1 text-white/50 text-xs font-medium tracking-wide">
          <p>
            Bản quyền thuộc về <a href="https://tamanhhospital.vn/chuyen-gia/do-tien-son/" target="_blank" rel="noreferrer" className="hover:text-white/70 transition-colors">BS. Đỗ Tiến Sơn</a> &copy; 2026
          </p>
          <p>Mọi quyền đều được bảo vệ</p>
        </div>
      </footer>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-amber-500 text-white text-[10px] sm:text-xs font-semibold py-1 px-4 overflow-hidden flex items-center w-full shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
  <div className="animate-marquee-mobile sm:w-full sm:text-center w-full">
    KẾT QUẢ DO BÁC SĨ PHÂN TÍCH THỦ CÔNG - KHÔNG PHẢI SẢN PHẨM CỦA TRÍ TUỆ NHÂN TẠO (AI)
  </div>
</div>
    </div>
  );
}