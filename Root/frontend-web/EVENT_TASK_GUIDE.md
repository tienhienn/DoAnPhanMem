# 📋 Hướng Dẫn Trang Phân công & Quản lý Nhiệm vụ Sự kiện

## 🎯 Tổng Quan

Trang **EventTaskManagement** (Triển khai & Phân công nhiệm vụ) là công cụ quản lý toàn diện cho việc phân chia công việc giữa các thành viên đội trong mỗi sự kiện. Tính năng được thiết kế dành cho **Ban Chủ Nhiệm CLB (BCN)** để dễ dàng theo dõi tiến độ công việc.

---

## 📍 Truy Cập Trang

### Desktop

1. Đăng nhập với tài khoản BCN: `quan.nt@ute.udn.vn` (mật khẩu: `password`)
2. Nhấp menu **"Phân công nhiệm vụ"** trong Navigation Bar trên cùng
3. Hoặc truy cập URL trực tiếp: `/event-tasks/1`

### Mobile

1. Đăng nhập với tài khoản BCN
2. Nhấp icon **"Phân công nhiệm vụ"** trong Bottom Navigation Bar
3. Hoặc truy cập URL trực tiếp: `/event-tasks/1`

---

## 🖼️ Cấu Trúc Giao Diện

### 1️⃣ Header (Đầu trang)

```
📋 Triển khai & Phân công nhiệm vụ
[Dropdown: Chọn Sự kiện] [Nút: + Thêm công việc]
```

- **Tiêu đề**: Hiển thị tên trang
- **Dropdown Sự kiện**: Cho phép chọn sự kiện để xem công việc liên quan
  - Ví dụ: Hackathon 2026, Tech Conference 2026, etc.
- **Nút Thêm công việc**: Mở modal để tạo công việc mới

---

### 2️⃣ Thống Kê Nhanh (Statistics Cards)

4 thẻ hiển thị tóm tắt:

| Card                      | Nội dung                     | Badge      | Màu        |
| ------------------------- | ---------------------------- | ---------- | ---------- |
| 🔵 Tổng công việc         | Số lượng tất cả tasks        | Xanh dương | Blue-600   |
| ⏱️ Chưa làm (To-do)       | Số tasks status "Chưa làm"   | Xám        | Gray-600   |
| ⚙️ Đang làm (In Progress) | Số tasks status "Đang làm"   | Vàng       | Yellow-600 |
| ✅ Hoàn thành (Done)      | Số tasks status "Hoàn thành" | Xanh lá    | Green-600  |

**Ví dụ**:

```
[Total: 6] [To-do: 2] [In Progress: 2] [Done: 2]
```

---

### 3️⃣ Bảng Công Việc (Task Table)

Hiển thị danh sách chi tiết các công việc:

| Cột                 | Nội dung            | Chi tiết                                        |
| ------------------- | ------------------- | ----------------------------------------------- |
| **Tên công việc**   | Tiêu đề + mô tả     | Có mô tả ngắn bên dưới                          |
| **Người phụ trách** | Avatar + Tên + Role | Ví dụ: 👨‍💼 Nguyễn Văn An (Leader)                |
| **Hạn chót**        | Ngày giờ deadline   | Có cảnh báo nếu quá hạn ⚠️                      |
| **Trạng thái**      | Dropdown select     | `📋 Chưa làm` / `⚙️ Đang làm` / `✅ Hoàn thành` |
| **Hành động**       | Nút xóa             | ❌ Xóa công việc                                |

**Các Tính Năng**:

- ✨ **Hover Effect**: Dòng sáng lên khi hover
- 🔄 **Thay đổi trạng thái**: Click dropdown để cập nhật status ngay lập tức
- ⚠️ **Cảnh báo quá hạn**: Hiển thị "Quá hạn" nếu deadline đã vượt quá ngày hôm nay
- 🗑️ **Xóa công việc**: Nhấp nút ❌ để xóa

---

## 🎯 Các Chức Năng Chính

### 1. Chọn Sự Kiện

```
Dropdown: [Chọn sự kiện ▼]
```

- Danh sách các sự kiện để quản lý
- Chọn sự kiện → Tự động cập nhật danh sách công việc
- Thống kê thay đổi theo sự kiện được chọn

---

### 2. Xem Thống Kê Nhanh

4 card hiển thị tóm tắt:

