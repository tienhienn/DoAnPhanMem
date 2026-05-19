# 🔗 EventTaskManagement - API Integration Guide

## 📌 Overview

Guide này hỗ trợ nhà phát triển backend để tích hợp EventTaskManagement với backend API. Hiện tại component sử dụng mock data, bạn cần thay thế bằng API calls thực tế.

---

## 🎯 Current State vs. Integrated State

### Current (Mock Data)

```jsx
const initialTasks = [
  {
    id: 1,
    title: "Setup Infrastructure & Server",
    assignee: members[0],
    deadline: "2026-06-15",
    status: "todo",
    description: "...",
  },
  // ... hardcoded data
];
```

### Integrated (API Calls)

```jsx
useEffect(() => {
  fetchTasks(selectedEvent.id)
    .then((data) => setTasks(data))
    .catch((err) => console.error(err));
}, [selectedEvent.id]);
```

---

## 🚀 Integration Steps

### Step 1: Create API Service

**File**: `src/utils/taskService.js`

```javascript
// src/utils/taskService.js
import { apiClient } from "./apiClient"; // Assuming you have an axios/fetch instance

/**
 * Fetch all tasks for an event
 * GET /api/events/{eventId}/tasks
 */
export const fetchTasks = async (eventId) => {
  try {
    const response = await apiClient.get(`/events/${eventId}/tasks`);
    return response.data; // Expected: Array of Task objects
  } catch (error) {
    console.error("Fetch tasks failed:", error);
    throw error;
  }
};

/**
 * Create a new task
 * POST /api/events/{eventId}/tasks
 */
export const createTask = async (eventId, taskData) => {
  try {
    const response = await apiClient.post(`/events/${eventId}/tasks`, {
      title: taskData.title,
      assigneeId: parseInt(taskData.assignee),
      deadline: taskData.deadline,
      description: taskData.description,
      status: "todo", // Default status
    });
    return response.data; // Expected: Created Task object with id
  } catch (error) {
    console.error("Create task failed:", error);
    throw error;
  }
};

/**
 * Update task status
 * PATCH /api/tasks/{taskId}/status
 */
export const updateTaskStatus = async (taskId, status) => {
  try {
    const response = await apiClient.patch(`/tasks/${taskId}/status`, {
      status: status, // 'todo' | 'in_progress' | 'done'
    });
    return response.data; // Expected: Updated Task object
  } catch (error) {
    console.error("Update task status failed:", error);
    throw error;
  }
};

/**
 * Delete a task
 * DELETE /api/tasks/{taskId}
 */
export const deleteTask = async (taskId) => {
  try {
    await apiClient.delete(`/tasks/${taskId}`);
    return { success: true }; // Expected: Success response
  } catch (error) {
    console.error("Delete task failed:", error);
    throw error;
  }
};

/**
 * Fetch all members
 * GET /api/members
 */
export const fetchMembers = async () => {
  try {
    const response = await apiClient.get("/members");
    return response.data; // Expected: Array of Member objects
  } catch (error) {
    console.error("Fetch members failed:", error);
    throw error;
  }
};

/**
 * Fetch all events
 * GET /api/events
 */
export const fetchEvents = async () => {
  try {
    const response = await apiClient.get("/events");
    return response.data; // Expected: Array of Event objects
  } catch (error) {
    console.error("Fetch events failed:", error);
    throw error;
  }
};
```

---

### Step 2: Update Component Imports

**In EventTaskManagement.jsx**, add at the top:

```javascript
import {
  fetchTasks,
  createTask,
  updateTaskStatus,
  deleteTask,
  fetchMembers,
  fetchEvents,
} from "../utils/taskService";
```

---

### Step 3: Add useEffect for Data Fetching

**Add after state declarations**:

```jsx
useEffect(() => {
  // Load events on mount
  const loadData = async () => {
    try {
      const eventsData = await fetchEvents();
      setEvents(eventsData);

      const membersData = await fetchMembers();
      setMembers(membersData);

      // Set initial event
      if (eventsData.length > 0) {
        setSelectedEvent(eventsData[0]);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      // Show error toast or message
    }
  };

  loadData();
}, []);

// Load tasks when selected event changes
useEffect(() => {
  const loadTasks = async () => {
    try {
      const tasksData = await fetchTasks(selectedEvent.id);
      setTasks(tasksData);
    } catch (error) {
      console.error("Failed to load tasks:", error);
      // Show error toast or message
    }
  };

  if (selectedEvent?.id) {
    loadTasks();
  }
}, [selectedEvent.id]);
```

---

### Step 4: Update handleAddTask

**Replace current implementation** with:

