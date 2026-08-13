const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const bannerContent = `<div className="fixed bottom-0 left-0 right-0 z-50 bg-amber-500 text-white text-[10px] sm:text-xs font-semibold py-1 px-4 overflow-hidden flex items-center w-full shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
  <div className="animate-marquee-mobile sm:w-full sm:text-center w-full">
    KẾT QUẢ DO BÁC SĨ PHÂN TÍCH THỦ CÔNG - KHÔNG PHẢI SẢN PHẨM CỦA TRÍ TUỆ NHÂN TẠO (AI)
  </div>
</div>`;

// Remove banner from header
code = code.replace(
  /<div className="bg-amber-500 text-white text-\[10px\] sm:text-xs font-semibold py-1 px-4 overflow-hidden flex items-center w-full">\s*<div className="animate-marquee-mobile sm:w-full sm:text-center w-full">\s*KẾT QUẢ DO BÁC SĨ PHÂN TÍCH THỦ CÔNG - KHÔNG PHẢI SẢN PHẨM CỦA TRÍ TUỆ NHÂN TẠO \(AI\)\s*<\/div>\s*<\/div>/g,
  ''
);

// Shrink header
code = code.replace(
  /<header className="border-b border-zinc-200 bg-white\/80 backdrop-blur-md sticky top-0 z-50 flex flex-col">/g,
  '<header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">'
);
code = code.replace(
  /<div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between w-full">/g,
  '<div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between w-full">'
);
code = code.replace(
  /<h1 className="text-xl font-bold tracking-tight text-emerald-600 flex items-center">/g,
  '<h1 className="text-lg font-bold tracking-tight text-emerald-600 flex items-center">'
);
code = code.replace(
  /<Dog size={24} className="mr-2 hidden sm:block" \/>/g,
  '<Dog size={20} className="mr-2 hidden sm:block" />'
);

// Add banner to bottom before closing div
code = code.replace(
  /<\/footer>\s*<\/div>\s*\);\s*}/g,
  '</footer>\n      ' + bannerContent + '\n    </div>\n  );\n}'
);

// Add padding to footer so it's not hidden by banner
code = code.replace(
  /<footer className="border-t border-white\/10 py-6 mt-12 bg-black\/20 backdrop-blur-sm">/g,
  '<footer className="border-t border-white/10 py-6 pb-12 mt-12 bg-black/20 backdrop-blur-sm">'
);

fs.writeFileSync('src/App.tsx', code);
