# 📋 Hướng Dẫn Sử Dụng Hệ Thống Quản Lý Sự Kiện - RBAC

## 🎯 Tổng Quan

Hệ thống quản lý sự kiện được nâng cấp với **Role-Based Access Control (RBAC)** cho phép quản lý quyền hạn dựa trên 3 vai trò chính:

1. **BCN** (Ban Chủ Nhiệm CLB)
2. **KHOA** (Cán Bộ Khoa/Phòng Ban)
3. **CTSV** (Phòng Công Tác Sinh Viên)

---

## 📍 Trang Đăng Nhập (Login)

### Giao Diện

- Trang đăng nhập hiện đại với background gradient xanh biển - trắng
- 3 card hiển thị các vai trò với icon biểu tượng
- Nút "🚀 Vào Hệ Thống" kích hoạt khi chọn role

### Cách Sử Dụng

1. Mở `EventManagementPage.jsx`
2. Chọn 1 trong 3 role (card sẽ được highlight)
3. Nhấn "🚀 Vào Hệ Thống"
4. Bạn được chuyển đến Dashboard phù hợp với role

### Đăng Xuất

- Nhấn nút "Đăng xuất" ở header (phải trên)
- Quay lại trang Login để chọn role khác

---

## 🧑‍💼 Role: **BCN** (Ban Chủ Nhiệm CLB)

### Quyền Hạn

| Hành Động          | Được/Không                     |
| ------------------ | ------------------------------ |
| Tạo sự kiện        | ✅ **CÓ**                      |
| Sửa sự kiện        | ✅ **CÓ** (chỉ draft/rejected) |
| Xóa sự kiện        | ✅ **CÓ** (chỉ draft/rejected) |
| Xem tất cả sự kiện | ✅ **CÓ**                      |
| Phê duyệt          | ❌ **KHÔNG**                   |

### Tab Hiển Thị

- **Tất cả** - Xem toàn bộ sự kiện
- **Bản nháp** - Sự kiện chưa nộp
- **Chờ Khoa duyệt** - Đang chờ Khoa
- **Chờ CTSV duyệt** - Đang chờ CTSV
- **Đã duyệt** - Sự kiện được phê duyệt
- **Bị từ chối** - Sự kiện bị từ chối

### Stats Dashboard

- Hiển thị 5 thống kê chi tiết các trạng thái sự kiện
- Chỉ dành riêng cho BCN

### Quy Trình Tạo Sự Kiện

1. Nhấn "➕ Tạo sự kiện mới"
2. Điền thông tin sự kiện
3. **Lưu nháp** → Trạng thái `draft`
4. **Nộp duyệt** → Trạng thái `pending_faculty` (gửi Khoa)

### Xử Lý Sự Kiện Bị Từ Chối

1. Tab "Bị từ chối"
2. Xem lý do từ chối (icon 👁️ hoặc biểu tượng info)
3. **Sửa lại** sự kiện (icon ✏️)
4. **Nộp lại** duyệt

---

## 🏢 Role: **KHOA** (Cán Bộ Khoa/Phòng Ban)

### Quyền Hạn

| Hành Động   | Được/Không                                 |
| ----------- | ------------------------------------------ |
| Tạo sự kiện | ❌ **KHÔNG**                               |
| Sửa sự kiện | ❌ **KHÔNG**                               |
| Xóa sự kiện | ❌ **KHÔNG**                               |
| Xem sự kiện | ✅ **CÓ** (chỉ `pending_faculty`)          |
| Phê duyệt   | ✅ **CÓ** (sang `pending_student_affairs`) |
| Từ chối     | ✅ **CÓ** (sang `rejected`)                |

### Tab Hiển Thị

- **Chờ duyệt** - Danh sách sự kiện từ BCN nộp lên (và chỉ tab này)

### Quy Trình Duyệt Sự Kiện

1. Xem danh sách sự kiện "Chờ duyệt"
2. Nhấn icon ✅ (Phê duyệt)
3. Modal hiển thị chi tiết sự kiện
4. **Phê duyệt** → Gửi tiếp Khoa/CTSV
5. **Từ chối** → Nhập lý do, gửi lại BCN (trạng thái `rejected`)

### Lưu Ý

- ❌ Không thấy tab "Tất cả", "Bản nháp", "Đã duyệt"
- ❌ Không thấy nút "+ Tạo sự kiện mới"
- ❌ Không thấy Stats dashboard
- ✅ Modal ở chế độ **phê duyệt** (có nút hành động)

---

## 📋 Role: **CTSV** (Phòng Công Tác Sinh Viên)

### Quyền Hạn

| Hành Động      | Được/Không                                |
| -------------- | ----------------------------------------- |
| Tạo sự kiện    | ❌ **KHÔNG**                              |
| Sửa sự kiện    | ❌ **KHÔNG**                              |
| Xóa sự kiện    | ❌ **KHÔNG**                              |
| Xem sự kiện    | ✅ **CÓ** (chỉ `pending_student_affairs`) |
| Phê duyệt cuối | ✅ **CÓ** (sang `approved`)               |
| Từ chối        | ✅ **CÓ** (sang `rejected`)               |

### Tab Hiển Thị

- **Chờ duyệt** - Danh sách sự kiện từ Khoa nộp lên (và chỉ tab này)

### Quy Trình Duyệt Cuối Cùng

