# 📋 Hướng Dẫn Trang Quản Lý Nhân Sự Câu Lạc Bộ

## 🎯 Tổng Quan

Trang **MemberManagementPage** là công cụ quản lý toàn diện cho nhân sự của câu lạc bộ. Cho phép **Ban Chủ Nhiệm (BCN)** quản lý thành viên, vai trò, và phê duyệt đơn xin gia nhập.

---

## 📍 Truy Cập Trang

### Desktop

1. Đăng nhập với tài khoản BCN: `quan.nt@ute.udn.vn` (mật khẩu: `password`)
2. Nhấp menu **"Quản lý nhân sự"** trong Navigation Bar
3. Hoặc truy cập URL: `/member-management`

### Mobile

1. Đăng nhập với tài khoản BCN
2. Nhấp icon **"Quản lý nhân sự"** trong Bottom Navigation
3. Hoặc truy cập URL: `/member-management`

---

## 🖼️ Cấu Trúc Giao Diện

### 1️⃣ Header

```
👥 Quản lý nhân sự Câu lạc bộ
[+ Thêm thành viên] [Xuất danh sách]
```

- **Tiêu đề**: Hiển thị tên trang
- **Nút Thêm thành viên**: Mở modal thêm thành viên mới (xanh biển)
- **Nút Xuất danh sách**: Xuất dữ liệu thành viên (định dạng Excel/PDF)

### 2️⃣ Tabs (Pills Navigation)

4 tab để phân loại thành viên:

| Tab                          | Nội dung                         | Số lượng |
| ---------------------------- | -------------------------------- | -------- |
| 🟢 **Thành viên chính thức** | Các thành viên đã được phê duyệt | 3        |
| 🔵 **Ban chủ nhiệm**         | Lãnh đạo CLB                     | 3        |
| 🟠 **Đơn xin gia nhập**      | Chờ phê duyệt                    | 2        |
| ⚫ **Đã rời CLB**            | Thành viên cũ                    | 1        |

**Đặc điểm**:

- Hiển thị dạng Pill (viên thuốc)
- Click để chuyển tab
- Tab đang chọn: Nền xanh biển, text trắng
- Tab không chọn: Nền xám, text xám

### 3️⃣ Search Bar

```
🔍 Tìm kiếm theo tên hoặc MSSV...
```

- Tìm kiếm realtime
- Hỗ trợ tìm theo tên hoặc mã sinh viên

### 4️⃣ Bảng Thành Viên (Member Table)

| Cột               | Nội dung      | Ví dụ                      |
| ----------------- | ------------- | -------------------------- |
| **Họ và tên**     | Avatar + Tên  | 👨‍🎓 Nguyễn Văn An           |
| **MSSV**          | Mã sinh viên  | 2021001                    |
| **Vai trò**       | Chức vụ       | Thành viên / Chủ nhiệm     |
| **Ngày tham gia** | Ngày gia nhập | 15/01/2024                 |
| **Điểm đóng góp** | Progress bar  | [████░] 85                 |
| **Hành động**     | Buttons       | Sửa / Xóa, Duyệt / Từ chối |

### 5️⃣ Hành Động (Actions)

**Tab Thành viên chính thức / Ban chủ nhiệm**:

- 🔵 **Nút Sửa**: Thay đổi vai trò
- 🔴 **Nút Xóa**: Xóa khỏi CLB

**Tab Đơn xin gia nhập**:

- 🟢 **Nút Duyệt**: Phê duyệt đơn
- 🔴 **Nút Từ chối**: Từ chối đơn

---

## 🎯 Các Chức Năng Chính

### 1. Phân Loại Thành Viên (Tabs)

Click các tab để xem:

- **Thành viên chính thức**: Tất cả thành viên đã được phê duyệt
- **Ban chủ nhiệm**: Lãnh đạo CLB (Chủ nhiệm, Phó chủ, Trưởng ban)
- **Đơn xin gia nhập**: Chờ phê duyệt (cần thực hiện hành động)
- **Đã rời CLB**: Lịch sử thành viên cũ

### 2. Tìm Kiếm Thành Viên

```
Nhập tên hoặc MSSV → Bảng tự động lọc
```

Ví dụ:

- Tìm "Nguyễn" → Hiển thị tất cả Nguyễn
- Tìm "2021001" → Hiển thị sinh viên có MSSV này

