const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `<header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-2 min-h-[4rem] flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-tight text-emerald-600 flex items-center">
                <img src="/logo.png" alt="Logo" className="h-12 sm:h-16 w-auto mr-2 object-contain"`;

const replacement = `<header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-tight text-emerald-600 flex items-center">
                <img src="/logo.png" alt="Logo" className="h-16 sm:h-24 w-auto mr-2 object-contain"`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
