const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// replace language texts manually by replacing 'lang === 'vi' ? 'A' : 'B'' with ''A''
const langRegex = /lang\s*===\s*'vi'\s*\?\s*'([^']*)'\s*:\s*'[^']*'/g;
content = content.replace(langRegex, "'$1'");

const langRegexDouble = /lang\s*===\s*'vi'\s*\?\s*"([^"]*)"\s*:\s*"[^"]*"/g;
content = content.replace(langRegexDouble, '"$1"');

const langRegexBacktick = /lang\s*===\s*'vi'\s*\?\s*`([^`]*)`\s*:\s*`[^`]*`/g;
content = content.replace(langRegexBacktick, '`$1`');

// Custom translations mapping
content = content.replace(/t\.expertAtlasTitle : t\.selectBoneAge/g, "isExpertMode ? 'Đối chiếu tuổi xương theo Atlas kĩ thuật số của Vicente Gilsanz và Osman Ratib' : 'Đối chiếu nhanh tuổi xương theo atlas mẫu (Vicente Gilsanz và Osman Ratib)'");

content = content.replace(/t\.years/g, "'Năm'");
content = content.replace(/t\.months/g, "'Tháng'");
content = content.replace(/t\.realAge/g, "'Tuổi thực'");
content = content.replace(/t\.finalBoneAge/g, "'Tuổi xương kết luận'");
content = content.replace(/t\.gender/g, "'Giới tính'");
content = content.replace(/t\.boy/g, "'Nam'");
content = content.replace(/t\.girl/g, "'Nữ'");
content = content.replace(/t\.conclusion/g, "'Kết luận'");
content = content.replace(/t\.copy/g, "'Sao chép'");
content = content.replace(/t\.footerSub/g, "'Phát triển phục vụ thực hành lâm sàng'");
content = content.replace(/t\.footer/g, "'BS. Đỗ Tiến Sơn TAHN'");
content = content.replace(/t\.expertBoneAgeLabel/g, "'Tuổi xương:'");
content = content.replace(/t\.xrayDateLabel/g, "'Ngày chụp phim'");
content = content.replace(/t\.xrayLocationLabel/g, "'Nơi chụp'");
content = content.replace(/t\.xrayQualityLabel/g, "'Chất lượng'");
content = content.replace(/t\.page/g, "'Trang'");
content = content.replace(/t\.of/g, "'trên'");
content = content.replace(/t\.magnifier/g, "'Kính lúp'");
content = content.replace(/t\.xrayTitle/g, "'X-quang của trẻ'");
content = content.replace(/t\.uploadXray/g, "'Tải lên hoặc Chụp ảnh'");
content = content.replace(/t\.xrayReminder/g, "'Hãy chụp thẳng; đủ sáng; với mũi ngón tay hướng lên trên'");
content = content.replace(/t\.showXray/g, "'Hiện phim'");
content = content.replace(/t\.hideXray/g, "'Ẩn phim'");
content = content.replace(/t\.interpretingDoctor/g, "'Bác sĩ phiên giải'");
content = content.replace(/t\.otherDoctor/g, "'BS khác'");
content = content.replace(/t\.expertAtlasTitle/g, "'Đối chiếu tuổi xương theo Atlas kĩ thuật số của Vicente Gilsanz và Osman Ratib'");
content = content.replace(/t\.selectBoneAge/g, "'Đối chiếu nhanh tuổi xương theo atlas mẫu (Vicente Gilsanz và Osman Ratib)'");

// For string interpolation like ${lang === 'vi' ? 'A' : 'B'}
content = content.replace(/\$\{lang\s*===\s*'vi'\s*\?\s*'([^']*)'\s*:\s*'[^']*'\}/g, "$1");

content = content.replace(/selectedEntry\.labelVi : selectedEntry\.labelEn/g, "selectedEntry.labelVi");

// remove Placeholders
content = content.replace(/placeholder="[^"]*"/g, "");
content = content.replace(/placeholder=\{[^}]*\}/g, "");

fs.writeFileSync('src/App.tsx', content);
