const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace padding
code = code.replace(
  /<div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between w-full">/,
  '<div className="max-w-7xl mx-auto px-4 py-1 flex items-center justify-between w-full">'
);

// Replace logo size classes
const target = `<img src="/logo.png" alt="Logo" className="h-16 sm:h-24 w-auto mr-2 object-contain"`;
const replacement = `<img src="/logo.png" alt="Logo" className="h-auto w-auto max-h-16 sm:max-h-24 max-w-[60vw] sm:max-w-[350px] mr-2 object-contain"`;

code = code.replace(target, replacement);

fs.writeFileSync('src/App.tsx', code);
