import { useState } from "react";
import {
  FiPlus,
  FiX,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiAlertCircle,
  FiLogOut,
} from "react-icons/fi";
import EventFormModal from "../components/events/EventFormModal";

/**
 * ============================================
 * ROLE-BASED EVENT MANAGEMENT SYSTEM
 * ============================================
 * Hệ thống quản lý sự kiện với phân quyền 3 role:
 * - BCN (Ban chủ nhiệm CLB): Tạo/Sửa/Xóa sự kiện
 * - KHOA (Cán bộ Khoa): Phê duyệt sự kiện (pending_faculty)
 * - CTSV (Phòng Công tác sinh viên): Phê duyệt sự kiện (pending_student_affairs)
 */

// ============================================
// LOGIN COMPONENT - Trang đăng nhập
// ============================================
const LoginComponent = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: "BCN",
      name: "Ban Chủ Nhiệm CLB",
      description: "Tạo, sửa, xóa và quản lý sự kiện",
      icon: "👑",
      color: "from-blue-600 to-blue-700",
    },
    {
      id: "KHOA",
      name: "Cán Bộ Khoa/Phòng Ban",
      description: "Phê duyệt sự kiện ở bước Khoa",
      icon: "🏢",
      color: "from-cyan-600 to-cyan-700",
    },
    {
      id: "CTSV",
      name: "Phòng Công Tác Sinh Viên",
      description: "Phê duyệt sự kiện ở bước CTSV",
      icon: "📋",
      color: "from-emerald-600 to-emerald-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />

      <div className="relative z-10 max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-blue-600 mb-3">
            🎓 Hệ Thống Quản Lý Sự Kiện
          </h1>
          <p className="text-lg text-slate-600">
            Vui lòng chọn vai trò của bạn để tiếp tục
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`group relative p-6 rounded-2xl transition-all duration-300 ${
                selectedRole === role.id
                  ? `bg-gradient-to-br ${role.color} shadow-2xl scale-105`
                  : "bg-white border-2 border-slate-200 hover:border-blue-400 shadow-lg hover:shadow-xl"
              }`}
            >
              {/* Card Content */}
              <div
                className={`space-y-3 transition-all ${
                  selectedRole === role.id ? "text-white" : "text-slate-800"
                }`}
              >
                <div className="text-5xl mb-2">{role.icon}</div>
                <h3 className="text-lg font-bold">{role.name}</h3>
                <p
                  className={`text-sm ${
                    selectedRole === role.id
                      ? "text-blue-100"
                      : "text-slate-600"
                  }`}
                >
                  {role.description}
                </p>
              </div>

              {/* Selection Indicator */}
              {selectedRole === role.id && (
                <div className="absolute top-4 right-4 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                  <FiCheck className="w-4 h-4 text-blue-600 font-bold" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Login Button */}
        <div className="text-center">
          <button
            onClick={() => selectedRole && onLogin(selectedRole)}
            disabled={!selectedRole}
            className={`px-12 py-4 text-lg font-bold rounded-xl transition-all duration-300 ${
              selectedRole
                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg hover:shadow-2xl hover:scale-105 cursor-pointer"
                : "bg-slate-300 text-slate-500 cursor-not-allowed"
            }`}
          >
            🚀 Vào Hệ Thống
          </button>
        </div>
      </div>
    </div>
  );
};

// Mock Data - 5 sự kiện mẫu với đầy đủ trạng thái
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
    status: "draft", // Bản nháp
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
    status: "pending_faculty", // Chờ Khoa duyệt
    createdBy: "Ban chủ nhiệm",
    feedback: "",
  },
  {
    id: 3,
    name: "Buổi tư vấn Du học Úc",
    startTime: "2026-05-22 14:00",
    endTime: "2026-05-22 16:00",
    location: "Phòng hội trường B",
    quota: 150,
    points: 0.5,
    description:
      "Tư vấn chi tiết về chương trình du học tại các trường Đại học Úc hàng đầu.",
    status: "pending_student_affairs", // Chờ CTSV duyệt
    createdBy: "Ban chủ nhiệm",
    feedback: "",
  },
  {
    id: 4,
    name: "Lễ tuyên dương Sinh viên Xuất sắc 2025",
    startTime: "2026-05-25 19:00",
    endTime: "2026-05-25 21:00",
    location: "Nhà văn hóa sinh viên",
    quota: 300,
    points: 2.0,
    description:
      "Lễ tuyên dương và khen thưởng các sinh viên có thành tích xuất sắc trong năm học.",
    status: "approved", // Đã duyệt
    createdBy: "Ban chủ nhiệm",
    feedback: "Sự kiện hay, ủng hộ",
  },
  {
    id: 5,
    name: "Roadshow Tuyển dụng Công ty X",
    startTime: "2026-05-28 10:00",
    endTime: "2026-05-28 12:00",
    location: "Phòng C205",
    quota: 80,
    points: 1.0,
    description:
      "Công ty X tuyển dụng các sinh viên ngành Công Nghệ Thông Tin.",
    status: "rejected", // Bị từ chối
    createdBy: "Ban chủ nhiệm",
    feedback:
      "Sự kiện chưa đủ thông tin chi tiết. Vui lòng cập nhật lại nội dung trước khi nộp.",
  },
];

