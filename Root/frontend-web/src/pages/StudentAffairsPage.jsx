/**
 * StudentAffairsPage - Phòng Công tác sinh viên (CTSV) cấp phép hoạt động sự kiện
 *
 * Chức năng:
 * - Tổng quan với 4 stat cards chuyên nghiệp
 * - Danh sách phê duyệt cuối (pending_student_affairs)
 * - Modal cấp phép với stepper tiến trình
 * - Xuất báo cáo tháng
 * - Giao diện đỉnh cao, hiện đại, tone xanh - trắng
 */

import { useState } from "react";
import {
  FiCheck,
  FiX,
  FiCalendar,
  FiUsers,
  FiCheckCircle,
  FiAlertCircle,
  FiMessageSquare,
  FiDownload,
  FiChevronRight,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

// ============================================
// MOCK DATA
// ============================================
const MOCK_PENDING_EVENTS = [
  {
    id: 1,
    name: "Buổi tư vấn Du học Úc",
    startTime: "2026-05-22 14:00",
    endTime: "2026-05-22 16:00",
    location: "Phòng hội trường B",
    quota: 150,
    points: 0.5,
    description:
      "Tư vấn chi tiết về chương trình du học tại các trường Đại học Úc hàng đầu.",
    status: "pending_student_affairs",
    clubName: "CLB Tiếng Anh UTE",
    approvedByFaculty: "Cán bộ Khoa - Đã duyệt",
  },
  {
    id: 2,
    name: "Sự kiện tuyên dương Sinh viên Xuất sắc",
    startTime: "2026-05-25 19:00",
    endTime: "2026-05-25 21:00",
    location: "Nhà văn hóa sinh viên",
    quota: 300,
    points: 2.0,
    description:
      "Lễ tuyên dương và khen thưởng các sinh viên có thành tích xuất sắc trong năm học.",
    status: "pending_student_affairs",
    clubName: "Đoàn Thanh niên",
    approvedByFaculty: "Cán bộ Khoa - Đã duyệt",
  },
];

const MOCK_APPROVED_EVENTS = [
  {
    id: 10,
    name: "Hackathon Innovation 2026",
    startTime: "2026-05-20 08:00",
    endTime: "2026-05-21 17:00",
    status: "approved",
    clubName: "CLB Lập trình UTE",
    approvedDate: "2026-05-12",
    registeredCount: 180,
  },
  {
    id: 11,
    name: "Hội thảo Python Advanced",
    startTime: "2026-05-15 09:00",
    endTime: "2026-05-15 11:30",
    status: "approved",
    clubName: "CLB Lập trình UTE",
    approvedDate: "2026-05-10",
    registeredCount: 95,
  },
];

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
// STAT CARD COMPONENT - PREMIUM DESIGN
// ============================================
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    rose: "bg-rose-50 border-rose-200 text-rose-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
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
// FINAL APPROVAL MODAL WITH GLASSMORPHISM
// ============================================
const FinalApprovalModal = ({
  isOpen,
  event,
  onClose,
  onApprove,
  onReject,
}) => {
  const [opinion, setOpinion] = useState("");

  if (!isOpen || !event) return null;

  const handleApprove = () => {
    onApprove(event.id, opinion);
    setOpinion("");
  };

  const handleReject = () => {
    if (!opinion.trim()) {
      alert("Vui lòng nhập lý do không cấp phép");
      return;
    }
    onReject(event.id, opinion);
    setOpinion("");
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
            <h2 className="text-2xl font-bold text-white">Cấp Phép Hoạt Động</h2>
            <p className="text-blue-100 text-sm mt-1">
              Phê duyệt cuối cùng từ Phòng CTSV
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

                {/* Faculty Approval */}
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                    Duyệt Khoa
                  </p>
                  <p className="text-sm font-semibold text-emerald-700 flex items-center gap-1">
                    <FiCheck className="w-4 h-4" />
                    {event.approvedByFaculty}
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

          {/* Opinion/Reason Input */}
          <div>
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">
              <FiMessageSquare className="inline w-4 h-4 mr-2" />
              Ý kiến chỉ đạo / Lý do
            </label>
            <textarea
              value={opinion}
              onChange={(e) => setOpinion(e.target.value)}
              placeholder="Nhập ý kiến chỉ đạo hoặc lý do không cấp phép..."
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
            Cấp phép hoạt động
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// EVENT CARD COMPONENT - PENDING EVENTS
// ============================================
const EventCard = ({ event, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(event)}
      className="group bg-white rounded-2xl border border-slate-200 hover:border-teal-300 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
    >
      {/* Top accent */}
      <div className="h-1 bg-gradient-to-r from-teal-600 to-cyan-600" />

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-2">
              {event.name}
            </h3>
            <p className="text-sm text-slate-600 mt-1">{event.clubName}</p>
          </div>
          <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full whitespace-nowrap">
            Chờ duyệt
          </span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <FiCalendar className="w-4 h-4 text-teal-600" />
            <span>{event.startTime}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <span className="text-xs font-semibold">{event.points} điểm</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 line-clamp-2">
          {event.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">
              {event.quota} chỗ
            </span>
          </div>
          <FiChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
        </div>
      </div>
    </div>
  );
};

// ============================================
// APPROVED EVENT CARD COMPONENT
// ============================================
const ApprovedEventCard = ({ event }) => {
  return (
    <div className="bg-white rounded-xl border border-emerald-200 p-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-slate-900 line-clamp-2">
          {event.name}
        </h3>
        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full whitespace-nowrap">
          ✓ Đã cấp phép
        </span>
      </div>
      <p className="text-xs text-slate-600 mb-2">{event.clubName}</p>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Cấp phép: {event.approvedDate}</span>
        <span className="font-semibold text-slate-700">
          {event.registeredCount} SV
        </span>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function StudentAffairsPage() {
  const { user } = useAuth();
  const [pendingEvents, setPendingEvents] = useState(MOCK_PENDING_EVENTS);
  const [approvedEvents, setApprovedEvents] = useState(MOCK_APPROVED_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate statistics
  const totalEvents = pendingEvents.length + approvedEvents.length;
  const totalStudents = approvedEvents.reduce(
    (sum, e) => sum + (e.registeredCount || 0),
    0
  );
  const completedEvents = approvedEvents.length;

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleApprove = (eventId, opinion) => {
    setPendingEvents((prev) => prev.filter((e) => e.id !== eventId));
    const event = pendingEvents.find((e) => e.id === eventId);
    if (event) {
      setApprovedEvents((prev) => [
        ...prev,
        {
          ...event,
          status: "approved",
          approvedDate: new Date().toISOString().split("T")[0],
          registeredCount: Math.floor(Math.random() * (event.quota - 50) + 50),
          opinion,
        },
      ]);
    }
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleReject = (eventId, reason) => {
    setPendingEvents((prev) => prev.filter((e) => e.id !== eventId));
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleExportReport = () => {
    const month = new Date().toLocaleString("vi-VN", {
      month: "long",
      year: "numeric",
    });
    alert(
      `Xuất báo cáo tháng ${month}\n\nTổng sự kiện: ${totalEvents}\nSự kiện hoàn thành: ${completedEvents}\nTổng sinh viên tham gia: ${totalStudents}`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Quản Lý Cấp Phép Sự Kiện
            </h1>
            <p className="text-slate-600 mt-2">
              Phòng Công Tác Sinh Viên: <span className="font-semibold">{user?.hoTen}</span>
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              icon={FiCalendar}
              label="Tổng sự kiện toàn trường"
              value={totalEvents}
              color="blue"
            />
            <StatCard
              icon={FiAlertCircle}
              label="Hồ sơ chờ CTSV duyệt"
              value={pendingEvents.length}
              color="amber"
            />
            <StatCard
              icon={FiCheckCircle}
              label="Sự kiện hoàn thành"
              value={completedEvents}
              color="emerald"
            />
            <StatCard
              icon={FiUsers}
              label="Tổng SV tham gia"
              value={totalStudents}
              color="blue"
            />
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Danh sách phê duyệt cuối
                </h2>
                <p className="text-slate-600 text-sm mt-1">
                  {pendingEvents.length} sự kiện chờ cấp phép
                </p>
              </div>
              <button
                onClick={handleExportReport}
                className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-900 transition-all shadow-md hover:shadow-lg"
              >
                <FiDownload className="w-4 h-4" />
                Xuất báo cáo tháng
              </button>
            </div>

            {/* Events Grid */}
            {pendingEvents.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pendingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onSelect={handleSelectEvent}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <FiCheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <p className="text-lg font-semibold text-slate-900 mb-1">
                  Không có sự kiện chờ duyệt
                </p>
                <p className="text-slate-600">
                  Tất cả sự kiện đã được xử lý
                </p>
              </div>
            )}
          </div>

          {/* Approved Events Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Sự kiện đã cấp phép
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                {approvedEvents.length} sự kiện • {totalStudents} sinh viên tham gia
              </p>
            </div>

            {approvedEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {approvedEvents.map((event) => (
                  <ApprovedEventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-xl border border-slate-200">
                <p className="text-slate-600">Chưa có sự kiện nào được cấp phép</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Final Approval Modal */}
      <FinalApprovalModal
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
