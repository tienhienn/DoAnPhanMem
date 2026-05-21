# 🛠️ Technical Documentation - EventTaskManagement Component

## 📋 Tổng Quan

**File**: `src/pages/EventTaskManagement.jsx`

**Loại Component**: Functional Component (React Hooks)

**Chức năng chính**: Quản lý phân công nhiệm vụ sự kiện, bao gồm CRUD operations, thay đổi trạng thái, và hiển thị thống kê.

---

## 🏗️ Cấu Trúc Component

### 1. Imports & Dependencies

```jsx
import React, { useState } from "react";
import {
  ChevronDown,
  Plus,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
} from "lucide-react";
```

**Dependencies**:

- `react`: Core React library
- `lucide-react`: Icon library (SVG icons)

**Icons sử dụng**:

- `ChevronDown`: Dropdown arrow
- `Plus`: Add button
- `Calendar`: Deadline icon
- `User`: User/assignee icon
- `CheckCircle2`: Complete status
- `Clock`: Timer/in-progress icon
- `AlertCircle`: Alert/total icon
- `X`: Close/delete icon

---

### 2. Mock Data

#### Events Array

```jsx
const events = [
  { id: 1, name: "Hackathon 2026" },
  { id: 2, name: "Tech Conference 2026" },
  { id: 3, name: "Workshop React" },
  { id: 4, name: "Ngày hội Công nghệ" },
];
```

**Cấu trúc**: `{ id: number, name: string }`

#### Members Array

```jsx
const members = [
  { id: 1, name: "Nguyễn Văn An", avatar: "👨‍💼", role: "Leader" },
  { id: 2, name: "Trần Thị Bảo", avatar: "👩‍💻", role: "Developer" },
  // ...
];
```

**Cấu trúc**: `{ id: number, name: string, avatar: string, role: string }`

#### Initial Tasks Array

```jsx
const initialTasks = [
  {
    id: 1,
    title: "Setup Infrastructure & Server",
    assignee: members[0], // Object reference
    deadline: "2026-06-15",
    status: "todo", // todo | in_progress | done
    description: "Chuẩn bị server, database, và các công cụ cần thiết",
  },
  // ...
];
```

**Cấu trúc Task**:

```typescript
interface Task {
  id: number;
  title: string;
  assignee: Member; // Object reference to member
  deadline: string; // ISO date format: YYYY-MM-DD
  status: "todo" | "in_progress" | "done";
  description: string;
}
```

---

### 3. State Management

```jsx
const [selectedEvent, setSelectedEvent] = useState(events[0]);
const [showModal, setShowModal] = useState(false);
const [tasks, setTasks] = useState(initialTasks);
const [formData, setFormData] = useState({
  title: "",
  assignee: "",
  deadline: "",
  description: "",
});
```

| State           | Type    | Default        | Dùng cho               |
| --------------- | ------- | -------------- | ---------------------- |
| `selectedEvent` | Object  | `events[0]`    | Event được chọn        |
| `showModal`     | Boolean | `false`        | Hiển thị/ẩn modal      |
| `tasks`         | Array   | `initialTasks` | Danh sách công việc    |
| `formData`      | Object  | `{empty}`      | Dữ liệu form thêm task |

---

### 4. Computed Values (Statistics)

```jsx
const stats = {
  total: tasks.length,
  todo: tasks.filter((t) => t.status === "todo").length,
  inProgress: tasks.filter((t) => t.status === "in_progress").length,
  done: tasks.filter((t) => t.status === "done").length,
};
```

**Tính toán tự động** từ danh sách `tasks` hiện tại.

---

## 🎯 Core Functions

### 1. `handleAddTask(e)`

**Mục đích**: Thêm công việc mới

**Parameters**: `e: FormEvent`

**Logic**:

```jsx
1. Prevent default form submission (e.preventDefault())
2. Validate: title, assignee, deadline không được rỗng
3. Find member object từ assignee ID
4. Create new task object với id mới (max + 1)
5. Set status mặc định: 'todo'
6. Add to tasks array
7. Reset form data
8. Close modal
```

**Return**: `void`

---

### 2. `handleChangeStatus(taskId, newStatus)`

**Mục đích**: Cập nhật trạng thái của công việc

**Parameters**:

- `taskId: number` - ID của task cần update
- `newStatus: string` - Trạng thái mới ('todo' | 'in_progress' | 'done')

**Logic**:

```jsx
setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
```

**Return**: `void`

---

### 3. `handleDeleteTask(taskId)`

**Mục đích**: Xóa công việc

**Parameters**: `taskId: number`

**Logic**:

```jsx
setTasks(tasks.filter((t) => t.id !== taskId));
```

**Return**: `void`

---

### 4. `getStatusBadge(status)`

**Mục đích**: Lấy styling và label cho badge trạng thái

**Parameters**: `status: string` ('todo' | 'in_progress' | 'done')

