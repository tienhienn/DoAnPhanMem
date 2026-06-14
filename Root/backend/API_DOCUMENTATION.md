# Admin Event Management API - Documentation

## 📋 Tổng Quan

API này cung cấp các endpoint để quản lý sự kiện cho Ban chủ nhiệm CLB (BCN), Khoa, và Phòng CTSV. Hệ thống hỗ trợ toàn bộ vòng đời sự kiện từ tạo bản nháp đến duyệt phê chuẩn.

---

## 🔧 Cài Đặt

### 1. Chuẩn Bị Database

Chạy file `ALTER_TABLE_SUKIEN.sql` để thêm 2 cột vào bảng `SU_KIEN`:

- `DiemRenLuyen FLOAT` - Điểm rèn luyện cho sự kiện
- `LyDoTuChoi NVARCHAR(MAX)` - Lý do từ chối sự kiện

```sql
USE QUANLYCLB_UTE;
GO

ALTER TABLE SU_KIEN
ADD DiemRenLuyen FLOAT DEFAULT 0;

ALTER TABLE SU_KIEN
ADD LyDoTuChoi NVARCHAR(MAX) NULL;
GO
```

### 2. Cài Đặt Dependencies

```bash
npm install
```

### 3. Cấu Hình Environment

Tạo file `.env` dựa trên `.env.example`:

```bash
cp .env.example .env
```

Cập nhật các giá trị config:

```env
NODE_ENV=development
PORT=3000

# Database Configuration
DB_SERVER=your-server
DB_NAME=QUANLYCLB_UTE
DB_USER=sa
DB_PASSWORD=your-password
```

### 4. Chạy Server

**Development (với hot reload):**

```bash
npm run dev
```

**Production:**

```bash
npm start
```

---

## 🔐 Xác Thực

### Token Format

Tất cả requests (ngoại trừ `/api/health`) đều yêu cầu header `Authorization`:

```http
Authorization: Bearer {token}
```

**Format token:** `base64(userId:role:clubId)`

**Các Role:**

- `BCN` - Ban chủ nhiệm CLB
- `KHOA` - Khoa
- `CTSV` - Phòng Công tác Sinh viên
- `ADMIN` - Quản trị viên

### Ví Dụ Tạo Token

```bash
# userId: SV210000001, role: BCN, clubId: CLB00000001
TOKEN=$(echo -n "SV210000001:BCN:CLB00000001" | base64)
```

---

## 📡 Endpoints

### 1. Health Check

```http
GET /api/health
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-05-13T10:00:00.000Z"
}
```

---

### 2. Lấy Danh Sách Sự Kiện

```http
GET /api/admin/events
```

**Query Parameters:**
| Param | Type | Default | Mô Tả |
|-------|------|---------|--------|
| page | number | 1 | Số trang (bắt đầu từ 1) |
| limit | number | 10 | Số bản ghi trên trang |
| status | string | - | Lọc theo trạng thái |
| search | string | - | Tìm kiếm theo tên sự kiện |

**Headers:**

