# Testing Faculty Approval Page

## Prerequisites
- Backend running: `http://localhost:3000`
- Frontend running: `http://localhost:5173`
- User logged in with faculty role (Cán bộ Khoa)
- At least one event with status `cho_duyet_khoa` in database

## Test Scenarios

### Scenario 1: View Pending Events
1. Navigate to Faculty Management page
2. **Expected**: 
   - Statistics cards show correct counts
   - Table displays events with status `cho_duyet_khoa`
   - Events are sorted by creation date (newest first)

### Scenario 2: View Event Details
1. Click on any event row in the table
2. **Expected**:
   - Approval modal opens
   - All event details display correctly:
     - Event name, times, location
     - Quota, points, event type, cost
     - Full description
     - Approval stepper shows current status
   - Modal is read-only (no edit fields)

### Scenario 3: Approve Event
1. Open event details modal
2. Click "Phê duyệt bảo trợ" button
3. **Expected**:
   - Button shows loading state
   - API call to `/api/bcn/events/{MaSK}/approve-faculty`
   - Success alert appears
   - Modal closes
   - Event list refreshes
   - Event no longer appears in pending list
   - Statistics update (pending count decreases, approved count increases)

### Scenario 4: Reject Event
1. Open event details modal
2. Enter rejection reason in notes field
3. Click "Từ chối" button
4. **Expected**:
   - Button shows loading state
   - API call to `/api/bcn/events/{MaSK}/reject` with reason
   - Success alert appears
   - Modal closes
   - Event list refreshes
   - Event no longer appears in pending list
   - Statistics update (pending count decreases, rejected count increases)

### Scenario 5: Reject Without Reason
1. Open event details modal
2. Leave notes field empty
3. Click "Từ chối" button
4. **Expected**:
   - Alert: "Vui lòng nhập lý do từ chối"
   - Modal stays open
   - No API call made

### Scenario 6: View All Events Summary
1. Scroll to "Tất cả sự kiện" section
2. **Expected**:
   - Grid shows all events from all statuses
   - Events color-coded by status:
     - Amber: `cho_duyet_khoa` (pending faculty)
     - Blue: `cho_duyet_ctsv` (pending CTSV)
     - Green: `da_duyet` (approved)
     - Red: `tu_choi` (rejected)
   - Each card shows event name, club, and date

### Scenario 7: Error Handling
1. Disconnect network or stop backend
2. Try to load page or perform action
3. **Expected**:
   - Error banner displays with message
   - Loading state clears
   - User can retry

## Database Test Data

To create test events, run this SQL:

```sql
-- Create test event in cho_duyet_khoa status
INSERT INTO SU_KIEN (
  MaSK, MaCLB, TenSK, MoTa, ThoiGianBatDau, ThoiGianKetThuc,
  DiaDiem, SoNguoiToiDa, ChiPhiDuKien, LoaiSK, TrangThai,
  UrlAnh, DiemRenLuyen, NgayTao
) VALUES (
  'SK000000001', 'CLB00000001', 'Test Event for Faculty Approval',
  'This is a test event for faculty approval workflow',
  '2026-06-01 09:00:00', '2026-06-01 11:00:00',
  'Room A101', 100, 1000000, 'Workshop', 'cho_duyet_khoa',
  NULL, 3, GETDATE()
);
```

## API Endpoints Being Called

### 1. Fetch Pending Events
```
GET /api/bcn/events?TrangThai=cho_duyet_khoa
Authorization: Bearer {token}
```

### 2. Fetch All Events
```
GET /api/bcn/events
Authorization: Bearer {token}
```

### 3. Approve Event
```
PATCH /api/bcn/events/{MaSK}/approve-faculty
Authorization: Bearer {token}
Body: {}
```

### 4. Reject Event
```
PATCH /api/bcn/events/{MaSK}/reject
Authorization: Bearer {token}
Body: { "LyDoTuChoi": "reason text" }
```

## Expected API Responses

### Success Response (Approve)
```json
{
  "success": true,
  "message": "Duyệt sự kiện từ Khoa thành công"
}
```

### Success Response (Reject)
```json
{
  "success": true,
  "message": "Từ chối sự kiện thành công"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Sự kiện không ở trạng thái chờ duyệt khoa"
  }
}
```

## Browser Console Checks

1. Open DevTools (F12)
2. Go to Network tab
3. Perform actions and verify:
   - API calls are made with correct endpoints
   - Authorization header is present
   - Response status is 200 for success
   - Response body contains expected data

## Common Issues & Solutions

### Issue: "Không thể tải danh sách sự kiện"
- **Cause**: Backend not running or API URL incorrect
- **Solution**: 
  - Check backend is running on port 3000
  - Verify `VITE_API_URL` in `.env` file
  - Check browser console for network errors

### Issue: Events not showing in table
- **Cause**: No events with status `cho_duyet_khoa` in database
- **Solution**: 
  - Create test event with correct status
  - Check user has permission to view events
  - Verify user is logged in

### Issue: Approve/Reject button not working
- **Cause**: Token expired or API error
- **Solution**:
  - Log out and log back in
  - Check browser console for error details
  - Verify backend is running

### Issue: Modal shows old data after action
- **Cause**: Event list not refreshing
- **Solution**:
  - Check `fetchEvents()` is called after action
  - Verify API response is successful
  - Check browser console for errors

## Performance Notes

- Events are fetched on component mount
- All events are fetched for statistics (consider pagination for large datasets)
- Modal is read-only (no additional API calls needed)
- Loading states prevent duplicate submissions

## Accessibility

- Modal has proper focus management
- Buttons have clear labels
- Error messages are visible and descriptive
- Keyboard navigation supported
