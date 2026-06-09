const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Footer Updates
content = content.replace(/\{'BS\. Đỗ Tiến Sơn TAHN'\}/g, "(<a href=\"https://tamanhhospital.vn/chuyen-gia/do-tien-son/\" target=\"_blank\" rel=\"noreferrer\" className=\"hover:text-white/70 transition-colors underline underline-offset-2\">Bản quyền phần mềm thuộc về BS. Đỗ Tiến Sơn</a>)");
content = content.replace(/<p className="text-white\/30 text-\[10px\] italic">\s*\{'Phát triển phục vụ thực hành lâm sàng'\}\s*<\/p>/g, ""); 

// 2. Labels
content = content.replace(/'Kết luận mốc tuổi xương \(Vicente\):'/g, "'Kết luận mốc tuổi xương (Vicente - Osman):'");
content = content.replace(/'Kết luận mốc tuổi xương DBAC:'/g, "'Kết luận mốc tuổi xương (DBAC, Gaskin và cộng sự):'");

// 3. New state variables
const stateVars = `const [patientName, setPatientName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [examDate, setExamDate] = useState('');
  const [showRef, setShowRef] = useState(false);`;

content = content.replace(/const \[gender, setGender] = useState<'boy' \| 'girl'>\('girl'\);/g, `const [gender, setGender] = useState<'boy' | 'girl'>('girl');\n  \${stateVars}`);

// 4. handleReset updates
const resetUpdates = `setPatientName('');
    setPatientId('');
    setExamDate('');`;
content = content.replace(/setRealAgeYears\(8\);/g, `setRealAgeYears(8);\n    \${resetUpdates}`);