```http
Authorization: Bearer {token}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Events retrieved successfully",
  "data": {
    "events": [
      {
        "MaSK": "SK260000001",
        "MaCLB": "CLB00000001",
        "TenSK": "Workshop: Nhập môn ReactJS",
        "MoTa": "Buổi workshop thực hành xây dựng ứng dụng web",
        "ThoiGianBatDau": "2026-06-10T08:00:00.000Z",
        "ThoiGianKetThuc": "2026-06-10T11:30:00.000Z",
        "DiaDiem": "Phòng Lab 201 - Nhà A",
        "SoNguoiToiDa": 40,
        "ChiPhiDuKien": 0.0,
        "LoaiSK": "Workshop",
        "DiemRenLuyen": 1.5,
        "TrangThai": "draft",
        "LyDoTuChoi": null,
        "NgayTao": "2026-05-13T09:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

**Quy tắc lọc theo Role:**

- **BCN**: Lấy tất cả sự kiện của CLB (`MaCLB` = clubId trong token)
- **KHOA**: Chỉ lấy sự kiện có `TrangThai = 'pending_faculty'`
- **CTSV**: Chỉ lấy sự kiện có `TrangThai = 'pending_student_affairs'`
- **ADMIN**: Lấy tất cả sự kiện

---

### 3. Lấy Chi Tiết Sự Kiện

```http
GET /api/admin/events/{id}
```

**URL Parameters:**
| Param | Mô Tả |
|-------|--------|
| id | Mã sự kiện (MaSK) |

**Headers:**

```http
Authorization: Bearer {token}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Event retrieved successfully",
  "data": {
    "MaSK": "SK260000001",
    "MaCLB": "CLB00000001",
    "TenSK": "Workshop: Nhập môn ReactJS",
    "ThoiGianBatDau": "2026-06-10T08:00:00.000Z",
    ...
  }
}
```

**Errors:**

- `404 Not Found` - Sự kiện không tồn tại
- `403 Forbidden` - BCN chỉ có thể xem sự kiện của CLB mình

---

### 4. Tạo Sự Kiện Mới (BCN)

```http
POST /api/admin/events
```

**Headers:**

```http
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Workshop: Nhập môn ReactJS",
  "description": "Buổi workshop thực hành xây dựng ứng dụng web với ReactJS dành cho sinh viên mới bắt đầu",
  "startTime": "2026-06-10T08:00:00Z",
  "endTime": "2026-06-10T11:30:00Z",
  "location": "Phòng Lab 201 - Nhà A",
  "quota": 40,
  "points": 1.5,
  "costEstimate": 0,
  "eventType": "Workshop"
}
```

**Required Fields:**

- `name` - Tên sự kiện
- `startTime` - Thời gian bắt đầu (ISO 8601)
- `endTime` - Thời gian kết thúc (ISO 8601)
- `location` - Địa điểm
- `quota` - Số người tối đa

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "eventId": "SK260000001",
    "event": {
      "MaSK": "SK260000001",
      "MaCLB": "CLB00000001",
      "TenSK": "Workshop: Nhập môn ReactJS",
      "TrangThai": "draft",
      ...
    }
  }
}
```

**Quy tắc:**

- Chỉ **BCN** có quyền tạo sự kiện
- Sự kiện mới có trạng thái mặc định: `draft`
- `startTime` phải trước `endTime`

**Errors:**

- `403 Forbidden` - Chỉ BCN có quyền
- `400 Bad Request` - Dữ liệu không hợp lệ

---

### 5. Cập Nhật Sự Kiện (BCN)

```http
PUT /api/admin/events/{id}
```

**URL Parameters:**
| Param | Mô Tả |
|-------|--------|
| id | Mã sự kiện (MaSK) |

**Headers:**

