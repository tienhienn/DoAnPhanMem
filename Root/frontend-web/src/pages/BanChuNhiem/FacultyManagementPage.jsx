/**
 * FacultyManagementPage - Cán bộ Khoa duyệt sự kiện
 *
 * Chức năng:
 * - Xem thống kê nhanh: Cần duyệt, Đã duyệt bảo trợ, Bị từ chối
 * - Danh sách chờ duyệt (cho_duyet_khoa)
 * - Modal chi tiết sự kiện (Read-only)
 * - Phê duyệt hoặc từ chối với ghi chú
 * - Chuyển trạng thái sang cho_duyet_ctsv (CTSV)
 */

import { useState, useEffect } from "react";
import {
  FiCheck,
  FiX,
  FiAlertCircle,
  FiMessageSquare,
  FiChevronRight,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// ============================================
// STATUS MAPPING: Database status → UI status
// ============================================
const STATUS_MAP = {
  cho_duyet_khoa: "pending_faculty",
  cho_duyet_ctsv: "pending_student_affairs",
  da_duyet: "approved",
  tu_choi: "rejected",
};

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
    { key: "cho_duyet_khoa", label: "Khoa duyệt", icon: "🏫" },
    { key: "cho_duyet_ctsv", label: "CTSV duyệt", icon: "👥" },
    { key: "da_duyet", label: "Hoàn tất", icon: "✅" },
  ];

  const statusOrder = [
    "draft",
    "cho_duyet_khoa",
    "cho_duyet_ctsv",
    "da_duyet",
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
const ApprovalModal = ({ isOpen, event, onClose, onApprove, onReject, loading }) => {
  const [notes, setNotes] = useState("");

  if (!isOpen || !event) return null;

  const handleApprove = () => {
    onApprove(event.MaSK, notes);
    setNotes("");
  };

  const handleReject = () => {
    if (!notes.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }
    onReject(event.MaSK, notes);
    setNotes("");
  };

  const formatDate = (date) => new Date(date).toLocaleString("vi-VN");

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
            <ApprovalStepper status={event.TrangThai} />
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
                    {event.TenSK}
                  </p>
                </div>

                {/* Time */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                    Thời gian bắt đầu
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatDate(event.ThoiGianBatDau)}
                  </p>
                </div>

                {/* End Time */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                    Thời gian kết thúc
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatDate(event.ThoiGianKetThuc)}
                  </p>
                </div>

                {/* Location */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                    Địa điểm
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {event.DiaDiem || "N/A"}
                  </p>
                </div>

                {/* Quota */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                    Chỉ tiêu sinh viên
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {event.SoNguoiToiDa || "N/A"} sinh viên
                  </p>
                </div>

                {/* Points */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                    Điểm rèn luyện
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {event.DiemRenLuyen || 0} điểm
                  </p>
                </div>

                {/* Event Type */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                    Loại sự kiện
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {event.LoaiSK || "N/A"}
                  </p>
                </div>

                {/* Cost */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                    Chi phí dự kiến
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {event.ChiPhiDuKien?.toLocaleString("vi-VN") || 0} đ
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
                  {event.MoTa || "Không có mô tả"}
                </p>
              </div>
            </div>

            {/* Rejection Reason if rejected */}
            {event.TrangThai === "tu_choi" && event.LyDoTuChoi && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <FiAlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-rose-900 mb-1">
                      Lý do từ chối trước:
                    </p>
                    <p className="text-sm text-rose-700">{event.LyDoTuChoi}</p>
                  </div>
                </div>
              </div>
            )}
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
              disabled={loading}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all resize-none bg-white disabled:opacity-50"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-8 py-6 flex items-center justify-end gap-3 rounded-b-3xl">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            Đóng
          </button>
          <button
            onClick={handleReject}
            disabled={loading}
            className="px-6 py-2.5 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            <FiX className="w-4 h-4" />
            {loading ? "Đang xử lý..." : "Từ chối"}
          </button>
          <button
            onClick={handleApprove}
            disabled={loading}
            className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            <FiCheck className="w-4 h-4" />
            {loading ? "Đang xử lý..." : "Phê duyệt bảo trợ"}
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
    cho_duyet_khoa: {
      label: "Chờ duyệt",
      bg: "bg-amber-100",
      text: "text-amber-700",
    },
    cho_duyet_ctsv: {
      label: "Chờ CTSV",
      bg: "bg-blue-100",
      text: "text-blue-700",
    },
    da_duyet: {
      label: "Đã duyệt",
      bg: "bg-emerald-100",
      text: "text-emerald-700",
    },
    tu_choi: { label: "Bị từ chối", bg: "bg-rose-100", text: "text-rose-700" },
  };

  const config = statusConfig[event.TrangThai] || statusConfig.cho_duyet_khoa;
  const formatDate = (date) => new Date(date).toLocaleDateString("vi-VN");

  return (
    <div
      onClick={() => event.TrangThai === "cho_duyet_khoa" && onSelect(event)}
      className={`grid grid-cols-6 gap-4 px-6 py-4 border-b border-slate-200 hover:bg-teal-50/30 transition-colors ${
        event.TrangThai === "cho_duyet_khoa" ? "cursor-pointer" : ""
      }`}
    >
      <div className="font-semibold text-slate-800 truncate">{event.TenSK}</div>
      <div className="text-sm text-slate-600">{formatDate(event.ThoiGianBatDau)}</div>
      <div className="text-sm text-slate-600 truncate">{event.DiaDiem || "N/A"}</div>
      <div className="text-sm text-slate-600">{event.SoNguoiToiDa || "N/A"}</div>
      <div className="text-sm text-slate-600">{event.DiemRenLuyen || 0}</div>
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
        >
          {config.label}
        </span>
        {event.TrangThai === "cho_duyet_khoa" && (
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
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch events on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all events with status cho_duyet_khoa (pending faculty approval)
      const response = await axios.get(`${API_BASE_URL}/bcn/events?TrangThai=cho_duyet_khoa`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      setEvents(response.data.data || []);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Không thể tải danh sách sự kiện");
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const pendingCount = events.filter(
    (e) => e.TrangThai === "cho_duyet_khoa",
  ).length;
  
  // Fetch all events to get approved and rejected counts
  const [allEvents, setAllEvents] = useState([]);
  
  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/bcn/events`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setAllEvents(response.data.data || []);
      } catch (err) {
        console.error("Error fetching all events:", err);
      }
    };
    fetchAllEvents();
  }, []);

  const approvedCount = allEvents.filter(
    (e) => e.TrangThai === "cho_duyet_ctsv",
  ).length;
  const rejectedCount = allEvents.filter((e) => e.TrangThai === "tu_choi").length;

  // Get pending events for display
  const pendingEvents = events.filter((e) => e.TrangThai === "cho_duyet_khoa");

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleApprove = async (maSK, notes) => {
    try {
      setLoading(true);
      await axios.patch(
        `${API_BASE_URL}/bcn/events/${maSK}/approve-faculty`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      
      alert("Phê duyệt sự kiện thành công! Sự kiện đã được chuyển cho CTSV xét duyệt.");
      setIsModalOpen(false);
      setSelectedEvent(null);
      await fetchEvents();
    } catch (err) {
      console.error("Error approving event:", err);
      alert("Lỗi: " + (err.response?.data?.error?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (maSK, reason) => {
    try {
      setLoading(true);
      await axios.patch(
        `${API_BASE_URL}/bcn/events/${maSK}/reject`,
        { LyDoTuChoi: reason },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      
      alert("Từ chối sự kiện thành công!");
      setIsModalOpen(false);
      setSelectedEvent(null);
      await fetchEvents();
    } catch (err) {
      console.error("Error rejecting event:", err);
      alert("Lỗi: " + (err.response?.data?.error?.message || err.message));
    } finally {
      setLoading(false);
    }
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
              Cán bộ Khoa: <span className="font-semibold">{user?.hoTen || "N/A"}</span>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex gap-3">
              <FiAlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-900">Lỗi:</p>
                <p className="text-sm text-rose-700">{error}</p>
              </div>
            </div>
          )}

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
            {loading ? (
              <div className="px-6 py-12 text-center text-slate-500">
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : pendingEvents.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {pendingEvents.map((event) => (
                  <EventTableRow
                    key={event.MaSK}
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
            {allEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {allEvents.map((event) => {
                  const statusConfig = {
                    cho_duyet_khoa: "bg-amber-50 border-amber-200",
                    cho_duyet_ctsv: "bg-blue-50 border-blue-200",
                    da_duyet: "bg-emerald-50 border-emerald-200",
                    tu_choi: "bg-rose-50 border-rose-200",
                  };
                  return (
                    <div
                      key={event.MaSK}
                      className={`rounded-xl border p-4 ${statusConfig[event.TrangThai] || "bg-slate-50 border-slate-200"}`}
                    >
                      <p className="font-semibold text-slate-800 text-sm line-clamp-2">
                        {event.TenSK}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {event.MaCLB}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(event.ThoiGianBatDau).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">Không có sự kiện nào</p>
            )}
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
        loading={loading}
      />
    </div>
  );
}
