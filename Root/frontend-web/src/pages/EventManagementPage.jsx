import { useState } from "react";
import {
  FiPlus,
  FiX,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";
import EventFormModal from "../components/events/EventFormModal";
/**
 * ============================================
 * EVENT MANAGEMENT PAGE - QUẢN LÝ & PHÊ DUYỆT SỰ KIỆN
 * ============================================
 * Component chính quản lý toàn bộ quy trình tạo, sửa, duyệt sự kiện
 */

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

// APPROVAL MODAL - Phê duyệt/Từ chối sự kiện
const ApprovalModal = ({ isOpen, event, onClose, onApprove, onReject }) => {
  const [feedback, setFeedback] = useState(event?.feedback || "");
  const [reason, setReason] = useState("");

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
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-white">Phê duyệt sự kiện</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-emerald-700 rounded-lg transition-colors"
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

          {/* Feedback/Reason Textarea */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              {event.status === "rejected"
                ? "Lý do từ chối"
                : "Lý do phê duyệt / từ chối"}
            </label>
            {event.status === "rejected" ? (
              <div className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-700">
                {event.feedback}
              </div>
            ) : (
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập lý do hoặc ghi chú của bạn"
                rows="4"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all resize-none"
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-8 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-all"
          >
            Đóng
          </button>
          {event.status !== "rejected" && (
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
                Đồng ý Phê duyệt
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN EVENT MANAGEMENT PAGE COMPONENT
// ============================================
export default function EventManagementPage() {
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [activeTab, setActiveTab] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);

  // Filter tabs
  const tabs = [
    { key: "all", label: "Tất cả" },
    { key: "draft", label: "Bản nháp" },
    { key: "pending_faculty", label: "Chờ Khoa/Phòng ban duyệt" },
    { key: "pending_student_affairs", label: "Chờ CTSV duyệt" },
    { key: "approved", label: "Đã duyệt" },
    { key: "rejected", label: "Bị từ chối" },
  ];

  // Lọc sự kiện theo tab
  const filteredEvents =
    activeTab === "all"
      ? events
      : events.filter((event) => event.status === activeTab);

  // Xử lý tạo sự kiện mới
  const handleCreateEvent = () => {
    setEditingEvent(null);
    setIsFormOpen(true);
  };

  // Xử lý sửa sự kiện
  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  // Xử lý xóa sự kiện
  const handleDeleteEvent = (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa sự kiện này?")) {
      setEvents((prev) => prev.filter((event) => event.id !== id));
    }
  };

  // Xử lý lưu sự kiện
  const handleSaveEvent = (formData, action) => {
    if (editingEvent) {
      // Cập nhật sự kiện
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
      // Tạo sự kiện mới
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

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ============ HEADER ============ */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Quản lý Sự kiện
            </h1>
            <p className="text-slate-500 mt-1">
              Tạo, sửa và phê duyệt sự kiện học tập
            </p>
          </div>
          <button
            onClick={handleCreateEvent}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
          >
            <FiPlus className="w-5 h-5" />
            Tạo sự kiện mới
          </button>
        </div>

        {/* ============ FILTER TABS (PILLS) ============ */}
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
                    {/* Edit Button */}
                    {event.status === "draft" && (
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                        title="Sửa"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                    )}

                    {/* Approval Button */}
                    {(event.status === "pending_faculty" ||
                      event.status === "pending_student_affairs") && (
                      <button
                        onClick={() => handleOpenApprovalModal(event)}
                        className="p-2 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors"
                        title="Phê duyệt"
                      >
                        <FiCheck className="w-4 h-4" />
                      </button>
                    )}

                    {/* View Button for Approved/Rejected */}
                    {(event.status === "approved" ||
                      event.status === "rejected") && (
                      <button
                        onClick={() => handleOpenApprovalModal(event)}
                        className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <FiAlertCircle className="w-4 h-4" />
                      </button>
                    )}

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-2 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-slate-500">
              Không có sự kiện nào trong danh mục này
            </div>
          )}
        </div>

        {/* ============ STATS ============ */}
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
                <p className="text-3xl font-bold text-blue-600 mt-2">{count}</p>
              </div>
            );
          })}
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