```http
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:** (Giống POST)

```json
{
  "name": "Workshop: Nhập môn ReactJS - Cập Nhật",
  "startTime": "2026-06-10T09:00:00Z",
  "endTime": "2026-06-10T12:00:00Z",
  ...
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Event updated successfully",
  "data": {
    "eventId": "SK260000001",
    "event": {...}
  }
}
```

**Quy tắc:**

- Chỉ **BCN** có quyền sửa sự kiện
- Chỉ có thể sửa sự kiện ở trạng thái `draft` hoặc `rejected`
- Trạng thái sẽ reset về `draft` sau khi sửa
- BCN chỉ có thể sửa sự kiện của CLB mình

**Errors:**

- `404 Not Found` - Sự kiện không tồn tại
- `403 Forbidden` - Không có quyền
- `400 Bad Request` - Trạng thái không cho phép sửa

---

### 6. Xóa Sự Kiện (BCN)

```http
DELETE /api/admin/events/{id}
```

**URL Parameters:**
| Param | Mô Tả |
|-------|--------|
| id | Mã sự kiện (MaSK) |

**Headers:**

```http
Authorization: Bearer {token}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Event deleted successfully",
  "data": {
    "eventId": "SK260000001"
  }
}
```

**Quy tắc:**

- Chỉ **BCN** có quyền xóa sự kiện
- Chỉ có thể xóa sự kiện ở trạng thái `draft` hoặc `rejected`
- BCN chỉ có thể xóa sự kiện của CLB mình

**Errors:**

- `404 Not Found` - Sự kiện không tồn tại
- `403 Forbidden` - Không có quyền
- `400 Bad Request` - Trạng thái không cho phép xóa

---

### 7. Duyệt/Từ Chối Sự Kiện (KHOA/CTSV)

```http
PATCH /api/admin/events/{id}/review
```

**URL Parameters:**
| Param | Mô Tả |
|-------|--------|
| id | Mã sự kiện (MaSK) |

**Headers:**

```http
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "status": "approved",
  "feedback": null
}
```

Nếu từ chối:

```json
{
  "status": "rejected",
  "feedback": "Sự kiện không phù hợp với các tiêu chí của trường"
}
```

**Request Fields:**
| Field | Type | Required | Mô Tả |
|-------|------|----------|--------|
| status | string | ✓ | `approved` hoặc `rejected` |
| feedback | string | | Lý do từ chối (bắt buộc nếu rejected) |

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Event rejected successfully",
  "data": {
    "eventId": "SK260000001",
    "newStatus": "rejected",
    "feedback": "Sự kiện không phù hợp với các tiêu chí của trường"
  }
}
```

**Quy tắc:**

- **KHOA**: Duyệt sự kiện ở trạng thái `pending_faculty`
- **CTSV**: Duyệt sự kiện ở trạng thái `pending_student_affairs`
- Trạng thái sẽ thay đổi thành `approved` hoặc `rejected`

**Trạng thái Sự Kiện:**

```
draft
  ↓ (Gửi duyệt)
pending_faculty
  ↓ (Khoa duyệt)
approved hoặc rejected
  ↓ (Nếu rejected, BCN sửa lại và gửi lại)
pending_student_affairs
  ↓ (CTSV duyệt)
approved hoặc rejected
```

**Errors:**

- `404 Not Found` - Sự kiện không tồn tại
- `403 Forbidden` - Chỉ KHOA/CTSV có quyền
- `400 Bad Request` - Trạng thái không phù hợp

---

## 🔄 Vòng Đời Sự Kiện

```
┌─────────────────────────────────────────────────────────┐
│ 1. BCN TẠO SỰ KIỆN (trạng thái: draft)               │
│    - POST /api/admin/events                            │
└─────────────┬───────────────────────────────────────────┘
              │
              │ BCN CÓ THỂ SỬA/XÓA (nếu draft/rejected)
              │ - PUT /api/admin/events/{id}
              │ - DELETE /api/admin/events/{id}
              │
              ↓
┌─────────────────────────────────────────────────────────┐
│ 2. BCN GỬI DUYỆT KHOA (trạng thái: pending_faculty)   │
│    - Update status từ draft → pending_faculty         │
│    - KHOA xem danh sách: GET /api/admin/events        │
└─────────────┬───────────────────────────────────────────┘
              │
              ├→ KHOA PHÊ CHUẨN (trạng thái: approved)
              │  - PATCH /api/admin/events/{id}/review
              │
              └→ KHOA TỪ CHỐI (trạng thái: rejected)
                 - PATCH /api/admin/events/{id}/review
                 - BCN sửa lại → draft → gửi lại khoa
```

---

## 📊 Trạng Thái Sự Kiện

| Trạng Thái                | Mô Tả          | Cho Phép Thao Tác        |
| ------------------------- | -------------- | ------------------------ |
| `draft`                   | Bản nháp       | BCN: Sửa, Xóa, Gửi duyệt |
| `pending_faculty`         | Chờ Khoa duyệt | KHOA: Phê chuẩn, Từ chối |
| `pending_student_affairs` | Chờ CTSV duyệt | CTSV: Phê chuẩn, Từ chối |
| `approved`                | Đã phê chuẩn   | Chỉ xem, không sửa       |
| `rejected`                | Bị từ chối     | BCN: Sửa, Xóa            |

---

