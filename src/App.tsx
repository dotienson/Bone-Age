import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Copy, Check, CheckCheck, Info, Languages, User, FileText, Search, Lock, Camera, Upload, Eye, EyeOff, X, RotateCcw, LogOut, ChevronDown, Download, FileType, Dog, BookOpen } from 'lucide-react';
import { Document as DocxDocument, Packer, Paragraph, TextRun, AlignmentType, SectionType, BorderStyle, PageBorderDisplay, PageBorderOffsetFrom, Table, TableRow, TableCell, WidthType, VerticalAlign, UnderlineType } from 'docx';
import { saveAs } from 'file-saver';
import { Document, Page, pdfjs } from 'react-pdf';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot, AreaChart, Area, ReferenceArea } from 'recharts';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ATLAS_DATA, AtlasEntry } from './data';
import { DBAC_DATA_BOY } from './dbac_data';
import { DBAC_DATA_GIRL } from './dbac_data_girl';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const MagnifiablePage = ({ pageNumber, width, isActive }: { pageNumber: number, width: number, isActive: boolean }) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [show, setShow] = useState(false);
  const ZOOM_LEVEL = 2;
  const LOUPE_SIZE = 200;

  return (
    <div
      className="relative"
      onMouseEnter={() => isActive && setShow(true)}
      onMouseLeave={() => setShow(false)}
      onMouseMove={(e) => {
        if (!isActive) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
    >
      <Page 
        pageNumber={pageNumber} 
        renderTextLayer={false}
        renderAnnotationLayer={false}
        width={width}
        className="bg-white"
      />
      {isActive && show && (
        <div
          className="absolute pointer-events-none border-4 border-emerald-500 rounded-full overflow-hidden bg-white shadow-2xl z-50"
          style={{
            width: LOUPE_SIZE,
            height: LOUPE_SIZE,
            left: pos.x - LOUPE_SIZE / 2,
            top: pos.y - LOUPE_SIZE / 2,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: -pos.x * ZOOM_LEVEL + LOUPE_SIZE / 2,
              top: -pos.y * ZOOM_LEVEL + LOUPE_SIZE / 2,
            }}
          >
            <Page 
              pageNumber={pageNumber} 
              renderTextLayer={false}
              renderAnnotationLayer={false}
              width={width * ZOOM_LEVEL}
              className="bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const MagnifiableImage = ({ src, isActive }: { src: string, isActive: boolean }) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [show, setShow] = useState(false);
  const ZOOM_LEVEL = 2;
  const LOUPE_SIZE = 200;
  const imgRef = useRef<HTMLImageElement>(null);

  return (
    <div 
      className="relative inline-block max-w-full max-h-[800px]"
      onMouseEnter={() => isActive && setShow(true)}
      onMouseLeave={() => setShow(false)}
      onMouseMove={(e) => {
        if (!isActive || !imgRef.current) return;
        const rect = imgRef.current.getBoundingClientRect();
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
    >
      <img
        ref={imgRef}
        src={src}
        alt="Patient X-ray"
        className="max-w-full max-h-[800px] object-contain rounded-xl border border-white/10 bg-black"
      />
      {isActive && show && imgRef.current && (
        <div
          className="absolute pointer-events-none border-4 border-emerald-500 rounded-full shadow-2xl z-50 bg-no-repeat bg-black"
          style={{
            width: LOUPE_SIZE,
            height: LOUPE_SIZE,
            left: pos.x - LOUPE_SIZE / 2,
            top: pos.y - LOUPE_SIZE / 2,
            backgroundImage: `url(${src})`,
            backgroundSize: `${imgRef.current.width * ZOOM_LEVEL}px ${imgRef.current.height * ZOOM_LEVEL}px`,
            backgroundPosition: `-${pos.x * ZOOM_LEVEL - LOUPE_SIZE / 2}px -${pos.y * ZOOM_LEVEL - LOUPE_SIZE / 2}px`,
          }}
        />
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

const getInitialDraft = () => {
  try {
    const saved = localStorage.getItem('dualGP_draft_state');
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
  
  const [realAgeYears, setRealAgeYears] = useState<number>(initialDraft.realAgeYears ?? 8);
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
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [xrayImage, setXrayImage] = useState<string | null>(null);
  const [isXrayVisible, setIsXrayVisible] = useState(true);
  const [isGpVisible, setIsGpVisible] = useState(true);
  const [isGaskinVisible, setIsGaskinVisible] = useState(true);

  const [patientName, setPatientName] = useState(initialDraft.patientName ?? '');
  const [patientId, setPatientId] = useState(initialDraft.patientId ?? '');
  const [dob, setDob] = useState<string>(initialDraft.dob ?? '');
  const [examDate, setExamDate] = useState(() => {
    if (initialDraft.examDate) return initialDraft.examDate;
    const d = new Date();
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  });
  const [showRef, setShowRef] = useState(false);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isExpertMode, setIsExpertMode] = useState(false);
  const [username, setUsername] = useState('');
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
  const [vicenteViewMode, setVicenteViewMode] = useState<'single' | 'duet'>('single');

  const [patientRecords, setPatientRecords] = useState<PatientRecord[]>(() => {
    const saved = localStorage.getItem('dualGP_patients');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('dualGP_patients', JSON.stringify(patientRecords));
  }, [patientRecords]);

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
    const fileName = `Du lieu Tuoi xuong ${hours}h${minutes} ${day}-${month}-${year} DualGP Dr.Son.json`;
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
    localStorage.setItem('dualGP_draft_state', JSON.stringify(draft));
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
    xrayQuality
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
    if (loginTab === 'premium' && val === '6868') {
      setIsAuthenticated(true);
      setIsExpertMode(false);
      localStorage.setItem('boneAgeAuth', 'premium');
    } else if (loginTab === 'expert' && username.toLowerCase() === 'admin' && val === '0984144492') {
      setIsAuthenticated(true);
      setIsExpertMode(true);
      localStorage.setItem('boneAgeAuth', 'expert');
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

  const handleExportWord = async () => {
    if (!isExpertMode) return;
    
    // Parse findings
    const dbacPopulated = dbacBoneAgeYears !== '';
    const { yesFeatures, noFeatures, summaryText } = getDbacParsedData();
    const devZ = getDeviationAndZScore();
    const sauvegrainPopulated = sauvegrainAgeYears !== '';

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
          })
        ]
      }]
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `TuoiXuong_${patientName || 'BenhNhan'}.docx`);
    });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsExpertMode(false);
    setUsername('');
    setPasscode('');
    localStorage.removeItem('boneAgeAuth');
  };

  const handleReset = () => {
    setRealAgeYears(8);
    setRealAgeMonths(0);
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
    setXrayDate('');
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
    setPatientName('');
    setPatientId('');
    setDob('');
  };

  const capitalizeWords = (str: string) => {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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

    return { diffText, significanceText, zScores };
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
      const vDbac = `\n- Tuổi xương ước tính: ${dbacFormatted} ± 0.5 tuổi (Tham chiếu theo: Atlas Thực tế chuẩn hoá của C.M. Gaskin et al., sử dụng mốc cốt hoá cổ điển của Brush Foundation, OUP, ISBN-10: 0199782059). ${summaryText ? summaryText + ' ' : ''}${(yesFeatures.length > 0 || noFeatures.length > 0) ? 'Cụ thể như sau:' : ''}`.trimEnd();
      
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
        setXrayImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans selection:bg-emerald-500/30 ${gender === 'boy' ? 'bg-blue-900' : 'bg-pink-900'}`}>
      {!isAuthenticated && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-xl">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-zinc-100 max-w-md w-full mx-4 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-emerald-600">DualGP Dr. Son 2.0</h2>
              <p className="text-zinc-500 text-sm">Vui lòng đăng nhập để sử dụng ứng dụng</p>
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
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                  
                />
              </div>
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
                    
                    maxLength={loginTab === 'expert' ? 10 : 4}
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
      <header className={`border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 transition-transform duration-300 ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-emerald-600 flex items-center">
              <Dog size={24} className="mr-2 hidden sm:block" />
              <span className="hidden sm:inline">{t.title}</span>
              <span className="sm:hidden">DualGP Dr.Son</span>
            </h1>
            {isAuthenticated && (
              <span className={`hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${isExpertMode ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                {isExpertMode ? 'PRO' : 'LITE'}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {isAuthenticated && (
              <>
                <button 
                  onClick={handleReset}
                  title="Tạo mới"
                  className="p-1.5 rounded-full border border-sky-200 bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
                >
                  <RotateCcw size={18} />
                </button>
                <button 
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="p-1.5 rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
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
                      handleAdminChangeAttempt(num, setRealAgeYears);
                      setIsAgeManuallySet(true);
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
                      handleAdminChangeAttempt(num, setRealAgeMonths);
                      setIsAgeManuallySet(true);
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
            {!isExpertMode && (
              <div className="space-y-1.5 w-full lg:w-auto lg:flex-1 shrink-0">
                <label className="text-xs font-semibold text-zinc-400">{'Kết luận'}</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input 
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={finalAgeYears} 
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        setFinalAgeYears(val === '' ? '' : Number(val));
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
                      value={finalAgeMonths} 
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        setFinalAgeMonths(val === '' ? '' : Number(val));
                      }}
                      className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500 transition-colors text-base"
                    />
                    <span className="text-[10px] text-zinc-500 mt-1 block">{'Tháng'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          {isExpertMode && (
            <div className="grid grid-cols-2 lg:flex lg:flex-nowrap items-start gap-3 sm:gap-4 w-full">
              <div className="space-y-1.5 w-full lg:w-auto lg:flex-[1.5] shrink-0 col-span-2 lg:col-span-1">
                <label className="text-xs font-semibold text-zinc-400">{'Tên khách hàng'}</label>
                <input type="text" value={patientName} onChange={e => handleAdminChangeAttempt(e.target.value, setPatientName)} onBlur={() => setPatientName(capitalizeNameWords(patientName))} className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 transition-colors text-base h-[42px]" />
              </div>
              <div className="space-y-1.5 w-full lg:w-auto lg:flex-[1] shrink-0">
                <label className="text-xs font-semibold text-zinc-400">{'Mã khách hàng'}</label>
                <input type="text" value={patientId} onChange={e => handleAdminChangeAttempt(e.target.value, setPatientId)} className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 transition-colors text-base h-[42px]" />
              </div>
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
            </div>
          )}
        </section>

        {/* Atlas Comparison Section */}
        <section className="space-y-6">
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
                  onClick={() => setVicenteViewMode(prev => prev === 'single' ? 'duet' : 'single')}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors bg-white/10 border-white/20 hover:bg-white/20 text-white"
                >
                  {vicenteViewMode === 'single' ? <Eye size={16} className="shrink-0" /> : <BookOpen size={16} className="shrink-0" />}
                  <span>{vicenteViewMode === 'single' ? 'Chế độ Single' : 'Chế độ Duet'}</span>
                </button>
              )}
              {isGpVisible && (
                <button
                  onClick={() => setIsMagnifierActive(!isMagnifierActive)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${isMagnifierActive ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 'bg-white/10 border-white/20 hover:bg-white/20 text-white'}`}
                >
                  <Search size={16} className="shrink-0" />
                  <span className="hidden sm:inline">{'Kính lúp'}</span>
                </button>
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
                <div ref={atlas1Ref} className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-[0_4px_20px_rgba(16,185,129,0.15)] bg-zinc-800 flex justify-center items-center min-h-[600px] p-4 md:p-8" style={{ perspective: 1200 }}>
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
                    initial={isMobile ? { opacity: 0 } : { opacity: 0, rotateY: 15, scale: 0.95 }}
                    animate={isMobile ? { opacity: 1 } : { opacity: 1, rotateY: 0, scale: 1 }}
                    exit={isMobile ? { opacity: 0 } : { opacity: 0, rotateY: -15, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="flex shadow-2xl bg-white origin-center"
                    style={{ transformStyle: isMobile || vicenteViewMode === 'single' ? 'flat' : 'preserve-3d' }}
                  >
                    {isMobile || vicenteViewMode === 'single' ? (
                      <div className="relative">
                        <MagnifiablePage 
                          pageNumber={Math.max(1, Math.min(pageNumber, numPages))} 
                          width={isMobile ? window.innerWidth - 64 : 600} 
                          isActive={isMagnifierActive} 
                        />
                      </div>
                    ) : (
                      <>
                        {/* Left Page */}
                        {(pageNumber % 2 === 0 ? pageNumber : pageNumber - 1) > 0 && (pageNumber % 2 === 0 ? pageNumber : pageNumber - 1) <= numPages ? (
                          <div className="border-r border-zinc-300 relative bg-white">
                            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/10 to-transparent z-10 pointer-events-none" />
                            <MagnifiablePage 
                              pageNumber={pageNumber % 2 === 0 ? pageNumber : pageNumber - 1} 
                              width={400}
                              isActive={isMagnifierActive}
                            />
                          </div>
                        ) : (
                          <div style={{ width: 400 }} className="bg-zinc-100" />
                        )}
                        
                        {/* Right Page */}
                        {(pageNumber % 2 === 0 ? pageNumber + 1 : pageNumber) <= numPages ? (
                          <div className="relative bg-white">
                            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/10 to-transparent z-10 pointer-events-none" />
                            <MagnifiablePage 
                              pageNumber={pageNumber % 2 === 0 ? pageNumber + 1 : pageNumber} 
                              width={400}
                              isActive={isMagnifierActive}
                            />
                          </div>
                        ) : (
                          <div style={{ width: 400 }} className="bg-zinc-100" />
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
              <div className="flex items-center gap-2 w-full md:w-auto">
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
                  <button
                    onClick={() => setIsDbacMagnifierActive(!isDbacMagnifierActive)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${isDbacMagnifierActive ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-white/10 border-white/20 hover:bg-white/20 text-white'}`}
                  >
                    <Search size={16} className="shrink-0" />
                    <span className="hidden sm:inline">{'Kính lúp'}</span>
                  </button>
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
              <div ref={atlas2Ref} className="relative rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-[0_4px_20px_rgba(99,102,241,0.15)] bg-zinc-800 flex justify-center items-center min-h-[500px] p-4 lg:p-8" style={{ perspective: 1200 }}>
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
                          width={isMobile ? window.innerWidth - 64 : 500} 
                          isActive={isDbacMagnifierActive} 
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
                <h3 className="text-white font-semibold text-sm sm:text-[15px] mb-3 pb-3 border-b border-white/10">
                  Mốc cốt hoá ứng với <span className="text-yellow-400">{currentDbacData[dbacIndex]?.label}</span> (<span className={gender === 'boy' ? 'text-blue-300' : 'text-pink-300'}>{gender === 'boy' ? 'nam' : 'nữ'}</span>)
                </h3>
                <ul className="space-y-2 overflow-y-auto pr-2">
                  {currentDbacData[dbacIndex].features.map((feature, idx) => {
                    const sKey = `${dbacIndex}-${idx}`;
                    const val = dbacSelections[sKey];
                    return (
                      <li key={idx} className="flex items-center justify-between gap-3 p-3 bg-zinc-900/50 rounded-xl border border-white/5">
                        <span className="text-zinc-200 text-[11px] sm:text-xs leading-relaxed flex-1 break-words">{feature}</span>
                        <div className="flex bg-zinc-950 p-1 rounded-lg border border-white/10 shrink-0 gap-1 ml-auto">
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

                  return (
                    <div className="space-y-4">
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
                <button
                  onClick={() => setIsXrayMagnifierActive(!isXrayMagnifierActive)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${isXrayMagnifierActive ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 'bg-white/10 border-white/20 hover:bg-white/20 text-white'}`}
                >
                  <Search size={16} className="shrink-0" />
                  <span className="hidden sm:inline">{'Kính lúp'}</span>
                </button>
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
        {isExpertMode ? (
          expertBoneAgeYears !== '' && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">{'Kết luận'}</h2>
              </div>
              <div className="p-4 md:p-6 bg-yellow-50 border border-yellow-200 rounded-2xl relative group">
                <div className="text-zinc-800 leading-relaxed font-sans text-sm md:text-base whitespace-pre-wrap">
                  {renderExpertConclusionDisplay()}
                </div>
              </div>
              
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
          )
        ) : (
          finalAgeYears !== '' && finalAgeMonths !== '' && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">{'Kết luận'}</h2>
              </div>
              <div className="p-4 md:p-6 bg-yellow-50 border border-yellow-200 rounded-2xl relative group pb-14">
                <p className="text-zinc-800 leading-relaxed font-sans text-sm md:text-base whitespace-pre-wrap">
                  {getConclusion()}
                </p>
              </div>
            </section>
          )
        )}
        
        {/* Sticky Action Footer */}
        {((isExpertMode && expertBoneAgeYears !== '') || (!isExpertMode && finalAgeYears !== '' && finalAgeMonths !== '')) && (
          <div className="fixed bottom-0 left-0 right-0 p-3 bg-zinc-900 border-t border-white/10 z-50 flex justify-center gap-2 sm:gap-4 flex-wrap">
            {isExpertMode && (
              <button 
                onClick={handleExportWord}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors text-sm sm:text-base font-semibold shadow-lg shadow-blue-900/20"
              >
                <FileType size={20} /> <span className="hidden sm:inline">Xuất báo cáo</span>
              </button>
            )}
            <button 
              onClick={copyToClipboard}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors text-sm sm:text-base font-semibold shadow-lg shadow-emerald-900/20"
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
              <span className="hidden sm:inline">{copied ? 'Đã chép' : 'Sao chép kết quả'}</span>
            </button>
            <button 
              onClick={() => {
                if(window.confirm('Bạn có chắc chắn muốn reset để tạo ca mới?')) {
                  handleReset();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-colors text-sm sm:text-base font-semibold shadow-lg shadow-red-900/20"
            >
              <RotateCcw size={20} /> <span className="hidden sm:inline">Tạo ca mới</span>
            </button>
          </div>
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
                            onClick={() => handleDeleteRecord(record.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
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
                  <p>5. Diméglio, Alain (2005). Accuracy of the Sauvegrain Method in Determining Skeletal Age During Puberty. The Journal of Bone and Joint Surgery (American), 87(8), 1689–. doi:10.2106/JBJS.D.02418</p>

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

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 mt-12 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-1 text-white/50 text-xs font-medium tracking-wide">
          <p>
            Bản quyền thuộc về <a href="https://tamanhhospital.vn/chuyen-gia/do-tien-son/" target="_blank" rel="noreferrer" className="hover:text-white/70 transition-colors">BS. Đỗ Tiến Sơn</a> &copy; 2026
          </p>
          <p>Mọi quyền đều được bảo vệ</p>
        </div>
      </footer>
    </div>
  );
}
