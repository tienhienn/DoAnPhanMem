const fs = require('fs');
const path = require('path');

const bcnControllerPath = path.join(__dirname, 'backend', 'controllers', 'bcnEventController.js');
let bcnContent = fs.readFileSync(bcnControllerPath, 'utf8');

const normalizeText = (text) => text.replace(/\r\n/g, '\n');
let normalizedBcnContent = normalizeText(bcnContent);

const target = `      const diemRenLuyen = eventRes.recordset[0].DiemRenLuyen || 0;
      if (diemRenLuyen > 0) {
        await request
          .input("DiemCong", sql.Float, diemRenLuyen)
          .input("MaND2", sql.NVarChar, maND)
          .query(\`
            UPDATE SINHVIEN 
            SET diemRenLuyen = COALESCE(diemRenLuyen, 0) + @DiemCong 
            WHERE maSV = @MaND2
          \`);
      }`;

const replacement = `      const diemRenLuyen = eventRes.recordset[0].DiemRenLuyen || 0;
      if (diemRenLuyen > 0) {
        const requestSV = new sql.Request(transaction);
        await requestSV
          .input("DiemCong", sql.Float, diemRenLuyen)
          .input("MaND", sql.NVarChar, maND)
          .query(\`
            UPDATE SINHVIEN 
            SET diemRenLuyen = COALESCE(diemRenLuyen, 0) + @DiemCong 
            WHERE maSV = @MaND
          \`);
      }`;

if (normalizedBcnContent.includes(normalizeText(target))) {
  normalizedBcnContent = normalizedBcnContent.replace(normalizeText(target), normalizeText(replacement));
  fs.writeFileSync(bcnControllerPath, normalizedBcnContent, 'utf8');
  console.log('✓ Successfully patched transaction to use fresh sql.Request objects');
} else {
  console.error('Error: transaction target block not found in bcnEventController.js');
}