- Giúp nhanh chóng biết tổng tiến độ sự kiện
- Cập nhật real-time khi thay đổi status công việc

---

### 3. Thêm Công Việc Mới

**Nút**: `+ Thêm công việc` (góc trên phải bảng)

#### Modal Thêm Công Việc

```
┌─────────────────────────────────────┐
│  Thêm công việc mới              ╳  │
├─────────────────────────────────────┤
│ Tên công việc *                      │
│ [____________________________]       │
│                                     │
│ Phân công cho ai *                  │
│ [-- Chọn thành viên --▼]           │
│                                     │
│ Hạn chót *                          │
│ [____________________________]       │
│                                     │
│ Mô tả chi tiết                      │
│ [____________________________]       │
│ [____________________________]       │
│ [____________________________]       │
│                                     │
│  [Hủy]              [Thêm công việc]│
└─────────────────────────────────────┘
```

**Các trường**:

| Trường           | Bắt buộc | Loại            | Mô tả                              |
| ---------------- | -------- | --------------- | ---------------------------------- |
| Tên công việc    | ✅       | Text Input      | Tiêu đề công việc (20-100 ký tự)   |
| Phân công cho ai | ✅       | Dropdown        | Chọn thành viên từ danh sách       |
| Hạn chót         | ✅       | DateTime Picker | Chọn ngày giờ deadline             |
| Mô tả chi tiết   | ❌       | Textarea        | Thêm chi tiết công việc (tùy chọn) |

**Cách sử dụng**:

1. Nhấp nút `+ Thêm công việc`
2. Điền đầy đủ thông tin bắt buộc (\*)
3. (Tùy chọn) Thêm mô tả chi tiết
4. Nhấp `[Thêm công việc]` để lưu
5. Công việc sẽ xuất hiện trong bảng với status mặc định là "Chưa làm"

---

### 4. Quản Lý Trạng Thái

#### Thay Đổi Trạng Thái

Click dropdown **Trạng thái** trong bảng để chọn:

```
📋 Chưa làm      → Công việc chưa bắt đầu
⚙️ Đang làm      → Công việc đang thực hiện
✅ Hoàn thành    → Công việc đã xong
```

**Ví dụ quy trình**:

```
Tạo công việc
    ↓
📋 Chưa làm (mặc định)
    ↓
⚙️ Đang làm (khi bắt đầu)
    ↓
✅ Hoàn thành (khi xong)
```

---

### 5. Xóa Công Việc

1. Nhấp nút **❌** ở cột Hành động
2. Công việc sẽ bị xóa khỏi danh sách
3. Thống kê tự động cập nhật

---

## 👥 Thành Viên Mẫu (Mock Data)

Danh sách thành viên có sẵn để phân công:

| STT | Tên           | Vai trò   | Avatar |
| --- | ------------- | --------- | ------ |
| 1   | Nguyễn Văn An | Leader    | 👨‍💼     |
| 2   | Trần Thị Bảo  | Developer | 👩‍💻     |
| 3   | Lê Minh Chính | Designer  | 👨‍🎨     |
| 4   | Phạm Thị Dung | Manager   | 👩‍📊  |
| 5   | Đỗ Hoàng Em   | Developer | 👨‍🔧     |

---

## 🎨 Thiết Kế & Styling

### Màu Sắc

```
Primary Blue      : #2563eb (blue-600)
Background Slate  : #f8fafc (bg-slate-50)
Card White        : #ffffff
Success Green     : #16a34a (green-600)
Warning Yellow    : #ca8a04 (yellow-600)
Neutral Gray      : #6b7280 (gray-600)
```

### Các Thành Phần

- **Cards**: Bo góc `rounded-2xl`, bóng đổ `shadow-sm`, border `border-slate-100`
- **Buttons**: Có transition, hover effect, active scale
- **Modal**: Backdrop blur `backdrop-blur-sm`, mờ nhẹ
- **Table**: Hover highlight, alternating row colors
- **Form Inputs**: Border focus, smooth transition

---

## 📱 Responsive Design

### Desktop (≥1024px)

- Layout đầy đủ với tất cả cột
- Cards xếp 4 cột
- Modal hiển thị bình thường
- Navigation bar cố định ở trên

### Tablet & Mobile (<1024px)

- Cards xếp 2 cột (md), 1 cột (sm)
- Bảng có scroll ngang nếu cần
- Modal responsive, chiếm 90% viewport
- Navigation bar cố định ở dưới

