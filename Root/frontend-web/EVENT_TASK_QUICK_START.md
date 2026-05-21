# 🚀 EventTaskManagement - Quick Start Guide

## ⚡ 5 Phút Để Bắt Đầu

### 1️⃣ Truy Cập Trang (1 phút)

**Option A - Desktop Browser**

```
1. Mở: http://localhost:5173
2. Login: quan.nt@ute.udn.vn
3. Password: password
4. Click: 📋 Phân công nhiệm vụ (navbar)
```

**Option B - Direct URL**

```
http://localhost:5173/event-tasks/1
```

### 2️⃣ Khám Phá Giao Diện (1 phút)

**Bạn sẽ thấy**:

```
┌─────────────────────────────────────────────┐
│ 📋 Triển khai & Phân công nhiệm vụ        │
│ [Dropdown: Hackathon 2026▼] [+ Thêm việc] │
├─────────────────────────────────────────────┤
│  [Tổng:6]  [To-do:2]  [In Prog:2] [Done:2]│
├─────────────────────────────────────────────┤
│ Tên công việc | Người phụ trách | Deadline │
│ ─────────────────────────────────────────── │
│ Setup Server  | 👨‍💼 Nguyễn Văn An | 15/06/2026│
│ Design UI     | 👨‍🎨 Lê Minh Chính | 10/06/2026│
│ ...           | ...              | ...     │
└─────────────────────────────────────────────┘
```

### 3️⃣ Thêm Công Việc (2 phút)

**Bước 1**: Click nút `+ Thêm công việc` (góc trên phải)

**Bước 2**: Modal hiển thị

```
┌─────────────────────────────────┐
│ Thêm công việc mới          ╳  │
├─────────────────────────────────┤
│ Tên công việc *                 │
│ [_________________________]      │
│                                 │
│ Phân công cho ai *              │
│ [-- Chọn thành viên --▼]       │
│                                 │
│ Hạn chót *                      │
│ [_________________________]      │
│                                 │
│ Mô tả chi tiết                  │
│ [_________________________]      │
│                                 │
│ [Hủy]     [Thêm công việc]     │
└─────────────────────────────────┘
```

**Bước 3**: Điền thông tin

```
Tên công việc:    Soạn bài giới thiệu sự kiện
Phân công cho ai: Trần Thị Bảo (Developer)
Hạn chót:         2026-06-18 14:00
Mô tả:            Viết nội dung PR, kiểm tra từng từ
```

**Bước 4**: Click `Thêm công việc`

✅ Task mới xuất hiện ở bảng!

### 4️⃣ Quản Lý Tasks (1 phút)

**Thay Đổi Trạng Thái**:

```
Trước: 📋 Chưa làm
Click: ⬇️ Dropdown
Chọn: ⚙️ Đang làm
Sau:  ⚙️ Đang làm ✅
```

**Xóa Task**:

```
Click: ❌ (cột Hành động)
Done! Task xóa khỏi bảng
```

---

## 📊 Dashboard Overview

### Statistics Cards

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ 🔵 Tổng  │  │ ⏱️ To-do │  │ ⚙️ In Pr.│  │ ✅ Done  │
│    6     │  │    2     │  │    2     │  │    2     │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

- **Cập nhật Real-time**: Khi bạn thêm/xóa/update task
- **Tự động Tính toán**: Không cần refresh

### Task Table Columns

| Cột       | Nội dung            | Ví dụ                         |
| --------- | ------------------- | ----------------------------- |
| 📝 Tên    | Tiêu đề + mô tả     | Setup Infrastructure & Server |
| 👤 Người  | Avatar + Tên + Role | 👨‍💼 Nguyễn Văn An (Leader)     |
| 📅 Hạn    | Ngày deadline       | 15/06/2026                    |
| 🏷️ Status | Dropdown select     | ⚙️ Đang làm                   |
| 🗑️ Action | Delete button       | ❌                            |

---

## 🎯 Common Tasks

### Scenario 1: Phân Công Công Việc Mới

