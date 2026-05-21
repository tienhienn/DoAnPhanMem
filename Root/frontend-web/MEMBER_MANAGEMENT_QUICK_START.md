# ⚡ Bắt Đầu Nhanh: Quản Lý Nhân Sự

**Thời gian**: 5 phút | **Level**: Beginner | **Role**: Ban Chủ Nhiệm (BCN)

---

## 🚀 3 Bước Cơ Bản

### 1️⃣ Đăng Nhập BCN

```
URL: /login
Email: quan.nt@ute.udn.vn
Pass: password
→ Chọn "Đăng nhập"
```

### 2️⃣ Truy Cập Trang

```
Navbar → "Quản lý nhân sự"
hoặc
URL: /member-management
```

### 3️⃣ Quản Lý Thành Viên

```
✓ Xem danh sách        (4 tabs)
✓ Tìm kiếm             (Search bar)
✓ Thêm mới             (+ Button)
✓ Sửa vai trò          (Edit button)
✓ Xóa                  (Delete button)
✓ Duyệt/Từ chối        (Approve/Reject)
```

---

## 🎯 5 Tác Vụ Thường Dùng

### #1: Xem Danh Sách Thành Viên

```
1. Mở Quản lý nhân sự
2. Chọn tab bạn muốn xem:
   - Thành viên chính thức
   - Ban chủ nhiệm
   - Đơn xin gia nhập
   - Đã rời CLB
3. ✅ Xong!
```

**Kết quả**: Hiển thị bảng với tên, MSSV, vai trò, ngày tham gia, điểm đóng góp

---

### #2: Tìm Kiếm Thành Viên

```
1. Vào tab muốn tìm
2. Nhập tên hoặc MSSV trong search bar
   Ví dụ: "Nguyễn" hoặc "2021001"
3. Bảng tự động lọc kết quả
4. ✅ Xong!
```

**Mẹo**: Tìm bằng MSSV chuẩn hơn tìm bằng tên

---

### #3: Thêm Thành Viên Mới

```
1. Nhấp nút "+ Thêm thành viên" (góc trên)
2. Modal mở, điền thông tin:
   - Họ và tên: Nguyễn Văn Tú
   - MSSV: 2024001
   - Vai trò: Chọn từ dropdown
3. Nhấp "Thêm thành viên"
4. ✅ Xong! Thành viên được thêm
```

**Validate**:

- ❌ Không nhập đủ thông tin → Hiện lỗi
- ✅ Nhập đầy đủ → Thêm thành công

---

### #4: Sửa Vai Trò Thành Viên

```
1. Tab: Thành viên chính thức / Ban chủ nhiệm
2. Tìm thành viên cần sửa
3. Nhấp nút "Sửa" (icon edit)
4. Modal hiện, chọn vai trò mới
5. Nhấp "Cập nhật"
6. ✅ Xong! Vai trò được cập nhật
```

**Ví dụ**: Từ "Thành viên" → "Trưởng ban Sự kiện"

---

### #5: Phê Duyệt Đơn Xin Gia Nhập

```
1. Chọn tab "Đơn xin gia nhập"
2. Xem danh sách người chờ duyệt
3. Chọn hành động:

   A) DUYỆT ✓
      └─ Nhấp nút "✓"
      └─ Thành viên được thêm vào chính thức

   B) TỪ CHỐI ✗
      └─ Nhấp nút "✗"
      └─ Đơn bị từ chối, xóa khỏi danh sách

4. ✅ Xong!
```

---

## 🎨 Giao Diện Tham Khảo

```
┌───────────────────────────────────────────┐
│ 👥 Quản lý nhân sự Câu lạc bộ            │
│ [+ Thêm]    [Xuất danh sách]             │
├───────────────────────────────────────────┤
│ [Chính thức] [Ban chủ] [Đơn xin] [Rời]   │
├───────────────────────────────────────────┤
│ 🔍 Tìm kiếm...                            │
├──────┬────────┬──────┬────────┬───────┬──┤
│ Tên  │ MSSV  │ Vai trò│ Ngày  │ Điểm │ │
├──────┼────────┼──────┼────────┼───────┼──┤
│👤 An │2021001│Thành v│15/01  │ [████]│✏️│
│👤 Bảo│2021002│Thành v│20/02  │ [████]│✏️│
│👤 Chính│2021003│Thành v│10/01  │ [███░]│✏️│
└──────┴────────┴──────┴────────┴───────┴──┘
```

