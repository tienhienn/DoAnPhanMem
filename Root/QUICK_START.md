# Bắt đầu Nhanh - 5 Phút

## 1️⃣ Cài đặt Database (2 phút)

```bash
# Mở SQL Server Management Studio
# Chạy file: QuanLyCLB.sql
# Hoặc copy toàn bộ nội dung vào SSMS và chạy
```

✅ Database `QUANLYCLB_UTE` được tạo với dữ liệu mẫu

---

## 2️⃣ Chạy Backend (1 phút)

```bash
cd backend
npm install
npm run dev
```

✅ Backend chạy tại `http://localhost:3000`

---

## 3️⃣ Chạy Frontend (1 phút)

```bash
cd frontend-web
npm install
npm run dev
```

✅ Frontend chạy tại `http://localhost:5173`

---

## 4️⃣ Đăng nhập (1 phút)

Truy cập: `http://localhost:5173`

**Tài khoản Sinh viên:**
- Email: `an.nv@sv.ute.udn.vn`
- Password: `password`

---

## 5️⃣ Truy cập BCN Management

1. Đăng nhập với tài khoản sinh viên
2. Tìm menu "Quản lý Hoạt động Câu lạc bộ"
3. Bắt đầu tạo/sửa/xóa sự kiện

---

## 🎯 Các Chức năng Chính

### Tạo Sự kiện
```
1. Nhấn "Tạo sự kiện mới"
2. Điền thông tin
3. Nhấn "Lưu bản nháp" hoặc "Gửi phê duyệt"
```

### Sửa Sự kiện
```
1. Tìm sự kiện ở trạng thái "Bản nháp"
2. Nhấn "Sửa"
3. Cập nhật thông tin
4. Nhấn "Lưu bản nháp" hoặc "Gửi phê duyệt"
```

### Xóa Sự kiện
```
1. Tìm sự kiện ở trạng thái "Bản nháp"
2. Nhấn "Xóa"
3. Xác nhận
```

### Gửi Duyệt
```
1. Tìm sự kiện ở trạng thái "Bản nháp"
2. Nhấn "Gửi duyệt"
3. Sự kiện chuyển sang "Chờ Khoa duyệt"
```

### Xem Chi tiết
```
1. Tìm sự kiện
2. Nhấn "Xem chi tiết"
3. Xem tiến trình phê duyệt
```

---

## 📊 Các Trường Dữ liệu

| Trường | Bắt buộc | Ví dụ |
|--------|---------|-------|
| Tên sự kiện | ✓ | Workshop ReactJS |
| Thời gian bắt đầu | ✓ | 2026-06-10 08:00 |
| Thời gian kết thúc | ✓ | 2026-06-10 11:30 |
| Địa điểm | | Phòng Lab 201 |
| Số lượng tối đa | | 40 |
| Chi phí dự kiến | | 0 |
| Loại sự kiện | | Workshop |
| Điểm rèn luyện | | 5 |
| URL ảnh | | https://... |
| Mô tả | | Buổi workshop... |

---

## 🔄 Trạng thái Sự kiện

```
draft (Bản nháp)
  ↓ Gửi duyệt
cho_duyet_khoa (Chờ Khoa duyệt)
  ↓ Duyệt
cho_duyet_ctsv (Chờ CTSV duyệt)
  ↓ Duyệt
da_duyet (Đã cấp phép)

Hoặc:
  ↓ Từ chối
tu_choi (Bị từ chối)
  ↓ Sửa & Gửi lại
cho_duyet_khoa
```

---

## 🐛 Lỗi Thường Gặp

### "Không thể kết nối database"
```bash
# Kiểm tra SQL Server đang chạy
# Kiểm tra .env có đúng không
```

### "Port 3000 đã sử dụng"
```bash
# Thay đổi PORT trong backend/.env
PORT=3001
```

### "CORS error"
```bash
# Kiểm tra VITE_API_URL trong frontend/.env
VITE_API_URL=http://localhost:3000/api
```

### "Token hết hạn"
```bash
# Đăng nhập lại
```

---

## 📚 Tài liệu Chi tiết

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Hướng dẫn cài đặt chi tiết
- [BCN_EVENTS_API.md](./backend/BCN_EVENTS_API.md) - API Documentation
- [BCN_INTEGRATION_GUIDE.md](./frontend-web/BCN_INTEGRATION_GUIDE.md) - Frontend Guide
- [README.md](./README.md) - Tài liệu chính

---

## ✅ Kiểm tra Hoạt động

```bash
# 1. Kiểm tra Backend
curl http://localhost:3000/api/health

# 2. Kiểm tra Frontend
# Mở http://localhost:5173 trong trình duyệt

# 3. Kiểm tra Database
# Mở SQL Server Management Studio
# Chạy: SELECT COUNT(*) FROM SU_KIEN;
```

---

## 🎓 Ví dụ Nhanh

### Tạo Sự kiện qua API

```bash
curl -X POST http://localhost:3000/api/bcn/events \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

---

## 🚀 Tiếp Theo

1. ✅ Cài đặt xong
2. ✅ Chạy được
3. ✅ Đăng nhập được
4. 📖 Đọc tài liệu chi tiết
5. 🔧 Tùy chỉnh theo nhu cầu

---

**Thời gian**: ~5 phút  
**Độ khó**: ⭐ Dễ  
**Trạng thái**: ✅ Sẵn sàng
