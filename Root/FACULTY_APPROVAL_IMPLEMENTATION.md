# Faculty Approval Page Implementation (Cán bộ Khoa)

## Overview
Implemented full API integration for the Faculty Management Page (`FacultyManagementPage.jsx`). This page allows faculty staff (Cán bộ Khoa) to review and approve/reject club events that are pending faculty approval.

## What Was Implemented

### 1. **API Integration**
- **Replaced Mock Data**: Removed hardcoded `MOCK_EVENTS` and replaced with real API calls
- **Fetch Events on Mount**: Added `useEffect` hook to fetch events when component loads
- **Two API Calls**:
  - `GET /api/bcn/events?TrangThai=cho_duyet_khoa` - Fetch events pending faculty approval
  - `GET /api/bcn/events` - Fetch all events for summary statistics

### 2. **State Management**
```javascript
const [events, setEvents] = useState([]);           // Events pending faculty approval
const [allEvents, setAllEvents] = useState([]);     // All events for statistics
const [selectedEvent, setSelectedEvent] = useState(null);
const [isModalOpen, setIsModalOpen] = useState(false);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

### 3. **API Endpoints Used**

#### Fetch Events
```
GET /api/bcn/events?TrangThai=cho_duyet_khoa
Headers: Authorization: Bearer {token}
Response: { success: true, data: [...], total: number }
```

#### Approve Event
```
PATCH /api/bcn/events/{MaSK}/approve-faculty
Headers: Authorization: Bearer {token}
Body: {} (empty)
Response: { success: true, message: "Duyệt sự kiện từ Khoa thành công" }
```

#### Reject Event
```
PATCH /api/bcn/events/{MaSK}/reject
Headers: Authorization: Bearer {token}
Body: { LyDoTuChoi: "reason text" }
Response: { success: true, message: "Từ chối sự kiện thành công" }
```

### 4. **Database Status Mapping**
The page now uses actual database status values:
- `cho_duyet_khoa` - Pending faculty approval (displayed as "Chờ duyệt")
- `cho_duyet_ctsv` - Pending CTSV approval (displayed as "Chờ CTSV")
- `da_duyet` - Approved (displayed as "Đã duyệt")
- `tu_choi` - Rejected (displayed as "Bị từ chối")

### 5. **Key Features**

#### Statistics Cards
- **Cần duyệt (Pending)**: Count of events with status `cho_duyet_khoa`
- **Đã duyệt bảo trợ**: Count of events with status `cho_duyet_ctsv`
- **Hồ sơ bị từ chối**: Count of events with status `tu_choi`

#### Events Table
- Displays only events pending faculty approval (`cho_duyet_khoa`)
- Clickable rows to open approval modal
- Shows: Event name, start time, location, quota, points, status
- Only `cho_duyet_khoa` events are clickable

#### Approval Modal
- **Read-only display** of event details:
  - Event name, times, location, quota, points, event type, cost
  - Full description
  - Approval stepper showing current status in workflow
  - Previous rejection reason (if applicable)
- **Approval Notes**: Textarea for faculty to add notes
- **Two Actions**:
  - **Phê duyệt bảo trợ** (Approve): Moves event to `cho_duyet_ctsv` status
  - **Từ chối** (Reject): Moves event to `tu_choi` status with reason

#### All Events Summary
- Grid view of all events from all statuses
- Color-coded by status
- Shows event name, club, and date

### 6. **Error Handling**
- Try-catch blocks on all API calls
- User-friendly error messages displayed in UI
- Loading states during API operations
- Disabled buttons during loading

### 7. **User Experience Improvements**
- Loading indicator while fetching data
- Error banner if data fetch fails
- Success alerts after approve/reject actions
- Auto-refresh of event list after actions
- Disabled modal buttons during processing

## Database Fields Used

From `SU_KIEN` table:
- `MaSK` - Event ID
- `TenSK` - Event name
- `MoTa` - Description
- `ThoiGianBatDau` - Start time
- `ThoiGianKetThuc` - End time
- `DiaDiem` - Location
- `SoNguoiToiDa` - Max participants
- `ChiPhiDuKien` - Estimated cost
- `LoaiSK` - Event type
- `DiemRenLuyen` - Training points
- `TrangThai` - Status
- `LyDoTuChoi` - Rejection reason
- `MaCLB` - Club ID

## API Response Format

### Events List Response
```json
{
  "success": true,
  "data": [
    {
      "MaSK": "SK000000001",
      "MaCLB": "CLB00000001",
      "TenSK": "Hackathon Innovation 2026",
      "MoTa": "Description...",
      "ThoiGianBatDau": "2026-05-20T08:00:00.000Z",
      "ThoiGianKetThuc": "2026-05-21T17:00:00.000Z",
      "DiaDiem": "Sân vận động trường",
      "SoNguoiToiDa": 200,
      "ChiPhiDuKien": 5000000,
      "LoaiSK": "Cuộc thi",
      "TrangThai": "cho_duyet_khoa",
      "UrlAnh": "https://...",
      "DiemRenLuyen": 3,
      "LyDoTuChoi": null,
      "NgayTao": "2026-05-10T10:30:00.000Z"
    }
  ],
  "total": 1
}
```

## Testing Checklist

- [ ] Backend running on `http://localhost:3000`
- [ ] Frontend running on `http://localhost:5173`
- [ ] User logged in with faculty role
- [ ] Events with status `cho_duyet_khoa` display in table
- [ ] Click event row opens approval modal
- [ ] Modal shows all event details correctly
- [ ] Approval stepper shows correct status
- [ ] Approve button changes status to `cho_duyet_ctsv`
- [ ] Reject button requires reason and changes status to `tu_choi`
- [ ] Statistics update after approve/reject
- [ ] Error handling works for failed API calls
- [ ] Loading states display correctly

## Files Modified

1. **`frontend-web/src/pages/BanChuNhiem/FacultyManagementPage.jsx`**
   - Removed mock data
   - Added API integration
   - Implemented `fetchEvents()` function
   - Implemented `handleApprove()` function
   - Implemented `handleReject()` function
   - Updated component to use real database field names
   - Added error handling and loading states

## Backend Endpoints (Already Implemented)

All endpoints are already implemented in `backend/controllers/bcnEventController.js`:
- `GET /api/bcn/events` - Get events (with optional TrangThai filter)
- `PATCH /api/bcn/events/:id/approve-faculty` - Approve event
- `PATCH /api/bcn/events/:id/reject` - Reject event

## Next Steps (Optional Enhancements)

1. Add pagination for large event lists
2. Add search/filter by event name or club
3. Add export to CSV functionality
4. Add event history/audit log
5. Add bulk approve/reject functionality
6. Add email notifications to club leaders
7. Add approval deadline tracking
