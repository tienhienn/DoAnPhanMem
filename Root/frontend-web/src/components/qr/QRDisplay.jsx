import { QRCodeSVG } from 'qrcode.react';

/**
 * Component hiển thị mã QR với độ tương phản cao.
 * Bọc QR trong container có padding trắng để đảm bảo khả năng quét.
 *
 * Requirements: 5.2, 5.7
 *
 * @param {string} value - Chuỗi dữ liệu QR (bắt buộc)
 * @param {number} [size=256] - Kích thước QR (px), tối thiểu 200
 */
function QRDisplay({ value, size = 256 }) {
  // Đảm bảo kích thước tối thiểu 200x200px theo yêu cầu 5.2
  const qrSize = Math.max(200, size);

  return (
    <div
      className="inline-flex items-center justify-center bg-white rounded-lg"
      style={{ padding: '16px' }}
      aria-label="Mã QR điểm danh"
    >
      <QRCodeSVG
        value={value}
        size={qrSize}
        bgColor="#ffffff"
        fgColor="#000000"
        level="M"
      />
    </div>
  );
}

export default QRDisplay;