```jsx
const handleAddTask = async (e) => {
  e.preventDefault();

  if (!formData.title || !formData.assignee || !formData.deadline) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }

  try {
    // Show loading state (optional)
    // setIsLoading(true);

    const newTask = await createTask(selectedEvent.id, formData);

    // Update local state with new task
    setTasks([...tasks, newTask]);

    // Reset form
    setFormData({ title: "", assignee: "", deadline: "", description: "" });
    setShowModal(false);

    // Show success message (optional)
    // showToast('Thêm công việc thành công!', 'success');
  } catch (error) {
    console.error("Failed to add task:", error);
    alert("Lỗi: Không thể thêm công việc. Vui lòng thử lại.");
  }
};
```

---

### Step 5: Update handleChangeStatus

**Replace current implementation** with:

```jsx
const handleChangeStatus = async (taskId, newStatus) => {
  try {
    // Optimistic update: update UI immediately
    setTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );

    // Then call API to persist
    await updateTaskStatus(taskId, newStatus);

    // If API call succeeds, state is already updated
    // If API call fails, you can rollback (see error handling below)
  } catch (error) {
    console.error("Failed to update task status:", error);

    // Rollback on error
    const previousStatus = tasks.find((t) => t.id === taskId)?.status;
    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, status: previousStatus } : t,
      ),
    );

    alert("Lỗi: Không thể cập nhật trạng thái. Vui lòng thử lại.");
  }
};
```

---

### Step 6: Update handleDeleteTask

**Replace current implementation** with:

```jsx
const handleDeleteTask = async (taskId) => {
  try {
    // Confirm deletion
    if (!window.confirm("Bạn có chắc muốn xóa công việc này?")) {
      return;
    }

    // Optimistic update
    setTasks(tasks.filter((t) => t.id !== taskId));

    // Call API to delete
    await deleteTask(taskId);

    // If successful, state is already updated
    // Show success message (optional)
    // showToast('Xóa công việc thành công!', 'success');
  } catch (error) {
    console.error("Failed to delete task:", error);

    // Rollback: reload tasks from server
    try {
      const tasksData = await fetchTasks(selectedEvent.id);
      setTasks(tasksData);
    } catch (e) {
      console.error("Failed to reload tasks:", e);
    }

    alert("Lỗi: Không thể xóa công việc. Vui lòng thử lại.");
  }
};
```

---

## 📊 Expected API Endpoints

### Backend Routes

```javascript
// Tasks Management
GET / api / events / { eventId } / tasks; // Fetch tasks for event
POST / api / events / { eventId } / tasks; // Create new task
PATCH / api / tasks / { taskId }; // Update task
PATCH / api / tasks / { taskId } / status; // Update task status
DELETE / api / tasks / { taskId }; // Delete task

// Events
GET / api / events; // Fetch all events
GET / api / events / { eventId }; // Fetch single event

// Members
GET / api / members; // Fetch all members
GET / api / members / { memberId }; // Fetch single member
```

---

## 📝 Expected Request/Response Format

### Create Task

**Request**:

```json
POST /api/events/1/tasks
Content-Type: application/json

{
  "title": "Setup Infrastructure & Server",
  "assigneeId": 1,
  "deadline": "2026-06-15T00:00:00Z",
  "description": "Chuẩn bị server, database, và các công cụ cần thiết",
  "status": "todo"
}
```

**Response** (201 Created):

```json
{
  "id": 7,
  "title": "Setup Infrastructure & Server",
  "assignee": {
    "id": 1,
    "name": "Nguyễn Văn An",
    "avatar": "👨‍💼",
    "role": "Leader"
  },
  "deadline": "2026-06-15T00:00:00Z",
  "status": "todo",
  "description": "Chuẩn bị server, database, và các công cụ cần thiết",
  "createdAt": "2026-05-19T10:30:00Z",
  "updatedAt": "2026-05-19T10:30:00Z"
}
```

### Update Task Status

**Request**:

```json
PATCH /api/tasks/1/status
Content-Type: application/json

{
  "status": "in_progress"
}
```

**Response** (200 OK):

```json
{
  "id": 1,
  "title": "Setup Infrastructure & Server",
  "assignee": {...},
  "deadline": "2026-06-15T00:00:00Z",
  "status": "in_progress",
  "description": "...",
  "updatedAt": "2026-05-19T11:45:00Z"
}
```

### Fetch Tasks

**Request**:

```
GET /api/events/1/tasks
```

**Response** (200 OK):