// 5. Imports for lucide-react and docx and file-saver
content = content.replace(/import \{ ChevronLeft/g, "import { ChevronLeft, ChevronDown, Download, FileType");
// docx
const imports = `import { Document as DocxDocument, Packer, Paragraph, TextRun, AlignmentType, SectionType, BorderStyle, ShadingType } from 'docx';
import { saveAs } from 'file-saver';
`;
content = content.replace(/import \{ Document/g, imports + "\nimport { Document");

// 6. Add Export Word function
const exportWordFn = `  const handleExportWord = async () => {
    if (!isExpertMode) return;
    
    // Parse findings
    const yesFeatures: string[] = [];
    const noFeatures: string[] = [];
    if (dbacBoneAge) {
      Object.entries(dbacSelections).forEach(([key, val]) => {
        const [mIdx, fIdx] = key.split('-').map(Number);
        const milestone = DBAC_DATA_BOY[mIdx];
        const feature = milestone.features[fIdx];
        const str = \`\${capitalizeWords(feature)} (mốc \${milestone.label})\`;
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
          
          new Paragraph({
            children: [
              new TextRun({ text: "1. ĐỐI CHIẾU THEO VICENTE GILSANZ & OSMAN RATIB:", bold: true, size: 24, font: "Arial", color: "1E40AF" })
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Tuổi xương kết luận: ", size: 24, font: "Arial" }),
              new TextRun({ text: \`\${expertBoneAge.replace(',', '.')} +/- 0.5 tuổi\`, size: 24, font: "Arial", bold: true })
            ],
            spacing: { after: 400 }
          }),

          ...(dbacBoneAge ? [
            new Paragraph({
                children: [
                new TextRun({ text: "2. ĐỐI CHIẾU THEO KẾT QUẢ DBAC (Cree M. Gaskin và cộng sự):", bold: true, size: 24, font: "Arial", color: "1E40AF" })
                ],
                spacing: { after: 200 }
            }),
            new Paragraph({
                children: [
                new TextRun({ text: "Tuổi xương kết luận: ", size: 24, font: "Arial" }),
                new TextRun({ text: \`\${dbacBoneAge.replace(',', '.')} +/- 0.5 tuổi\`, size: 24, font: "Arial", bold: true })
                ],
                spacing: { after: 200 }
            }),
            new Paragraph({
                children: [
                new TextRun({ text: "- Các dấu hiệu đã ghi nhận rõ:", size: 24, font: "Arial", italics: true })
                ],
                spacing: { after: 100 }
            }),
            ...(yesFeatures.length > 0 ? yesFeatures.map(f => new Paragraph({
                children: [new TextRun({ text: \`+ \${f}\`, size: 24, font: "Arial" })],
                indent: { left: 720 },
                spacing: { after: 100 }
            })) : [new Paragraph({ children: [new TextRun({ text: "+ Chưa có", size: 24, font: "Arial" })], indent: { left: 720 }, spacing: { after: 100 } })]),
            new Paragraph({
                children: [
                new TextRun({ text: "- Các dấu hiệu chưa ghi nhận rõ sự xuất hiện:", size: 24, font: "Arial", italics: true })
                ],
                spacing: { after: 100 }
            }),
            ...(noFeatures.length > 0 ? noFeatures.map(f => new Paragraph({
                children: [new TextRun({ text: \`+ \${f}\`, size: 24, font: "Arial" })],
                indent: { left: 720 },
                spacing: { after: 100 }
            })) : [new Paragraph({ children: [new TextRun({ text: "+ Chưa có", size: 24, font: "Arial" })], indent: { left: 720 }, spacing: { after: 100 } })]),
            new Paragraph({ text: "", spacing: { after: 200 } })
          ] : []),

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
             spacing: { after: 400 }
          }),

          // References
          new Paragraph({
             children: [
                new TextRun({ text: "Tài liệu tham khảo (References):", size: 18, font: "Arial", color: "666666" })
             ],
             spacing: { after: 100 }
          }),
          new Paragraph({
             children: [
                new TextRun({ text: "[1] Bunch, P. M., Altes, T. A., McIlhenny, J., Patrie, J., & Gaskin, C. M. (2017). Skeletal development of the hand and wrist: digital bone age companion-a suitable alternative to the Greulich and Pyle atlas for bone age assessment?. Skeletal radiology, 46(6), 785–793.", size: 16, font: "Arial", color: "666666" })
             ],
             spacing: { after: 100 }
          }),
          new Paragraph({
             children: [
                new TextRun({ text: "[2] Gilsanz V, Ratib O. Hand bone age a digital atlas of skeletal maturity. New York: Springer; 2011; Second Edition;", size: 16, font: "Arial", color: "666666" })
             ],
             spacing: { after: 100 }
          }),
          new Paragraph({
             children: [
                new TextRun({ text: "[3] Martin, D. D., et al. (2011). The use of bone age in clinical practice - part 1. Hormone research in paediatrics, 76(1), 1–9.", size: 16, font: "Arial", color: "666666" })
             ]
          })
        ]
      }]
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, \`TuoiXuong_\${patientName || 'BenhNhan'}.docx\`);
    });
  };\n`;

// Insert the exact Export Word function above handleLogout
content = content.replace(/const handleLogout = /g, \`\${exportWordFn}\n  const handleLogout = \`);

// 7. Add Export button
content = content.replace(/<button \n\s*onClick=\{copyToClipboard\}/g, \`<button 
                  onClick={handleExportWord}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors text-sm font-semibold shadow-lg shadow-blue-900/10 mr-2"
                >
                  <FileType size={16} /> Xuất Word
                </button>
                <button 
                  onClick={copyToClipboard}\`);

// 8. Add Reference box
const refBox = \`
        {/* Reference Section */}
        <section className="mt-8 border-t border-white/10 pt-6">
          <button 
            onClick={() => setShowRef(!showRef)}
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors text-sm font-medium ml-4 md:ml-0"
          >
            <ChevronDown size={16} className={\\\`transition-transform \\\\\\\${showRef ? 'rotate-180' : ''}\\\`} />
            References
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
\`;

content = content.replace(/\{\/\* Footer \*\/\}/g, \`\${refBox}\n      {/* Footer */}\`);

fs.writeFileSync('src/App.tsx', content);