// Status Badge - Hiển thị trạng thái sự kiện
const StatusBadge = ({ status }) => {
  const statusConfig = {
    draft: { label: "Bản nháp", bg: "bg-slate-100", text: "text-slate-700" },
    pending_faculty: {
      label: "Chờ Khoa duyệt",
      bg: "bg-amber-100",
      text: "text-amber-700",
    },
    pending_student_affairs: {
      label: "Chờ CTSV duyệt",
      bg: "bg-blue-100",
      text: "text-blue-700",
    },
    approved: {
      label: "Đã duyệt",
      bg: "bg-emerald-100",
      text: "text-emerald-700",
    },
    rejected: { label: "Bị từ chối", bg: "bg-rose-100", text: "text-rose-700" },
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
};

// Progress Stepper - Hiển thị quá trình duyệt
const ApprovalStepper = ({ status }) => {
  const steps = [
    { key: "draft", label: "Tạo mới" },
    { key: "pending_faculty", label: "Khoa duyệt" },
    { key: "pending_student_affairs", label: "CTSV duyệt" },
    { key: "approved", label: "Hoàn tất" },
  ];

  const statusOrder = [
    "draft",
    "pending_faculty",
    "pending_student_affairs",
    "approved",
    "rejected",
  ];
  const currentIndex = statusOrder.indexOf(status);

  return (
    <div className="py-4">
      <div className="flex items-center gap-2">
        {steps.map((step, idx) => (
          <div key={step.key} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                idx <= currentIndex
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {idx + 1}
            </div>
            <span
              className={`ml-2 text-xs font-medium ${
                idx <= currentIndex ? "text-blue-600" : "text-slate-500"
              }`}
            >
              {step.label}
            </span>
            {idx < steps.length - 1 && (
              <div
                className={`mx-3 flex-1 h-1 transition-all ${
                  idx < currentIndex ? "bg-blue-600" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// APPROVAL MODAL - Phê duyệt/Từ chối sự kiện (hỗ trợ role-based logic)
const ApprovalModal = ({
  isOpen,
  event,
  userRole,
  onClose,
  onApprove,
  onReject,
}) => {
  const [feedback, setFeedback] = useState(event?.feedback || "");
  const [reason, setReason] = useState("");

  // Xác định chế độ modal dựa trên role và status
  const isReadOnly =
    userRole === "BCN" ||
    !["pending_faculty", "pending_student_affairs"].includes(event?.status);

  const canApprove =
    (userRole === "KHOA" && event?.status === "pending_faculty") ||
    (userRole === "CTSV" && event?.status === "pending_student_affairs");

  const handleApprove = () => {
    onApprove(event.id, feedback);
    setFeedback("");
    setReason("");
  };

  const handleReject = () => {
    if (!reason.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }
    onReject(event.id, reason);
    setFeedback("");
    setReason("");
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className={`sticky top-0 bg-gradient-to-r ${
            isReadOnly
              ? "from-slate-600 to-slate-500"
              : "from-blue-600 to-blue-500"
          } px-8 py-6 flex items-center justify-between rounded-t-2xl`}
        >
          <h2 className="text-xl font-bold text-white">
            {isReadOnly ? "Chi tiết Sự kiện" : "Phê duyệt Sự kiện"}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isReadOnly ? "hover:bg-slate-700" : "hover:bg-blue-700"
            }`}
          >
            <FiX className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Event Info */}
          <div className="bg-slate-50 rounded-xl p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase mb-1">
                Tên sự kiện
              </h3>
              <p className="text-lg font-bold text-slate-800">{event.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase mb-1">
                  Thời gian
                </h4>
                <p className="text-slate-700">{event.startTime}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase mb-1">
                  Địa điểm
                </h4>
                <p className="text-slate-700">{event.location}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase mb-1">
                  Chỉ tiêu SV
                </h4>
                <p className="text-slate-700">{event.quota} sinh viên</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase mb-1">
                  Điểm rèn luyện
                </h4>
                <p className="text-slate-700">{event.points} điểm</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-500 uppercase mb-1">
                Mô tả
              </h4>
              <p className="text-slate-700">{event.description}</p>
            </div>
          </div>

          {/* Approval Stepper */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">
              Tiến trình phê duyệt
            </h3>
            <ApprovalStepper status={event.status} />
          </div>

          {/* Feedback/Reason - Hiển thị khác nhau tùy role */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              {event.status === "rejected"
                ? "Lý do từ chối"
                : isReadOnly
                  ? "Lý do từ chối (nếu có)"
                  : "Lý do phê duyệt / từ chối"}
            </label>
            {isReadOnly ? (
              <div className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-700">
                {event.feedback || "Không có ghi chú"}
              </div>
            ) : (
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập lý do hoặc ghi chú của bạn"
                rows="4"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none"
              />
            )}
          </div>
        </div>

        {/* Footer - Hiển thị nút hành động dựa trên role */}
        <div className="border-t border-slate-200 bg-slate-50 px-8 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-all"
          >
            Đóng
          </button>

          {/* Nút hành động chỉ hiển thị khi không phải read-only */}
          {!isReadOnly && canApprove && (
            <>
              <button
                onClick={handleReject}
                className="px-6 py-2 bg-rose-500 text-white font-medium rounded-lg hover:bg-rose-600 transition-all shadow-sm"
              >
                Từ chối
              </button>
              <button
                onClick={handleApprove}
                className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-all shadow-sm"
              >
                Phê duyệt
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// HEADER - Hiển thị role hiện tại + nút Đăng xuất
// ============================================
const RoleHeader = ({ userRole, onLogout }) => {
  const roleConfig = {
    BCN: { name: "Ban Chủ Nhiệm CLB", color: "from-blue-600 to-blue-700" },
    KHOA: { name: "Cán Bộ Khoa/Phòng Ban", color: "from-cyan-600 to-cyan-700" },
    CTSV: {
      name: "Phòng Công Tác Sinh Viên",
      color: "from-emerald-600 to-emerald-700",
    },
  };

  const config = roleConfig[userRole] || {};

  return (
    <div
      className={`bg-gradient-to-r ${config.color} px-8 py-5 text-white shadow-lg`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quản Lý Sự Kiện</h2>
          <p className="text-blue-100 text-sm mt-1">Vai trò: {config.name}</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-all"
        >
          <FiLogOut className="w-5 h-5" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

// ============================================
// MAIN EVENT MANAGEMENT PAGE COMPONENT
// ============================================
export default function EventManagementPage() {
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [activeTab, setActiveTab] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);

  // Xử lý đăng nhập
  const handleLogin = (role) => {
    setCurrentUserRole(role);
    setActiveTab("all");
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    setCurrentUserRole(null);
    setActiveTab("all");
    setIsFormOpen(false);
    setIsApprovalOpen(false);
    setSelectedEvent(null);
    setEditingEvent(null);
  };

  // Nếu chưa đăng nhập, hiển thị trang Login
  if (!currentUserRole) {
    return <LoginComponent onLogin={handleLogin} />;
  }

  // ============================================
  // LOGIC LỌC THEO ROLE
  // ============================================

  // Định nghĩa tabs hiển thị dựa trên role
  const getTabsForRole = () => {
    if (currentUserRole === "BCN") {
      return [
        { key: "all", label: "Tất cả" },
        { key: "draft", label: "Bản nháp" },
        { key: "pending_faculty", label: "Chờ Khoa duyệt" },
        { key: "pending_student_affairs", label: "Chờ CTSV duyệt" },
        { key: "approved", label: "Đã duyệt" },
        { key: "rejected", label: "Bị từ chối" },
      ];
    } else if (currentUserRole === "KHOA") {
      return [{ key: "pending_faculty", label: "Chờ duyệt" }];
    } else {
      // CTSV
      return [{ key: "pending_student_affairs", label: "Chờ duyệt" }];
    }
  };

  const tabs = getTabsForRole();

  // Lọc sự kiện theo role và tab
  const getFilteredEvents = () => {
    let filtered = events;

    // Lọc theo role
    if (currentUserRole === "BCN") {
      // BCN thấy tất cả sự kiện của mình
      filtered = events;
    } else if (currentUserRole === "KHOA") {
      // KHOA chỉ thấy sự kiện ở trạng thái pending_faculty
      filtered = events.filter((e) => e.status === "pending_faculty");
    } else if (currentUserRole === "CTSV") {
      // CTSV chỉ thấy sự kiện ở trạng thái pending_student_affairs
      filtered = events.filter((e) => e.status === "pending_student_affairs");
    }

    // Lọc theo tab
    if (activeTab !== "all") {
      filtered = filtered.filter((event) => event.status === activeTab);
    }

    return filtered;
  };

  const filteredEvents = getFilteredEvents();

  // Xử lý tạo sự kiện mới (chỉ BCN)
  const handleCreateEvent = () => {
    if (currentUserRole !== "BCN") {
      alert("Chỉ Ban Chủ Nhiệm mới có quyền tạo sự kiện");
      return;
    }
    setEditingEvent(null);
    setIsFormOpen(true);
  };

  // Xử lý sửa sự kiện (chỉ BCN, chỉ draft hoặc rejected)
  const handleEditEvent = (event) => {
    if (currentUserRole !== "BCN") {
      alert("Chỉ Ban Chủ Nhiệm mới có quyền sửa sự kiện");
      return;
    }
    if (!["draft", "rejected"].includes(event.status)) {
      alert("Chỉ có thể sửa sự kiện ở trạng thái Bản nháp hoặc Bị từ chối");
      return;
    }
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  // Xử lý xóa sự kiện (chỉ BCN, chỉ draft hoặc rejected)
  const handleDeleteEvent = (id) => {
    if (currentUserRole !== "BCN") {
      alert("Chỉ Ban Chủ Nhiệm mới có quyền xóa sự kiện");
      return;
    }

    const event = events.find((e) => e.id === id);
    if (!["draft", "rejected"].includes(event.status)) {
      alert("Chỉ có thể xóa sự kiện ở trạng thái Bản nháp hoặc Bị từ chối");
      return;
    }

    if (window.confirm("Bạn chắc chắn muốn xóa sự kiện này?")) {
      setEvents((prev) => prev.filter((event) => event.id !== id));
    }
  };

  // Xử lý lưu sự kiện
  const handleSaveEvent = (formData, action) => {
    if (editingEvent) {
      setEvents((prev) =>
        prev.map((event) =>
          event.id === editingEvent.id
            ? {
                ...event,
                ...formData,
                status: action === "submit" ? "pending_faculty" : "draft",
              }
            : event,
        ),
      );
    } else {
      const newEvent = {
        id: Math.max(...events.map((e) => e.id), 0) + 1,
        ...formData,
        status: action === "submit" ? "pending_faculty" : "draft",
        createdBy: "Ban chủ nhiệm",
        feedback: "",
      };
      setEvents((prev) => [newEvent, ...prev]);
    }
    setIsFormOpen(false);
    setEditingEvent(null);
  };

  // Xử lý phê duyệt sự kiện
  const handleApproveEvent = (id, feedback) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id
          ? {
              ...event,
              status:
                event.status === "pending_faculty"
                  ? "pending_student_affairs"
                  : "approved",
              feedback,
            }
          : event,
      ),
    );
    setIsApprovalOpen(false);
    setSelectedEvent(null);
  };

  // Xử lý từ chối sự kiện
  const handleRejectEvent = (id, reason) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id
          ? { ...event, status: "rejected", feedback: reason }
          : event,
      ),
    );
    setIsApprovalOpen(false);
    setSelectedEvent(null);
  };

  // Xử lý mở modal phê duyệt
  const handleOpenApprovalModal = (event) => {
    setSelectedEvent(event);
    setIsApprovalOpen(true);
  };

  // Xác định có thể phê duyệt hay không dựa trên role
  const canApproveEvent = (event) => {
    if (currentUserRole === "KHOA") {
      return event.status === "pending_faculty";
    }
    if (currentUserRole === "CTSV") {
      return event.status === "pending_student_affairs";
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header theo role */}
      <RoleHeader userRole={currentUserRole} onLogout={handleLogout} />

      {/* Content */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* ============ HEADER ============ */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Quản lý Sự kiện
              </h1>
              <p className="text-slate-500 mt-1">
                {currentUserRole === "BCN"
                  ? "Tạo, sửa và quản lý sự kiện"
                  : currentUserRole === "KHOA"
                    ? "Phê duyệt sự kiện từ Ban Chủ Nhiệm"
                    : "Phê duyệt sự kiện từ Khoa/Phòng Ban"}
              </p>
            </div>

            {/* Nút Tạo sự kiện mới - chỉ dành cho BCN */}
            {currentUserRole === "BCN" && (
              <button
                onClick={handleCreateEvent}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
              >
                <FiPlus className="w-5 h-5" />
                Tạo sự kiện mới
              </button>
            )}
          </div>

          {/* ============ FILTER TABS ============ */}
          <div className="flex gap-3 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-blue-100 text-blue-700 shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ============ EVENTS TABLE ============ */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
            {/* Table Header */}
            <div className="grid grid-cols-7 gap-4 bg-slate-50 px-6 py-4 border-b border-slate-200">
              <div className="text-xs font-bold text-slate-500 uppercase">
                Tên sự kiện
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase">
                Thời gian
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase">
                Địa điểm
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase">
                Chỉ tiêu
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase">
                Điểm
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase">
                Trạng thái
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase">
                Hành động
              </div>
            </div>

            {/* Table Rows */}
            {filteredEvents.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="grid grid-cols-7 gap-4 px-6 py-4 hover:bg-blue-50 transition-colors"
                  >
                    <div className="font-semibold text-slate-800 truncate">
                      {event.name}
                    </div>
                    <div className="text-sm text-slate-600">
                      {event.startTime}
                    </div>
                    <div className="text-sm text-slate-600 truncate">
                      {event.location}
                    </div>
                    <div className="text-sm text-slate-600">{event.quota}</div>
                    <div className="text-sm text-slate-600">{event.points}</div>
                    <div className="flex items-center">
                      <StatusBadge status={event.status} />
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Edit Button - chỉ BCN, chỉ draft */}
                      {currentUserRole === "BCN" &&
                        event.status === "draft" && (
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                            title="Sửa"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                        )}

                      {/* Approval Button - KHOA/CTSV */}
                      {canApproveEvent(event) && (
                        <button
                          onClick={() => handleOpenApprovalModal(event)}
                          className="p-2 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors"
                          title="Phê duyệt"
                        >
                          <FiCheck className="w-4 h-4" />
                        </button>
                      )}

                      {/* View Button - BCN, approved/rejected hoặc others */}
                      {((currentUserRole === "BCN" &&
                        (event.status === "approved" ||
                          event.status === "rejected")) ||
                        ((currentUserRole === "KHOA" ||
                          currentUserRole === "CTSV") &&
                          (event.status === "approved" ||
                            event.status === "rejected"))) && (
                        <button
                          onClick={() => handleOpenApprovalModal(event)}
                          className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <FiAlertCircle className="w-4 h-4" />
                        </button>
                      )}

                      {/* Delete Button - chỉ BCN */}
                      {currentUserRole === "BCN" && (
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-2 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center text-slate-500">
                Không có sự kiện nào cần xử lý
              </div>
            )}
          </div>

          {/* ============ STATS (chỉ BCN) ============ */}
          {currentUserRole === "BCN" && (
            <div className="grid grid-cols-5 gap-4">
              {tabs.slice(1).map((tab) => {
                const count = events.filter(
                  (event) => event.status === tab.key,
                ).length;
                return (
                  <div
                    key={tab.key}
                    className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
                  >
                    <p className="text-sm text-slate-500 font-medium">
                      {tab.label}
                    </p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                      {count}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ============ MODALS ============ */}
      <EventFormModal
        isOpen={isFormOpen}
        event={editingEvent}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
      />

      <ApprovalModal
        isOpen={isApprovalOpen}
        event={selectedEvent}
        userRole={currentUserRole}
        onClose={() => {
          setIsApprovalOpen(false);
          setSelectedEvent(null);
        }}
        onApprove={handleApproveEvent}
        onReject={handleRejectEvent}
      />
    </div>
  );
}