```
1. Click + Thêm công việc
2. Nhập: "Code API payment module"
3. Chọn: Trần Thị Bảo (Developer)
4. Deadline: 2026-06-25
5. Mô tả: "Integrate Stripe API"
6. Click Thêm công việc ✅
```

### Scenario 2: Cập Nhật Tiến Độ

```
1. Người làm gọi bạn: "Tôi đang làm phần authentication"
2. Tìm task: "Authentication System"
3. Click dropdown Status: ⚙️ Đang làm
4. Auto-update dashboard ✅
```

### Scenario 3: Task Hoàn Thành

```
1. Nhậu thông báo: "Mình hoàn thành Design UI rồi"
2. Tìm task: "Design UI/UX Mockups"
3. Click Status: ✅ Hoàn thành
4. Stats update: Done: 2 → Done: 3 ✅
```

### Scenario 4: Xóa Task Nhầm

```
1. Bạn tạo task nhầm: "Test task"
2. Bạn hối hận, click ❌
3. Xóa ngay, không cần confirm ✅
```

---

## 🎨 Visual Guide

### Màu Status

```
📋 Chưa làm    = Xám     (bg-gray-100)
⚙️ Đang làm    = Vàng    (bg-yellow-100)
✅ Hoàn thành  = Xanh    (bg-green-100)
```

### Hover Effects

```
Khi hover vào row → Row sáng lên (bg-slate-50)
Khi hover vào button → Button đậm hơn
Khi click button → Button co lại chút (active state)
```

### Responsive Layout

```
📱 Mobile (< 640px)
├─ Cards: 1 cột
├─ Table: Scroll ngang
└─ Modal: Full width -20px

💻 Tablet (640px - 1024px)
├─ Cards: 2 cột
├─ Table: Scroll ngang
└─ Modal: 80% width

🖥️ Desktop (> 1024px)
├─ Cards: 4 cột
├─ Table: Full width
└─ Modal: 500px width
```

---

## 🎓 Tips & Tricks

### ⚡ Pro Tips

1. **Batch Update Status**

   ```
   Thay vì click từng cái,
   thay đổi status liên tiếp
   → nhanh hơn 3x lần
   ```

2. **Organize by Deadline**

   ```
   Thêm công việc theo deadline
   → dễ track tiến độ
   ```

3. **Clear Descriptions**

   ```
   Mô tả rõ ràng
   → team hiểu nhanh
   → ít miscommunication
   ```

4. **Regular Updates**
   ```
   Update status hàng ngày
   → dashboard luôn chuẩn xác
   ```

### 🐛 Troubleshooting

| Problem         | Solution                  |
| --------------- | ------------------------- |
| Modal không mở  | Click nút lại hoặc F5     |
| Dropdown empty  | Refresh trang (F5)        |
| Task không thêm | Kiểm tra fields marked \* |
| Stats sai       | Update status các task    |

---

## 📞 Key Contacts

**Status Page**: http://localhost:5173/event-tasks/1

**Test Account**:

- Email: `quan.nt@ute.udn.vn`
- Password: `password`
- Role: Ban Chủ Nhiệm CLB (BCN)

**Documentation**:

- User Guide: `EVENT_TASK_GUIDE.md`
- Technical: `EVENT_TASK_TECHNICAL.md`
- Implementation: `EVENT_TASK_IMPLEMENTATION.md`

---

## ✅ Checklist Trước Khi Deploy

```
□ Tested on desktop browser
□ Tested on mobile/tablet
□ Add/update/delete tasks working
□ Statistics updating correctly
□ Modal opening/closing smooth
□ No console errors (F12)
□ All links working
□ Responsive layout good
□ Performance acceptable
□ Ready for production!
```

---

## 🚀 Next Steps

1. **Thử Test** ← You are here!
2. Tìm bugs/issues
3. Feedback to dev team
4. Deploy to production
5. Communicate to team
6. Monitor usage

---

## 🎉 You're Ready!

```
Start adding tasks now!
Enjoy the premium UI!
Save time managing your events!
```

**Happy Task Managing! 🚀**

---

**Version**: 1.0 | **Last Updated**: May 19, 2026
