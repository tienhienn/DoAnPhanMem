# 🔧 Tài Liệu Kỹ Thuật: MemberManagementPage

**Target Audience**: Frontend Developers | **Language**: React.js | **Styling**: Tailwind CSS

---

## 📋 Mục Lục

1. [Overview](#overview)
2. [Component Structure](#component-structure)
3. [State Management](#state-management)
4. [Key Functions](#key-functions)
5. [Mock Data](#mock-data)
6. [Styling & Responsive](#styling--responsive)
7. [Error Handling](#error-handling)
8. [Performance Optimization](#performance-optimization)
9. [Browser Compatibility](#browser-compatibility)
10. [Testing Guide](#testing-guide)

---

## Overview

### Purpose

Complete member management system for club leadership (BCN). Handle CRUD operations, role management, approval workflow for new members.

### Tech Stack

- **Frontend**: React.js 18+
- **Styling**: Tailwind CSS v3+
- **Icons**: Lucide React
- **State**: React Hooks (useState)
- **Storage**: localStorage + Backend API (mock)

### File Location

```
src/pages/BanChuNhiem/MemberManagementPage.jsx
```

---

## Component Structure

```
MemberManagementPage
├─ Header
│  ├─ Title (👥 Quản lý nhân sự)
│  ├─ Button: Add Member
│  └─ Button: Export List
├─ Tabs (Pills)
│  ├─ Tab: Official (Chính thức)
│  ├─ Tab: Leadership (Ban chủ nhiệm)
│  ├─ Tab: Pending (Đơn xin)
│  └─ Tab: Inactive (Đã rời)
├─ Search Bar
│  └─ Input: Search by name/MSSV
├─ Member Table
│  ├─ Header Row
│  └─ Data Rows
├─ Modal: Add Member
│  ├─ Input: Name
│  ├─ Input: MSSV
│  ├─ Select: Role
│  └─ Buttons: Cancel/Submit
├─ Modal: Edit Role
│  ├─ Display: Member Info
│  ├─ Select: New Role
│  └─ Buttons: Cancel/Update
└─ Modals: Confirmations
   ├─ Confirm Delete
   └─ Confirm Reject
```

---

## State Management

### State Variables

```javascript
// Active tab: 'official' | 'leadership' | 'pending' | 'inactive'
const [activeTab, setActiveTab] = useState("official");

// All members organized by category
const [members, setMembers] = useState(allMembers);

// Search query string
const [searchQuery, setSearchQuery] = useState("");

// Member being edited
const [selectedMember, setSelectedMember] = useState(null);

// New role for editing
const [newRole, setNewRole] = useState("");

// Modal visibility
const [showAddModal, setShowAddModal] = useState(false);
const [showEditModal, setShowEditModal] = useState(false);
const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
const [showRejectConfirm, setShowRejectConfirm] = useState(null);

// Form data for adding member
const [formData, setFormData] = useState({
  name: "",
  mssv: "",
  role: "",
});
```

### State Flow

```
User Action
    ↓
Event Handler (onClick)
    ↓
setState()
    ↓
Re-render Component
    ↓
Display Updated UI
```

---

## Key Functions

### 1. Tab Management

```javascript
function handleTabChange(tab) {
  setActiveTab(tab);
  setSearchQuery(""); // Reset search when changing tab
}
```

**Usage**: Click tab → Switch view → Update activeTab state

### 2. Search & Filter

```javascript
function getFilteredMembers() {
  const tabMembers = members[activeTab] || [];
  return tabMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.mssv.includes(searchQuery),
  );
}
```

**Features**:

- Real-time filtering
- Search by name or MSSV
- Case-insensitive
- Empty query returns all

### 3. Add Member

```javascript
function handleAddMember() {
  if (!formData.name || !formData.mssv || !formData.role) {
    alert("Vui lòng điền đầy đủ thông tin");
    return;
  }

  const newMember = {
    id: `mem_${Date.now()}`,
    name: formData.name,
    mssv: formData.mssv,
    role: formData.role,
    joinDate: new Date().toLocaleDateString("vi-VN"),
    contribution: Math.floor(Math.random() * 100),
    avatar: `https://i.pravatar.cc/150?u=${formData.mssv}`,
  };

  setMembers((prev) => ({
    ...prev,
    official: [...prev.official, newMember],
  }));

  setFormData({ name: "", mssv: "", role: "" });
  setShowAddModal(false);
  alert("Thêm thành viên thành công!");
}
```

**Validation**:

- ✅ All fields required
- ✅ MSSV format check (optional)
- ✅ Duplicate MSSV check (optional)

### 4. Edit Member Role

```javascript
function handleSaveEdit() {
  if (!newRole) {
    alert("Vui lòng chọn chức vụ mới");
    return;
  }

  setMembers((prev) => ({
    ...prev,
    [activeTab]: prev[activeTab].map((m) =>
      m.id === selectedMember.id ? { ...m, role: newRole } : m,
    ),
  }));

  setSelectedMember(null);
  setNewRole("");
  setShowEditModal(false);
  alert("Cập nhật chức vụ thành công!");
}
```

**Process**:

1. Select member → Edit modal opens
2. Choose new role from dropdown
3. Click Update → State changes
4. Modal closes, table updates

### 5. Delete Member

```javascript
function handleDeleteMember(memberId) {
  setMembers((prev) => ({
    ...prev,
    [activeTab]: prev[activeTab].filter((m) => m.id !== memberId),
  }));
  setShowDeleteConfirm(null);
  alert("Xóa thành viên thành công!");
}
```

### 6. Approve/Reject Request

```javascript
function handleApproveMember(memberId) {
  const member = members.pending.find((m) => m.id === memberId);
  if (!member) return;

  setMembers((prev) => ({
    ...prev,
    pending: prev.pending.filter((m) => m.id !== memberId),
    official: [...prev.official, member],
  }));
  alert("Duyệt thành viên thành công!");
}

function handleRejectMember(memberId) {
  setMembers((prev) => ({
    ...prev,
    pending: prev.pending.filter((m) => m.id !== memberId),
  }));
  setShowRejectConfirm(null);
  alert("Từ chối đơn thành công!");
}
```

### 7. Date Formatting

```javascript
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
```

**Output**: "2024-05-15" → "15/05/2024"

---

## Mock Data

### Data Structure

```javascript
const allMembers = {
  official: [
    {
      id: "mem_001",
      name: "Nguyễn Văn An",
      mssv: "2021001",
      role: "Thành viên",
      joinDate: "15/01/2024",
      contribution: 85,
      avatar: "https://i.pravatar.cc/150?u=2021001",
    },
    // ... more members
  ],
  leadership: [
    /* ... */
  ],
  pending: [
    /* ... */
  ],
  inactive: [
    /* ... */
  ],
};
```

### Member Object

| Field        | Type   | Example         | Required |
| ------------ | ------ | --------------- | -------- |
| id           | string | "mem_001"       | ✅       |
| name         | string | "Nguyễn Văn An" | ✅       |
| mssv         | string | "2021001"       | ✅       |
| role         | string | "Thành viên"    | ✅       |
| joinDate     | string | "15/01/2024"    | ✅       |
| contribution | number | 85              | ✅       |
| avatar       | string | URL             | ✅       |

### Sample Members

**Official Members** (3):

```javascript
{
  id: 'mem_001',
  name: 'Nguyễn Văn An',
  mssv: '2021001',
  role: 'Thành viên',
  joinDate: '15/01/2024',
  contribution: 85,
  avatar: 'https://i.pravatar.cc/150?u=2021001'
}
```

**Leadership** (3):

```javascript
{
  id: 'mem_007',
  name: 'Phạm Thị Dung',
  mssv: '2020001',
  role: 'Chủ nhiệm CLB',
  joinDate: '01/09/2023',
  contribution: 98,
  avatar: 'https://i.pravatar.cc/150?u=2020001'
}
```

---

## Styling & Responsive

### Color Palette (Teal Theme)

```css
/* Primary Colors */
--primary-teal: #0d9488; /* teal-600 */
--light-teal: #99f6e4; /* teal-200 */
--bg-teal: #f0fdfa; /* teal-50 */

/* Neutral */
--white: #ffffff;
--slate-100: #f1f5f9;
--slate-500: #64748b;
--slate-900: #1e293b;

/* Status */
--green-600: #10b981; /* Success */
--red-600: #ef4444; /* Danger */
--amber-600: #d97706; /* Warning */
```

### Key Components

#### Header

```jsx
<header className="bg-white border-b border-slate-100 sticky top-0 z-40">
  <div className="max-w-7xl mx-auto px-4 py-6">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-slate-900">
        👥 Quản lý nhân sự Câu lạc bộ
      </h1>
      <div className="flex gap-3">
        <button className="bg-teal-600 text-white px-4 py-2 rounded-lg">
          + Thêm thành viên
        </button>
        <button className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg">
          Xuất danh sách
        </button>
      </div>
    </div>
  </div>
</header>
```

#### Tab Navigation (Pills)

```jsx
<div className="flex gap-2 mb-6 overflow-x-auto pb-2">
  {["official", "leadership", "pending", "inactive"].map((tab) => (
    <button
      key={tab}
      onClick={() => handleTabChange(tab)}
      className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition ${
        activeTab === tab
          ? "bg-teal-600 text-white"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      {tabLabels[tab]}
    </button>
  ))}
</div>
```

#### Search Bar

```jsx
<div className="mb-6">
  <input
    type="text"
    placeholder="🔍 Tìm kiếm theo tên hoặc MSSV..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
  />
</div>
```

#### Member Table

```jsx
<div className="overflow-x-auto">
  <table className="w-full text-left text-sm">
    <thead className="border-b border-slate-200 bg-slate-50">
      <tr>
        <th className="px-4 py-3 font-semibold text-slate-900">Họ và tên</th>
        <th className="px-4 py-3 font-semibold text-slate-900">MSSV</th>
        <th className="px-4 py-3 font-semibold text-slate-900">Vai trò</th>
        <th className="px-4 py-3 font-semibold text-slate-900">
          Ngày tham gia
        </th>
        <th className="px-4 py-3 font-semibold text-slate-900">
          Điểm đóng góp
        </th>
        <th className="px-4 py-3 font-semibold text-slate-900">Hành động</th>
      </tr>
    </thead>
    <tbody>
      {filteredMembers.map((member, index) => (
        <tr
          key={member.id}
          className={`border-b border-slate-100 hover:bg-slate-50 transition ${
            index % 2 === 0 ? "bg-white" : "bg-slate-50"
          }`}
        >
          {/* Cells */}
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

### Responsive Breakpoints

```css
/* Mobile: < 640px */
@media (max-width: 640px) {
  .container { padding: 1rem; }
  .tabs { flex-wrap: nowrap; overflow-x-auto; }
  .table { font-size: 0.75rem; }
  .buttons { flex-direction: column; }
}

/* Tablet: 640px - 1024px */
@media (min-width: 640px) and (max-width: 1024px) {
  .container { padding: 1.5rem; }
  .table { font-size: 0.875rem; }
}

/* Desktop: > 1024px */
@media (min-width: 1024px) {
  .container { padding: 2rem; max-width: 1280px; }
  .table { font-size: 1rem; }
}
```

---

## Error Handling

### Validation Errors

```javascript
// Add Member Validation
function validateNewMember(data) {
  const errors = [];

  if (!data.name || data.name.trim() === "") {
    errors.push("Tên không được để trống");
  }

  if (!data.mssv || data.mssv.trim() === "") {
    errors.push("MSSV không được để trống");
  }

  if (!/^\d{7}$/.test(data.mssv)) {
    errors.push("MSSV phải là 7 chữ số");
  }

  if (!data.role) {
    errors.push("Vai trò không được để trống");
  }

  return errors;
}

// Usage
const errors = validateNewMember(formData);
if (errors.length > 0) {
  alert(errors.join("\n"));
  return;
}
```

### Try-Catch Patterns

```javascript
async function handleApiCall() {
  try {
    const response = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error:", error);
    alert("Có lỗi xảy ra. Vui lòng thử lại.");
  }
}
```

---

## Performance Optimization

### 1. Memoization (useMemo)

```javascript
import { useMemo } from "react";

const filteredMembers = useMemo(() => {
  const tabMembers = members[activeTab] || [];
  return tabMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.mssv.includes(searchQuery),
  );
}, [members, activeTab, searchQuery]);
```

### 2. Callback Optimization (useCallback)

```javascript
import { useCallback } from "react";

const handleTabChange = useCallback((tab) => {
  setActiveTab(tab);
  setSearchQuery("");
}, []);
```

### 3. Lazy Loading

```javascript
// Load only visible rows
const itemsPerPage = 20;
const [currentPage, setCurrentPage] = useState(1);

const visibleMembers = useMemo(() => {
  const start = (currentPage - 1) * itemsPerPage;
  return filteredMembers.slice(start, start + itemsPerPage);
}, [filteredMembers, currentPage]);
```

---

## Browser Compatibility

### Supported Browsers

| Browser | Min Version | Status           |
| ------- | ----------- | ---------------- |
| Chrome  | 90+         | ✅ Full          |
| Firefox | 88+         | ✅ Full          |
| Safari  | 14+         | ✅ Full          |
| Edge    | 90+         | ✅ Full          |
| Opera   | 76+         | ✅ Full          |
| IE      | Any         | ❌ Not Supported |

### Polyfills Needed

- Array.includes() → Use includes() or polyfill
- Array.filter() → Standard, no polyfill
- localStorage → Check availability before use

---

## Testing Guide

### Unit Tests

```javascript
// Test search filter
describe("Member Search", () => {
  test("filters by name", () => {
    const result = getFilteredMembers("Nguyễn");
    expect(result.length).toBeGreaterThan(0);
  });

  test("filters by MSSV", () => {
    const result = getFilteredMembers("2021001");
    expect(result[0].mssv).toBe("2021001");
  });
});

// Test add member
describe("Add Member", () => {
  test("adds new member successfully", () => {
    handleAddMember({
      name: "Test User",
      mssv: "2024001",
      role: "Thành viên",
    });
    expect(members.official.length).toBe(4);
  });

  test("rejects invalid data", () => {
    handleAddMember({
      name: "",
      mssv: "",
      role: "",
    });
    expect(members.official.length).toBe(3);
  });
});
```

### Integration Tests

```javascript
// Test full workflow
test('Full member management workflow', () => {
  // 1. Add member
  handleAddMember({ ... });

  // 2. Edit role
  handleEditMember(memberId);
  handleSaveEdit();

  // 3. Delete member
  handleDeleteMember(memberId);

  // 4. Verify state
  expect(members.official.length).toBe(3);
});
```

---

## API Integration

### Endpoints

```
GET    /api/members                  → Get all members
POST   /api/members                  → Create member
PUT    /api/members/:id              → Update member
DELETE /api/members/:id              → Delete member
POST   /api/members/:id/approve      → Approve pending
POST   /api/members/:id/reject       → Reject pending
GET    /api/members/export           → Export list
```

### Example Calls

```javascript
// Get members
async function fetchMembers() {
  const response = await fetch("/api/members");
  return response.json();
}

// Create member
async function createMember(data) {
  return fetch("/api/members", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());
}

// Update role
async function updateMemberRole(memberId, newRole) {
  return fetch(`/api/members/${memberId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: newRole }),
  }).then((r) => r.json());
}
```

---

## Debugging

### Console Logging

```javascript
// Enable debug mode
const DEBUG = true;

function log(...args) {
  if (DEBUG) console.log("[MemberMgmt]", ...args);
}

// Usage
log("activeTab:", activeTab);
log("filteredMembers:", filteredMembers);
```

### React DevTools

1. Install React DevTools browser extension
2. Open DevTools (F12)
3. Click "React" tab
4. Inspect component state and props

---

**Version**: 1.0 | **Last Updated**: May 19, 2026 | **Author**: Frontend Team
