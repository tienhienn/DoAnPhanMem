# Complete Event Approval Workflow

## System Overview

This document describes the complete event approval workflow from creation to final approval.

## Workflow Stages

### Stage 1: Event Creation (Ban Chủ Nhiệm - Club Leaders)
**Page**: `BCNManagementPage.jsx`
**Status**: `draft`

1. Club leader (Chủ nhiệm/Phó chủ nhiệm) creates event
2. Can save as draft or submit for approval
3. Event details:
   - Name, description, time, location
   - Quota, cost, event type, training points
   - Image URL

**Actions Available**:
- ✏️ Edit (only in draft status)
- 🗑️ Delete (only in draft status)
- 📤 Submit for Approval
- 👁️ View Details

**API Endpoints**:
- `POST /api/bcn/events` - Create event
- `PUT /api/bcn/events/{id}` - Update event
- `DELETE /api/bcn/events/{id}` - Delete event
- `PATCH /api/bcn/events/{id}/submit` - Submit for approval

---

### Stage 2: Faculty Approval (Cán bộ Khoa - Faculty Staff)
**Page**: `FacultyManagementPage.jsx`
**Status**: `cho_duyet_khoa` → `cho_duyet_ctsv` or `tu_choi`

1. Faculty staff reviews pending events
2. Can approve or reject with reason
3. Event details are read-only

**Statistics**:
- Cần duyệt (Pending): Events waiting for faculty approval
- Đã duyệt bảo trợ: Events approved by faculty, waiting for CTSV
- Hồ sơ bị từ chối: Events rejected by faculty

**Actions Available**:
- 👁️ View Details
- ✅ Approve (moves to CTSV approval)
- ❌ Reject (with reason, moves to rejected status)

**API Endpoints**:
- `GET /api/bcn/events?TrangThai=cho_duyet_khoa` - Get pending events
- `PATCH /api/bcn/events/{id}/approve-faculty` - Approve event
- `PATCH /api/bcn/events/{id}/reject` - Reject event

---

### Stage 3: CTSV Approval (Phòng CTSV - Student Affairs Office)
**Status**: `cho_duyet_ctsv` → `da_duyet` or `tu_choi`

*Note: CTSV approval page not yet implemented*

1. CTSV staff reviews events approved by faculty
2. Can approve or reject with reason
3. Final approval stage

**API Endpoints** (ready in backend):
- `PATCH /api/bcn/events/{id}/approve-ctsv` - Approve event
- `PATCH /api/bcn/events/{id}/reject` - Reject event

---

### Stage 4: Event Execution
**Status**: `da_duyet` → `sap_dien_ra` → `dang_dien_ra` → `da_ket_thuc`

1. Event is approved and ready to execute
2. Students can register for event
3. Event status updates based on time

---

## Status Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    EVENT APPROVAL WORKFLOW                      │
└─────────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │   DRAFT      │ (Ban Chủ Nhiệm creates)
                    └──────┬───────┘
                           │
                    ┌──────▼──────────┐
                    │ Submit for      │
                    │ Approval        │
                    └──────┬──────────┘
                           │
                    ┌──────▼──────────────────┐
                    │ CHO_DUYET_KHOA          │ (Faculty reviews)
                    │ (Pending Faculty)       │
                    └──────┬──────────────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
         ┌──────▼──────┐      ┌──────▼──────┐
         │ APPROVE     │      │ REJECT      │
         │ (Faculty)   │      │ (Faculty)   │
         └──────┬──────┘      └──────┬──────┘
                │                    │
         ┌──────▼──────────────┐     │
         │ CHO_DUYET_CTSV      │     │
         │ (Pending CTSV)      │     │
         └──────┬──────────────┘     │
                │                    │
         ┌──────┴──────┐             │
         │             │             │
    ┌────▼────┐   ┌────▼────┐       │
    │ APPROVE │   │ REJECT  │       │
    │ (CTSV)  │   │ (CTSV)  │       │
    └────┬────┘   └────┬────┘       │
         │             │            │
    ┌────▼─────────────▼────┐       │
    │ TU_CHO (Rejected)      │◄─────┘
    └────────────────────────┘
         │
    ┌────▼──────────────┐
    │ DA_DUYET          │
    │ (Approved)        │
    └────┬──────────────┘
         │
    ┌────▼──────────────┐
    │ SAP_DIEN_RA        │
    │ (Upcoming)         │
    └────┬──────────────┘
         │
    ┌────▼──────────────┐
    │ DANG_DIEN_RA       │
    │ (Ongoing)          │
    └────┬──────────────┘
         │
    ┌────▼──────────────┐
    │ DA_KET_THUC        │
    │ (Completed)        │
    └────────────────────┘