## 📋 Mapping Dữ Liệu

**Frontend → Database:**

| Frontend     | Database        | Type          |
| ------------ | --------------- | ------------- |
| name         | TenSK           | NVARCHAR(150) |
| description  | MoTa            | NVARCHAR(MAX) |
| startTime    | ThoiGianBatDau  | DATETIME      |
| endTime      | ThoiGianKetThuc | DATETIME      |
| location     | DiaDiem         | NVARCHAR(200) |
| quota        | SoNguoiToiDa    | INT           |
| points       | DiemRenLuyen    | FLOAT         |
| costEstimate | ChiPhiDuKien    | DECIMAL(18,2) |
| eventType    | LoaiSK          | NVARCHAR(50)  |
| status       | TrangThai       | NVARCHAR(50)  |
| feedback     | LyDoTuChoi      | NVARCHAR(MAX) |

---

## 🧪 Test Endpoints (cURL)

### 1. Health Check

```bash
curl -X GET http://localhost:3000/api/health
```

### 2. Tạo Event (BCN)

```bash
TOKEN=$(echo -n "SV210000001:BCN:CLB00000001" | base64)

curl -X POST http://localhost:3000/api/admin/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Workshop: Nhập môn ReactJS",
    "description": "Workshop thực hành",
    "startTime": "2026-06-10T08:00:00Z",
    "endTime": "2026-06-10T11:30:00Z",
    "location": "Phòng Lab 201",
    "quota": 40,
    "points": 1.5,
    "eventType": "Workshop"
  }'
```

### 3. Lấy Danh Sách Event (BCN)

```bash
TOKEN=$(echo -n "SV210000001:BCN:CLB00000001" | base64)

curl -X GET "http://localhost:3000/api/admin/events?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Duyệt Event (KHOA)

```bash
TOKEN=$(echo -n "CB000000001:KHOA:null" | base64)

curl -X PATCH http://localhost:3000/api/admin/events/SK260000001/review \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved"
  }'
```

### 5. Từ Chối Event (CTSV)

```bash
TOKEN=$(echo -n "CB000000002:CTSV:null" | base64)

curl -X PATCH http://localhost:3000/api/admin/events/SK260000001/review \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "rejected",
    "feedback": "Sự kiện không phù hợp với các tiêu chí"
  }'
```

---

## 🔒 Error Responses

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Missing or invalid authorization token",
  "data": null
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Only club leaders (BCN) can create events",
  "data": null
}
```

### 400 Bad Request

```json
{
  "success": false,
  "message": "Missing required fields: name, startTime, endTime, location, quota",
  "data": null
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Event not found",
  "data": null
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal Server Error",
  "data": null
}
```

---

## 📦 Project Structure

```
backend/
├── db/
│   └── index.js                      # Connection pool
├── middleware/
│   └── auth.js                       # Authentication & Authorization
├── controllers/
│   └── adminEventController.js       # Business logic
├── routes/
│   └── adminEvents.js                # API endpoints
├── utils/
│   └── idGenerator.js                # ID generation
├── index.js                          # Main server file
├── package.json
├── .env.example
├── ALTER_TABLE_SUKIEN.sql            # Database migration
├── README.md                         # This file
└── logs/                             # Log files
```

---

## 🚀 Tính Năng Chính

✅ **Authentication & Authorization** - Xác thực người dùng theo role  
✅ **Event CRUD** - Tạo, đọc, cập nhật, xóa sự kiện  
✅ **Event Review** - Duyệt/từ chối sự kiện  
✅ **Role-based Access Control** - Quyền khác nhau cho từng role  
✅ **Pagination** - Phân trang danh sách  
✅ **Search & Filter** - Tìm kiếm và lọc sự kiện  
✅ **SQL Injection Prevention** - Sử dụng parameterized queries  
✅ **Error Handling** - Xử lý lỗi toàn cục  
✅ **Connection Pooling** - Tối ưu hóa kết nối database

---

## 📝 License

MIT

---

## 👨‍💻 Author

Senior Node.js Backend Developer
