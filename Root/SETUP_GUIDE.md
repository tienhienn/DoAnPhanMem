# Hướng dẫn Cài đặt và Chạy Hệ thống

## Yêu cầu Hệ thống

- **Node.js**: v16 trở lên
- **SQL Server**: 2019 trở lên
- **npm** hoặc **yarn**

---

## 1. Cài đặt Database

### Bước 1: Tạo Database

Mở SQL Server Management Studio (SSMS) và chạy script:

```sql
-- Xóa database cũ nếu tồn tại
IF EXISTS (SELECT * FROM sys.databases WHERE name = 'QUANLYCLB_UTE')
BEGIN
    USE master;
    ALTER DATABASE QUANLYCLB_UTE SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE QUANLYCLB_UTE;
END

-- Tạo database mới
CREATE DATABASE QUANLYCLB_UTE;
GO
USE QUANLYCLB_UTE;
GO
```

### Bước 2: Chạy Script SQL

Chạy file `QuanLyCLB.sql` từ thư mục root:

```bash
# Hoặc copy toàn bộ nội dung file QuanLyCLB.sql vào SSMS và chạy
```

### Bước 3: Kiểm tra Database

```sql
-- Kiểm tra các bảng đã được tạo
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo';

-- Kiểm tra dữ liệu mẫu
SELECT COUNT(*) FROM TAI_KHOAN;        -- Nên có 11 tài khoản
SELECT COUNT(*) FROM SINHVIEN;         -- Nên có 9 sinh viên
SELECT COUNT(*) FROM CAULACBO;         -- Nên có 4 CLB
SELECT COUNT(*) FROM SU_KIEN;          -- Nên có 8 sự kiện
```

---

## 2. Cài đặt Backend

### Bước 1: Vào thư mục Backend

```bash
cd backend
```

### Bước 2: Cài đặt Dependencies

```bash
npm install
```

### Bước 3: Tạo file .env

Tạo file `.env` trong thư mục `backend`:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_SERVER=localhost
DB_NAME=QUANLYCLB_UTE
DB_USER=sa
DB_PASSWORD=12345
DB_CONNECTION_TIMEOUT=5000
DB_POOL_MIN=1
DB_POOL_MAX=10
DB_IDLE_TIMEOUT=30000
DB_ENCRYPT=false
DB_TRUST_CERT=true

# JWT
JWT_SECRET=your_secret_key_here_change_in_production
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Bước 4: Chạy Backend

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

Kết quả mong đợi:
```
✓ Database connection pool initialized successfully
✓ Server is running on port 3000
✓ Environment: development
```

### Bước 5: Kiểm tra Health Check

```bash
curl http://localhost:3000/api/health
```

Kết quả:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-05-23T10:00:00.000Z"
}
```

---

## 3. Cài đặt Frontend

### Bước 1: Vào thư mục Frontend Web

```bash
cd frontend-web
```

### Bước 2: Cài đặt Dependencies

```bash
npm install
```

### Bước 3: Tạo file .env

Tạo file `.env` trong thư mục `frontend-web`:

```env
VITE_API_URL=http://localhost:3000/api
```

### Bước 4: Chạy Frontend

**Development Mode:**
```bash
npm run dev
```

Kết quả mong đợi:
```
  VITE v5.0.0  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Bước 5: Truy cập Ứng dụng

Mở trình duyệt và truy cập: `http://localhost:5173`

---

## 4. Đăng nhập Hệ thống

### Tài khoản Mẫu

#### Sinh viên
- **Email**: `an.nv@sv.ute.udn.vn`
- **Password**: `password`

#### Cán bộ Khoa
- **Email**: `quan.nt@ute.udn.vn`
- **Password**: `password`

#### Phòng CTSV
- **Email**: `tho.nh@ute.udn.vn`
- **Password**: `password`

---

## 5. Kiểm tra API BCN Events

### Lấy Token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "an.nv@sv.ute.udn.vn",
    "password": "password"
  }'
```

Kết quả:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "maSV": "SV210000001",
      "hoTen": "Nguyễn Văn An",
      "email": "an.nv@sv.ute.udn.vn"
    }
  }
}
```

### Lấy Danh sách Sự kiện

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/bcn/events?MaCLB=CLB00000001
```

---

## 6. Cấu trúc Thư mục

```
Root/
├── backend/
│   ├── controllers/
│   │   ├── bcnEventController.js      (NEW)
│   │   ├── eventController.js
│   │   └── ...
│   ├── routes/
│   │   ├── bcnEvents.js               (NEW)
│   │   ├── events.js
│   │   └── ...
│   ├── db/
│   │   ├── index.js
│   │   └── initDatabase.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── .env
│   ├── index.js
│   ├── package.json
│   ├── BCN_EVENTS_API.md              (NEW)
│   └── ...
│
├── frontend-web/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── BanChuNhiem/
│   │   │   │   └── BCNManagementPage.jsx  (UPDATED)
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── eventService.js        (NEW)
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   └── ...
│   ├── .env
│   ├── package.json
│   ├── BCN_INTEGRATION_GUIDE.md       (NEW)
│   └── ...
│
├── QuanLyCLB.sql
├── SETUP_GUIDE.md                     (NEW)
└── ...
```

---

## 7. Troubleshooting

### Lỗi: "Cannot connect to database"

**Giải pháp:**
1. Kiểm tra SQL Server đang chạy
2. Kiểm tra thông tin kết nối trong `.env`
3. Kiểm tra database `QUANLYCLB_UTE` đã được tạo

### Lỗi: "Port 3000 already in use"

**Giải pháp:**
```bash
# Tìm process sử dụng port 3000
lsof -i :3000

# Hoặc thay đổi PORT trong .env
PORT=3001
```

### Lỗi: "CORS error"

**Giải pháp:**
1. Kiểm tra `CORS_ORIGIN` trong `.env` backend
2. Kiểm tra `VITE_API_URL` trong `.env` frontend
3. Đảm bảo backend đang chạy

### Lỗi: "Token expired"

**Giải pháp:**
- Đăng nhập lại để lấy token mới

---

## 8. Các Lệnh Hữu ích

### Backend

```bash
# Development
npm run dev

# Production
npm start

# Test
npm test
```

### Frontend

```bash
# Development
npm run dev

# Build
npm run build

# Preview
npm run preview

# Lint
npm run lint
```

---

## 9. Tài liệu Liên quan

- [BCN_EVENTS_API.md](./backend/BCN_EVENTS_API.md) - API Documentation
- [BCN_INTEGRATION_GUIDE.md](./frontend-web/BCN_INTEGRATION_GUIDE.md) - Frontend Integration
- [QuanLyCLB.sql](./QuanLyCLB.sql) - Database Schema

---

## 10. Hỗ trợ

Nếu gặp vấn đề:

1. Kiểm tra logs trong console
2. Xem file `.env` có đúng không
3. Kiểm tra database connection
4. Xem tài liệu API
5. Liên hệ với team development