```

---

## Database Status Values

| Status | Vietnamese | Stage | Actor | Next Status |
|--------|-----------|-------|-------|------------|
| `draft` | Bản nháp | Creation | Ban Chủ Nhiệm | `cho_duyet_khoa` |
| `cho_duyet_khoa` | Chờ Khoa duyệt | Faculty Review | Cán bộ Khoa | `cho_duyet_ctsv` or `tu_choi` |
| `cho_duyet_ctsv` | Chờ CTSV duyệt | CTSV Review | Phòng CTSV | `da_duyet` or `tu_choi` |
| `da_duyet` | Đã cấp phép | Approved | - | `sap_dien_ra` |
| `tu_choi` | Bị từ chối | Rejected | - | `draft` (can resubmit) |
| `sap_dien_ra` | Sắp diễn ra | Upcoming | - | `dang_dien_ra` |
| `dang_dien_ra` | Đang diễn ra | Ongoing | - | `da_ket_thuc` |
| `da_ket_thuc` | Đã kết thúc | Completed | - | - |
| `huy` | Đã hủy | Cancelled | - | - |

---

## User Roles & Permissions

### Ban Chủ Nhiệm (Club Leaders)
- **Can**: Create, edit, delete, submit events
- **Cannot**: Approve events
- **Sees**: Only their club's events
- **Page**: `BCNManagementPage.jsx`

### Cán bộ Khoa (Faculty Staff)
- **Can**: Approve or reject events
- **Cannot**: Create or edit events
- **Sees**: All events pending faculty approval
- **Page**: `FacultyManagementPage.jsx`

### Phòng CTSV (Student Affairs Office)
- **Can**: Approve or reject events
- **Cannot**: Create or edit events
- **Sees**: All events pending CTSV approval
- **Page**: Not yet implemented

### Sinh viên (Students)
- **Can**: Register for approved events
- **Cannot**: Create or approve events
- **Sees**: Only approved events
- **Page**: Not yet implemented

---

## API Endpoints Summary

### Event Management (Ban Chủ Nhiệm)
```
POST   /api/bcn/events              - Create event
GET    /api/bcn/events              - Get club's events
GET    /api/bcn/events/:id          - Get event details
PUT    /api/bcn/events/:id          - Update event
DELETE /api/bcn/events/:id          - Delete event
PATCH  /api/bcn/events/:id/submit   - Submit for approval
```

### Faculty Approval (Cán bộ Khoa)
```
PATCH  /api/bcn/events/:id/approve-faculty  - Approve event
PATCH  /api/bcn/events/:id/reject           - Reject event
```

### CTSV Approval (Phòng CTSV)
```
PATCH  /api/bcn/events/:id/approve-ctsv     - Approve event
PATCH  /api/bcn/events/:id/reject           - Reject event
```

---

## Implementation Status

### ✅ Completed
- [x] Event creation & management (Ban Chủ Nhiệm)
- [x] Faculty approval page (Cán bộ Khoa)
- [x] API integration for all endpoints
- [x] Error handling & loading states
- [x] Database schema & relationships

### 🔄 In Progress
- [ ] CTSV approval page
- [ ] Student registration page
- [ ] Event execution status updates

### 📋 Planned
- [ ] Email notifications
- [ ] Event history/audit log
- [ ] Bulk operations
- [ ] Advanced filtering & search
- [ ] Export to CSV/PDF

---

## Key Features

### Ban Chủ Nhiệm Page
- ✅ Create events with full details
- ✅ Save as draft or submit for approval
- ✅ Edit draft/rejected events
- ✅ Delete draft events
- ✅ View event details with approval stepper
- ✅ Statistics dashboard
- ✅ Filter by status

### Faculty Approval Page
- ✅ View pending events
- ✅ Approve events (move to CTSV)
- ✅ Reject events with reason
- ✅ View event details (read-only)
- ✅ Approval stepper showing workflow
- ✅ Statistics dashboard
- ✅ All events summary

---

## Testing Checklist

- [ ] Create event as Ban Chủ Nhiệm
- [ ] Submit event for approval
- [ ] View pending event as Cán bộ Khoa
- [ ] Approve event
- [ ] Verify status changed to `cho_duyet_ctsv`
- [ ] Reject event with reason
- [ ] Verify status changed to `tu_choi`
- [ ] Verify rejection reason displays
- [ ] Test error handling
- [ ] Test loading states
- [ ] Verify statistics update correctly

---

## Notes

- All timestamps are stored in UTC and converted to Vietnam timezone (UTC+7) for display
- Event IDs (MaSK) are auto-generated with format `SK000000001`
- Club IDs (MaCLB) are used to filter events by club
- User ID (MaND) is extracted from JWT token
- All API calls require valid Bearer token