---

## ⚙️ Cài Đặt & Bộ Nhớ

### Browser Memory

Trang sử dụng **localStorage** để lưu:

- Danh sách thành viên hiện tại
- Tab đang chọn
- Lịch sử tìm kiếm

### Xóa Cache (Nếu Cần)

```
Chrome/Edge:
1. Ctrl + Shift + Delete
2. Chọn "Cookies and other site data"
3. Chọn website
4. Click "Clear data"

Firefox:
1. Ctrl + Shift + Delete
2. Chọn "Cookies and Site Data"
3. Click "Clear now"
```

---

## ❓ FAQ

### Q: Làm sao thêm thành viên?

**A**: Nhấp "+ Thêm thành viên" → Điền info → Nhấp "Thêm"

### Q: Sửa vai trò như thế nào?

**A**: Tìm thành viên → Nhấp "Sửa" → Chọn vai trò mới → "Cập nhật"

### Q: Duyệt đơn ở đâu?

**A**: Tab "Đơn xin gia nhập" → Nhấp "✓" hoặc "✗"

### Q: Tìm kiếm không work?

**A**: Thử tìm bằng MSSV chính xác, ví dụ: "2021001"

### Q: Xóa thành viên vĩnh viễn không?

**A**: Có, click "Xóa" → Xác nhận → Xóa vĩnh viễn (chuyển sang "Đã rời CLB")

### Q: Dữ liệu lưu ở đâu?

**A**: Local storage + Backend API (mock data)

### Q: Bao nhiêu thành viên tối đa?

**A**: Không giới hạn, nhưng bảng sẽ scroll nếu > 50

### Q: Tạo backup danh sách?

**A**: Nhấp "Xuất danh sách" để download Excel/PDF

---

## 🔐 Quyền Hạn

✅ BCN có quyền:

- Xem toàn bộ thành viên
- Thêm/Sửa/Xóa thành viên
- Duyệt/Từ chối đơn
- Quản lý vai trò
- Xuất danh sách

❌ Các role khác không thể:

- SV: Không thấy trang này
- KHOA: Không thấy trang này
- CTSV: Không thấy trang này

---

## 🆘 Sự Cố Thường Gặp

| Sự cố                | Nguyên nhân           | Giải pháp          |
| -------------------- | --------------------- | ------------------ |
| Modal không mở       | Bug hoặc cache        | Refresh F5         |
| Không tìm thấy người | Tên sai hoặc họ riêng | Dùng MSSV          |
| Sửa không lưu        | Mạng chậm             | Kiểm tra kết nối   |
| Tab không chuyển     | Bug UI                | Refresh trang      |
| Button bị vô hiệu    | Chưa chọn thành viên  | Bấm vào hàng trước |

---

## 🚀 Advanced Tips

1. **Tìm nhanh**: Nhấp vào hàng → Xuất hiện buttons tự động
2. **Sắp xếp**: Click header cột để sort
3. **Bulk export**: Xuất tất cả thành viên 1 lần
4. **Undo/Redo**: Ctrl+Z (Undo), Ctrl+Y (Redo)
5. **Keyboard**: Tab để navigate, Enter để xác nhận

---

## 📞 Cần Giúp Đỡ?

1. **Docs**: Xem [MEMBER_MANAGEMENT_GUIDE.md](MEMBER_MANAGEMENT_GUIDE.md)
2. **API**: Xem [MEMBER_MANAGEMENT_API_INTEGRATION.md](MEMBER_MANAGEMENT_API_INTEGRATION.md)
3. **Code**: Xem [MEMBER_MANAGEMENT_TECHNICAL.md](MEMBER_MANAGEMENT_TECHNICAL.md)
4. **Chat**: Liên hệ @frontend-team

---

**Version**: 1.0 | **Duration**: 5 mins | **Level**: ⭐
