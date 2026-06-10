import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Copy, Check, Info, Languages, User, FileText, Search, Lock, Camera, Upload, Eye, EyeOff, X, RotateCcw, LogOut, ChevronDown, Download, FileType, Dog } from 'lucide-react';
import { Document as DocxDocument, Packer, Paragraph, TextRun, AlignmentType, SectionType, BorderStyle, PageBorderDisplay, PageBorderOffsetFrom } from 'docx';
import { saveAs } from 'file-saver';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ATLAS_DATA, AtlasEntry } from './data';
import { DBAC_DATA_BOY } from './dbac_data';

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

const capitalizeNameWords = (str: string) => {
  return str.split(/\s+/).map(word => {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
};

export default function App() {
  const [realAgeYears, setRealAgeYears] = useState<number>(8);
  const [realAgeMonths, setRealAgeMonths] = useState<number>(0);
  const [gender, setGender] = useState<'boy' | 'girl'>('girl');
  const [copied, setCopied] = useState(false);
  const [finalAgeYears, setFinalAgeYears] = useState<number | ''>('');
  const [finalAgeMonths, setFinalAgeMonths] = useState<number | ''>('');
  const [clinicalReason, setClinicalReason] = useState<string>('Đánh giá tăng trưởng');
  const clinicalOptions = ['Sàng lọc dậy thì sớm', 'Đánh giá tăng trưởng', 'Đánh giá bệnh lý', 'Lý do khác'];
  const [isMagnifierActive, setIsMagnifierActive] = useState(false);
  const [isXrayMagnifierActive, setIsXrayMagnifierActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [xrayImage, setXrayImage] = useState<string | null>(null);
  const [isXrayVisible, setIsXrayVisible] = useState(true);

  const [patientName, setPatientName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [examDate, setExamDate] = useState(() => {
    const d = new Date();
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  });
  const [showRef, setShowRef] = useState(false);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isExpertMode, setIsExpertMode] = useState(false);
  const [username, setUsername] = useState('');
  const [passcode, setPasscode] = useState('');
  const [loginTab, setLoginTab] = useState<'premium' | 'expert'>('premium');
  
  const [dbacIndex, setDbacIndex] = useState(0);
  const [dbacSelections, setDbacSelections] = useState<Record<string, 'yes' | 'no'>>({});
  const [dbacOtherFeatures, setDbacOtherFeatures] = useState<string>('');
  const [dbacBoneAge, setDbacBoneAge] = useState<string>('');
  const [dbacNumPages, setDbacNumPages] = useState<number | null>(null);
  const [dbacPageNumber, setDbacPageNumber] = useState<number>(1);
  const [isDbacMagnifierActive, setIsDbacMagnifierActive] = useState(false);
  
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const atlas1Ref = useRef<HTMLDivElement>(null);
  const atlas2Ref = useRef<HTMLDivElement>(null);
  const [activeAtlasView, setActiveAtlasView] = useState<1 | 2 | null>(null);

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
          setDbacIndex(prev => Math.min(DBAC_DATA_BOY.length - 1, prev + 1));
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
  
  const [expertBoneAge, setExpertBoneAge] = useState<string>('');
  const [xrayDate, setXrayDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  });
  const [xrayLocation, setXrayLocation] = useState<string>('BVĐK Tâm Anh');
  const [xrayQuality, setXrayQuality] = useState<string>('Tốt');
  
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
  
  const qualityOptions = ['Tốt', 'Đạt', 'Kém', 'Ảnh chụp', 'Tư thế không tối ưu'];

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

  const handleExportWord = async () => {
    if (!isExpertMode) return;
    
    // Parse findings
    const yesFeatures: string[] = [];
    const noFeatures: string[] = [];
    if (dbacBoneAge) {
      Object.entries(dbacSelections).forEach(([key, val]) => {
        const [mIdx, fIdx] = key.split('-').map(Number);
        const milestone = DBAC_DATA_BOY[mIdx];
        const feature = milestone.features[fIdx];
        const str = `${capitalizeWords(feature)} (mốc ${milestone.label})`;
        if (val === 'yes') yesFeatures.push(str);
        if (val === 'no') noFeatures.push(str);
      });
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
              new TextRun({ text: `Tuổi thực tại ngày chụp: ${realAgeYears} tuổi ${realAgeMonths} tháng`, size: 24, font: "Arial" }),
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
              new TextRun({ text: `Chất lượng phim: ${xrayQuality || 'Tốt'}`, size: 24, font: "Arial" }),
            ],
            spacing: { after: 400 }
          }),
          
          // Inject exact conclusion
          ...getExpertConclusion()
            .substring(getExpertConclusion().indexOf('* Bằng phương pháp'))
            .split('\n')
            .map(line => {
              if (line.trim() === "Bác sĩ lâm sàng ghi nhận các dấu hiệu đã có sau:") {
                return new Paragraph({
                  children: [new TextRun({ text: line, size: 24, font: "Arial", bold: true })],
                  spacing: { after: 100 }
                });
              }
              if (line.trim() === "Bác sĩ chưa thấy rõ các dấu hiệu sau:") {
                return new Paragraph({
                  children: [
                    new TextRun({ text: "Bác sĩ ", size: 24, font: "Arial", bold: true }),
                    new TextRun({ text: "chưa thấy rõ", size: 24, font: "Arial", bold: true, underline: { type: "single", color: "000000" } }),
                    new TextRun({ text: " các dấu hiệu sau:", size: 24, font: "Arial", bold: true })
                  ],
                  spacing: { after: 100 }
                });
              }
              return new Paragraph({
                children: [new TextRun({ text: line, size: 24, font: "Arial" })],
                spacing: { after: 100 }
              });
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
    setExpertBoneAge('');
    setXrayDate('');
    setXrayLocation('BVĐK Tâm Anh');
    setXrayQuality('Tốt');
    setDbacIndex(0);
    setDbacSelections({});
    setDbacBoneAge('');
    setDbacPageNumber(1);
    setCopied(false);
    setPatientName('');
    setPatientId('');
    setExamDate('');
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
    
    if (gender === 'boy') {
      let cIndex = 0;
      let minD = Math.abs(DBAC_DATA_BOY[0].ageMonths - totalRealAgeMonths);
      for (let i = 1; i < DBAC_DATA_BOY.length; i++) {
        const d = Math.abs(DBAC_DATA_BOY[i].ageMonths - totalRealAgeMonths);
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

  const getExpertConclusion = () => {
    if (expertBoneAge === '') return '';
    const dateText = xrayDate ? xrayDate : '....';
    const locationText = xrayLocation ? xrayLocation : '....';
    const qualityText = xrayQuality ? xrayQuality : '...';
    
    const formattedBoneAge = expertBoneAge.replace(',', '.');
    
    // G-P
    let vText = `BÁO CÁO PHIÊN GIẢI TUỔI XƯƠNG\nDựa trên phim chụp ngày ${dateText}, tại ${locationText} (Chất lượng phim: ${qualityText})\nTuổi thực tại ngày chụp: ${realAgeYears} tuổi ${realAgeMonths} tháng\n\n* Bằng phương pháp Greulich - Pyle, khi so với atlas kĩ thuật số của V.Gilsanz và O.Ratib (ISBN-13: 978-3642237621, Springer, 2011): Bác sĩ lâm sàng ghi nhận trung bình các xương bàn - ngón tay đang phù hợp với mốc tuổi xương: ${formattedBoneAge} +/- 0.5 tuổi`;

    if (dbacBoneAge) {
      const yesFeatures: string[] = [];
      const noFeatures: string[] = [];
      Object.entries(dbacSelections).forEach(([key, val]) => {
        const [mIdx, fIdx] = key.split('-').map(Number);
        const milestone = DBAC_DATA_BOY[mIdx];
        const feature = milestone.features[fIdx];
        const str = `${feature} [${milestone.label}]`;
        if (val === 'yes') yesFeatures.push(str);
        if (val === 'no') noFeatures.push(str);
      });
      if (dbacOtherFeatures.trim()) {
        yesFeatures.push(dbacOtherFeatures.trim());
      }
      const yesStr = yesFeatures.length > 0 ? yesFeatures.map(f => `- ${f}`).join('\n') : '- (không có)';
      const noStr = noFeatures.length > 0 ? noFeatures.map(f => `- ${f}`).join('\n') : '- (không có)';
      
      const dbacFormatted = dbacBoneAge.replace(',', '.');
      const vDbac = `\n\n* Bằng phương pháp Greulich - Pyle, dựa trên atlas thực tế chuẩn hoá của Cree M. Gaskin (mốc cốt hoá từ Brush Foundation) (ISBN-10: 0199782059, Oxford Univ. Press, 2011): Bác sĩ lâm sàng ghi nhận trung bình các xương bàn - ngón tay đang phù hợp với mốc tuổi xương: ${dbacFormatted} +/- 0.5 tuổi.\nBác sĩ lâm sàng ghi nhận các dấu hiệu đã có sau:\n${yesStr}\nBác sĩ chưa thấy rõ các dấu hiệu sau:\n${noStr}`;
      
      vText += vDbac;
    }

    const disclaimerVi = '\n\n* Lưu ý: Kết quả tuổi xương được BS. Đỗ Tiến Sơn đánh giá trực tiếp, chỉ có ý nghĩa khi được bác sĩ lâm sàng ứng dụng trong đánh giá, theo dõi trên từng trường hợp cụ thể.';

    return vText + disclaimerVi;
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
          <h1 className="text-xl font-bold tracking-tight text-emerald-600 flex items-center">
            <Dog size={24} className="mr-2" />
            {t.title}
          </h1>
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
                  onClick={() => setGender('boy')}
                  className={`flex-1 rounded-md text-sm font-medium transition-all ${gender === 'boy' ? 'bg-emerald-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  {'Nam'}
                </button>
                <button 
                  onClick={() => setGender('girl')}
                  className={`flex-1 rounded-md text-sm font-medium transition-all ${gender === 'girl' ? 'bg-pink-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  {'Nữ'}
                </button>
              </div>
            </div>
            <div className="space-y-1.5 w-full lg:w-auto lg:flex-1 shrink-0">
              <label className="text-xs font-semibold text-zinc-400">{'Tuổi thực'}</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input 
                    type="number" 
                    value={realAgeYears} 
                    onChange={(e) => setRealAgeYears(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500 transition-colors text-base"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">{'Năm'}</span>
                </div>
                <div className="flex-1">
                  <input 
                    type="number" 
                    value={realAgeMonths} 
                    onChange={(e) => setRealAgeMonths(Number(e.target.value))}
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
                    setExamDate(val);
                  }} className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 transition-colors text-base h-[42px]" maxLength={10} />
                </div>
                <div className="space-y-1.5 w-full lg:w-auto lg:flex-1 shrink-0">
                  <label className="text-xs font-semibold text-zinc-400">{'Ngày chụp phim'}</label>
                  <input type="text" value={xrayDate} onChange={handleDateChange} className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 transition-colors text-base h-[42px]"  maxLength={10} />
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
                      type="number" 
                      value={finalAgeYears} 
                      onChange={(e) => setFinalAgeYears(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500 transition-colors text-base"
                    />
                    <span className="text-[10px] text-zinc-500 mt-1 block">{'Năm'}</span>
                  </div>
                  <div className="flex-1">
                    <input 
                      type="number" 
                      value={finalAgeMonths} 
                      onChange={(e) => setFinalAgeMonths(e.target.value === '' ? '' : Number(e.target.value))}
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
                <input type="text" value={patientName} onChange={e => setPatientName(e.target.value)} onBlur={() => setPatientName(capitalizeNameWords(patientName))} className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 transition-colors text-base h-[42px]" />
              </div>
              <div className="space-y-1.5 w-full lg:w-auto lg:flex-[1] shrink-0">
                <label className="text-xs font-semibold text-zinc-400">{'Mã khách hàng'}</label>
                <input type="text" value={patientId} onChange={e => setPatientId(e.target.value)} className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 transition-colors text-base h-[42px]" />
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
                onClick={() => setIsMagnifierActive(!isMagnifierActive)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${isMagnifierActive ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 'bg-white/10 border-white/20 hover:bg-white/20 text-white'}`}
              >
                <Search size={16} className="shrink-0" />
                <span className="hidden sm:inline">{'Kính lúp'}</span>
              </button>
              <div className="flex items-center gap-2 text-sm font-medium text-white/70">
                {selectedEntry && (
                  <span className="bg-white/10 px-2 py-1 rounded-md">{selectedEntry.labelVi}</span>
                )}
              </div>
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
            </div>
          </div>

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
                    style={{ transformStyle: isMobile && !isExpertMode ? 'flat' : 'preserve-3d' }}
                  >
                    {isMobile || isExpertMode ? (
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
              <input 
                type="text" 
                inputMode="decimal"
                pattern="[0-9.,]*"
                value={expertBoneAge} 
                onChange={e => {
                  const val = e.target.value;
                  if (/^[0-9.,]*$/.test(val)) {
                    setExpertBoneAge(val);
                  }
                }} 
                className="w-full md:w-48 bg-zinc-900 border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 hover:border-white/30 transition-all font-medium text-center shadow-inner" 
                
              />
            </div>
          )}
        </section>

        {/* DBAC Section */}
        {isExpertMode && gender === 'boy' && DBAC_DATA_BOY.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shrink-0" />
                <span className="hidden sm:inline">Đối chiếu tuổi xương theo Atlas của Cree M. Gaskin và cộng sự</span>
                <span className="sm:hidden">So Atlas Gaskin et al.</span>
              </h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsDbacMagnifierActive(!isDbacMagnifierActive)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${isDbacMagnifierActive ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-white/10 border-white/20 hover:bg-white/20 text-white'}`}
                >
                  <Search size={16} className="shrink-0" />
                  <span className="hidden sm:inline">{'Kính lúp'}</span>
                </button>
                <div className="flex items-center gap-2 text-sm font-medium text-white/70">
                  <span className="bg-white/10 px-2 py-1 rounded-md">{DBAC_DATA_BOY[dbacIndex]?.label || ''}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    disabled={dbacPageNumber <= 1}
                    onClick={() => {
                      setDbacPageNumber(prev => {
                        const next = prev - 1;
                        if (next > 0 && next <= DBAC_DATA_BOY.length) {
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
                        if (next > 0 && next <= DBAC_DATA_BOY.length) {
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
              </div>
            </div>

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
                        setDbacIndex(prev => Math.min(DBAC_DATA_BOY.length - 1, prev + 1));
                      }}
                      className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 sm:py-6 bg-black/40 text-white rounded-xl backdrop-blur-sm opacity-50 hover:opacity-100 hover:scale-105 active:scale-95 transition-all disabled:opacity-0"
                    >
                      <ChevronRight size={28} />
                    </button>
                  </>
                )}
              <Document
                file={gender === 'boy' ? '/Male.pdf' : '/Female.pdf'}
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
                        {`Không tìm thấy file ${gender === 'boy' ? 'Male.pdf' : 'Female.pdf'}. Vui lòng đặt file vào thư mục public của dự án.`}
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
                <ul className="space-y-2 overflow-y-auto pr-2">
                  {DBAC_DATA_BOY[dbacIndex].features.map((feature, idx) => {
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
                            className={`flex items-center justify-center w-10 py-1.5 rounded-md transition-all ${val === 'yes' ? 'bg-emerald-600 text-white shadow-sm' : 'text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800'}`}
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
                            className={`flex items-center justify-center w-10 py-1.5 rounded-md transition-all ${val === 'no' ? 'bg-red-600 text-white shadow-sm' : 'text-zinc-400 hover:text-red-400 hover:bg-zinc-800'}`}
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
                  const grouped: Record<number, { fIdx: number, val: 'yes' | 'no' }[]> = {};
                  Object.entries(dbacSelections).forEach(([key, val]) => {
                    const [mIdx, fIdx] = key.split('-').map(Number);
                    if (!grouped[mIdx]) grouped[mIdx] = [];
                    grouped[mIdx].push({ fIdx, val });
                  });
                  return (
                    <div className="space-y-4">
                      {Object.keys(grouped).map(mIdxStr => {
                        const mIdx = Number(mIdxStr);
                        const milestone = DBAC_DATA_BOY[mIdx];
                        return (
                          <div key={mIdxStr} className="space-y-3">
                            <h4 className="text-sm font-bold text-indigo-300 bg-indigo-500/20 inline-block px-3 py-1 rounded-lg border border-indigo-500/30">Mốc {milestone.label}</h4>
                            <div className="space-y-2 pl-1">
                              {grouped[mIdx].map(({ fIdx, val }) => (
                                <div key={fIdx} className="flex items-start gap-3 text-sm">
                                  <span className={`shrink-0 w-14 text-center font-bold whitespace-nowrap px-2 py-0.5 rounded text-xs mt-0.5 ${val === 'yes' ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20' : 'text-red-400 bg-red-400/10 border border-red-400/20'}`}>{val === 'yes' ? 'Có' : 'Không'}</span>
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
                <input 
                  type="text" 
                  inputMode="decimal"
                  pattern="[0-9.,]*"
                  value={dbacBoneAge} 
                  onChange={e => {
                    const val = e.target.value;
                    if (/^[0-9.,]*$/.test(val)) {
                      setDbacBoneAge(val);
                    }
                  }} 
                  className="w-full md:w-48 bg-zinc-900 border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 hover:border-white/30 transition-all font-medium text-center shadow-inner" 
                />
              </div>
            </div>
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
          expertBoneAge !== '' && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">{'Kết luận'}</h2>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleExportWord}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors text-sm font-semibold shadow-lg shadow-blue-900/10"
                  >
                    <FileType size={16} /> Xuất báo cáo
                  </button>
                  <button 
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors text-sm font-semibold shadow-lg shadow-emerald-900/10"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? ('Đã chép') : 'Sao chép'}
                  </button>
                </div>
              </div>
              <div className="p-4 md:p-6 bg-yellow-50 border border-yellow-200 rounded-2xl relative group">
                <p className="text-zinc-800 leading-relaxed font-sans text-sm md:text-base whitespace-pre-wrap">
                  {getExpertConclusion()}
                </p>
              </div>
            </section>
          )
        ) : (
          finalAgeYears !== '' && finalAgeMonths !== '' && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">{'Kết luận'}</h2>
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors text-sm font-semibold shadow-lg shadow-emerald-900/10"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? ('Đã chép') : 'Sao chép'}
                </button>
              </div>
              <div className="p-4 md:p-6 bg-yellow-50 border border-yellow-200 rounded-2xl relative group">
                <p className="text-zinc-800 leading-relaxed font-sans text-sm md:text-base whitespace-pre-wrap">
                  {getConclusion()}
                </p>
              </div>
            </section>
          )
        )}
      </main>

      {/* Reference Section */}
      {isExpertMode && (
        <section className="max-w-7xl mx-auto mt-8 border-t border-white/10 pt-6 px-4">
          <button 
            onClick={() => setShowRef(!showRef)}
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors text-sm font-medium"
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

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 mt-12 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-1 text-white/50 text-xs font-medium tracking-wide uppercase">
          <p>
            <a href="https://tamanhhospital.vn/chuyen-gia/do-tien-son/" target="_blank" rel="noreferrer" className="hover:text-white/70 transition-colors">BS. Đỗ Tiến Sơn</a>
          </p>
          <p>Uỷ viên Tiểu ban Đào tạo Nền tảng số</p>
          <p>Hội Nội tiết Nhi Châu Âu (ESPE)</p>
        </div>
      </footer>
    </div>
  );
}
