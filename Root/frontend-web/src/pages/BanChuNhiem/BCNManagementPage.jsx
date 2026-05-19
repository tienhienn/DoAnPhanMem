/**
 * BCNManagementPage - Ban chủ nhiệm CLB quản lý sự kiện
 *
 * Chức năng:
 * - Tạo/Sửa/Xóa sự kiện của CLB
 * - Nộp sự kiện để duyệt
 * - Xem phản hồi từ cấp Khoa và CTSV
 * - Xem danh sách sự kiện
 * - Giao diện premium, đồng bộ với EventListPage
 */

import { useState } from "react";
import {
  FiPlus,
  FiX,
  FiEdit2,
  FiTrash2,
  FiSend,
  FiEye,
  FiAlertCircle,
  FiCalendar,
  FiMapPin,
  FiUsers,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

// ============================================
// MOCK DATA
// ============================================
const MOCK_EVENTS = [
  {
    id: 1,
    name: "Hội thảo Python Advanced",
    startTime: "2026-05-15 09:00",
    endTime: "2026-05-15 11:30",
    location: "Phòng A101, Tòa A",
    quota: 100,
    points: 1.5,
    description:
      "Hội thảo nâng cao về Python, xử lý dữ liệu và Web Development.",
    status: "draft",
    createdBy: "Ban chủ nhiệm",
    feedback: "",
  },
  {
    id: 2,
    name: "Hackathon Innovation 2026",
    startTime: "2026-05-20 08:00",
    endTime: "2026-05-21 17:00",
    location: "Sân vận động trường",
    quota: 200,
    points: 3.0,
    description: "Cuộc thi hackathon quy mô lớn, hỗ trợ startup khởi nghiệp.",
    status: "pending_faculty",
    createdBy: "Ban chủ nhiệm",
    feedback: "",
  },
  {
    id: 3,
    name: "Lễ tuyên dương Sinh viên Xuất sắc 2025",
    startTime: "2026-05-25 19:00",
    endTime: "2026-05-25 21:00",
    location: "Nhà văn hóa sinh viên",
    quota: 300,
    points: 2.0,
    description:
      "Lễ tuyên dương và khen thưởng các sinh viên có thành tích xuất sắc.",
    status: "approved",
    createdBy: "Ban chủ nhiệm",
    feedback: "✓ Đã duyệt",
  },
  {
    id: 4,
    name: "Roadshow Tuyển dụng Công ty X",
    startTime: "2026-05-28 10:00",
    endTime: "2026-05-28 12:00",
    location: "Phòng C205",
    quota: 80,
    points: 1.0,
    description:
      "Công ty X tuyển dụng các sinh viên ngành Công Nghệ Thông Tin.",
    status: "rejected",
    createdBy: "Ban chủ nhiệm",
    feedback: "Sự kiện chưa đủ thông tin chi tiết. Vui lòng cập nhật lại.",
  },
];

const STATUS_CONFIG = {
  draft: {
    label: "Bản nháp",
    bg: "bg-slate-100",
    text: "text-slate-700",
    badge: "bg-slate-50 border-slate-200",
  },
  pending_faculty: {
    label: "Chờ duyệt",
    bg: "bg-blue-100",
    text: "text-blue-700",
    badge: "bg-blue-50 border-blue-200",
  },
  pending_student_affairs: {
    label: "Chờ CTSV",
    bg: "bg-purple-100",
    text: "text-purple-700",
    badge: "bg-purple-50 border-purple-200",
  },
  approved: {
    label: "✓ Đã cấp phép",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    badge: "bg-emerald-50 border-emerald-200",
  },
  rejected: {
    label: "✗ Bị từ chối",
    bg: "bg-rose-100",
    text: "text-rose-700",
    badge: "bg-rose-50 border-rose-200",
  },
};

// ============================================
// STAT CARD COMPONENT
// ============================================
const StatCard = ({ icon: Icon, label, value }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

// ============================================
// CREATE/EDIT EVENT MODAL
// ============================================
const EventFormModal = ({ isOpen, event, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    event || {
      name: "",
      startTime: "",
      endTime: "",
      location: "",
      quota: "",
      points: "",
      description: "",
    },
  );

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "quota" || name === "points" ? parseFloat(value) || "" : value,
    }));
  };

  const handleSaveDraft = () => {
    onSave(formData, "draft");
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert("Vui lòng nhập tên sự kiện");
      return;
    }
    onSave(formData, "pending_faculty");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-lg"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto border border-slate-100">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 px-8 py-8 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {event ? "Chỉnh sửa sự kiện" : "Tạo sự kiện mới"}
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              {event
                ? "Cập nhật thông tin sự kiện"
                : "Lập kế hoạch hoạt động mới"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            <FiX className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Event Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Tên sự kiện
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên sự kiện"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Time Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Thời gian bắt đầu
              </label>
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Thời gian kết thúc
              </label>
              <input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Địa điểm
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Nhập địa điểm tổ chức"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Quota & Points Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Số lượng thành viên dự kiến
              </label>
              <input
                type="number"
                name="quota"
                value={formData.quota}
                onChange={handleChange}
                placeholder="Số lượng"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Điểm rèn luyện
              </label>
              <input
                type="number"
                name="points"
                value={formData.points}
                onChange={handleChange}
                step="0.5"
                placeholder="Điểm"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Mô tả chi tiết kế hoạch
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả chi tiết về sự kiện..."
              rows="5"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-8 py-6 flex items-center justify-end gap-3 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-all"
          >
            Hủy
          </button>
          <button
            onClick={handleSaveDraft}
            className="px-6 py-2.5 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all"
          >
            Lưu bản nháp
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <FiSend className="w-4 h-4" />
            Gửi phê duyệt
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// APPROVAL STEPPER COMPONENT
// ============================================
const ApprovalStepper = ({ status }) => {
  const steps = [
    { key: "draft", label: "Tạo mới", icon: "📝" },
    { key: "pending_faculty", label: "Khoa duyệt", icon: "🏫" },
    { key: "pending_student_affairs", label: "CTSV duyệt", icon: "👥" },
    { key: "approved", label: "Hoàn tất", icon: "✅" },
  ];

  const statusOrder = [
    "draft",
    "pending_faculty",
    "pending_student_affairs",
    "approved",
  ];
  const currentIndex = statusOrder.indexOf(status);

  return (
    <div className="py-6">
      <div className="flex items-center gap-2">
        {steps.map((step, idx) => (
          <div key={step.key} className="flex items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                idx <= currentIndex
                  ? "bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 text-white shadow-lg"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {step.icon}
            </div>
            <span
              className={`ml-2 text-xs font-semibold whitespace-nowrap ${
                idx <= currentIndex ? "text-cyan-600" : "text-slate-500"
              }`}
            >
              {step.label}
            </span>
            {idx < steps.length - 1 && (
              <div
                className={`mx-2 flex-1 h-1 transition-all ${
                  idx < currentIndex ? "bg-cyan-600" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// EVENT DETAIL MODAL
// ============================================
const EventDetailModal = ({ isOpen, event, onClose }) => {
  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-lg"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto border border-slate-100">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 px-8 py-8 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-2xl font-bold text-white">Chi tiết sự kiện</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            <FiX className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Approval Stepper */}
          <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 rounded-2xl p-6 border border-blue-100">
            <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">
              Tiến trình phê duyệt
            </h3>
            <ApprovalStepper status={event.status} />
          </div>

          {/* Event Name */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
              Tên sự kiện
            </p>
            <p className="text-lg font-bold text-slate-900">{event.name}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                Thời gian bắt đầu
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {event.startTime}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                Thời gian kết thúc
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {event.endTime}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                Địa điểm
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {event.location}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                Số lượng dự kiến
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {event.quota} thành viên
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                Điểm rèn luyện
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {event.points} điểm
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                Trạng thái
              </p>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[event.status].bg} ${STATUS_CONFIG[event.status].text}`}
              >
                {STATUS_CONFIG[event.status].label}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
              Mô tả chi tiết
            </p>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-sm text-slate-700 leading-relaxed">
                {event.description}
              </p>
            </div>
          </div>

          {/* Feedback Alert */}
          {event.status === "rejected" && event.feedback && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
              <div className="flex gap-3">
                <FiAlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-rose-900 mb-1">
                    Lý do từ chối:
                  </p>
                  <p className="text-sm text-rose-700">{event.feedback}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-8 py-6 flex items-center justify-end rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// EVENT CARD COMPONENT
// ============================================
const EventCard = ({ event, onEdit, onDelete, onView }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            {event.name}
          </h3>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <FiCalendar className="w-4 h-4 text-blue-600" />
              <span>{event.startTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiMapPin className="w-4 h-4 text-blue-600" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiUsers className="w-4 h-4 text-blue-600" />
              <span>{event.quota} thành viên</span>
            </div>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${STATUS_CONFIG[event.status].bg} ${STATUS_CONFIG[event.status].text}`}
        >
          {STATUS_CONFIG[event.status].label}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-600 mb-4 line-clamp-2">
        {event.description}
      </p>

      {/* Rejection Alert */}
      {event.status === "rejected" && event.feedback && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
          <strong>Lý do từ chối:</strong> {event.feedback}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {(event.status === "draft" || event.status === "rejected") && (
          <>
            <button
              onClick={() => onEdit(event)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all font-medium"
            >
              <FiEdit2 className="w-4 h-4" />
              Sửa
            </button>
            <button
              onClick={() => onDelete(event.id)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-all font-medium"
            >
              <FiTrash2 className="w-4 h-4" />
              Xóa
            </button>
          </>
        )}
        {(event.status === "pending_faculty" ||
          event.status === "pending_student_affairs" ||
          event.status === "approved") && (
          <button
            onClick={() => onView(event)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium"
          >
            <FiEye className="w-4 h-4" />
            Xem chi tiết
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function BCNManagementPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [filter, setFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [detailEvent, setDetailEvent] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Calculate statistics
  const totalEvents = events.length;
  const draftCount = events.filter((e) => e.status === "draft").length;
  const pendingCount = events.filter(
    (e) => e.status === "pending_faculty",
  ).length;

  // Filter events
  const filteredEvents =
    filter === "all" ? events : events.filter((e) => e.status === filter);

  // Handlers
  const handleCreateEvent = () => {
    setEditingEvent(null);
    setIsFormOpen(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleSaveEvent = (formData, status) => {
    if (editingEvent) {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === editingEvent.id ? { ...e, ...formData, status } : e,
        ),
      );
    } else {
      setEvents((prev) => [
        ...prev,
        {
          ...formData,
          id: Math.max(...prev.map((e) => e.id), 0) + 1,
          status,
          feedback: "",
          createdBy: user?.hoTen || "Ban chủ nhiệm",
        },
      ]);
    }
    setIsFormOpen(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (id) => {
    if (confirm("Bạn chắc chắn muốn xóa sự kiện này?")) {
      setEvents((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const handleViewEvent = (event) => {
    setDetailEvent(event);
    setIsDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">
                Quản lý Hoạt động Câu lạc bộ
              </h1>
              <p className="text-slate-600 mt-2">
                Đã đăng nhập:{" "}
                <span className="font-semibold">{user?.hoTen}</span>
              </p>
            </div>
            <button
              onClick={handleCreateEvent}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              <FiPlus className="w-5 h-5" />
              Tạo sự kiện mới
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={FiCalendar}
              label="Tổng sự kiện"
              value={totalEvents}
            />
            <StatCard
              icon={FiAlertCircle}
              label="Đang dự thảo (Nháp)"
              value={draftCount}
            />
            <StatCard
              icon={FiSend}
              label="Đang chờ duyệt"
              value={pendingCount}
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-3 flex-wrap">
            {[
              { key: "all", label: "Tất cả" },
              { key: "draft", label: "Bản nháp" },
              { key: "pending_faculty", label: "Chờ duyệt" },
              { key: "approved", label: "Đã cấp phép" },
              { key: "rejected", label: "Bị từ chối" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === tab.key
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-slate-700 border border-slate-300 hover:border-blue-400"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Events Grid */}
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onEdit={handleEditEvent}
                  onDelete={handleDeleteEvent}
                  onView={handleViewEvent}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <FiAlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-900 mb-1">
                Không có sự kiện nào
              </p>
              <p className="text-slate-600">Hãy tạo sự kiện mới để bắt đầu</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <EventFormModal
        isOpen={isFormOpen}
        event={editingEvent}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
      />

      <EventDetailModal
        isOpen={isDetailOpen}
        event={detailEvent}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailEvent(null);
        }}
      />
    </div>
  );
}
