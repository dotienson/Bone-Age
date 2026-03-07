import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Copy, Check, Info, Languages, User, FileText, Search, Lock, Camera, Upload, Eye, EyeOff, X } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ATLAS_DATA, AtlasEntry } from './data';

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

type Language = 'vi' | 'en';

export default function App() {
  const [lang, setLang] = useState<Language>('vi');
  const [realAgeYears, setRealAgeYears] = useState<number>(8);
  const [realAgeMonths, setRealAgeMonths] = useState<number>(0);
  const [gender, setGender] = useState<'boy' | 'girl'>('girl');
  const [copied, setCopied] = useState(false);
  const [doctorName, setDoctorName] = useState<string>('Đỗ Tiến Sơn');
  const [finalAgeYears, setFinalAgeYears] = useState<number | ''>('');
  const [finalAgeMonths, setFinalAgeMonths] = useState<number | ''>('');
  const [isMagnifierActive, setIsMagnifierActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [xrayImage, setXrayImage] = useState<string | null>(null);
  const [isXrayVisible, setIsXrayVisible] = useState(true);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [passcode, setPasscode] = useState('');

  const handlePasscodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPasscode(val);
    if (val === '6868') {
      setIsAuthenticated(true);
    }
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

    const doctorText = lang === 'vi' ? ` - Bác sĩ phiên giải: BS. ${doctorName}` : ` - Interpreting Doctor: Dr. ${doctorName}`;
    
    const finalAgeTextVi = `${finalAgeYears} năm ${finalAgeMonths} tháng +/- 0,5 năm`;
    const finalAgeTextEn = `${finalAgeYears} years ${finalAgeMonths} months +/- 0.5 years`;

    if (lang === 'vi') {
      return `Bằng phương pháp Greulich - Pyle, khi so với atlas của Vicente Gilsanz và Osman Ratib: Hand Bone Age - A Digital Atlas of Skeletal Maturity - Ấn bản thứ 2, NXB Springer cho thấy Tuổi xương hiện tại của trẻ tương đương ${finalAgeTextVi} ${diffTextVi}${doctorText}`;
    } else {
      return `Using the Greulich-Pyle method, compared to the atlas by Vicente Gilsanz and Osman Ratib: Hand Bone Age - A Digital Atlas of Skeletal Maturity - 2nd Edition, Springer Publishing shows the child's current bone age is equivalent to ${finalAgeTextEn} ${diffTextEn}${doctorText}`;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getConclusion());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const t = {
    title: lang === 'vi' ? 'BoneAge - Dr.Son' : 'BoneAge - Dr.Son',
    realAge: lang === 'vi' ? 'Tuổi thực' : 'Chronological Age',
    finalBoneAge: lang === 'vi' ? 'Tuổi xương kết luận' : 'Final Bone Age',
    years: lang === 'vi' ? 'Năm' : 'Years',
    months: lang === 'vi' ? 'Tháng' : 'Months',
    gender: lang === 'vi' ? 'Giới tính' : 'Gender',
    boy: lang === 'vi' ? 'Nam' : 'Boy',
    girl: lang === 'vi' ? 'Nữ' : 'Girl',
    interpretingDoctor: lang === 'vi' ? 'Bác sĩ phiên giải' : 'Interpreting Doctor',
    otherDoctor: lang === 'vi' ? 'BS khác' : 'Other Doctor',
    conclusion: lang === 'vi' ? 'Kết luận' : 'Conclusion',
    copy: lang === 'vi' ? 'Sao chép' : 'Copy',
    footer: lang === 'vi' ? 'BS. Đỗ Tiến Sơn TAHN' : 'Dr. Do Tien Son TAHN',
    footerSub: lang === 'vi' ? 'Phát triển phục vụ thực hành lâm sàng' : 'Developed for clinical practice',
    selectBoneAge: lang === 'vi' ? 'Đối chiếu nhanh tuổi xương theo atlas mẫu (Vicente Gilsanz và Osman Ratib)' : 'Quick Bone Age Comparison via Reference Atlas (Vicente Gilsanz & Osman Ratib)',
    page: lang === 'vi' ? 'Trang' : 'Page',
    of: lang === 'vi' ? 'trên' : 'of',
    magnifier: lang === 'vi' ? 'Kính lúp' : 'Magnifier',
    xrayTitle: lang === 'vi' ? 'X-quang của trẻ' : 'Child\'s X-ray',
    uploadXray: lang === 'vi' ? 'Tải lên hoặc Chụp ảnh' : 'Upload or Capture',
    xrayReminder: lang === 'vi' ? 'Hãy chụp thẳng; đủ sáng; với mũi ngón tay hướng lên trên' : 'Please capture straight; well-lit; with fingertips pointing upwards',
    showXray: lang === 'vi' ? 'Hiện phim' : 'Show X-ray',
    hideXray: lang === 'vi' ? 'Ẩn phim' : 'Hide X-ray',
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
              <h2 className="text-2xl font-bold text-emerald-600">BoneAge - Dr.Son</h2>
              <p className="text-zinc-500 text-sm">Vui lòng đăng nhập để sử dụng ứng dụng</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="Nhập tên người dùng..."
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
                    placeholder="••••"
                    maxLength={4}
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
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-emerald-600">{t.title}</h1>
          <button 
            onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 hover:bg-zinc-100 transition-colors text-sm font-medium"
          >
            <Languages size={16} />
            {lang === 'vi' ? 'English' : 'Tiếng Việt'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Input Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-zinc-50 p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{t.realAge}</label>
            <div className="flex gap-4">
              <div className="flex-1">
                <input 
                  type="number" 
                  value={realAgeYears} 
                  onChange={(e) => setRealAgeYears(Number(e.target.value))}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder={t.years}
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">{t.years}</span>
              </div>
              <div className="flex-1">
                <input 
                  type="number" 
                  value={realAgeMonths} 
                  onChange={(e) => setRealAgeMonths(Number(e.target.value))}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder={t.months}
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">{t.months}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{t.gender}</label>
            <div className="flex p-1 bg-zinc-100 rounded-xl border border-zinc-200">
              <button 
                onClick={() => setGender('boy')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${gender === 'boy' ? 'bg-emerald-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
              >
                {t.boy}
              </button>
              <button 
                onClick={() => setGender('girl')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${gender === 'girl' ? 'bg-pink-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
              >
                {t.girl}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{t.finalBoneAge}</label>
            <div className="flex gap-4">
              <div className="flex-1">
                <input 
                  type="number" 
                  value={finalAgeYears} 
                  onChange={(e) => setFinalAgeYears(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder={t.years}
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">{t.years}</span>
              </div>
              <div className="flex-1">
                <input 
                  type="number" 
                  value={finalAgeMonths} 
                  onChange={(e) => setFinalAgeMonths(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder={t.months}
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">{t.months}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{t.interpretingDoctor}</label>
            <div className="flex items-center bg-white border border-zinc-200 rounded-xl overflow-hidden focus-within:border-emerald-500 transition-colors">
              <div className="pl-3 pr-2 py-3 bg-zinc-50 border-r border-zinc-200 text-zinc-500 font-medium text-sm flex items-center gap-2">
                <User size={16} />
                <span>BS.</span>
              </div>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(capitalizeWords(e.target.value))}
                className="w-full px-3 py-3 focus:outline-none text-sm font-medium text-zinc-700"
                placeholder="Tên bác sĩ..."
              />
            </div>
          </div>
        </section>

        {/* Atlas Comparison Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              {t.selectBoneAge}
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMagnifierActive(!isMagnifierActive)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${isMagnifierActive ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 'bg-white/10 border-white/20 hover:bg-white/20 text-white'}`}
              >
                <Search size={16} />
                {t.magnifier}
              </button>
              <div className="text-sm font-medium text-white/70">
                {t.page} {pageNumber} {numPages ? `${t.of} ${numPages}` : ''}
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

          <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-[0_4px_20px_rgba(16,185,129,0.15)] bg-zinc-800 flex justify-center items-center min-h-[600px] p-4 md:p-8" style={{ perspective: 1200 }}>
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
                    {lang === 'vi' 
                      ? 'Không tìm thấy file atlas.pdf. Vui lòng đặt file atlas.pdf vào thư mục public của dự án.' 
                      : 'atlas.pdf not found. Please place atlas.pdf in the public folder of the project.'}
                  </p>
                </div>
              }
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={pageNumber}
                  initial={isMobile ? { opacity: 0 } : { opacity: 0, rotateY: 15, scale: 0.95 }}
                  animate={isMobile ? { opacity: 1 } : { opacity: 1, rotateY: 0, scale: 1 }}
                  exit={isMobile ? { opacity: 0 } : { opacity: 0, rotateY: -15, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="flex shadow-2xl bg-white origin-center"
                  style={{ transformStyle: isMobile ? 'flat' : 'preserve-3d' }}
                >
                  {isMobile ? (
                    <div className="relative">
                      <MagnifiablePage 
                        pageNumber={pageNumber} 
                        width={window.innerWidth - 64} 
                        isActive={isMagnifierActive} 
                      />
                    </div>
                  ) : (
                    <>
                      {/* Left Page */}
                      {(pageNumber % 2 === 0 ? pageNumber : pageNumber - 1) > 0 ? (
                        <div className="border-r border-zinc-300 relative">
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
                      {(pageNumber % 2 === 0 ? pageNumber + 1 : pageNumber) <= (numPages || 1000) ? (
                        <div className="relative">
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
              </AnimatePresence>
            </Document>
          </div>
        </section>

        {/* X-ray Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
              <Camera size={20} className="text-emerald-400" />
              {t.xrayTitle}
            </h2>
            <button
              onClick={() => setIsXrayVisible(!isXrayVisible)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors text-sm font-medium border border-white/20"
            >
              {isXrayVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              {isXrayVisible ? t.hideXray : t.showXray}
            </button>
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
                        <p className="text-white font-medium">{t.uploadXray}</p>
                        <p className="text-zinc-400 text-sm max-w-xs">{t.xrayReminder}</p>
                      </div>
                      <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl transition-colors font-semibold shadow-lg shadow-emerald-900/20">
                        {t.uploadXray}
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleXrayUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="relative group">
                      <img
                        src={xrayImage}
                        alt="Patient X-ray"
                        className="w-full max-h-[800px] object-contain rounded-xl border border-white/10 bg-black"
                      />
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <label className="cursor-pointer p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg transition-colors">
                          <Camera size={20} />
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
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
                      <div className="absolute bottom-4 left-4 right-4 p-4 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
                        <p className="text-white/90 text-sm flex items-center gap-2">
                          <Info size={16} className="text-emerald-400" />
                          {t.xrayReminder}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Conclusion Section */}
        {finalAgeYears !== '' && finalAgeMonths !== '' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{t.conclusion}</h2>
              <button 
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors text-sm font-semibold shadow-lg shadow-emerald-900/10"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? (lang === 'vi' ? 'Đã chép' : 'Copied') : t.copy}
              </button>
            </div>
            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-2xl relative group">
              <p className="text-zinc-800 leading-relaxed font-sans text-lg whitespace-pre-wrap">
                {getConclusion()}
              </p>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 mt-12 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-1">
          <p className="text-white/50 text-xs font-medium tracking-wide uppercase">
            {t.footer}
          </p>
          <p className="text-white/30 text-[10px] italic">
            {t.footerSub}
          </p>
          <p className="text-white/40 text-[11px] leading-relaxed pt-1">
            <a 
              href="https://dotienson.com/app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors underline underline-offset-4"
            >
              dotienson.com/app
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
