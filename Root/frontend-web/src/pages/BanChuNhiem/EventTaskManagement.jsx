import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  Plus,
  Calendar,
  AlertCircle,
  X,
  Eye,
  MessageSquare,
  Link as LinkIcon,
  Check,
  XCircle,
  Clock,
  CheckCircle2,
  Paperclip,
  UploadCloud,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const EventTaskManagement = () => {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [feedback, setFeedback] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    assignee: "",
    deadline: "",
    description: "",
    attachmentLink: null,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/bcn/events`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const validEvents = (res.data.data || []).filter(
        (e) => e.TrangThai !== "draft" && e.TrangThai !== "tu_choi",
      );
      setEvents(validEvents);
      if (validEvents.length > 0) setSelectedEvent(validEvents[0]);
    } catch (error) {
      console.error("Lỗi lấy sự kiện:", error);
    }
  };

  useEffect(() => {
    if (selectedEvent) {
      fetchTasks(selectedEvent.MaSK);
      fetchMembers(selectedEvent.MaCLB);
    }
  }, [selectedEvent]);

  const fetchTasks = async (eventId) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/tasks/event/${eventId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTasks(res.data.data || []);
    } catch (error) {
      console.error("Lỗi lấy nhiệm vụ:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (clubId) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/tasks/club-members/${clubId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setMembers(res.data.data || []);
    } catch (error) {
      console.error("Lỗi lấy thành viên:", error);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.assignee || !formData.deadline) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }
    try {
      setLoading(true);

      // Khởi tạo FormData để chứa cả text và file
      const submitData = new FormData();
      submitData.append("MaSK", selectedEvent.MaSK);
      submitData.append("MaCLB", selectedEvent.MaCLB);
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("assigneeId", formData.assignee);
      submitData.append("deadline", formData.deadline);

      if (formData.attachmentFile) {
        submitData.append("file", formData.attachmentFile); // Đính kèm file
      }

      await axios.post(`${API_BASE_URL}/tasks`, submitData, {
        headers: {
          "Content-Type": "multipart/form-data", // Quan trọng khi gửi file
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      alert("Phân công thành công!");
      setFormData({
        title: "",
        assignee: "",
        deadline: "",
        description: "",
        attachmentFile: null,
      });
      setShowAddModal(false);
      fetchTasks(selectedEvent.MaSK);
    } catch (error) {
      alert(
        "Lỗi khi thêm: " +
          (error.response?.data?.error?.message || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (confirm("Bạn có chắc chắn muốn xóa công việc này?")) {
      try {
        await axios.delete(`${API_BASE_URL}/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        fetchTasks(selectedEvent.MaSK);
      } catch (error) {
        alert("Lỗi khi xóa!");
      }
    }
  };

  const handleOpenReview = (task) => {
    setSelectedTask(task);
    setFeedback(task.bcnFeedback || "");
    setShowReviewModal(true);
  };

  const submitTaskReview = async (statusEnum) => {
    if (statusEnum === "in_progress" && !feedback.trim()) {
      alert("Vui lòng nhập lý do/feedback để thành viên sửa lại!");
      return;
    }
    try {
      setLoading(true);
      await axios.patch(
        `${API_BASE_URL}/tasks/${selectedTask.id}/review`,
        {
          status: statusEnum,
          feedback: feedback,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      alert(
        statusEnum === "done"
          ? "Đã duyệt thành công!"
          : "Đã gửi yêu cầu làm lại!",
      );
      setShowReviewModal(false);
      fetchTasks(selectedEvent.MaSK);
    } catch (error) {
      alert("Lỗi khi cập nhật trạng thái!");
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    reviewing: tasks.filter((t) => t.status === "reviewing").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  const getStatusBadge = (status) => {
    const configs = {
      todo: {
        style: "bg-slate-100 text-slate-700 border-slate-200",
        label: "📋 Chưa làm",
      },
      in_progress: {
        style: "bg-blue-100 text-blue-700 border-blue-200",
        label: "⚙️ Đang làm",
      },
      reviewing: {
        style:
          "bg-amber-100 text-amber-700 border-amber-200 shadow-sm animate-pulse",
        label: "👀 Chờ BCN duyệt",
      },
      done: {
        style: "bg-emerald-100 text-emerald-700 border-emerald-200",
        label: "✅ Hoàn thành",
      },
    };
    return configs[status] || configs.todo;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    return (
      new Date(deadline) < new Date() &&
      new Date(deadline).toDateString() !== new Date().toDateString()
    );
  };

  if (events.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="text-center bg-white p-10 rounded-2xl shadow-sm border border-slate-200 max-w-md">
          <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Chưa có sự kiện nào
          </h2>
          <p className="text-slate-500">
            CLB của bạn chưa có sự kiện nào được tạo. Hãy tạo sự kiện trước khi
            phân công nhiệm vụ.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Quản lý Tiến độ Sự kiện
            </h1>
            <p className="text-slate-600">
              Ban chủ nhiệm theo dõi và xét duyệt công việc
            </p>
          </div>

          <div className="relative min-w-[280px]">
            <div className="relative">
              <select
                value={selectedEvent?.MaSK || ""}
                onChange={(e) =>
                  setSelectedEvent(
                    events.find((ev) => ev.MaSK === e.target.value),
                  )
                }
                className="w-full px-4 py-3 pr-10 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer hover:border-slate-300"
              >
                {events.map((event) => (
                  <option key={event.MaSK} value={event.MaSK}>
                    {event.TenSK}
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
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-2">
                Tổng công việc
              </p>
              <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-2">
                Đang làm
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.inProgress}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-200 bg-amber-50/30 relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-amber-800 text-sm font-bold mb-2">
                Cần BCN Duyệt
              </p>
              <p className="text-3xl font-bold text-amber-600">
                {stats.reviewing}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-2">
                Hoàn thành
              </p>
              <p className="text-3xl font-bold text-emerald-600">
                {stats.done}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Khu vực chính - Bảng công việc */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">
            Danh sách nhiệm vụ - {selectedEvent?.TenSK}
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" /> Thêm nhiệm vụ
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            Đang tải dữ liệu...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 w-1/3">
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
                {tasks.map((task) => {
                  const badge = getStatusBadge(task.status);
                  const overdue =
                    isOverdue(task.deadline) && task.status !== "done";

                  return (
                    <tr
                      key={task.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900 flex items-center gap-2">
                            {task.title}
                            {task.attachmentLink && (
                              <Paperclip
                                className="w-3.5 h-3.5 text-blue-500"
                                title="Có tài liệu đính kèm"
                              />
                            )}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                            {task.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-sm">
                            👤
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {task.assignee?.name || "Chưa gán"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {task.assignee?.role || ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span
                            className={`text-sm font-medium ${overdue ? "text-red-600" : "text-slate-700"}`}
                          >
                            {formatDate(task.deadline)}
                            {overdue && (
                              <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                                Quá hạn
                              </span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${badge.style}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleOpenReview(task)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Xem chi tiết & Xét duyệt"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Xóa công việc"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {tasks.length === 0 && (
              <div className="px-6 py-12 text-center">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">
                  Chưa có công việc nào
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  Nhấn nút "Thêm nhiệm vụ" để giao việc cho thành viên
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: THÊM CÔNG VIỆC MỚI */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">
                Phân công nhiệm vụ mới
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleAddTask} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tên công việc *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Nhập tên nhiệm vụ..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Người phụ trách *
                  </label>
                  <select
                    required
                    value={formData.assignee}
                    onChange={(e) =>
                      setFormData({ ...formData, assignee: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">-- Chọn thành viên --</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Hạn chót *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Mô tả chi tiết
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Chi tiết công việc cần làm..."
                />
              </div>

              {/* TRƯỜNG TẢI FILE ĐÍNH KÈM */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tài liệu đính kèm (nếu có)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-blue-300 text-blue-600 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                    <UploadCloud className="w-5 h-5" />
                    <span className="font-medium truncate">
                      {formData.attachmentFile
                        ? formData.attachmentFile.name
                        : "Tải lên tài liệu (.pdf, .zip, .docx...)"}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          attachmentFile: e.target.files[0],
                        })
                      }
                    />
                  </label>

                  {/* Nút Xóa file đã chọn */}
                  {formData.attachmentFile && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, attachmentFile: null })
                      }
                      className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border-2 border-transparent"
                      title="Xóa file"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Đang xử lý..." : "Phân công"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: BCN XEM CHI TIẾT VÀ DUYỆT */}
      {/* ========================================================================= */}
      {showReviewModal && selectedTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-8 py-5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-3xl sticky top-0">
              <div>
                <h3 className="text-xl font-bold">Chi tiết & Xét duyệt</h3>
                <p className="text-blue-100 text-sm opacity-90 mt-1">
                  Nhiệm vụ: {selectedTask.title}
                </p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase mb-1">
                    Người phụ trách
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      👤
                    </span>
                    <span className="font-semibold text-slate-900">
                      {selectedTask.assignee?.name}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase mb-1">
                    Trạng thái hiện tại
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(selectedTask.status).style}`}
                  >
                    {getStatusBadge(selectedTask.status).label}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-500 font-medium uppercase mb-1">
                    Mô tả công việc
                  </p>
                  <p className="text-slate-800 text-sm whitespace-pre-wrap">
                    {selectedTask.description || "Không có mô tả"}
                  </p>
                </div>

                {/* HIỂN THỊ LINK BCN ĐÍNH KÈM Ở ĐÂY */}
                {selectedTask.attachmentLink && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500 font-medium uppercase mb-1">
                      Tài liệu BCN giao
                    </p>
                    <div className="flex items-center gap-3">
                      <a
                        href={selectedTask.attachmentLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors text-sm font-medium"
                      >
                        <Paperclip className="w-4 h-4" /> Mở tài liệu
                      </a>
                      <a
                        href={selectedTask.attachmentLink}
                        download
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-100 transition-colors text-sm font-medium"
                      >
                        <UploadCloud className="w-4 h-4" /> Tải xuống
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Khu vực Báo cáo của thành viên */}
              {selectedTask.status === "reviewing" ||
              selectedTask.status === "done" ||
              selectedTask.submissionLink ? (
                <div className="border border-amber-200 bg-amber-50/30 p-6 rounded-2xl space-y-4">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-amber-600" />
                    Báo cáo từ thành viên
                  </h4>

                  {selectedTask.submissionLink && (
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-1">
                        File đính kèm / Link kết quả:
                      </p>
                      <div className="flex items-center gap-2">
                        <a
                          href={selectedTask.submissionLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-blue-600 hover:text-blue-700 hover:border-blue-300 transition-colors text-sm font-medium"
                        >
                          <LinkIcon className="w-4 h-4" /> Xem đính kèm
                        </a>
                        <a
                          href={selectedTask.submissionLink}
                          download
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-100 transition-colors text-sm font-medium"
                        >
                          <UploadCloud className="w-4 h-4" /> Tải xuống
                        </a>
                      </div>
                    </div>
                  )}

                  {selectedTask.submissionNote && (
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-1">
                        Lời nhắn:
                      </p>
                      <div className="p-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 italic">
                        "{selectedTask.submissionNote}"
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-slate-400 text-right">
                    Nộp lúc: {formatDate(selectedTask.submittedAt)}
                  </p>
                </div>
              ) : (
                <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <p className="text-slate-500 text-sm">
                    Thành viên chưa nộp báo cáo công việc.
                  </p>
                </div>
              )}

              {/* BCN Feedback form */}
              {selectedTask.status === "reviewing" && (
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    BCN phản hồi / Yêu cầu sửa đổi (nếu có)
                  </label>
                  <textarea
                    rows="3"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Nhập nhận xét của BCN..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>
              )}
            </div>

            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 rounded-b-3xl">
              <button
                onClick={() => setShowReviewModal(false)}
                disabled={loading}
                className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 disabled:opacity-50"
              >
                Đóng
              </button>

              {selectedTask.status === "reviewing" && (
                <>
                  <button
                    onClick={() => submitTaskReview("in_progress")}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-rose-100 text-rose-700 font-semibold rounded-xl hover:bg-rose-200 disabled:opacity-50"
                  >
                    <XCircle className="w-5 h-5" /> Yêu cầu làm lại
                  </button>
                  <button
                    onClick={() => submitTaskReview("done")}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 shadow-md disabled:opacity-50"
                  >
                    <Check className="w-5 h-5" /> Duyệt (Hoàn thành)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventTaskManagement;
