# Hướng Dẫn Sử Dụng Hệ Thống QuanLyCLB

## 🎯 Các Role Người Dùng

### 1. Sinh Viên (SV)

- **Email**: `an.nv@sv.ute.udn.vn`
- **Mật khẩu**: `password`
- **Trang chủ**: Danh sách sự kiện
- **Menu**:
  - 📅 Sự Kiện (danh sách toàn bộ)
  - 🔖 Của Tôi (sự kiện đã đăng ký)

### 2. Ban Chủ Nhiệm CLB (BCN)

- **Email**: `quan.nt@ute.udn.vn`
- **Mật khẩu**: `password`
- **Trang chủ**: `/bcn-management`
- **Menu**:
  - 📅 Sự Kiện
  - ⚙️ Quản lý BCN
- **Chức năng**:
  - ✏️ Tạo sự kiện mới
  - 📝 Sửa/Xóa sự kiện (chỉ khi draft)
  - 📤 Nộp sự kiện để duyệt

### 3. Cán Bộ Khoa (KHOA)

- **Email**: `truong.lv@ute.udn.vn`
- **Mật khẩu**: `password`
- **Trang chủ**: `/faculty-management`
- **Menu**:
  - 📅 Sự Kiện
  - ✅ Duyệt Khoa
- **Chức năng**:
  - 👁️ Xem sự kiện chờ duyệt
  - ✔️ Duyệt sự kiện
  - ❌ Từ chối sự kiện (có ghi chú)

### 4. Phòng CTSV (CTSV)

- **Email**: `tho.nh@ute.udn.vn`
- **Mật khẩu**: `password`
- **Trang chủ**: `/student-affairs`
- **Menu**:
  - 📅 Sự Kiện
  - 📊 Quản lý CTSV
- **Chức năng**:
  - 📈 Xem thống kê sự kiện
  - 👁️ Xem sự kiện chờ duyệt cuối cùng
  - ✔️ Duyệt sự kiện
  - ❌ Từ chối sự kiện (có ghi chú)

## 🔄 Luồng Duyệt Sự Kiện

```
Ban Chủ Nhiệm (BCN)
    ↓
[Tạo & Nộp Sự Kiện] → Draft → Pending Faculty
    ↓
Cán Bộ Khoa (KHOA)
    ↓
[Duyệt] → Pending CTSV
    ↓
Phòng CTSV
    ↓
[Duyệt] → Approved ✅
[Từ chối] → Rejected ❌
```

## 🔐 Cách Đăng Nhập

1. Mở trang `/login`
2. Nhập email theo role của bạn
3. Nhập password: `password`
4. Nhấn "Đăng nhập"
5. Hệ thống sẽ tự redirect đến trang phù hợp với role

## 📱 Giao Diện

### Desktop (lg and above)

- NavBar cố định ở trên
- Logo + Menu links ở giữa
- User info + Logout ở phải

### Mobile (< lg)

- NavBar cố định ở dưới (BottomBar)
- Menu items hiển thị dưới dạng icon + label
- Nút Logout ở cuối

## 🗄️ Dữ Liệu Sample

Tất cả tài khoản mẫu được lưu trong bảng `TAI_KHOAN` với:

- Mật khẩu: `password` (bcrypt hash)
- Trạng thái: `trangThai = 1` (hoạt động)
- Vai trò: lưu trong bảng `NGUOIDUNG_VAITRO`

## 🚀 Tính Năng Chính

### Sinh Viên

- 📋 Xem danh sách sự kiện
- 📌 Đăng ký sự kiện
- 🎯 Xem sự kiện đã đăng ký
- 🔐 Xem mã QR check-in

### Ban Chủ Nhiệm

- 📝 Tạo sự kiện mới
- ✏️ Chỉnh sửa sự kiện (nháp)
- 🗑️ Xóa sự kiện (nháp)
- 📤 Nộp duyệt
- 💬 Xem phản hồi từ Khoa/CTSV

### Cán Bộ Khoa

- 👁️ Xem sự kiện chờ duyệt
- ✅ Duyệt sự kiện
- ❌ Từ chối sự kiện
- 💬 Ghi chú phản hồi

### Phòng CTSV

- 📊 Thống kê sự kiện toàn trường
- 👁️ Xem sự kiện chờ duyệt cuối
- ✅ Duyệt sự kiện cuối cùng
- ❌ Từ chối sự kiện
- 💬 Ghi chú phản hồi

## 📝 Ghi Chú

- Sự kiện sẽ được hiển thị ở trang chủ (`/`) cho tất cả role
- Mỗi role có trang quản lý riêng với đường dẫn khác nhau
- NavBar tự động hiển thị menu phù hợp theo role
- Redirect sau đăng nhập tự động theo role

## 🐛 Troubleshooting

### Lỗi: "Không thể truy cập trang này"

- Kiểm tra role của tài khoản
- Đảm bảo bạn đã đăng nhập
- Xóa localStorage và đăng nhập lại

### Lỗi: "Email hoặc mật khẩu không đúng"

- Kiểm tra email chính xác
- Mật khẩu mặc định là `password` (chữ thường)

### NavBar không hiển thị menu đúng

- Tải lại trang (F5)
- Xóa cache browser
- Đăng xuất và đăng nhập lại
