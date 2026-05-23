# Hướng dẫn Tích hợp BCN Management Page

## Tổng quan

Trang `BCNManagementPage` cho phép Ban Chủ Nhiệm (BCN) quản lý sự kiện của câu lạc bộ với các chức năng:

- ✅ Tạo sự kiện mới
- ✅ Sửa sự kiện (bản nháp hoặc bị từ chối)
- ✅ Xóa sự kiện (chỉ bản nháp)
- ✅ Gửi sự kiện để duyệt
- ✅ Xem chi tiết sự kiện
- ✅ Lọc theo trạng thái

---

## Cấu trúc Dữ liệu Sự kiện

### Bảng SU_KIEN trong Database

```sql
CREATE TABLE SU_KIEN (
    MaSK VARCHAR(13) PRIMARY KEY,
    MaCLB VARCHAR(13),
    TenSK NVARCHAR(150) NOT NULL,
    MoTa NVARCHAR(MAX),
    ThoiGianBatDau DATETIME,
    ThoiGianKetThuc DATETIME,
    DiaDiem NVARCHAR(200),
    SoNguoiToiDa INT,
    ChiPhiDuKien DECIMAL(18,2),
    LoaiSK NVARCHAR(50),
    TrangThai NVARCHAR(50),
    UrlAnh NVARCHAR(255),
    DiemRenLuyen INT DEFAULT 5,
    LyDoTuChoi NVARCHAR(MAX),
    NgayTao DATETIME DEFAULT GETDATE()
);
```

### Các Trường Dữ liệu

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|---------|-------|
| MaSK | VARCHAR(13) | ✓ | Mã sự kiện (tự sinh) |
| MaCLB | VARCHAR(13) | ✓ | Mã câu lạc bộ |
| TenSK | NVARCHAR(150) | ✓ | Tên sự kiện |
| MoTa | NVARCHAR(MAX) | | Mô tả chi tiết |
| ThoiGianBatDau | DATETIME | ✓ | Thời gian bắt đầu |
| ThoiGianKetThuc | DATETIME | ✓ | Thời gian kết thúc |
| DiaDiem | NVARCHAR(200) | | Địa điểm tổ chức |
| SoNguoiToiDa | INT | | Số lượng thành viên tối đa |
| ChiPhiDuKien | DECIMAL(18,2) | | Chi phí dự kiến (VND) |
| LoaiSK | NVARCHAR(50) | | Loại sự kiện |
| TrangThai | NVARCHAR(50) | | Trạng thái sự kiện |
| UrlAnh | NVARCHAR(255) | | URL ảnh đại diện |
| DiemRenLuyen | INT | | Điểm rèn luyện (mặc định 5) |
| LyDoTuChoi | NVARCHAR(MAX) | | Lý do từ chối (nếu có) |
| NgayTao | DATETIME | | Ngày tạo sự kiện |

---

## Trạng thái Sự kiện

```
draft (Bản nháp)
  ├─ Hành động: Sửa, Xóa, Gửi duyệt
  └─ Chuyển sang: cho_duyet_khoa

cho_duyet_khoa (Chờ Khoa duyệt)
  ├─ Hành động: Xem chi tiết, Từ chối
  └─ Chuyển sang: cho_duyet_ctsv hoặc tu_choi

cho_duyet_ctsv (Chờ CTSV duyệt)
  ├─ Hành động: Xem chi tiết, Từ chối
  └─ Chuyển sang: da_duyet hoặc tu_choi

da_duyet (Đã cấp phép)
  ├─ Hành động: Xem chi tiết
  └─ Trạng thái cuối cùng

tu_choi (Bị từ chối)
  ├─ Hành động: Sửa, Gửi lại
  └─ Chuyển sang: cho_duyet_khoa
```

---

## Cách Sử dụng

### 1. Import Component

```jsx
import BCNManagementPage from '@/pages/BanChuNhiem/BCNManagementPage';
```

### 2. Sử dụng Event Service

```javascript
import { bcnEventService } from '@/services/eventService';

// Lấy danh sách sự kiện
const events = await bcnEventService.getEventsByClub('CLB00000001');

// Tạo sự kiện
const newEvent = await bcnEventService.createEvent({
  MaCLB: 'CLB00000001',
  TenSK: 'Workshop ReactJS',
  MoTa: 'Buổi workshop về ReactJS',
  ThoiGianBatDau: '2026-06-10T08:00:00Z',
  ThoiGianKetThuc: '2026-06-10T11:30:00Z',
  DiaDiem: 'Phòng Lab 201',
  SoNguoiToiDa: 40,
  ChiPhiDuKien: 0,
  LoaiSK: 'Workshop',
  UrlAnh: 'https://...',
  DiemRenLuyen: 5
});

// Gửi duyệt
await bcnEventService.submitEventForApproval('SK1234567890');

// Từ chối
await bcnEventService.rejectEvent('SK1234567890', 'Sự kiện chưa đủ thông tin');
```

