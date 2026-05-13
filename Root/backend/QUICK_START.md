# 🚀 Quick Start Guide - Admin Event Management API

## ⚡ 5 Phút để Chạy Ứng Dụng

### Step 1: Chuẩn Bị Database (1 min)

Mở SQL Server Management Studio và chạy:

```sql
USE QUANLYCLB_UTE;
GO

-- Thêm 2 cột vào bảng SU_KIEN
ALTER TABLE SU_KIEN
ADD DiemRenLuyen FLOAT DEFAULT 0;

ALTER TABLE SU_KIEN
ADD LyDoTuChoi NVARCHAR(MAX) NULL;
GO

-- Kiểm tra
SELECT * FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'SU_KIEN'
ORDER BY ORDINAL_POSITION;
GO
```

### Step 2: Cài Đặt Dependencies (2 min)

```bash
cd backend
npm install
```

### Step 3: Cấu Hình Environment (1 min)

Tạo file `.env`:

```bash
cp .env.example .env
```

Cập nhật thông tin database trong `.env`:

```env
DB_SERVER=localhost
DB_NAME=QUANLYCLB_UTE
DB_USER=sa
DB_PASSWORD=SA@123456
PORT=3000
```

### Step 4: Chạy Server (1 min)

**Development:**

```bash
npm run dev
```

**Production:**

```bash
npm start
```

Server sẽ chạy tại: `http://localhost:3000`

---

## 🧪 Test Nhanh Endpoints

### 1. Health Check

```bash
curl http://localhost:3000/api/health
```

**Response:**

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-05-13T10:00:00.000Z"
}
```

### 2. Tạo Token

#### Token cho BCN (Ban chủ nhiệm CLB):

```bash
# Format: base64(userId:role:clubId)
# userId: SV210000001, role: BCN, clubId: CLB00000001

# Linux/Mac
TOKEN=$(echo -n "SV210000001:BCN:CLB00000001" | base64)
echo $TOKEN

# Windows PowerShell
$token = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes("SV210000001:BCN:CLB00000001"))
$token
```

#### Token cho KHOA:

```bash
# userId: CB000000001, role: KHOA, clubId: null
TOKEN=$(echo -n "CB000000001:KHOA:null" | base64)
```

#### Token cho CTSV:

```bash
# userId: CB000000002, role: CTSV, clubId: null
TOKEN=$(echo -n "CB000000002:CTSV:null" | base64)
```

### 3. Tạo Sự Kiện (BCN)

```bash
TOKEN="U0MyMTAwMDAwMDE6QkNOOkNMQjAwMDAwMDAxIgo="

curl -X POST http://localhost:3000/api/admin/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Workshop: Nhập môn ReactJS",
    "description": "Workshop thực hành",
    "startTime": "2026-06-10T08:00:00Z",
    "endTime": "2026-06-10T11:30:00Z",
    "location": "Phòng Lab 201",
    "quota": 40,
    "points": 1.5,
    "costEstimate": 0,
    "eventType": "Workshop"
  }'
```

### 4. Xem Danh Sách Sự Kiện

```bash
TOKEN="U0MyMTAwMDAwMDE6QkNOOkNMQjAwMDAwMDAxIgo="

curl -X GET "http://localhost:3000/api/admin/events?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Duyệt Sự Kiện (KHOA)

```bash
TOKEN="Q0IwMDAwMDAwMDE6S0hPQTpudWxsIgo="

curl -X PATCH http://localhost:3000/api/admin/events/SK260000001/review \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved"
  }'
```

---

## 📝 Sử Dụng Postman

### Import Collection

1. Mở Postman
2. Click **Import** → **Upload Files**
3. Chọn file `postman_collection.json`
4. Các requests sẽ được tự động import

### Cấu Hình Environment

1. Click **Environments** → **Create**
2. Tạo biến: `base_url = http://localhost:3000`
3. Tạo biến: `token = <token-của-bạn>`
4. Sử dụng trong requests: `{{base_url}}/api/admin/events`

---

## 🔑 Access Tokens cho Test

Sao chép các token này vào requests:

### BCN (Ban chủ nhiệm CLB)

```
U0MyMTAwMDAwMDE6QkNOOkNMQjAwMDAwMDAxIgo=
```

### KHOA (Khoa)

```
Q0IwMDAwMDAwMDE6S0hPQTpudWxsIgo=
```

### CTSV (Phòng Công tác Sinh viên)

```
Q0IwMDAwMDAwMDI6Q1RTVJBOV3VsbCIgo=
```

### ADMIN

```
QURNSVIwMDAwMDAwMDpBRE1JTjpudWxsIgo=
```

---

## 📚 Tài Liệu Đầy Đủ

Xem chi tiết tại: `API_DOCUMENTATION.md`