1. Xem danh sách sự kiện "Chờ duyệt"
2. Nhấn icon ✅ (Phê duyệt)
3. Modal hiển thị chi tiết + quá trình phê duyệt
4. **Phê duyệt** → Sự kiện trở thành `approved` (hoàn tất)
5. **Từ chối** → Nhập lý do, gửi lại BCN (trạng thái `rejected`)

### Lưu Ý

- ❌ Không thấy tab "Tất cả", "Bản nháp", "Chờ Khoa duyệt"
- ❌ Không thấy nút "+ Tạo sự kiện mới"
- ❌ Không thấy Stats dashboard
- ✅ Modal ở chế độ **phê duyệt** (có nút hành động)
- 🎯 Quyết định cuối cùng về sự kiện

---

## 🔄 Quy Trình Duyệt Sự Kiện

```
┌─────────────────────────────────────────────────────────────┐
│                      BCN (Ban Chủ Nhiệm)                    │
│  • Tạo sự kiện                                              │
│  • Chọn "Lưu nháp" (draft) hoặc "Nộp duyệt"                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  pending_faculty     │
              │  (Chờ Khoa duyệt)    │
              └────────┬─────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
   BCN xem & sửa          KHOA phê duyệt/từ chối
   khi bị từ chối              │
                               ▼
                  ┌────────────────────────┐
                  │ pending_student_affairs │
                  │ (Chờ CTSV duyệt)       │
                  └────────┬────────────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
            CTSV duyệt          CTSV từ chối
                │                     │
                ▼                     ▼
          ┌─────────────┐      ┌──────────┐
          │  approved   │      │ rejected │
          │ (Hoàn tất)  │      │ (Từ chối)│
          └─────────────┘      └────┬─────┘
                                     │
                              BCN xem & sửa
                              khi bị từ chối
```

---

## 🎨 Phối Màu & Giao Diện

### Color Scheme

- **Header Login**: Xanh biển gradient (blue-600 → teal)
- **Header Dashboard**:
  - BCN: Blue gradient
  - KHOA: Cyan gradient
  - CTSV: Emerald gradient
- **Background**: Slate-50 (trắng nhạt)
- **Buttons**: Blue-600 (primary), Rose-500 (danger), Emerald-600 (success)

### Status Badge Colors

| Trạng Thái              | Màu               |
| ----------------------- | ----------------- |
| draft                   | Slate (xám)       |
| pending_faculty         | Amber (vàng)      |
| pending_student_affairs | Blue (xanh)       |
| approved                | Emerald (xanh lá) |
| rejected                | Rose (đỏ)         |

---

## 💡 Hướng Dẫn Sử Dụng Nhanh

### 🧑‍💼 Đối với BCN

```
1. Đăng nhập → Chọn "Ban Chủ Nhiệm CLB"
2. Tạo sự kiện → Điền form → Nộp duyệt
3. Theo dõi tiến độ qua 6 tab
4. Sửa sự kiện bị từ chối → Nộp lại
```

### 🏢 Đối với KHOA

```
1. Đăng nhập → Chọn "Cán Bộ Khoa/Phòng Ban"
2. Xem sự kiện "Chờ duyệt" từ BCN
3. Phê duyệt (gửi CTSV) hoặc Từ chối (gửi lại BCN)
4. Nhập lý do từ chối nếu cần
```

### 📋 Đối với CTSV

```
1. Đăng nhập → Chọn "Phòng Công Tác Sinh Viên"
2. Xem sự kiện "Chờ duyệt" từ Khoa
3. Phê duyệt cuối (approved) hoặc Từ chối (gửi lại BCN)
4. Nhập lý do từ chối nếu cần
```

---

## 🔐 Bảo Mật & Kiểm Soát

### Kiểm Soát Truy Cập

- ✅ Mỗi role chỉ thấy dữ liệu phù hợp
- ✅ Hành động bị cấm sẽ hiển thị thông báo lỗi
- ✅ Nút hành động ẩn tự động dựa trên quyền

### Quy Tắc Kinh Doanh

- ❌ BCN không thể trực tiếp phê duyệt sự kiện của mình
- ❌ KHOA/CTSV không thể tạo hoặc xóa sự kiện
- ✅ Lý do từ chối **bắt buộc** phải nhập

---

## 🐛 Khắc Phục Sự Cố

### Không thấy sự kiện nào

- **BCN**: Kiểm tra tab khác hoặc nhấn "Tất cả"
- **KHOA/CTSV**: Chỉ thấy sự kiện ở tab "Chờ duyệt" → Bình thường

### Không tìm thấy nút phê duyệt

- Kiểm tra role: KHOA/CTSV mới có quyền phê duyệt
- Kiểm tra status sự kiện: Phải ở trạng thái `pending_faculty` (KHOA) hoặc `pending_student_affairs` (CTSV)

### Lỗi khi từ chối

- Lý do từ chối **không được để trống**
- Nhập ít nhất 1 ký tự và thử lại

---

## 📝 Ghi Chú

- Hệ thống sử dụng **mock data** để mô phỏng
- Dữ liệu sẽ được reset khi F5 hoặc reload trang
- Icon & Component từ **React Icons** (FiEdit2, FiTrash2, FiCheck, FiAlertCircle)
- StatusBadge & ApprovalStepper giữ nguyên từ file gốc

---

**✅ Hệ thống đã sẵn sàng để sử dụng!**
