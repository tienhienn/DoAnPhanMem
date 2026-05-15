# 🚀 Hướng Dẫn Setup & Kiểm Tra Hệ Thống

## 📋 Các thay đổi đã thực hiện

### Frontend (frontend-web)

#### 1. ✅ Tạo 3 trang riêng cho từng role

- **`BCNManagementPage.jsx`** - Ban chủ nhiệm CLB
  - Tạo/Sửa/Xóa sự kiện
  - Nộp sự kiện để duyệt
  - Xem phản hồi
- **`FacultyManagementPage.jsx`** - Cán bộ Khoa
  - Duyệt sự kiện cấp khoa
  - Ghi chú/phản hồi cho BCN
  - Xem lịch sử duyệt

- **`StudentAffairsPage.jsx`** - Phòng CTSV
  - Duyệt sự kiện cấp trường (cuối cùng)
  - Thống kê sự kiện
  - Xem phản hồi

#### 2. ✅ Update Routing (App.jsx)

- `/` → EventListPage (tất cả role)
- `/my-events` → MyEventsPage (chỉ SV)
- `/bcn-management` → BCNManagementPage (chỉ BCN)
- `/faculty-management` → FacultyManagementPage (chỉ KHOA)
- `/student-affairs` → StudentAffairsPage (chỉ CTSV)

#### 3. ✅ Update AuthContext (AuthContext.jsx)

```javascript
// Redirect tự động theo role
getHomeByRole(role):
  - BCN → /bcn-management
  - KHOA → /faculty-management
  - CTSV → /student-affairs
  - SV → /
```

#### 4. ✅ Update NavBar (NavBar.jsx)

- Hiển thị menu khác nhau cho từng role
- BCN: "Sự Kiện" + "Quản lý BCN"
- KHOA: "Sự Kiện" + "Duyệt Khoa"
- CTSV: "Sự Kiện" + "Quản lý CTSV"
- SV: "Sự Kiện" + "Của Tôi"

### Backend (database & API)

#### 1. ✅ Dữ liệu Sample (QuanLyCLB.sql)

Đã có đầy đủ:

- 4 role: SV, BCN, KHOA, CTSV
- Tài khoản sample cho từng role
- Mật khẩu: `password` (bcrypt hash)

#### 2. ✅ Auth API (authController.js)

- Lấy vai trò từ NGUOIDUNG_VAITRO
- Map VaiTroID → role string
- Trả về role trong JWT token

---

## 🧪 Cách Kiểm Tra

### Bước 1: Khởi động Backend

```bash
cd backend
npm install
npm start
```

### Bước 2: Khởi động Frontend

```bash
cd frontend-web
npm install
npm run dev
```

### Bước 3: Truy cập Trang Web

```
http://localhost:5173 (hoặc port khác tùy Vite config)
```

---

## 🔐 Test Từng Role

### Test 1: Sinh Viên (SV)

**Đăng nhập:**

- Email: `an.nv@sv.ute.udn.vn`
- Mật khẩu: `password`

**Kỳ vọng:**

1. ✅ Đăng nhập thành công
2. ✅ Redirect về `/` (EventListPage)
3. ✅ NavBar hiển thị: "Sự Kiện" + "Của Tôi"
4. ✅ Có thể click vào "Của Tôi" → `/my-events`
5. ✅ Không thể truy cập `/bcn-management`, `/faculty-management`, `/student-affairs`

**Xác minh:**

```javascript
// Mở DevTools (F12) → Console
// Kiểm tra token
localStorage.getItem("token");
// Decode token
atob(token.split(".")[1]); // Xem role
// Kỳ vọng: role: "SV"
```

---

### Test 2: Ban Chủ Nhiệm (BCN)

**Đăng nhập:**

- Email: `quan.nt@ute.udn.vn`
- Mật khẩu: `password`

**Kỳ vọng:**

1. ✅ Đăng nhập thành công
2. ✅ Redirect về `/bcn-management` (BCNManagementPage)
3. ✅ NavBar hiển thị: "Sự Kiện" + "Quản lý BCN"
4. ✅ Thấy button "Tạo sự kiện mới"
5. ✅ Thấy filter: "Bản nháp", "Chờ Khoa", "Duyệt", "Từ chối"
6. ✅ Không thể truy cập `/my-events`, `/faculty-management`, `/student-affairs`

**Xác minh:**

```javascript
// DevTools → Console
atob(localStorage.getItem("token").split(".")[1]);
// Kỳ vọng: role: "BCN"
```

---

### Test 3: Cán Bộ Khoa (KHOA)

**Đăng nhập:**

- Email: `truong.lv@ute.udn.vn`
- Mật khẩu: `password`

**Kỳ vọng:**

1. ✅ Đăng nhập thành công
2. ✅ Redirect về `/faculty-management` (FacultyManagementPage)
3. ✅ NavBar hiển thị: "Sự Kiện" + "Duyệt Khoa"
4. ✅ Thấy tab: "Chờ Duyệt" + "Đã Duyệt"
5. ✅ Có button "Duyệt" và "Từ chối"
6. ✅ Không thể truy cập `/my-events`, `/bcn-management`, `/student-affairs`

