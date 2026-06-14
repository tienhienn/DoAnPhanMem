# Hệ thống Quản lý Câu lạc bộ UTE (QUANLYCLB)

## 📱 Giới thiệu

Hệ thống quản lý câu lạc bộ toàn diện cho Trường Đại học Bách khoa - Đại học Đà Nẵng, bao gồm:

- 🎯 Quản lý sự kiện
- 👥 Quản lý thành viên
- 💰 Quản lý tài chính
- 📊 Thống kê hoạt động
- 🔐 Quản lý quyền hạn

---

## 🏗️ Kiến trúc Hệ thống

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)              │
│  - BCN Management Page (Quản lý sự kiện)               │
│  - Event List Page (Danh sách sự kiện)                 │
│  - Member Management (Quản lý thành viên)              │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST API
┌────────────────────▼────────────────────────────────────┐
│              Backend (Node.js + Express)                │
│  - Authentication & Authorization                       │
│  - Event Management API                                 │
│  - Member Management API                                │
│  - Finance Management API                               │
└────────────────────┬────────────────────────────────────┘
                     │ SQL Queries
┌────────────────────▼────────────────────────────────────┐
│           Database (SQL Server 2019+)                   │
│  - QUANLYCLB_UTE Database                               │
│  - 20+ Tables                                           │
│  - Sample Data                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📂 Cấu trúc Thư mục

```
Root/
├── backend/                          # Backend API
│   ├── controllers/
│   │   ├── bcnEventController.js     # Quản lý sự kiện BCN
│   │   ├── eventController.js        # Sự kiện sinh viên
│   │   ├── authController.js         # Xác thực
│   │   └── ...
│   ├── routes/
│   │   ├── bcnEvents.js              # Routes BCN
│   │   ├── events.js                 # Routes sự kiện
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.js                   # Middleware xác thực
│   │   └── errorHandler.js           # Xử lý lỗi
│   ├── db/
│   │   ├── index.js                  # Kết nối database
│   │   └── initDatabase.js           # Khởi tạo database
│   ├── .env                          # Biến môi trường
│   ├── index.js                      # Entry point
│   ├── package.json
│   ├── BCN_EVENTS_API.md             # Tài liệu API
│   └── ...
│
├── frontend-web/                     # Frontend Web
│   ├── src/
│   │   ├── pages/
│   │   │   ├── BanChuNhiem/
│   │   │   │   └── BCNManagementPage.jsx
│   │   │   ├── EventListPage.jsx
│   │   │   ├── EventDetailPage.jsx
│   │   │   └── ...
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── eventService.js       # API Service
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   └── ...
│   ├── .env                          # Biến môi trường
│   ├── package.json
│   ├── BCN_INTEGRATION_GUIDE.md      # Hướng dẫn tích hợp
│   └── ...
│
├── frontend-mobile/                  # Frontend Mobile (React Native)
│   ├── app/
│   ├── components/
│   ├── package.json
│   └── ...
│
├── QuanLyCLB.sql                     # Database Schema
├── SETUP_GUIDE.md                    # Hướng dẫn cài đặt
├── IMPLEMENTATION_SUMMARY.md         # Tóm tắt triển khai
└── README.md                         # File này
```

---

## 🚀 Bắt đầu Nhanh

### Yêu cầu
- Node.js v16+
- SQL Server 2019+
- npm hoặc yarn

### 1. Cài đặt Database

```bash
# Mở SQL Server Management Studio
# Chạy file: QuanLyCLB.sql
```

### 2. Cài đặt Backend

```bash
cd backend
npm install
cp .env.example .env  # Cấu hình .env
npm run dev
```

### 3. Cài đặt Frontend

```bash
cd frontend-web
npm install
cp .env.example .env  # Cấu hình .env
npm run dev
```

### 4. Truy cập Ứng dụng

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api

---

## 👤 Tài khoản Mẫu

| Vai trò | Email | Password |
|---------|-------|----------|
| Sinh viên | an.nv@sv.ute.udn.vn | password |
| Cán bộ Khoa | quan.nt@ute.udn.vn | password |
| Phòng CTSV | tho.nh@ute.udn.vn | password |

---

## 📚 Tài liệu

### Backend
- [BCN_EVENTS_API.md](./backend/BCN_EVENTS_API.md) - API Documentation
- [API_DOCUMENTATION.md](./backend/API_DOCUMENTATION.md) - Tài liệu API tổng hợp

### Frontend
- [BCN_INTEGRATION_GUIDE.md](./frontend-web/BCN_INTEGRATION_GUIDE.md) - Hướng dẫn tích hợp
- [ROLE_BASED_GUIDE.md](./frontend-web/ROLE_BASED_GUIDE.md) - Hướng dẫn theo vai trò