**Returns**:

```jsx
{
  style: string,  // Tailwind classes
  label: string   // Display text
}
```

**Mapping**:

```
'todo' → 'bg-gray-100 text-gray-700 border border-gray-300' + '📋 Chưa làm'
'in_progress' → 'bg-yellow-100 text-yellow-700 border border-yellow-300' + '⚙️ Đang làm'
'done' → 'bg-green-100 text-green-700 border border-green-300' + '✅ Hoàn thành'
```

---

### 5. `formatDate(dateString)`

**Mục đích**: Format ngày từ ISO format sang định dạng hiển thị

**Parameters**: `dateString: string` (ISO format: YYYY-MM-DD)

**Returns**: `string` (VN format: DD/MM/YYYY)

**Example**:

```
Input:  '2026-06-15'
Output: '15/06/2026'
```

---

### 6. `isOverdue(deadline)`

**Mục đích**: Kiểm tra xem deadline có quá hạn không

**Parameters**: `deadline: string` (ISO format)

**Returns**: `boolean`

**Logic**:

```jsx
new Date(deadline) < new Date() &&
  new Date(deadline).toDateString() !== new Date().toDateString();
```

**Notes**: Không tính ngày hôm nay là quá hạn

---

## 🎨 Component Structure (JSX)

```
<div className="min-h-screen bg-slate-50 p-4 md:p-8">
  ├─ <Header>
  │  ├─ <Title>
  │  └─ <EventDropdown>
  │
  ├─ <StatsCards>
  │  ├─ <Card: Total>
  │  ├─ <Card: To-do>
  │  ├─ <Card: In Progress>
  │  └─ <Card: Done>
  │
  ├─ <TaskTable>
  │  ├─ <TableHeader>
  │  ├─ <TableBody>
  │  │  └─ <TableRow> (for each task)
  │  │     ├─ <TaskName>
  │  │     ├─ <AssigneeInfo>
  │  │     ├─ <Deadline>
  │  │     ├─ <StatusDropdown>
  │  │     └─ <DeleteButton>
  │  └─ <EmptyState>
  │
  └─ <Modal> (conditional)
     ├─ <ModalHeader>
     ├─ <ModalForm>
     │  ├─ <FormField: Title>
     │  ├─ <FormField: Assignee>
     │  ├─ <FormField: Deadline>
     │  ├─ <FormField: Description>
     │  └─ <FormButtons>
     └─ <ModalBackdrop>
```

---

## 🎨 Tailwind CSS Classes Reference

### Layout Classes

```
min-h-screen          - Full viewport height
bg-slate-50           - Light background
p-4 md:p-8            - Responsive padding
grid gap-4            - CSS Grid with gap
grid-cols-1 md:grid-cols-2 lg:grid-cols-4
                      - Responsive columns (1→2→4)
```

### Component Classes

```
rounded-2xl           - Border radius 16px
shadow-sm             - Small shadow
border border-slate-100  - Light gray border
hover:shadow-md       - Shadow on hover
transition-all        - Smooth transition
transform hover:scale-105  - Scale on hover
active:scale-95       - Shrink on active
```

### Text Classes

```
text-3xl font-bold    - Large bold text
text-sm font-medium   - Small medium text
text-slate-900        - Dark text color
text-blue-600         - Primary blue text
truncate max-w-[140px]  - Truncate long text
```

### States

```
focus:outline-none focus:border-blue-600  - Focus state
hover:bg-slate-100 transition-colors  - Hover state
disabled:opacity-50  - Disabled state
```

---

## 🔄 Data Flow

### Adding a Task

```
User Input
  ↓
handleAddTask()
  ├─ Validate formData
  ├─ Find assignee member object
  ├─ Create new task with unique ID
  ├─ setTasks([...tasks, newTask])
  ├─ Reset formData
  └─ Close modal
  ↓
Re-render
  ├─ tasks array updated
  ├─ stats recalculated
  └─ Table updates
```

### Updating Task Status

```
User selects status from dropdown
  ↓
handleChangeStatus(taskId, newStatus)
  ├─ Find task by ID
  ├─ Update status property
  ├─ setTasks(modified array)
  ↓
Re-render
  ├─ Badge updates
  ├─ stats recalculated
  └─ Card statistics change
```

### Deleting a Task

```
User clicks delete button
  ↓
handleDeleteTask(taskId)
  ├─ Filter out task by ID
  ├─ setTasks(filtered array)
  ↓
Re-render
  ├─ Row removed from table
  └─ stats recalculated
```

---

## 📱 Responsive Breakpoints

### Tailwind Breakpoints Used

```
sm:   640px   (mobile)
md:   768px   (tablet)
lg:   1024px  (desktop)
```

### Responsive Classes