---

## 🐛 Troubleshooting

### Error: Connection timeout

**Nguyên nhân:** Không kết nối được database

**Giải pháp:**

1. Kiểm tra SQL Server đang chạy
2. Kiểm tra thông tin DB trong `.env`
3. Test kết nối: `ping <DB_SERVER>`

### Error: Module not found

**Nguyên nhân:** Chưa cài dependencies

**Giải pháp:**

```bash
npm install
```

### Error: 401 Unauthorized

**Nguyên nhân:** Token không hợp lệ

**Giải pháp:**

1. Kiểm tra token format: `base64(userId:role:clubId)`
2. Kiểm tra header: `Authorization: Bearer {token}`

### Error: 403 Forbidden

**Nguyên nhân:** Role không có quyền

**Giải pháp:**

1. Kiểm tra role trong token
2. Xem danh sách role cho phép của endpoint
3. Dùng token với role đúng

---

## 📊 Database Schema

**Bảng SU_KIEN** (sau khi ALTER):

| Cột              | Type              | Ghi Chú                                  |
| ---------------- | ----------------- | ---------------------------------------- |
| MaSK             | CHAR(13)          | Primary Key                              |
| MaCLB            | CHAR(13)          | Foreign Key → CAULACBO                   |
| TenSK            | NVARCHAR(150)     | Tên sự kiện                              |
| MoTa             | NVARCHAR(MAX)     | Mô tả chi tiết                           |
| ThoiGianBatDau   | DATETIME          | Thời gian bắt đầu                        |
| ThoiGianKetThuc  | DATETIME          | Thời gian kết thúc                       |
| DiaDiem          | NVARCHAR(200)     | Địa điểm tổ chức                         |
| SoNguoiToiDa     | INT               | Số người tối đa                          |
| ChiPhiDuKien     | DECIMAL(18,2)     | Chi phí dự kiến                          |
| LoaiSK           | NVARCHAR(50)      | Loại sự kiện                             |
| **DiemRenLuyen** | **FLOAT**         | **Điểm rèn luyện** _(NEW)_               |
| TrangThai        | NVARCHAR(50)      | Trạng thái (draft, pending_faculty, ...) |
| **LyDoTuChoi**   | **NVARCHAR(MAX)** | **Lý do từ chối** _(NEW)_                |
| NgayTao          | DATETIME          | Ngày tạo                                 |

---

## 🎯 Workflow Ví Dụ

### Scenario: Ban chủ nhiệm CLB tạo và gửi duyệt sự kiện

**1. Tạo sự kiện (trạng thái: draft)**

```bash
TOKEN="U0MyMTAwMDAwMDE6QkNOOkNMQjAwMDAwMDAxIgo="

curl -X POST http://localhost:3000/api/admin/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hackathon UTE 2026",
    "startTime": "2026-06-20T07:00:00Z",
    "endTime": "2026-06-21T07:00:00Z",
    "location": "Hội trường A",
    "quota": 60,
    "points": 3.0,
    "eventType": "Cuộc thi"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "eventId": "SK260000001",
    "event": {
      "MaSK": "SK260000001",
      "TrangThai": "draft"
    }
  }
}
```

**2. Xem sự kiện vừa tạo**

```bash
curl -X GET http://localhost:3000/api/admin/events/SK260000001 \
  -H "Authorization: Bearer $TOKEN"
```

**3. Sửa nếu cần**

```bash
curl -X PUT http://localhost:3000/api/admin/events/SK260000001 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hackathon UTE 2026 - Updated",
    "startTime": "2026-06-20T08:00:00Z",
    "endTime": "2026-06-21T08:00:00Z",
    "location": "Hội trường A",
    "quota": 70,
    "points": 3.5,
    "eventType": "Cuộc thi"
  }'
```

**4. Khoa duyệt (KHOA)**

```bash
KHOA_TOKEN="Q0IwMDAwMDAwMDE6S0hPQTpudWxsIgo="

curl -X PATCH http://localhost:3000/api/admin/events/SK260000001/review \
  -H "Authorization: Bearer $KHOA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved"
  }'
```

✅ **Sự kiện đã được phê chuẩn!**

---

## 💡 Tips

- 💾 Luôn backup database trước khi chạy ALTER TABLE
- 🔐 Dùng environment variables cho production
- 📝 Log request/response cho debugging
- 🧪 Test với Postman trước khi integrate frontend
- 🚀 Dùng PM2 để run server ở production

---

## 📞 Support

Nếu gặp vấn đề:

1. Xem `API_DOCUMENTATION.md`
2. Check logs: `console.log` output
3. Verify database connection
4. Kiểm tra SQL Server service đang chạy

---

**Happy Coding! 🎉**
