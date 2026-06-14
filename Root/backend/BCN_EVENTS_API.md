# API Quản lý Sự kiện - Ban Chủ Nhiệm (BCN)

## Base URL
```
http://localhost:3000/api/bcn/events
```

## Authentication
Tất cả các endpoint yêu cầu header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Lấy danh sách sự kiện của CLB
**GET** `/api/bcn/events`

**Query Parameters:**
- `MaCLB` (string, required): Mã câu lạc bộ
- `TrangThai` (string, optional): Lọc theo trạng thái
  - `draft`: Bản nháp
  - `cho_duyet_khoa`: Chờ Khoa duyệt
  - `cho_duyet_ctsv`: Chờ CTSV duyệt
  - `da_duyet`: Đã cấp phép
  - `tu_choi`: Bị từ chối

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "MaSK": "SK1234567890",
      "MaCLB": "CLB00000001",
      "TenSK": "Workshop ReactJS",
      "MoTa": "Buổi workshop về ReactJS",
      "ThoiGianBatDau": "2026-06-10T08:00:00.000Z",
      "ThoiGianKetThuc": "2026-06-10T11:30:00.000Z",
      "DiaDiem": "Phòng Lab 201",
      "SoNguoiToiDa": 40,
      "ChiPhiDuKien": 0,
      "LoaiSK": "Workshop",
      "TrangThai": "draft",
      "UrlAnh": "https://...",
      "DiemRenLuyen": 5,
      "LyDoTuChoi": null,
      "NgayTao": "2026-05-20T09:00:00.000Z"
    }
  ],
  "total": 1
}
```

---

### 2. Lấy chi tiết sự kiện
**GET** `/api/bcn/events/:id`

**Parameters:**
- `id` (string): Mã sự kiện (MaSK)

**Response:**
```json
{
  "success": true,
  "data": {
    "MaSK": "SK1234567890",
    "MaCLB": "CLB00000001",
    "TenSK": "Workshop ReactJS",
    "MoTa": "Buổi workshop về ReactJS",
    "ThoiGianBatDau": "2026-06-10T08:00:00.000Z",
    "ThoiGianKetThuc": "2026-06-10T11:30:00.000Z",
    "DiaDiem": "Phòng Lab 201",
    "SoNguoiToiDa": 40,
    "ChiPhiDuKien": 0,
    "LoaiSK": "Workshop",
    "TrangThai": "draft",
    "UrlAnh": "https://...",
    "DiemRenLuyen": 5,
    "LyDoTuChoi": null,
    "NgayTao": "2026-05-20T09:00:00.000Z",
    "soNguoiDaDangKy": 15
  }
}
```

---

### 3. Tạo sự kiện mới
**POST** `/api/bcn/events`

**Request Body:**
```json
{
  "MaCLB": "CLB00000001",
  "TenSK": "Workshop ReactJS",
  "MoTa": "Buổi workshop về ReactJS",
  "ThoiGianBatDau": "2026-06-10T08:00:00Z",
  "ThoiGianKetThuc": "2026-06-10T11:30:00Z",
  "DiaDiem": "Phòng Lab 201",
  "SoNguoiToiDa": 40,
  "ChiPhiDuKien": 0,
  "LoaiSK": "Workshop",
  "UrlAnh": "https://...",
  "DiemRenLuyen": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tạo sự kiện thành công",
  "data": {
    "MaSK": "SK1234567890"
  }
}
```

---

### 4. Cập nhật sự kiện
**PUT** `/api/bcn/events/:id`

**Parameters:**
- `id` (string): Mã sự kiện (MaSK)

**Request Body:** (Tương tự như tạo sự kiện)

**Response:**
```json
{
  "success": true,
  "message": "Cập nhật sự kiện thành công"
}
```

**Lưu ý:** Chỉ có thể sửa sự kiện ở trạng thái `draft` hoặc `tu_choi`

---

### 5. Xóa sự kiện
**DELETE** `/api/bcn/events/:id`

**Parameters:**
- `id` (string): Mã sự kiện (MaSK)

**Response:**
```json
{
  "success": true,
  "message": "Xóa sự kiện thành công"
}
```

**Lưu ý:** Chỉ có thể xóa sự kiện ở trạng thái `draft`

---

### 6. Gửi sự kiện để duyệt
**PATCH** `/api/bcn/events/:id/submit`

**Parameters:**
- `id` (string): Mã sự kiện (MaSK)

**Response:**
```json
{
  "success": true,
  "message": "Gửi sự kiện để duyệt thành công"
}
```

**Trạng thái chuyển:** `draft` → `cho_duyet_khoa`

---

### 7. Duyệt sự kiện (Cán bộ Khoa)
**PATCH** `/api/bcn/events/:id/approve-faculty`

**Parameters:**
- `id` (string): Mã sự kiện (MaSK)

**Response:**
```json
{
  "success": true,
  "message": "Duyệt sự kiện từ Khoa thành công"
}
```

**Trạng thái chuyển:** `cho_duyet_khoa` → `cho_duyet_ctsv`

---

### 8. Duyệt sự kiện (Phòng CTSV)
**PATCH** `/api/bcn/events/:id/approve-ctsv`

**Parameters:**
- `id` (string): Mã sự kiện (MaSK)

**Response:**
```json
{
  "success": true,
  "message": "Duyệt sự kiện từ CTSV thành công"
}
```

**Trạng thái chuyển:** `cho_duyet_ctsv` → `da_duyet`

---

### 9. Từ chối sự kiện
**PATCH** `/api/bcn/events/:id/reject`

**Parameters:**
- `id` (string): Mã sự kiện (MaSK)

**Request Body:**
```json
{
  "LyDoTuChoi": "Sự kiện chưa đủ thông tin chi tiết"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Từ chối sự kiện thành công"
}
```

**Trạng thái chuyển:** `cho_duyet_khoa` hoặc `cho_duyet_ctsv` → `tu_choi`

---

## Trạng thái Sự kiện

| Trạng thái | Mô tả | Hành động có thể |
|-----------|-------|-----------------|
| `draft` | Bản nháp | Sửa, Xóa, Gửi duyệt |
| `cho_duyet_khoa` | Chờ Khoa duyệt | Xem chi tiết, Từ chối |
| `cho_duyet_ctsv` | Chờ CTSV duyệt | Xem chi tiết, Từ chối |
| `da_duyet` | Đã cấp phép | Xem chi tiết |
| `tu_choi` | Bị từ chối | Sửa, Gửi lại |

---

## Loại Sự kiện

- Workshop
- Cuộc thi
- Sinh hoạt
- Thể thao
- Tình nguyện
- Khóa học
- Seminar

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Thiếu thông tin bắt buộc: MaCLB, TenSK, ThoiGianBatDau, ThoiGianKetThuc"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Chỉ có thể sửa sự kiện ở trạng thái bản nháp hoặc bị từ chối"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Sự kiện không tồn tại"
  }
}
```

---

## Ví dụ Sử dụng

### JavaScript/Axios
```javascript
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';
const token = localStorage.getItem('token');

// Lấy danh sách sự kiện
const getEvents = async (MaCLB) => {
  const response = await axios.get(`${API_BASE}/bcn/events`, {
    params: { MaCLB },
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Tạo sự kiện
const createEvent = async (eventData) => {
  const response = await axios.post(`${API_BASE}/bcn/events`, eventData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Gửi duyệt
const submitEvent = async (MaSK) => {
  const response = await axios.patch(
    `${API_BASE}/bcn/events/${MaSK}/submit`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};
```

---

## Quy trình Phê duyệt

```
Tạo mới (draft)
    ↓
Gửi duyệt (cho_duyet_khoa)
    ↓
Khoa duyệt (cho_duyet_ctsv)
    ↓
CTSV duyệt (da_duyet)
    ↓
Hoàn tất

Hoặc tại bất kỳ bước nào:
    ↓
Từ chối (tu_choi) → Sửa lại → Gửi lại
```