### Chung
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Hướng dẫn cài đặt
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Tóm tắt triển khai

---

## 🎯 Các Tính năng Chính

### 1. Quản lý Sự kiện (Ban Chủ Nhiệm)
- ✅ Tạo sự kiện mới
- ✅ Sửa/Xóa sự kiện
- ✅ Gửi duyệt
- ✅ Xem chi tiết
- ✅ Lọc theo trạng thái

### 2. Phê duyệt Sự kiện
- ✅ Khoa duyệt
- ✅ CTSV duyệt
- ✅ Từ chối với lý do
- ✅ Xem tiến trình

### 3. Đăng ký Sự kiện (Sinh viên)
- ✅ Xem danh sách sự kiện
- ✅ Đăng ký tham gia
- ✅ Hủy đăng ký
- ✅ Xem QR code

### 4. Quản lý Thành viên
- ✅ Danh sách thành viên
- ✅ Thêm/Xóa thành viên
- ✅ Phân công nhiệm vụ
- ✅ Xem điểm rèn luyện

---

## 🔄 Quy trình Phê duyệt Sự kiện

```
1. Ban Chủ Nhiệm tạo sự kiện (draft)
   ↓
2. Gửi duyệt (cho_duyet_khoa)
   ↓
3. Khoa duyệt (cho_duyet_ctsv)
   ↓
4. CTSV duyệt (da_duyet)
   ↓
5. Sinh viên có thể đăng ký

Hoặc tại bất kỳ bước nào:
   ↓
Từ chối (tu_choi) → Sửa lại → Gửi lại
```

---

## 🔐 Bảo mật

- ✅ JWT Authentication
- ✅ Role-based Access Control (RBAC)
- ✅ Password Hashing (bcrypt)
- ✅ Input Validation
- ✅ CORS Protection
- ✅ SQL Injection Prevention

---

## 📊 Database Schema

### Bảng Chính
- **TAI_KHOAN** - Tài khoản người dùng
- **SINHVIEN** - Thông tin sinh viên
- **CANBO** - Thông tin cán bộ
- **CAULACBO** - Thông tin câu lạc bộ
- **SU_KIEN** - Sự kiện
- **THANH_VIEN** - Thành viên CLB
- **DANGKY_SUKIEN** - Đăng ký sự kiện
- **TAI_CHINH** - Tài chính CLB
- **NHIEM_VU** - Nhiệm vụ
- **THONG_BAO** - Thông báo

---

## 🛠️ Công nghệ Sử dụng

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQL Server
- **Authentication**: JWT
- **Password**: bcrypt
- **Validation**: Custom middleware

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: React Icons
- **HTTP Client**: Axios
- **State Management**: React Context

### Database
- **DBMS**: SQL Server 2019+
- **Language**: T-SQL

---

## 📈 Hiệu suất

- ✅ Connection Pooling
- ✅ Query Optimization
- ✅ Caching Strategy
- ✅ Lazy Loading
- ✅ Code Splitting

---

## 🐛 Troubleshooting

### Lỗi Kết nối Database
```bash
# Kiểm tra SQL Server đang chạy
# Kiểm tra .env có đúng không
# Kiểm tra database đã được tạo
```

### Lỗi CORS
```bash
# Kiểm tra CORS_ORIGIN trong backend .env
# Kiểm tra VITE_API_URL trong frontend .env
```

### Lỗi Token
```bash
# Đăng nhập lại để lấy token mới
# Kiểm tra JWT_SECRET trong backend .env
```

---

## 📝 Ghi chú

- Tất cả mật khẩu mẫu là `password`
- Database có dữ liệu mẫu sẵn
- API yêu cầu Bearer token
- Frontend tự động lưu token vào localStorage

---

## 🤝 Đóng góp

Để đóng góp vào dự án:

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

Dự án này được cấp phép dưới MIT License.

---

## 👨‍💼 Tác giả

**Trường Đại học Bách khoa - Đại học Đà Nẵng**

---

## 📞 Liên hệ

- Email: support@ute.udn.vn
- Website: https://www.ute.udn.vn
- Phone: (0236) 3650 403

---

## 🎓 Tài liệu Bổ sung

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Hướng dẫn cài đặt chi tiết
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Tóm tắt triển khai
- [backend/BCN_EVENTS_API.md](./backend/BCN_EVENTS_API.md) - API Documentation
- [frontend-web/BCN_INTEGRATION_GUIDE.md](./frontend-web/BCN_INTEGRATION_GUIDE.md) - Frontend Integration

---

**Phiên bản**: 1.0.0  
**Ngày cập nhật**: 23/05/2026  
**Trạng thái**: ✅ Hoàn thành
