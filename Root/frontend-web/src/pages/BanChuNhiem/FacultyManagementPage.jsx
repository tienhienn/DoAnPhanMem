/**
 * FacultyManagementPage - Cán bộ Khoa duyệt sự kiện
 */

import { useState, useEffect } from "react";
import {
  FiCheck,
  FiX,
  FiAlertCircle,
  FiMessageSquare,
  FiChevronRight,
  FiCalendar,
  FiMapPin,
  FiUsers,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// ============================================
// STATUS CONFIG — Đầy đủ trạng thái như BCN
// ============================================
const STATUS_CONFIG = {
  draft: {
    label: "Bản nháp",
    bg: "bg-slate-50",
    border: "border-slate-200",
    badgeBg: "bg-slate-100",
    text: "text-slate-700",
  },
  cho_duyet_khoa: {
    label: "Chờ Khoa duyệt",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badgeBg: "bg-amber-100",
    text: "text-amber-700",
  },
  cho_duyet_ctsv: {
    label: "Chờ CTSV duyệt",
    bg: "bg-blue-50",
    border: "border-blue-200",
    badgeBg: "bg-blue-100",
    text: "text-blue-700",
  },
  da_duyet: {
    label: "Đã cấp phép",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badgeBg: "bg-emerald-100",
    text: "text-emerald-700",
  },
  tu_choi: {
    label: "Bị từ chối",
    bg: "bg-rose-50",
    border: "border-rose-200",
    badgeBg: "bg-rose-100",
    text: "text-rose-700",
  },
  sap_dien_ra: {
    label: "🕐 Sắp diễn ra",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    badgeBg: "bg-indigo-100",
    text: "text-indigo-700",
  },
  dang_dien_ra: {
    label: "🟢 Đang diễn ra",
    bg: "bg-teal-50",
    border: "border-teal-200",
    badgeBg: "bg-teal-100",
    text: "text-teal-700",
  },
  da_ket_thuc: {
    label: "Đã kết thúc",
    bg: "bg-gray-50",
    border: "border-gray-200",
    badgeBg: "bg-gray-200",
    text: "text-gray-600",
  },
  huy: {
    label: "Đã hủy",
    bg: "bg-red-50",
    border: "border-red-200",
    badgeBg: "bg-red-100",
    text: "text-red-700",
  },
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
// APPROVAL STEPPER COMPONENT - Chuẩn như BCN
// ============================================
const ApprovalStepper = ({ status }) => {
  const steps = [
    { key: "draft", label: "Tạo mới", icon: "📝" },
    { key: "cho_duyet_khoa", label: "Khoa duyệt", icon: "🏫" },
    { key: "cho_duyet_ctsv", label: "CTSV duyệt", icon: "👥" },
    { key: "da_duyet", label: "Cấp phép", icon: "✅" },
    { key: "sap_dien_ra", label: "Sắp diễn ra", icon: "🕐" },
  ];

  const statusOrder = [
    "draft",
    "cho_duyet_khoa",
    "cho_duyet_ctsv",
    "da_duyet",
    "sap_dien_ra",
    "dang_dien_ra",
    "da_ket_thuc",
  ];
  const currentIndex = statusOrder.indexOf(status);

  return (
    <div className="py-4">
      <div className="flex items-center gap-1">
        {steps.map((step, idx) => (
          <div key={step.key} className="flex items-center flex-1">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all flex-shrink-0 ${
                idx <= currentIndex
                  ? "bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 text-white shadow-lg"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {step.icon}
            </div>
            <span
              className={`ml-1 text-xs font-semibold whitespace-nowrap ${
                idx <= currentIndex ? "text-cyan-600" : "text-slate-400"
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

      {/* Trạng thái ngoài flow duyệt (Đang diễn ra, Đã kết thúc, Hủy) */}
      {(status === "dang_dien_ra" ||
        status === "da_ket_thuc" ||
        status === "huy") && (
        <div className="mt-4 text-center">
          <div
            className={`text-sm font-semibold px-4 py-2 rounded-full inline-flex items-center justify-center border ${STATUS_CONFIG[status]?.badgeBg} ${STATUS_CONFIG[status]?.text} ${STATUS_CONFIG[status]?.border}`}
          >
            {STATUS_CONFIG[status]?.label}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// APPROVAL MODAL
// ============================================
const ApprovalModal = ({
  isOpen,
  event,
  onClose,
  onApprove,
  onReject,
  loading,
}) => {
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
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 px-8 py-8 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Chi Tiết Sự Kiện</h2>
            <p className="text-blue-100 text-sm mt-1">
              Thông tin chi tiết & Phê duyệt
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
            <h3 className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
              Tiến trình / Trạng thái
            </h3>
            <ApprovalStepper status={event.TrangThai} />
          </div>

          {/* Event Details */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">
                Thông tin sự kiện
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                    Tên sự kiện
                  </p>
                  <p className="text-lg font-bold text-slate-900">
                    {event.TenSK}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                    CLB tổ chức
                  </p>
                  <p className="text-sm font-semibold text-teal-700">
                    {event.TenCLB || event.MaCLB}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                    Loại sự kiện
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {event.LoaiSK || "N/A"}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                    Thời gian bắt đầu
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatDate(event.ThoiGianBatDau)}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                    Thời gian kết thúc
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatDate(event.ThoiGianKetThuc)}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                    Địa điểm
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {event.DiaDiem || "N/A"}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                    Chỉ tiêu sinh viên
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {event.SoNguoiToiDa || "N/A"} sinh viên
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                    Điểm hoạt động
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {event.DiemRenLuyen || 0} điểm
                  </p>
                </div>
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
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
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
                      Lý do từ chối:
                    </p>
                    <p className="text-sm text-rose-700">{event.LyDoTuChoi}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ẨN/HIỆN PHẦN GHI CHÚ DUYỆT TÙY VÀO TRẠNG THÁI */}
          {event.TrangThai === "cho_duyet_khoa" && (
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
          )}
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

          {/* ẨN/HIỆN NÚT DUYỆT/TỪ CHỐI TÙY VÀO TRẠNG THÁI */}
          {event.TrangThai === "cho_duyet_khoa" && (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// EVENT TABLE ROW
// ============================================
const EventTableRow = ({ event, onSelect }) => {
  const config = STATUS_CONFIG[event.TrangThai] || {
    badgeBg: "bg-slate-100",
    text: "text-slate-700",
    label: "Chưa xác định",
  };
  const formatDate = (date) => new Date(date).toLocaleDateString("vi-VN");

  return (
    <div
      onClick={() => onSelect(event)}
      className="grid grid-cols-7 gap-4 px-6 py-4 border-b border-slate-200 hover:bg-teal-50/30 transition-colors cursor-pointer"
    >
      <div className="font-semibold text-slate-800 truncate">{event.TenSK}</div>
      <div className="text-sm font-medium text-teal-600 truncate">
        {event.TenCLB}
      </div>
      <div className="text-sm text-slate-600">
        {formatDate(event.ThoiGianBatDau)}
      </div>
      <div className="text-sm text-slate-600 truncate">
        {event.DiaDiem || "N/A"}
      </div>
      <div className="text-sm text-slate-600">
        {event.SoNguoiToiDa || "N/A"}
      </div>
      <div className="text-sm text-slate-600">{event.DiemRenLuyen || 0}</div>
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${config.badgeBg} ${config.text}`}
        >
          {config.label}
        </span>
        <FiChevronRight className="w-4 h-4 text-slate-400" />
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

  // Fetch data
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${API_BASE_URL}/khoa/events`, // Đã sửa lại để lấy TẤT CẢ thay vì chỉ lấy trạng thái chờ duyệt
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setEvents(response.data.data || []);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Không thể tải danh sách sự kiện");
    } finally {
      setLoading(false);
    }
  };

  // Tính toán số liệu
  const pendingEvents = events.filter((e) => e.TrangThai === "cho_duyet_khoa");
  const pendingCount = pendingEvents.length;
  const approvedCount = events.filter(
    (e) =>
      e.TrangThai === "cho_duyet_ctsv" ||
      e.TrangThai === "da_duyet" ||
      e.TrangThai === "sap_dien_ra" ||
      e.TrangThai === "dang_dien_ra" ||
      e.TrangThai === "da_ket_thuc",
  ).length;
  const rejectedCount = events.filter((e) => e.TrangThai === "tu_choi").length;

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleApprove = async (maSK, notes) => {
    try {
      setLoading(true);
      await axios.patch(
        `${API_BASE_URL}/khoa/events/${maSK}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      alert(
        "Phê duyệt sự kiện thành công! Sự kiện đã được chuyển cho CTSV xét duyệt.",
      );
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
        `${API_BASE_URL}/khoa/events/${maSK}/reject`,
        { LyDoTuChoi: reason },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
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
              Cán bộ Khoa:{" "}
              <span className="font-semibold">{user?.hoTen || "N/A"}</span>
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
              label="Đã phê duyệt"
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

          {/* Events Table (Pending only) */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
            <div className="grid grid-cols-7 gap-4 bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 px-6 py-4 border-b border-slate-200">
              {[
                "Tên sự kiện",
                "Câu lạc bộ",
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

            {loading ? (
              <div className="px-6 py-12 text-center text-slate-500">
                Đang tải dữ liệu...
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
            {events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {events.map((event) => {
                  const config = STATUS_CONFIG[event.TrangThai] || {
                    bg: "bg-slate-50",
                    border: "border-slate-200",
                    badgeBg: "bg-slate-200",
                    text: "text-slate-600",
                    label: "Không xác định",
                  };

                  return (
                    <div
                      key={event.MaSK}
                      onClick={() => handleSelectEvent(event)}
                      className={`rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-1 ${config.bg} ${config.border}`}
                    >
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <p className="font-semibold text-slate-800 text-sm line-clamp-2">
                          {event.TenSK}
                        </p>
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${config.badgeBg} ${config.text}`}
                        >
                          {config.label}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-teal-600 mt-1 flex items-center gap-1.5">
                        <FiUsers className="w-3.5 h-3.5" />
                        <span className="truncate">
                          {event.TenCLB || event.MaCLB}
                        </span>
                      </p>

                      <div className="flex items-center justify-between gap-2 mt-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5 whitespace-nowrap">
                          <FiCalendar className="w-3.5 h-3.5" />
                          {new Date(event.ThoiGianBatDau).toLocaleDateString(
                            "vi-VN",
                          )}
                        </span>
                        <span className="flex items-center gap-1.5 truncate">
                          <FiMapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">
                            {event.DiaDiem || "N/A"}
                          </span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">
                Không có sự kiện nào
              </p>
            )}
          </div>
        </div>
      </div>

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
