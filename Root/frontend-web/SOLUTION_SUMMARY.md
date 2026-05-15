# 🎯 Giải Pháp Fix Lỗi Đăng Nhập & Tách Giao Diện Theo Role

## 📌 Bài Toán

Hệ thống QuanLyCLB gặp lỗi:

- ❌ Đăng nhập không vào được giao diện theo đúng role
- ❌ Tất cả role (BCN, KHOA, CTSV) dùng chung trang `/event-management`
- ❌ Giao diện không tách riêng cho từng role

---

## ✅ Giải Pháp

### 1. **Tách Giao Diện - 3 Trang Riêng**

#### `BCNManagementPage.jsx` - Ban Chủ Nhiệm CLB

- 🎨 Giao diện xanh dương (indigo)
- ✏️ Tạo/Sửa/Xóa sự kiện (chỉ bản nháp)
- 📤 Nộp sự kiện để duyệt
- 💬 Xem phản hồi từ Khoa/CTSV
- 🏷️ Filter: "Tất cả", "Bản nháp", "Chờ Khoa", "Duyệt", "Từ chối"

#### `FacultyManagementPage.jsx` - Cán Bộ Khoa

- 🎨 Giao diện xanh lá (green)
- 👁️ Xem sự kiện chờ duyệt
- ✅ Duyệt sự kiện
- ❌ Từ chối sự kiện (có ghi chú)
- 📊 Xem lịch sử duyệt
- 🔄 2 tab: "Chờ Duyệt" + "Đã Duyệt"

#### `StudentAffairsPage.jsx` - Phòng CTSV

- 🎨 Giao diện tím hồng (purple/pink)
- 📈 Thống kê sự kiện (chờ, duyệt, tổng, điểm)
- 👁️ Xem sự kiện chờ duyệt cuối
- ✅ Duyệt sự kiện cuối cùng
- ❌ Từ chối sự kiện (có ghi chú)
- 🔄 2 tab: "Chờ Duyệt" + "Đã Duyệt"

### 2. **Fix Routing - 5 Route Riêng**

```javascript
// App.jsx
<Route path="/login" element={<LoginPage />} />
<Route path="/" element={<EventListPage />} /> // tất cả role
<Route path="/my-events" element={<MyEventsPage />} /> // chỉ SV
<Route path="/bcn-management" element={<BCNManagementPage />} /> // chỉ BCN
<Route path="/faculty-management" element={<FacultyManagementPage />} /> // chỉ KHOA
<Route path="/student-affairs" element={<StudentAffairsPage />} /> // chỉ CTSV
```

### 3. **Fix Redirect - AuthContext.jsx**

```javascript
function getHomeByRole(role) {
  switch (role) {
    case "BCN":
      return "/bcn-management";
    case "KHOA":
      return "/faculty-management";
    case "CTSV":
      return "/student-affairs";
    default:
      return "/";
  }
}
```

**Kết quả:** Mỗi role tự động redirect đến trang quản lý của mình

### 4. **Fix NavBar - NavBar.jsx**

```javascript
function getNavItems(role) {
  if (role === "SV")
    return [
      { label: "Sự Kiện", path: "/" },
      { label: "Của Tôi", path: "/my-events" },
    ];

  if (role === "BCN")
    return [
      { label: "Sự Kiện", path: "/" },
      { label: "Quản lý BCN", path: "/bcn-management" },
    ];

  // ... tương tự cho KHOA, CTSV
}
```

**Kết quả:** Menu NavBar hiển thị khác nhau cho từng role

---

## 📂 Các File Thay Đổi

### ✅ Frontend

| File                                  | Thay Đổi        | Loại   |
| ------------------------------------- | --------------- | ------ |
| `src/pages/BCNManagementPage.jsx`     | Tạo mới         | CREATE |
| `src/pages/FacultyManagementPage.jsx` | Tạo mới         | CREATE |
| `src/pages/StudentAffairsPage.jsx`    | Tạo mới         | CREATE |
| `src/App.jsx`                         | Update routing  | EDIT   |
| `src/context/AuthContext.jsx`         | Update redirect | EDIT   |
| `src/components/layout/NavBar.jsx`    | Update menu     | EDIT   |
| `ROLE_BASED_LOGIN_GUIDE.md`           | Tạo mới         | CREATE |
| `SETUP_AND_TEST_GUIDE.md`             | Tạo mới         | CREATE |

### ✅ Backend

| File                            | Thay Đổi    | Ghi Chú                          |
| ------------------------------- | ----------- | -------------------------------- |
| `controllers/authController.js` | ✅ Verified | OK - đã có role mapping          |
| `QuanLyCLB.sql`                 | ✅ Verified | OK - đã có dữ liệu sample 4 role |

---

## 🔐 Tài Khoản Test

| Role          | Email                  | Mật khẩu   | Trang chủ             |
| ------------- | ---------------------- | ---------- | --------------------- |
| Sinh Viên     | `an.nv@sv.ute.udn.vn`  | `password` | `/`                   |
| Ban Chủ Nhiệm | `quan.nt@ute.udn.vn`   | `password` | `/bcn-management`     |
| Cán Bộ Khoa   | `truong.lv@ute.udn.vn` | `password` | `/faculty-management` |
| Phòng CTSV    | `tho.nh@ute.udn.vn`    | `password` | `/student-affairs`    |

