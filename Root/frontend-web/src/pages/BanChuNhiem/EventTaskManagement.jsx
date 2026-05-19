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

const EventTaskManagement = () => {
  // Mock Data - Danh sách sự kiện
  const events = [
    { id: 1, name: "Hackathon 2026" },
    { id: 2, name: "Tech Conference 2026" },
    { id: 3, name: "Workshop React" },
    { id: 4, name: "Ngày hội Công nghệ" },
  ];

  // Mock Data - Danh sách thành viên
  const members = [
    { id: 1, name: "Nguyễn Văn An", avatar: "👨‍💼", role: "Leader" },
    { id: 2, name: "Trần Thị Bảo", avatar: "👩‍💻", role: "Developer" },
    { id: 3, name: "Lê Minh Chính", avatar: "👨‍🎨", role: "Designer" },
    { id: 4, name: "Phạm Thị Dung", avatar: "👩‍📊", role: "Manager" },
    { id: 5, name: "Đỗ Hoàng Em", avatar: "👨‍🔧", role: "Developer" },
  ];

  // Mock Data - Danh sách nhiệm vụ
  const initialTasks = [
    {
      id: 1,
      title: "Setup Infrastructure & Server",
      assignee: members[0],
      deadline: "2026-06-15",
      status: "todo", // todo, in_progress, done
      description: "Chuẩn bị server, database, và các công cụ cần thiết",
    },
    {
      id: 2,
      title: "Design UI/UX Mockups",
      assignee: members[2],
      deadline: "2026-06-10",
      status: "in_progress",
      description: "Thiết kế wireframe và mockup cho toàn bộ ứng dụng",
    },
    {
      id: 3,
      title: "API Development",
      assignee: members[1],
      deadline: "2026-06-20",
      status: "in_progress",
      description: "Phát triển REST API cho các chức năng chính",
    },
    {
      id: 4,
      title: "Frontend Development",
      assignee: members[4],
      deadline: "2026-06-25",
      status: "todo",
      description: "Xây dựng giao diện người dùng bằng React",
    },
    {
      id: 5,
      title: "Testing & QA",
      assignee: members[3],
      deadline: "2026-07-01",
      status: "done",
      description: "Thực hiện kiểm tra chất lượng toàn bộ hệ thống",
    },
    {
      id: 6,
      title: "Deployment & Launch",
      assignee: members[0],
      deadline: "2026-07-05",
      status: "done",
      description: "Triển khai lên production và giám sát hệ thống",
    },
  ];

  // State
  const [selectedEvent, setSelectedEvent] = useState(events[0]);
  const [showModal, setShowModal] = useState(false);
  const [tasks, setTasks] = useState(initialTasks);
  const [formData, setFormData] = useState({
    title: "",
    assignee: "",
    deadline: "",
    description: "",
  });

  // Hàm tính toán thống kê
  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  // Hàm xử lý thêm công việc
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.assignee || !formData.deadline) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const newTask = {
      id: Math.max(...tasks.map((t) => t.id), 0) + 1,
      title: formData.title,
      assignee: members.find((m) => m.id === parseInt(formData.assignee)),
      deadline: formData.deadline,
      status: "todo",
      description: formData.description,
    };

    setTasks([...tasks, newTask]);
    setFormData({ title: "", assignee: "", deadline: "", description: "" });
    setShowModal(false);
  };

  // Hàm thay đổi trạng thái công việc
  const handleChangeStatus = (taskId, newStatus) => {
    setTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );
  };

  // Hàm xóa công việc
  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  // Hàm lấy badge màu theo trạng thái
  const getStatusBadge = (status) => {
    const styles = {
      todo: "bg-gray-100 text-gray-700 border border-gray-300",
      in_progress: "bg-yellow-100 text-yellow-700 border border-yellow-300",
      done: "bg-green-100 text-green-700 border border-green-300",
    };
    const labels = {
      todo: "📋 Chưa làm",
      in_progress: "⚙️ Đang làm",
      done: "✅ Hoàn thành",
    };
    return { style: styles[status], label: labels[status] };
  };

  // Hàm format ngày
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Hàm check hạn chót
  const isOverdue = (deadline) => {
    return (
      new Date(deadline) < new Date() &&
      new Date(deadline).toDateString() !== new Date().toDateString()
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Triển khai & Phân công nhiệm vụ
            </h1>
            <p className="text-slate-600">
              Quản lý và giám sát tiến độ công việc sự kiện
            </p>
          </div>

          {/* Dropdown chọn sự kiện */}
          <div className="relative min-w-[280px]">
            <div className="relative">
              <select
                value={selectedEvent.id}
                onChange={(e) =>
                  setSelectedEvent(
                    events.find((ev) => ev.id === parseInt(e.target.value)),
                  )
                }
                className="w-full px-4 py-3 pr-10 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer hover:border-slate-300"
              >
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Thống kê nhanh - Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card Tổng task */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-2">
                Tổng công việc
              </p>
              <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Card Chưa làm */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-2">
                Chưa làm (To-do)
              </p>
              <p className="text-3xl font-bold text-slate-900">{stats.todo}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Card Đang làm */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-2">
                Đang làm (In Progress)
              </p>
              <p className="text-3xl font-bold text-yellow-600">
                {stats.inProgress}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Card Hoàn thành */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-2">
                Hoàn thành (Done)
              </p>
              <p className="text-3xl font-bold text-green-600">{stats.done}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Khu vực chính - Bảng công việc */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header của bảng */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">
            Danh sách công việc - {selectedEvent.name}
          </h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Thêm công việc
          </button>
        </div>

        {/* Bảng công việc */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Tên công việc
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Người phụ trách
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Hạn chót
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => {
                const badge = getStatusBadge(task.status);
                const overdue = isOverdue(task.deadline);

                return (
                  <tr
                    key={task.id}
                    className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50"
                    }`}
                  >
                    {/* Tên công việc */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">
                          {task.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {task.description}
                        </p>
                      </div>
                    </td>

                    {/* Người phụ trách */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-sm">
                          {task.assignee.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {task.assignee.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {task.assignee.role}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Hạn chót */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span
                          className={`text-sm font-medium ${overdue ? "text-red-600" : "text-slate-700"}`}
                        >
                          {formatDate(task.deadline)}
                          {overdue && (
                            <span className="ml-2 text-xs text-red-600">
                              ⚠️ Quá hạn
                            </span>
                          )}
                        </span>
                      </div>
                    </td>

                    {/* Trạng thái - Dropdown */}
                    <td className="px-6 py-4">
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleChangeStatus(task.id, e.target.value)
                        }
                        className={`px-3 py-1 rounded-lg text-sm font-medium border transition-all cursor-pointer ${badge.style}`}
                      >
                        <option value="todo">📋 Chưa làm</option>
                        <option value="in_progress">⚙️ Đang làm</option>
                        <option value="done">✅ Hoàn thành</option>
                      </select>
                    </td>

                    {/* Hành động */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        title="Xóa công việc"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {tasks.length === 0 && (
          <div className="px-6 py-12 text-center">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Chưa có công việc nào</p>
            <p className="text-slate-500 text-sm mt-1">
              Nhấn nút "Thêm công việc" để tạo mới
            </p>
          </div>
        )}
      </div>

      {/* Modal Thêm công việc */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-slate-900">
                Thêm công việc mới
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Body Modal */}
            <form onSubmit={handleAddTask} className="p-6 space-y-5">
              {/* Tên công việc */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Tên công việc <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên công việc..."
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 transition-all bg-slate-50 hover:bg-white"
                />
              </div>

              {/* Phân công cho ai */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Phân công cho ai <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.assignee}
                  onChange={(e) =>
                    setFormData({ ...formData, assignee: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 transition-all bg-slate-50 hover:bg-white appearance-none cursor-pointer"
                >
                  <option value="">-- Chọn thành viên --</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Hạn chót */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Hạn chót <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 transition-all bg-slate-50 hover:bg-white"
                />
              </div>

              {/* Mô tả chi tiết */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Mô tả chi tiết
                </label>
                <textarea
                  placeholder="Nhập mô tả công việc..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 transition-all bg-slate-50 hover:bg-white resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all transform active:scale-95"
                >
                  Thêm công việc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventTaskManagement;