---

## Các Trường Dữ liệu trong Form

### Bắt buộc
- **Tên sự kiện** (TenSK)
- **Thời gian bắt đầu** (ThoiGianBatDau)
- **Thời gian kết thúc** (ThoiGianKetThuc)

### Tùy chọn
- **Mô tả chi tiết** (MoTa)
- **Địa điểm** (DiaDiem)
- **Số lượng tối đa** (SoNguoiToiDa)
- **Chi phí dự kiến** (ChiPhiDuKien)
- **Loại sự kiện** (LoaiSK)
- **URL ảnh** (UrlAnh)
- **Điểm rèn luyện** (DiemRenLuyen, mặc định 5)

---

## Loại Sự kiện

```javascript
const EVENT_TYPES = [
  'Workshop',
  'Cuộc thi',
  'Sinh hoạt',
  'Thể thao',
  'Tình nguyện',
  'Khóa học',
  'Seminar'
];
```

---

## Thống kê

Trang hiển thị 3 thống kê chính:

1. **Tổng sự kiện**: Tất cả sự kiện của CLB
2. **Đang dự thảo (Nháp)**: Sự kiện ở trạng thái `draft`
3. **Đang chờ duyệt**: Sự kiện ở trạng thái `cho_duyet_khoa`

---

## Lọc Sự kiện

Có thể lọc theo các trạng thái:

- Tất cả
- Bản nháp
- Chờ Khoa duyệt
- Chờ CTSV duyệt
- Đã cấp phép
- Bị từ chối

---

## Xử lý Lỗi

### Lỗi Validation

```javascript
// Thiếu thông tin bắt buộc
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Thiếu thông tin bắt buộc: MaCLB, TenSK, ThoiGianBatDau, ThoiGianKetThuc"
  }
}
```

### Lỗi Quyền hạn

```javascript
// Không thể sửa sự kiện không ở trạng thái draft
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Chỉ có thể sửa sự kiện ở trạng thái bản nháp hoặc bị từ chối"
  }
}
```

### Lỗi Không tìm thấy

```javascript
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Sự kiện không tồn tại"
  }
}
```

---

## Quy trình Phê duyệt

### Bước 1: Ban Chủ Nhiệm Tạo Sự kiện
- Tạo sự kiện mới ở trạng thái `draft`
- Có thể sửa hoặc xóa

### Bước 2: Gửi Duyệt
- Gửi sự kiện để Khoa duyệt
- Trạng thái chuyển sang `cho_duyet_khoa`

### Bước 3: Khoa Duyệt
- Cán bộ Khoa xem chi tiết
- Duyệt hoặc từ chối
- Nếu duyệt: chuyển sang `cho_duyet_ctsv`
- Nếu từ chối: chuyển sang `tu_choi`

### Bước 4: CTSV Duyệt
- Phòng CTSV xem chi tiết
- Duyệt hoặc từ chối
- Nếu duyệt: chuyển sang `da_duyet`
- Nếu từ chối: chuyển sang `tu_choi`

### Bước 5: Hoàn tất
- Sự kiện ở trạng thái `da_duyet`
- Sinh viên có thể đăng ký

---

## Biến Môi trường

Thêm vào file `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

---

## Kiểm tra Kết nối

### 1. Kiểm tra Backend

```bash
curl http://localhost:3000/api/health
```

Kết quả mong đợi:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-05-23T10:00:00.000Z"
}
```

### 2. Kiểm tra API BCN Events

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/bcn/events?MaCLB=CLB00000001
```

---

## Troubleshooting

### Lỗi: "Không thể tải danh sách sự kiện"

**Nguyên nhân:**
- Backend không chạy
- Token hết hạn
- MaCLB không hợp lệ

**Giải pháp:**
1. Kiểm tra backend đang chạy: `npm run dev`
2. Đăng nhập lại để lấy token mới
3. Kiểm tra MaCLB trong database

### Lỗi: "Chỉ có thể sửa sự kiện ở trạng thái bản nháp"

**Nguyên nhân:**
- Sự kiện đã được gửi duyệt

**Giải pháp:**
- Chỉ có thể sửa sự kiện ở trạng thái `draft` hoặc `tu_choi`
- Nếu bị từ chối, sửa lại rồi gửi lại

---

## Tài liệu Liên quan

- [BCN_EVENTS_API.md](./BCN_EVENTS_API.md) - Tài liệu API chi tiết
- [QuanLyCLB.sql](./QuanLyCLB.sql) - Schema database