```json
[
  {
    "id": 1,
    "title": "Setup Infrastructure & Server",
    "assignee": {
      "id": 1,
      "name": "Nguyễn Văn An",
      "avatar": "👨‍💼",
      "role": "Leader"
    },
    "deadline": "2026-06-15T00:00:00Z",
    "status": "todo",
    "description": "..."
  },
  ...
]
```

### Delete Task

**Request**:

```
DELETE /api/tasks/1
```

**Response** (204 No Content or 200 OK):

```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

## 🛡️ Error Handling

### Add Error State

```jsx
const [error, setError] = useState(null);
const [isLoading, setIsLoading] = useState(false);

const showError = (message) => {
  setError(message);
  setTimeout(() => setError(null), 5000); // Auto-dismiss after 5s
};
```

### Add Loading State

```jsx
const [taskLoading, setTaskLoading] = useState(false);

const handleAddTask = async (e) => {
  e.preventDefault();
  setTaskLoading(true);

  try {
    // ... your code
  } catch (error) {
    showError("Không thể thêm công việc: " + error.message);
  } finally {
    setTaskLoading(false);
  }
};
```

### Add Error Display

```jsx
{
  error && (
    <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
      {error}
    </div>
  );
}
```

---

## 🔐 Authentication

### Add Authorization Header

```javascript
// In taskService.js
const API_HEADERS = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
};

export const fetchTasks = async (eventId) => {
  const response = await fetch(`/api/events/${eventId}/tasks`, {
    headers: API_HEADERS,
  });
  return response.json();
};
```

---

## 📊 Data Transformation

### If Backend Returns Different Format

```javascript
// Map backend response to component format
const transformTask = (backendTask) => {
  return {
    id: backendTask.task_id,
    title: backendTask.task_name,
    assignee: {
      id: backendTask.assigned_user_id,
      name: backendTask.assigned_user_name,
      avatar: backendTask.user_avatar,
      role: backendTask.user_role,
    },
    deadline: new Date(backendTask.due_date).toISOString().split("T")[0],
    status: backendTask.task_status.toLowerCase(),
    description: backendTask.task_description,
  };
};

// Use in fetchTasks
export const fetchTasks = async (eventId) => {
  const response = await apiClient.get(`/events/${eventId}/tasks`);
  return response.data.map(transformTask);
};
```

---

## 🧪 Testing Integration

### Mock API Responses (for testing)

```javascript
// src/utils/__mocks__/taskService.js
export const fetchTasks = jest.fn(() =>
  Promise.resolve([
    {
      id: 1,
      title: "Test Task",
      assignee: { id: 1, name: "Test User", avatar: "👤", role: "Tester" },
      deadline: "2026-06-15",
      status: "todo",
      description: "Test description",
    },
  ]),
);

export const createTask = jest.fn((eventId, data) =>
  Promise.resolve({ id: 999, ...data, status: "todo" }),
);

export const updateTaskStatus = jest.fn((taskId, status) =>
  Promise.resolve({ id: taskId, status }),
);

export const deleteTask = jest.fn(() => Promise.resolve({ success: true }));
```

---

## 📋 Backend Requirements Checklist

```
API Endpoints:
□ GET /api/events                          (List events)
□ GET /api/events/{eventId}/tasks          (List tasks for event)
□ POST /api/events/{eventId}/tasks         (Create task)
□ PATCH /api/tasks/{taskId}                (Update task)
□ PATCH /api/tasks/{taskId}/status         (Update status)
□ DELETE /api/tasks/{taskId}               (Delete task)
□ GET /api/members                         (List members)

Response Format:
□ Include task.id
□ Include assignee object with: id, name, avatar, role
□ Include deadline in ISO format
□ Include status: 'todo' | 'in_progress' | 'done'
□ Include description
□ Include timestamps: createdAt, updatedAt

Error Handling:
□ Return proper HTTP status codes
□ Include error message in response
□ Handle validation errors (400)
□ Handle unauthorized (401)
□ Handle not found (404)
□ Handle server errors (500)

Security:
□ Require authentication (JWT)
□ Validate user permissions
□ Sanitize input
□ Prevent SQL injection
□ Rate limiting
```

---

## 🚀 Deployment Checklist

```
Before Going Live:
□ Replace mock data with API calls
□ Test all CRUD operations
□ Test error handling
□ Test with real backend
□ Test authentication/authorization
□ Test on all browsers
□ Test mobile responsiveness
□ Performance testing
□ Security audit
□ Backup existing data
□ Plan rollback strategy
```

---

## 📞 Support

**Questions about integration?**

1. Check this guide
2. Review component code comments
3. Check backend API docs
4. Contact dev team

---

**Version**: 1.0 | **Last Updated**: May 19, 2026
