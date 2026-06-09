const fs = require('fs');
let content = fs.readFileSync('src/dbac_data.ts', 'utf8');
content = content.replace(/ x\. /g, ' xương ');
content = content.replace(/x\./g, 'xương');
fs.writeFileSync('src/dbac_data.ts', content);