### 3. Thêm Thành Viên Mới

**Nút**: `+ Thêm thành viên` (góc trên phải)

#### Modal Thêm Thành Viên

```
┌─────────────────────────────────┐
│ Thêm thành viên mới         ╳   │
├─────────────────────────────────┤
│ Họ và tên *                     │
│ [____________________________]   │
│                                 │
│ MSSV *                          │
│ [____________________________]   │
│                                 │
│ Vai trò *                       │
│ [-- Chọn vai trò --▼]          │
│                                 │
│  [Hủy]     [Thêm thành viên]   │
└─────────────────────────────────┘
```

**Các trường**:

| Trường    | Bắt buộc | Mô tả                   |
| --------- | -------- | ----------------------- |
| Họ và tên | ✅       | Tên đầy đủ sinh viên    |
| MSSV      | ✅       | Mã số sinh viên         |
| Vai trò   | ✅       | Chọn từ danh sách roles |

### 4. Sửa Vai Trò Thành Viên

**Cách sử dụng**:

1. Tab: Thành viên chính thức hoặc Ban chủ nhiệm
2. Click nút 🔵 **Sửa** ở hàng thành viên
3. Modal hiển thị
4. Chọn vai trò mới từ dropdown
5. Click `Cập nhật`

#### Modal Sửa Vai Trò

```
┌─────────────────────────────────┐
│ Sửa chức vụ                 ╳   │
├─────────────────────────────────┤
│ Thành viên                      │
│ ┌───────────────────────────┐   │
│ │ 👨‍💼 Nguyễn Văn An (2021001) │   │
│ └───────────────────────────┘   │
│                                 │
│ Chức vụ mới *                   │
│ [Thành viên ▼]                 │
│  ├─ Thành viên
│  ├─ Phó chủ nhiệm
│  ├─ Trưởng ban Sự kiện
│  ├─ Trưởng ban Truyền thông
│  ├─ Trưởng ban Tài chính
│  └─ Chủ nhiệm CLB
│                                 │
│ ℹ️ Thay đổi chức vụ sẽ cập     │
│    nhật ngay trong hệ thống.   │
│                                 │
│  [Hủy]      [Cập nhật]         │
└─────────────────────────────────┘
```

### 5. Phê Duyệt Đơn Xin Gia Nhập

**Tab**: Đơn xin gia nhập

**Hành động**:

| Action      | Button | Màu     | Ý nghĩa              |
| ----------- | ------ | ------- | -------------------- |
| **Duyệt**   | ✓      | 🟢 Xanh | Chấp nhận thành viên |
| **Từ chối** | ✗      | 🔴 Đỏ   | Từ chối đơn          |

**Quy trình**:

```
Sinh viên nộp đơn
    ↓
Hiển thị ở tab "Đơn xin gia nhập"
    ↓
BCN xem thông tin
    ↓
Click ✓ (Duyệt) hoặc ✗ (Từ chối)
    ↓
Cập nhật trạng thái
```

### 6. Xóa Thành Viên

1. Tab: Thành viên chính thức hoặc Ban chủ nhiệm
2. Click nút 🗑️ **Xóa** ở hàng thành viên
3. Xác nhận lệnh xóa
4. Thành viên bị xóa khỏi CLB

---

## 🎨 Thiết Kế & Styling

### Màu Sắc (Teal/Cyan Color Scheme)

```
Primary Teal      : #0d9488 (teal-600)
Light Teal        : #99f6e4 (teal-200)
Teal Background   : #f0fdfa (teal-50)
White             : #ffffff
Slate Gray        : #f1f5f9 (slate-100)
Dark Text         : #1e293b (slate-900)
Light Text        : #64748b (slate-500)
Success Green     : #10b981 (green-600)
Error Red         : #ef4444 (red-600)
```

### Các Thành Phần

- **Cards**: rounded-2xl, shadow-sm, border-slate-100
- **Buttons**: transition smooth, hover scale-105, active scale-95
- **Tabs (Pills)**: Inline-flex, rounded-full, smooth transition
- **Table**: Alternating row colors, hover highlight

---

## 📊 Mock Data

### Thành Viên Chính Thức (3 thành viên)

