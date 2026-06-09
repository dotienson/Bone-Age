const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Initial State Dates
content = content.replace(/useState\(''\);\s*const \[xrayDate, setXrayDate\] = useState\(''\);/,
`useState('');
  const [xrayDate, setXrayDate] = useState(() => {
    const d = new Date();
    return \`\${d.getDate().toString().padStart(2, '0')}/\${(d.getMonth() + 1).toString().padStart(2, '0')}/\${d.getFullYear()}\`;
  });`);
  
content = content.replace(/const \[examDate, setExamDate\] = useState\(''\);/, 
`const [examDate, setExamDate] = useState(() => {
    const d = new Date();
    return \`\${d.getDate().toString().padStart(2, '0')}/\${(d.getMonth() + 1).toString().padStart(2, '0')}/\${d.getFullYear()}\`;
  });`);

// 2. Remove placeholders in Input Section
content = content.replace(/placeholder="Nguyễn Văn A" /g, "");
content = content.replace(/placeholder="BN123456" /g, "");
content = content.replace(/placeholder="DD\/MM\/YYYY"\s*/g, "");

// 3. Update getExpertConclusion
content = content.replace(/BÁO CÁO PHIÊN GIẢI TUỔI XƯƠNG\\nDựa trên phim chụp ngày \$\{dateText\}, tại \$\{locationText\} \(Chất lượng phim: \$\{qualityText\}\)\\nBằng phương pháp Greulich/,
`BÁO CÁO PHIÊN GIẢI TUỔI XƯƠNG\\nDựa trên phim chụp ngày \${dateText}, tại \${locationText} (Chất lượng phim: \${qualityText})\\n\\n* Bằng phương pháp Greulich`);

content = content.replace(/Xuất Word/g, "Xuất báo cáo");

// 4. Update handleExportWord
const exportReplacement = `const conclusionText = getExpertConclusion();
    const fromIndex = conclusionText.indexOf('* Bằng phương pháp');
    const conclusionToExport = fromIndex !== -1 ? conclusionText.substring(fromIndex) : conclusionText;

    const doc = new DocxDocument({
      sections: [{
        properties: {
          type: SectionType.CONTINUOUS,
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
            borders: {
              pageBorders: {
                display: "allPages",
                left: { style: BorderStyle.SINGLE, size: 24, color: "0000FF", space: 24 },
                right: { style: BorderStyle.SINGLE, size: 24, color: "0000FF", space: 24 },
                top: { style: BorderStyle.SINGLE, size: 24, color: "0000FF", space: 24 },
                bottom: { style: BorderStyle.SINGLE, size: 24, color: "0000FF", space: 24 },
              }
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
              new TextRun({ text: \`Tên người bệnh: \${patientName || '........................................'}\`, size: 24, font: "Arial", bold: true }),
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: \`ID: \${patientId || '........................................'}\`, size: 24, font: "Arial" }),
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: \`Ngày khám: \${examDate || '........................................'}\`, size: 24, font: "Arial" }),
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: \`Chất lượng phim: \${xrayQuality || 'Tốt'}\`, size: 24, font: "Arial" }),
            ],
            spacing: { after: 400 }
          }),
          
          // Inject exact conclusion
          ...conclusionToExport.split('\\n').map(line => new Paragraph({
             children: [new TextRun({ text: line, size: 24, font: "Arial" })],
             spacing: { after: 100 }
          })),

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
                new TextRun({ text: \`Ngày đánh giá: \${new Date().toLocaleDateString('vi-VN')}\`, size: 24, font: "Arial" })
             ],
             spacing: { after: 600 }
          }),

          // References
          new Paragraph({
             children: [
                new TextRun({ text: "Tài liệu tham khảo (References):", size: 22, font: "Arial", bold: true, color: "000000" })
             ],
             spacing: { after: 200 }
          }),
          new Paragraph({
             children: [
                new TextRun({ text: "[1] Bunch, P. M., Altes, T. A., McIlhenny, J., Patrie, J., & Gaskin, C. M. (2017). Skeletal development of the hand and wrist: digital bone age companion-a suitable alternative to the Greulich and Pyle atlas for bone age assessment?. Skeletal radiology, 46(6), 785–793.", size: 18, font: "Arial", color: "444444" })
             ],
             spacing: { after: 100 }
          }),
          new Paragraph({
             children: [
                new TextRun({ text: "[2] Gilsanz V, Ratib O. Hand bone age a digital atlas of skeletal maturity. New York: Springer; 2011; Second Edition;", size: 18, font: "Arial", color: "444444" })
             ],
             spacing: { after: 100 }
          }),
          new Paragraph({
             children: [
                new TextRun({ text: "[3] Martin, D. D., et al. (2011). The use of bone age in clinical practice - part 1. Hormone research in paediatrics, 76(1), 1–9.", size: 18, font: "Arial", color: "444444" })
             ]
          })
        ]
      }]
    });`;

content = content.replace(/const doc = new DocxDocument\(\{[\s\S]*?\}\]\s*\}\]\s*\}\);/, exportReplacement);

// 5. Update Footer text
content = content.replace(/<p className="text-white\/50 text-xs font-medium tracking-wide uppercase">\s*.*\s*.*\s*<\/p>/,
`<p className="text-white/50 text-xs font-medium tracking-wide uppercase">
            Bản quyền phần mềm thuộc về <a href="https://tamanhhospital.vn/chuyen-gia/do-tien-son/" target="_blank" rel="noreferrer" className="hover:text-white/70 transition-colors underline underline-offset-2">BS. Đỗ Tiến Sơn</a>
          </p>`);

// remove dotienson.com
content = content.replace(/<p className="text-white\/40 text-\[11px\] leading-relaxed pt-1">\s*<a\s*href="https:\/\/dotienson\.com\/app"[\s\S]*?<\/a>\s*<\/p>/, '');

// 6. DBAC layout
content = content.replace(/<div className="relative rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-\[0_4px_20px_rgba\(99,102,241,0\.15\)\] bg-zinc-800 flex justify-center items-center min-h-\[600px\] p-4 md:p-8" style=\{\{ perspective: 1200 \}\}>/, 
`<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-[0_4px_20px_rgba(99,102,241,0.15)] bg-zinc-800 flex justify-center items-center min-h-[500px] p-4 lg:p-8" style={{ perspective: 1200 }}>`);

content = content.replace(/<\/AnimatePresence>\s*<\/Document>\s*<\/div>\s*<div className="bg-zinc-800 p-4/,
`</AnimatePresence>
                </Document>
              </div>

              <div className="flex flex-col gap-4">
                <div className="bg-zinc-800 p-4`);

content = content.replace(/(placeholder="VD: 8\.5 hoặc 8,5"\s*\/>\s*<\/div>)\s*<\/section>/,
`$1
              </div>
            </div>
          </section>`);

fs.writeFileSync('src/App.tsx', content);
