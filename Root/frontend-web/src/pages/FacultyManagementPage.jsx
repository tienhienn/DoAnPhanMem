/**
 * FacultyManagementPage - Cán bộ Khoa duyệt sự kiện
 *
 * Chức năng:
 * - Xem thống kê nhanh: Cần duyệt, Đã duyệt bảo trợ, Bị từ chối
 * - Danh sách chờ duyệt (pending_faculty)
 * - Modal chi tiết sự kiện (Read-only)
 * - Phê duyệt hoặc từ chối với ghi chú
 * - Chuyển trạng thái sang pending_student_affairs (CTSV)
 */

import { useState } from "react";
import {
  FiCheck,
  FiX,
  FiAlertCircle,
  FiMessageSquare,
  FiChevronRight,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

// ============================================
// MOCK DATA
// ============================================
const MOCK_EVENTS = [
  {
    id: 1,
    name: "Hackathon Innovation 2026",
    startTime: "2026-05-20 08:00",
    endTime: "2026-05-21 17:00",
    location: "Sân vận động trường",
    quota: 200,
    points: 3.0,
    description:
      "Cuộc thi hackathon quy mô lớn, hỗ trợ startup khởi nghiệp.",
    status: "pending_faculty",
    createdBy: "Ban chủ nhiệm CLB Lập trình",
    clubName: "CLB Lập trình UTE",
    feedback: "",
  },
  {
    id: 2,
    name: "Hội thảo Python Advanced",
    startTime: "2026-05-15 09:00",
    endTime: "2026-05-15 11:30",
    location: "Phòng A101, Tòa A",
    quota: 100,
    points: 1.5,
    description:
      "Hội thảo nâng cao về Python, xử lý dữ liệu và Web Development.",
    status: "pending_faculty",
    createdBy: "Ban chủ nhiệm CLB",
    clubName: "CLB Lập trình UTE",
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
      "Tư vấn chi tiết về chương trình du học tại các trường Đại học Úc.",
    status: "pending_student_affairs",
    createdBy: "Ban chủ nhiệm CLB",
    clubName: "CLB Tiếng Anh UTE",
    feedback: "Sự kiện hay, ủng hộ",
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
      "Lễ tuyên dương và khen thưởng các sinh viên có thành tích xuất sắc.",
    status: "approved",
    createdBy: "Ban chủ nhiệm CLB",
    clubName: "Đoàn Thanh niên",
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
    status: "rejected",
    createdBy: "Ban chủ nhiệm CLB",
    clubName: "CLB CNTT",
    feedback: "Sự kiện chưa đủ thông tin chi tiết. Vui lòng cập nhật lại.",
  },
];

// ============================================
// STAT CARD COMPONENT
// ============================================
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    rose: "bg-rose-50 border-rose-200 text-rose-700",
  };

  return (
    <div
      className={`rounded-2xl border p-6 backdrop-blur-sm transition-all hover:shadow-lg ${colorClasses[color]}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <Icon className="w-10 h-10 opacity-30" />
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
// APPROVAL MODAL WITH GLASSMORPHISM - PREMIUM DESIGN
// ============================================
const ApprovalModal = ({
  isOpen,
  event,
  onClose,
  onApprove,
  onReject,
}) => {
  const [notes, setNotes] = useState("");

  if (!isOpen || !event) return null;

  const handleApprove = () => {
    onApprove(event.id, notes);
    setNotes("");
  };

  const handleReject = () => {
    if (!notes.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }
    onReject(event.id, notes);
    setNotes("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-lg"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto border border-slate-100">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 px-8 py-8 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-bold text-white">Phê Duyệt Sự Kiện</h2>
            <p className="text-blue-100 text-sm mt-1">
              Phê duyệt từ Cán bộ Khoa
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
        <div className="p-8 space-y-8">
          {/* Approval Stepper */}
          <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 rounded-2xl p-6 border border-blue-100">
            <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">
              Tiến trình phê duyệt
            </h3>
            <ApprovalStepper status={event.status} />
          </div>

          {/* Event Details - Premium Layout */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">
                Thông tin sự kiện
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Event Name */}
                <div className="md:col-span-2 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                    Tên sự kiện
                  </p>
                  <p className="text-lg font-bold text-slate-900">
                    {event.name}
                  </p>
                </div>

                {/* Time */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                    Thời gian
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {event.startTime}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Kết thúc: {event.endTime}
                  </p>
                </div>

                {/* Location */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                    Địa điểm
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {event.location}
                  </p>
                </div>

                {/* Quota */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                    Chỉ tiêu sinh viên
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {event.quota} sinh viên
                  </p>
                </div>

                {/* Points */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                    Điểm rèn luyện
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {event.points} điểm
                  </p>
                </div>

                {/* Club */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                    Câu lạc bộ
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {event.clubName}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">
                Mô tả chi tiết
              </h3>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>
          </div>

          {/* Approval Notes */}
          <div>
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">
              <FiMessageSquare className="inline w-4 h-4 mr-2" />
              Ghi chú phê duyệt của Khoa
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập ghi chú hoặc lý do từ chối..."
              rows="5"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all resize-none bg-white"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-8 py-6 flex items-center justify-end gap-3 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-all"
          >
            Đóng
          </button>
          <button
            onClick={handleReject}
            className="px-6 py-2.5 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <FiX className="w-4 h-4" />
            Từ chối
          </button>
          <button
            onClick={handleApprove}
            className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <FiCheck className="w-4 h-4" />
            Phê duyệt bảo trợ
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// EVENT TABLE ROW
// ============================================
const EventTableRow = ({ event, onSelect }) => {
  const statusConfig = {
    pending_faculty: {
      label: "Chờ duyệt",
      bg: "bg-amber-100",
      text: "text-amber-700",
    },
    pending_student_affairs: {
      label: "Chờ CTSV",
      bg: "bg-blue-100",
      text: "text-blue-700",
    },
    approved: { label: "Đã duyệt", bg: "bg-emerald-100", text: "text-emerald-700" },
    rejected: { label: "Bị từ chối", bg: "bg-rose-100", text: "text-rose-700" },
  };

  const config = statusConfig[event.status] || statusConfig.pending_faculty;

  return (
    <div
      onClick={() => event.status === "pending_faculty" && onSelect(event)}
      className={`grid grid-cols-6 gap-4 px-6 py-4 border-b border-slate-200 hover:bg-teal-50/30 transition-colors ${
        event.status === "pending_faculty" ? "cursor-pointer" : ""
      }`}
    >
      <div className="font-semibold text-slate-800 truncate">{event.name}</div>
      <div className="text-sm text-slate-600">{event.startTime}</div>
      <div className="text-sm text-slate-600 truncate">{event.location}</div>
      <div className="text-sm text-slate-600">{event.quota}</div>
      <div className="text-sm text-slate-600">{event.points}</div>
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
        >
          {config.label}
        </span>
        {event.status === "pending_faculty" && (
          <FiChevronRight className="w-4 h-4 text-slate-400" />
        )}
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function FacultyManagementPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate statistics
  const pendingCount = events.filter((e) => e.status === "pending_faculty").length;
  const approvedCount = events.filter((e) => e.status === "pending_student_affairs").length;
  const rejectedCount = events.filter((e) => e.status === "rejected").length;

  // Get pending events for display
  const pendingEvents = events.filter((e) => e.status === "pending_faculty");

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleApprove = (eventId, notes) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? { ...e, status: "pending_student_affairs", feedback: notes }
          : e
      )
    );
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleReject = (eventId, reason) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId ? { ...e, status: "rejected", feedback: reason } : e
      )
    );
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Quản Lý Phê Duyệt Sự Kiện
            </h1>
            <p className="text-slate-600 mt-2">
              Cán bộ Khoa: <span className="font-semibold">{user?.hoTen}</span>
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={FiAlertCircle}
              label="Cần duyệt (Pending)"
              value={pendingCount}
              color="amber"
            />
            <StatCard
              icon={FiCheck}
              label="Đã duyệt bảo trợ"
              value={approvedCount}
              color="emerald"
            />
            <StatCard
              icon={FiX}
              label="Hồ sơ bị từ chối"
              value={rejectedCount}
              color="rose"
            />
          </div>

          {/* Events Table */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 px-6 py-4 border-b border-slate-200">
              {[
                "Tên sự kiện",
                "Thời gian",
                "Địa điểm",
                "Chỉ tiêu",
                "Điểm",
                "Trạng thái",
              ].map((h) => (
                <div
                  key={h}
                  className="text-xs font-bold text-slate-600 uppercase"
                >
                  {h}
                </div>
              ))}
            </div>

            {/* Table Body */}
            {pendingEvents.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {pendingEvents.map((event) => (
                  <EventTableRow
                    key={event.id}
                    event={event}
                    onSelect={handleSelectEvent}
                  />
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center text-slate-500">
                <FiAlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Không có sự kiện nào chờ duyệt</p>
              </div>
            )}
          </div>

          {/* All Events Summary */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Tất cả sự kiện
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {events.map((event) => {
                const statusConfig = {
                  pending_faculty: "bg-amber-50 border-amber-200",
                  pending_student_affairs: "bg-blue-50 border-blue-200",
                  approved: "bg-emerald-50 border-emerald-200",
                  rejected: "bg-rose-50 border-rose-200",
                };
                return (
                  <div
                    key={event.id}
                    className={`rounded-xl border p-4 ${statusConfig[event.status]}`}
                  >
                    <p className="font-semibold text-slate-800 text-sm line-clamp-2">
                      {event.name}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">{event.clubName}</p>
                    <p className="text-xs text-slate-500 mt-2">{event.startTime}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      <ApprovalModal
        isOpen={isModalOpen}
        event={selectedEvent}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