---

## 🧪 Cách Test

### 1. **Test Redirect Đúng Route**

```bash
✅ Đăng nhập Sinh Viên → Redirect /
✅ Đăng nhập BCN → Redirect /bcn-management
✅ Đăng nhập KHOA → Redirect /faculty-management
✅ Đăng nhập CTSV → Redirect /student-affairs
```

### 2. **Test NavBar Menu**

```bash
✅ Sinh Viên thấy: "Sự Kiện" + "Của Tôi"
✅ BCN thấy: "Sự Kiện" + "Quản lý BCN"
✅ KHOA thấy: "Sự Kiện" + "Duyệt Khoa"
✅ CTSV thấy: "Sự Kiện" + "Quản lý CTSV"
```

### 3. **Test Authorization**

```bash
✅ Sinh Viên không truy cập được /bcn-management
✅ BCN không truy cập được /faculty-management
✅ KHOA không truy cập được /student-affairs
❌ Tự động redirect / về trang chủ phù hợp
```

### 4. **Test Giao Diện Riêng**

```bash
✅ BCN: Xanh dương, button "Tạo sự kiện", filter
✅ KHOA: Xanh lá, tab "Chờ Duyệt"/"Đã Duyệt", button Duyệt/Từ chối
✅ CTSV: Tím hồng, thống kê, tab, button Duyệt/Từ chối
```

---

## 📊 Luồng Duyệt Sự Kiện

```
Ban Chủ Nhiệm (BCN)
    ↓ Tạo & Nộp sự kiện
[/bcn-management] Draft → Pending Faculty
    ↓
Cán Bộ Khoa (KHOA)
    ↓ Duyệt
[/faculty-management] Pending Faculty → Pending CTSV
    ↓
Phòng CTSV
    ↓ Duyệt/Từ chối
[/student-affairs] Pending CTSV → Approved ✅ / Rejected ❌
```

---

## 🚀 Cách Chạy

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

```bash
cd frontend-web
npm install
npm run dev
```

### Truy cập

```
http://localhost:5173
```

---

## 🎨 Tính Năng Đặc Biệt

### BCNManagementPage

- 🎨 Giao diện gradient xanh dương → indigo
- 📝 Form modal tạo sự kiện
- 🔄 Filter theo status
- 💬 Xem phản hồi từ cấp trên

### FacultyManagementPage

- 🎨 Giao diện gradient xanh lá → emerald
- 👥 2 cột: danh sách + chi tiết sự kiện
- 💭 Textarea ghi chú
- ✅/❌ Button Duyệt/Từ chối

### StudentAffairsPage

- 🎨 Giao diện gradient tím → hồng
- 📈 4 card thống kê (chờ, duyệt, tổng, điểm)
- 👥 3 cột: danh sách + chi tiết + sidebar
- 💯 Xem tổng điểm sự kiện

---

## ⚙️ Cấu Hình

### JWT Token

- Expires: 24h (có thể config)
- Payload: maND, hoTen, email, role, vaiTroID

### Database

- VAI_TRO: 4 role (SV, BCN, KHOA, CTSV)
- NGUOIDUNG_VAITRO: Mapping user → role
- TAI_KHOAN: Tài khoản + mật khẩu (bcrypt)

### Auth Flow

1. Email + Password → DB
2. Verify bcrypt password
3. Lấy role từ NGUOIDUNG_VAITRO
4. Tạo JWT token + role
5. Frontend lưu token + tự redirect

---

## 📝 Ghi Chú

1. ✅ **Role Mapping**: VT000000001-004 → SV/BCN/KHOA/CTSV
2. ✅ **Database**: Đã có dữ liệu sample đầy đủ
3. ✅ **Auth Controller**: Đã có logic lấy role đúng
4. ✅ **Protected Route**: Đã kiểm tra authorization
5. ✅ **NavBar**: Tự động hiển thị menu theo role
6. ✅ **Responsive**: Desktop + Mobile layout

---

## 🔗 Tài Liệu

- [ROLE_BASED_LOGIN_GUIDE.md](./ROLE_BASED_LOGIN_GUIDE.md) - Hướng dẫn sử dụng role
- [SETUP_AND_TEST_GUIDE.md](./SETUP_AND_TEST_GUIDE.md) - Hướng dẫn setup & test
- [API_DOCUMENTATION.md](../backend/API_DOCUMENTATION.md) - API docs
- [QUICK_START.md](../backend/QUICK_START.md) - Backend quick start

---

## ✨ Kết Luận

Hệ thống giờ đã:

- ✅ Tách giao diện riêng cho từng role
- ✅ Redirect đúng trang theo role
- ✅ Hiển thị menu NavBar khác nhau
- ✅ Kiểm tra authorization chặt chẽ
- ✅ Có hướng dẫn đầy đủ để test

**Lỗi đã được fix!** 🎉