---

## 💡 Tips & Tricks

### Sử Dụng Hiệu Quả

1. **Cập nhật thường xuyên**: Thay đổi trạng thái công việc khi có tiến độ
2. **Mô tả chi tiết**: Thêm mô tả để thành viên hiểu rõ yêu cầu
3. **Deadline hợp lý**: Đặt deadline thực tế để không quá hạn
4. **Kiểm tra thường**: Xem bảng thống kê để biết tiến độ tổng thể

### Xử Lý Sự Cố

| Vấn đề                          | Giải pháp                                 |
| ------------------------------- | ----------------------------------------- |
| Dropdown sự kiện không cập nhật | Tải lại trang (F5)                        |
| Không thể thêm công việc        | Kiểm tra các trường bắt buộc (\*) đã điền |
| Bảng không hiển thị đầy đủ      | Cuộn sang phải (trên mobile)              |
| Thống kê sai                    | Kiểm tra lại trạng thái các task          |

---

## 🔄 Luồng Công Việc Tiêu Chuẩn

```
┌─────────────────────────────────────────┐
│ 1. LỰA CHỌN SỰ KIỆN                     │
│    [Chọn sự kiện từ dropdown]           │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ 2. XEM THỐNG KÊ NHANH                   │
│    [Tổng tasks, To-do, In Progress,Done]│
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ 3. THÊM CÔNG VIỆC MỚI                   │
│    [+ Thêm công việc] → [Modal]         │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ 4. PHÂN CÔNG NHIỆM VỤ                   │
│    [Chọn người, deadline, mô tả]        │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ 5. QUẢN LÝ TRẠNG THÁI                   │
│    [Cập nhật status: To-do→In Prog→Done]│
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ 6. GIÁM SÁT TIẾN ĐỘ                    │
│    [Xem thống kê & cảnh báo quá hạn]    │
└─────────────────────────────────────────┘
```

---

## 📊 Ví Dụ Sử Dụng Thực Tế

### Scenario: Tổ Chức Hackathon

**1. Chọn sự kiện**: Hackathon 2026

**2. Xem thống kê**:

```
Tổng: 6 | To-do: 2 | In Progress: 2 | Done: 2
```

**3. Các công việc**:

- ✅ Setup Infrastructure & Server (Nguyễn Văn An) - 15/06/2026
- ⚙️ Design UI/UX Mockups (Lê Minh Chính) - 10/06/2026
- ⚙️ API Development (Trần Thị Bảo) - 20/06/2026
- 📋 Frontend Development (Đỗ Hoàng Em) - 25/06/2026
- ✅ Testing & QA (Phạm Thị Dung) - 01/07/2026
- ✅ Deployment & Launch (Nguyễn Văn An) - 05/07/2026

**4. Cập nhật tiến độ**:

```
Frontend Development: 📋 Chưa làm → ⚙️ Đang làm
```

**5. Xem thống kê mới**:

```
Tổng: 6 | To-do: 1 | In Progress: 3 | Done: 2
```

---

## 🚀 Tính Năng Nâng Cao (Tương Lai)

- 📌 **Attachment**: Thêm file/ảnh cho công việc
- 💬 **Comments**: Bình luận trên từng task
- 🔔 **Notifications**: Thông báo khi task được giao
- 📈 **Analytics**: Biểu đồ tiến độ theo thời gian
- 🔗 **Dependencies**: Liên kết công việc phụ thuộc
- 👥 **Team Assignment**: Phân công cho nhóm thay vì cá nhân

---

## ✅ Checklist Hoàn Thiện

Trước khi hoàn thành sự kiện, hãy kiểm tra:

- [ ] Tất cả công việc được tạo
- [ ] Mỗi công việc được phân công cho đúng người
- [ ] Deadline hợp lý và không quá hạn
- [ ] Tất cả công việc có mô tả chi tiết
- [ ] Tất cả công việc có trạng thái "✅ Hoàn thành"
- [ ] Thống kê hiển thị: Done = Tổng số công việc

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:

1. **Kiểm tra kết nối mạng**
2. **Làm mới trang** (F5)
3. **Xóa cache browser** (Ctrl+Shift+Delete)
4. **Đăng xuất và đăng nhập lại**
5. **Liên hệ Support Team**: support@hcmute.edu.vn

---

**Version**: 1.0 | **Last Updated**: May 19, 2026 | **Author**: Frontend Team
