const fs = require('fs');
let content = fs.readFileSync('src/dbac_data.ts', 'utf8');
content = content.replace(/ x\. /gi, ' xương ');
content = content.replace(/ \bx\. /gi, ' xương ');
content = content.replace(/x\./gi, 'xương ');
fs.writeFileSync('src/dbac_data.ts', content);