| Tên           | MSSV    | Vai trò    | Ngày tham gia | Điểm |
| ------------- | ------- | ---------- | ------------- | ---- |
| Nguyễn Văn An | 2021001 | Thành viên | 15/01/2024    | 85   |
| Trần Thị Bảo  | 2021002 | Thành viên | 20/02/2024    | 92   |
| Lê Minh Chính | 2021003 | Thành viên | 10/01/2024    | 78   |

### Ban Chủ Nhiệm (3 người)

| Tên             | MSSV    | Vai trò            | Ngày tham gia | Điểm |
| --------------- | ------- | ------------------ | ------------- | ---- |
| Phạm Thị Dung   | 2020001 | Chủ nhiệm CLB      | 01/09/2023    | 98   |
| Đỗ Hoàng Em     | 2020002 | Phó chủ nhiệm      | 15/10/2023    | 95   |
| Hoàng Tuấn Kiệt | 2020003 | Trưởng ban Sự kiện | 01/11/2023    | 92   |

### Đơn Xin Gia Nhập (2 đơn)

| Tên             | MSSV    | Trạng thái | Ngày nộp   |
| --------------- | ------- | ---------- | ---------- |
| Võ Hữu Tài      | 2023001 | Chờ duyệt  | 10/05/2024 |
| Ngô Thanh Hương | 2023002 | Chờ duyệt  | 12/05/2024 |

### Đã Rời CLB (1 thành viên)

| Tên          | MSSV    | Vai trò cũ | Ngày rời   |
| ------------ | ------- | ---------- | ---------- |
| Từ Như Quỳnh | 2020101 | Thành viên | 30/05/2024 |

---

## 📱 Responsive Design

### Desktop (≥1024px)

- Bảng đầy đủ các cột
- 4 tabs nằm ngang
- Modal: 500px width
- Buttons cạnh nhau

### Tablet (640-1024px)

- Bảng scroll ngang nếu cần
- 2-4 tabs tùy kích thước
- Modal: 90% width
- Buttons stack nếu cần

### Mobile (<640px)

- Bảng scroll ngang
- Tabs scroll ngang
- Modal: Full width - 20px
- Buttons stack dọc

---

## 💡 Tips & Tricks

### Sử Dụng Hiệu Quả

1. **Kiểm tra thường xuyên tab "Đơn xin gia nhập"** để phê duyệt sinh viên mới nhanh
2. **Sử dụng Search** để tìm thành viên cụ thể
3. **Cập nhật vai trò** khi có thay đổi trong cấu trúc CLB
4. **Xuất danh sách** định kỳ để backup và thống kê

### Xử Lý Sự Cố

| Vấn đề                    | Giải pháp             |
| ------------------------- | --------------------- |
| Không tìm thấy thành viên | Thử tìm bằng MSSV     |
| Modal không mở            | Refresh trang (F5)    |
| Cập nhật không lưu        | Kiểm tra kết nối mạng |
| Tab không chuyển          | Tải lại trang         |

---

## 🔄 Luồng Công Việc Tiêu Chuẩn

```
┌─────────────────────────────────┐
│ 1. XEM DANH SÁCH THÀNH VIÊN    │
│    [Chọn tab]                  │
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│ 2. TÌM KIẾM THÀNH VIÊN         │
│    [Nhập tên/MSSV]             │
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│ 3. QUẢN LÝ THÀNH VIÊN          │
│    ├─ Sửa vai trò              │
│    ├─ Xóa khỏi CLB             │
│    ├─ Duyệt đơn                │
│    └─ Từ chối đơn              │
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│ 4. XUẤT DANH SÁCH              │
│    [Nút Xuất danh sách]        │
└─────────────────────────────────┘
```

---

## ✅ Checklist Hàng Ngày

```
☐ Kiểm tra tab "Đơn xin gia nhập"
☐ Phê duyệt hoặc từ chối đơn mới
☐ Cập nhật vai trò nếu cần
☐ Kiểm tra danh sách thành viên
☐ Xuất backup danh sách
```

---

## 📞 Liên Hệ

Nếu gặp vấn đề:

1. Kiểm tra kết nối mạng
2. Refresh trang (F5)
3. Xóa cache browser
4. Đăng xuất và đăng nhập lại
5. Liên hệ team support

---

**Version**: 1.0 | **Last Updated**: May 19, 2026 | **Author**: Frontend Team