```
grid-cols-1 md:grid-cols-2 lg:grid-cols-4
  - 1 column (mobile)
  - 2 columns (tablet)
  - 4 columns (desktop)

flex flex-col md:flex-row
  - Column layout (mobile)
  - Row layout (desktop)

hidden lg:flex
  - Hidden on mobile/tablet
  - Visible on desktop
```

---

## 🔐 Input Validation

### Form Validation in `handleAddTask()`

```jsx
if (!formData.title || !formData.assignee || !formData.deadline) {
  alert("Vui lòng điền đầy đủ thông tin!");
  return;
}
```

**Validated Fields**:

- ✅ `title` - Required
- ✅ `assignee` - Required
- ✅ `deadline` - Required
- ❌ `description` - Optional

---

## 🚀 Performance Optimizations

### Current Implementation

```jsx
// Efficient mapping
stats = tasks.filter(...).length

// Efficient updates
setTasks(tasks.map(t => t.id === id ? {...} : t))
setTasks(tasks.filter(t => t.id !== id))

// Memoization (potential future optimization)
// const stats = useMemo(() => {...}, [tasks])
```

### Potential Optimizations

1. **Memoization**:

   ```jsx
   const stats = useMemo(() => ({...}), [tasks]);
   ```

2. **useCallback**:

   ```jsx
   const handleDeleteTask = useCallback((taskId) => {...}, []);
   ```

3. **Component Splitting**:
   ```jsx
   <TaskRow /> - Separate component
   <StatsCard /> - Separate component
   <TaskModal /> - Separate component
   ```

---

## 🔗 API Integration (Future)

### Current State

- ✅ Mock data with `useState`
- ❌ No backend connection

### Integration Steps

```jsx
// 1. Replace initialTasks with API call
useEffect(() => {
  fetchTasks(selectedEvent.id).then(setTasks);
}, [selectedEvent.id]);

// 2. Update handleAddTask to call API
const handleAddTask = async (e) => {
  e.preventDefault();
  const newTask = await createTask(selectedEvent.id, formData);
  setTasks([...tasks, newTask]);
};

// 3. Update handleChangeStatus to call API
const handleChangeStatus = async (taskId, newStatus) => {
  await updateTaskStatus(taskId, newStatus);
  setTasks(...);
};

// 4. Update handleDeleteTask to call API
const handleDeleteTask = async (taskId) => {
  await deleteTask(taskId);
  setTasks(...);
};
```

---

## 🧪 Testing Guide

### Unit Tests (Jest)

```jsx
describe("EventTaskManagement", () => {
  test("renders component", () => {
    render(<EventTaskManagement />);
    expect(screen.getByText(/Triển khai/i)).toBeInTheDocument();
  });

  test("adds new task", () => {
    // Fill form and submit
    // Assert task appears in table
  });

  test("updates task status", () => {
    // Select status dropdown
    // Assert status changes in stats
  });

  test("deletes task", () => {
    // Click delete button
    // Assert task removed
  });
});
```

### E2E Tests (Cypress)

```jsx
describe("Task Management Flow", () => {
  it("should complete full workflow", () => {
    cy.visit("/event-tasks/1");
    cy.contains("Triển khai").should("be.visible");
    cy.contains("+").click();
    cy.get('input[placeholder*="Tên"]').type("New Task");
    // ... more assertions
  });
});
```

---

## 🐛 Debugging Tips

### Console Logging

```jsx
// Log stats calculation
console.log("Stats:", stats);

// Log form data
console.log("Form Data:", formData);

// Log tasks array changes
console.log("Tasks Updated:", tasks);
```

### React DevTools

1. Install React DevTools browser extension
2. Select component in DevTools
3. View props and state in real-time
4. Modify state directly for testing

### Browser DevTools

```
F12 → Console
  - Check for errors
  - Log custom data
```

---

## 📚 Related Files

| File                               | Purpose             |
| ---------------------------------- | ------------------- |
| `src/App.jsx`                      | Route definition    |
| `src/components/layout/NavBar.jsx` | Navigation menu     |
| `src/context/AuthContext.jsx`      | User authentication |
| `EVENT_TASK_GUIDE.md`              | User guide          |

---

## 🔄 Version History

| Version | Date         | Changes         |
| ------- | ------------ | --------------- |
| 1.0     | May 19, 2026 | Initial release |
| -       | -            | -               |

---

## 📞 Support & Maintenance

**Maintainer**: Frontend Team

**Contact**: dev@hcmute.edu.vn

**Last Updated**: May 19, 2026

---

## 📝 Notes for Future Development

- [ ] Add backend API integration
- [ ] Add real-time updates with WebSocket
- [ ] Add task comments and attachments
- [ ] Add task dependencies
- [ ] Add recurring tasks
- [ ] Add team task assignments
- [ ] Add task notifications
- [ ] Add task activity log
- [ ] Add task filtering and search
- [ ] Add task analytics and charts

---

**Document Version**: 1.0 | **Format**: Markdown | **Language**: Vietnamese