**Xác minh:**

```javascript
atob(localStorage.getItem("token").split(".")[1]);
// Kỳ vọng: role: "KHOA"
```

---

### Test 4: Phòng CTSV (CTSV)

**Đăng nhập:**

- Email: `tho.nh@ute.udn.vn`
- Mật khẩu: `password`

**Kỳ vọng:**

1. ✅ Đăng nhập thành công
2. ✅ Redirect về `/student-affairs` (StudentAffairsPage)
3. ✅ NavBar hiển thị: "Sự Kiện" + "Quản lý CTSV"
4. ✅ Thấy card thống kê: "Chờ Duyệt", "Đã Duyệt", "Tổng Sự Kiện", "Tổng Điểm"
5. ✅ Thấy tab: "Chờ Duyệt" + "Đã Duyệt"
6. ✅ Có button "Duyệt" và "Từ chối"
7. ✅ Không thể truy cập `/my-events`, `/bcn-management`, `/faculty-management`

**Xác minh:**

```javascript
atob(localStorage.getItem("token").split(".")[1]);
// Kỳ vọng: role: "CTSV"
```

---

## 🧐 Test Authorization

### Test 5: Kiểm Tra Authorization

1. **Đăng nhập với Sinh Viên** (`an.nv@sv.ute.udn.vn`)

2. **Thử truy cập trực tiếp:**
   - `/bcn-management` → ✅ Redirect về `/`
   - `/faculty-management` → ✅ Redirect về `/`
   - `/student-affairs` → ✅ Redirect về `/`

3. **Kỳ vọng:** Chỉ có thể truy cập `/my-events`, không thể truy cập trang quản lý của các role khác

---

### Test 6: Test Đăng Xuất

1. **Đăng nhập bất kỳ tài khoản nào**
2. **Click "Đăng xuất"** (Desktop) hoặc nút logout (Mobile)
3. **Kỳ vọng:**
   - ✅ Token xóa khỏi localStorage
   - ✅ Redirect về `/login`
   - ✅ Không thể quay lại trang trước đó (protected)

---

### Test 7: Test Tài Khoản Bị Khóa

**Đăng nhập:**

- Email: `khoa.tv@sv.ute.udn.vn`
- Mật khẩu: `password`

**Kỳ vọng:**

- ❌ Hiển thị lỗi: "Tài khoản đã bị vô hiệu hóa"

---

## 🎨 Giao Diện

### Desktop

- NavBar cố định ở trên (lg and above)
- Logo ở trái
- Menu links ở giữa
- User info + Logout ở phải

### Mobile

- BottomBar cố định ở dưới (< lg)
- Menu items dạng icon + label
- Nút Logout ở cuối

---

## 📁 Cấu Trúc Thư Mục

```
frontend-web/
├── src/
│   ├── pages/
│   │   ├── BCNManagementPage.jsx        ← NEW
│   │   ├── FacultyManagementPage.jsx    ← NEW
│   │   ├── StudentAffairsPage.jsx       ← NEW
│   │   ├── EventListPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── MyEventsPage.jsx
│   │   └── ...
│   ├── components/
│   │   └── layout/
│   │       └── NavBar.jsx               ← UPDATED
│   ├── context/
│   │   └── AuthContext.jsx              ← UPDATED
│   ├── App.jsx                          ← UPDATED
│   └── ...
├── ROLE_BASED_LOGIN_GUIDE.md            ← NEW
└── ...

backend/
├── controllers/
│   └── authController.js                ← VERIFIED (OK)
├── db/
│   ├── index.js
│   └── initDatabase.js
└── QuanLyCLB.sql                        ← VERIFIED (OK)
```

---

## ✅ Checklist Kiểm Tra

- [ ] Backend chạy thành công
- [ ] Frontend chạy thành công
- [ ] Test đăng nhập Sinh Viên
- [ ] Test đăng nhập Ban Chủ Nhiệm
- [ ] Test đăng nhập Cán Bộ Khoa
- [ ] Test đăng nhập Phòng CTSV
- [ ] Test authorization (không thể truy cập route của role khác)
- [ ] Test đăng xuất
- [ ] Test tài khoản bị khóa
- [ ] Kiểm tra NavBar hiển thị menu đúng cho từng role
- [ ] Kiểm tra giao diện trên mobile
- [ ] Kiểm tra giao diện trên desktop

---

## 🔗 Liên Kết Quan Trọng

- [ROLE_BASED_LOGIN_GUIDE.md](./ROLE_BASED_LOGIN_GUIDE.md) - Hướng dẫn sử dụng role
- [../backend/API_DOCUMENTATION.md](../backend/API_DOCUMENTATION.md) - API docs
- [../backend/QUICK_START.md](../backend/QUICK_START.md) - Backend setup

---

## 📞 Ghi Chú

1. Tất cả tài khoản mẫu đều có mật khẩu: `password`
2. Token JWT có thời hạn 24 giờ
3. Role được lưu trữ trong bảng `NGUOIDUNG_VAITRO`
4. NavBar tự động cập nhật khi user role thay đổi
5. Redirect tự động hoạt động qua `getHomeByRole()` trong AuthContext
