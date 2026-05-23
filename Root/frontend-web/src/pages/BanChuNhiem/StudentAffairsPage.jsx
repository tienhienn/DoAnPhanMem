/**
 * StudentAffairsPage - Phòng Công tác sinh viên (CTSV) cấp phép hoạt động sự kiện
 */

import { useState, useEffect } from "react";
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
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// ============================================
// STATUS CONFIG
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
// FORMAT DATE HELPER
// ============================================
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// ============================================
// APPROVAL STEPPER COMPONENT
// ============================================
const ApprovalStepper = ({ status }) => {
  // Chỉ định nghĩa 4 bước tới Cấp phép
  const steps = [
    { key: "draft", label: "Tạo mới", icon: "📝" },
    { key: "cho_duyet_khoa", label: "Khoa duyệt", icon: "🏫" },
    { key: "cho_duyet_ctsv", label: "CTSV duyệt", icon: "👥" },
    { key: "da_duyet", label: "Cấp phép", icon: "✅" },
  ];

  const statusOrder = [
    "draft",
    "cho_duyet_khoa",
    "cho_duyet_ctsv",
    "da_duyet",
    "sap_dien_ra",
    "dang_dien_ra",
    "da_ket_thuc",
    "huy",
  ];

  let currentIndex = statusOrder.indexOf(status);
  // Nếu trạng thái đã vượt qua mức "Cấp phép" (VD: đang diễn ra, kết thúc),
  // vẫn giữ thanh tiến trình sáng full ở bước 4 (Cấp phép).
  if (currentIndex > 3) currentIndex = 3;

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

      {/* Hiển thị Badge trạng thái thực tế bên dưới nếu nó đang vận hành (Sắp/Đang diễn ra...) */}
      {(status === "sap_dien_ra" ||
        status === "dang_dien_ra" ||
        status === "da_ket_thuc" ||
        status === "huy") && (
        <div className="mt-4 text-center">
          <div
            className={`text-sm font-semibold px-4 py-2 rounded-full inline-flex items-center justify-center border ${STATUS_CONFIG[status]?.badgeBg} ${STATUS_CONFIG[status]?.text} ${STATUS_CONFIG[status]?.border}`}
          >
            Trạng thái hiện tại: {STATUS_CONFIG[status]?.label}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// STAT CARD COMPONENT
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
// FINAL APPROVAL MODAL
// ============================================
const FinalApprovalModal = ({
  isOpen,
  event,
  onClose,
  onApprove,
  onReject,
  loading,
}) => {
  const [opinion, setOpinion] = useState("");

  if (!isOpen || !event) return null;

  const handleApprove = () => {
    onApprove(event.MaSK, opinion);
    setOpinion("");
  };

  const handleReject = () => {
    if (!opinion.trim()) {
      alert("Vui lòng nhập lý do không cấp phép");
      return;
    }
    onReject(event.MaSK, opinion);
    setOpinion("");
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("vi-VN");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-lg"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto border border-slate-100">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 px-8 py-8 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Chi Tiết Sự Kiện</h2>
            <p className="text-blue-100 text-sm mt-1">
              Thông tin chi tiết & Phê duyệt cuối cùng từ Phòng CTSV
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            <FiX className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 rounded-2xl p-6 border border-blue-100">
            <h3 className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
              Tiến trình phê duyệt
            </h3>
            <ApprovalStepper status={event.TrangThai} />
          </div>

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
                    Điểm rèn luyện
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

            {/* Hiển thị lý do nếu bị từ chối trước đó */}
            {event.TrangThai === "tu_choi" && event.LyDoTuChoi && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <FiAlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-rose-900 mb-1">
                      Lý do từ chối trước đó:
                    </p>
                    <p className="text-sm text-rose-700">{event.LyDoTuChoi}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chỉ hiện Ô ghi chú khi đang chờ CTSV duyệt */}
          {event.TrangThai === "cho_duyet_ctsv" && (
            <div>
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">
                <FiMessageSquare className="inline w-4 h-4 mr-2" />Ý kiến chỉ
                đạo / Lý do từ chối
              </label>
              <textarea
                value={opinion}
                onChange={(e) => setOpinion(e.target.value)}
                placeholder="Nhập ý kiến chỉ đạo hoặc lý do không cấp phép..."
                rows="5"
                disabled={loading}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all resize-none bg-white disabled:opacity-50"
              />
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-8 py-6 flex items-center justify-end gap-3 rounded-b-3xl">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            Đóng
          </button>

          {event.TrangThai === "cho_duyet_ctsv" && (
            <>
              <button
                onClick={handleReject}
                disabled={loading}
                className="px-6 py-2.5 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                <FiX className="w-4 h-4" />{" "}
                {loading ? "Đang xử lý..." : "Từ chối"}
              </button>
              <button
                onClick={handleApprove}
                disabled={loading}
                className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                <FiCheck className="w-4 h-4" />{" "}
                {loading ? "Đang xử lý..." : "Cấp phép hoạt động"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// EVENT CARD COMPONENT (PENDING)
// ============================================
const EventCard = ({ event, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(event)}
      className="group bg-white rounded-2xl border border-slate-200 hover:border-teal-300 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
    >
      <div className="h-1 bg-gradient-to-r from-teal-600 to-cyan-600" />
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-2">
              {event.TenSK}
            </h3>
            <p className="text-sm font-medium text-teal-600 mt-1">
              {event.TenCLB || event.MaCLB}
            </p>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full whitespace-nowrap">
            Chờ cấp phép
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <FiCalendar className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span className="truncate">{formatDate(event.ThoiGianBatDau)}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <span className="text-xs font-semibold">
              {event.DiemRenLuyen || 0} điểm RL
            </span>
          </div>
        </div>
        <p className="text-sm text-slate-600 line-clamp-2">{event.MoTa}</p>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-600">
            {event.SoNguoiToiDa || "N/A"} chỗ
          </span>
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
  const config = STATUS_CONFIG[event.TrangThai] || STATUS_CONFIG.da_duyet;

  return (
    <div
      className={`bg-white rounded-xl border p-4 hover:shadow-md transition-all ${config.border}`}
    >
      <div className="flex items-start justify-between mb-2 gap-2">
        <h3 className="font-semibold text-slate-900 line-clamp-2">
          {event.TenSK}
        </h3>
        <span
          className={`px-2 py-1 text-[10px] font-bold rounded-full whitespace-nowrap ${config.badgeBg} ${config.text}`}
        >
          {config.label}
        </span>
      </div>
      <p className="text-xs font-medium text-teal-600 mb-3">
        {event.TenCLB || event.MaCLB}
      </p>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Bắt đầu: {formatDate(event.ThoiGianBatDau)}</span>
        <span className="font-semibold text-slate-700">
          {event.SoNguoiToiDa} Slot
        </span>
      </div>
    </div>
  );
};

// ============================================
// MAIN PAGE
// ============================================
export default function StudentAffairsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/ctsv/events`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setEvents(response.data.data || []);
    } catch (err) {
      console.error("Error fetching CTSV events:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (maSK, opinion) => {
    try {
      setLoading(true);
      await axios.patch(
        `${API_BASE_URL}/ctsv/events/${maSK}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      alert("Cấp phép hoạt động thành công!");
      setIsModalOpen(false);
      fetchEvents();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.error?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (maSK, opinion) => {
    try {
      setLoading(true);
      await axios.patch(
        `${API_BASE_URL}/ctsv/events/${maSK}/reject`,
        { LyDoTuChoi: opinion },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      alert("Từ chối sự kiện thành công!");
      setIsModalOpen(false);
      fetchEvents();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.error?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    const month = new Date().toLocaleString("vi-VN", {
      month: "long",
      year: "numeric",
    });
    alert(
      `Đang xuất báo cáo tháng ${month}...\nTính năng xuất Excel sẽ được cập nhật sớm.`,
    );
  };

  // Lọc dữ liệu
  const pendingEvents = events.filter((e) => e.TrangThai === "cho_duyet_ctsv");
  const processedEvents = events.filter(
    (e) =>
      e.TrangThai !== "cho_duyet_ctsv" &&
      e.TrangThai !== "cho_duyet_khoa" &&
      e.TrangThai !== "draft",
  );

  // Tính toán chỉ số
  const totalEventsCount = events.length;
  const completedEventsCount = events.filter(
    (e) => e.TrangThai === "da_ket_thuc",
  ).length;
  const totalStudentsCount = events.reduce((sum, e) => {
    // Tạm tính dựa trên số người đã đăng ký thực tế lấy từ DB (nếu có trường soNguoiDaDangKy), nếu không dùng 0
    return sum + (e.soNguoiDaDangKy || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Quản lý cấp phép sự kiện toàn trường
            </h1>
            <p className="text-slate-600 mt-2">
              Phòng Công Tác Sinh Viên:{" "}
              <span className="font-semibold">{user?.hoTen}</span>
            </p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              icon={FiCalendar}
              label="Tổng sự kiện toàn trường"
              value={totalEventsCount}
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
              value={completedEventsCount}
              color="emerald"
            />
            <StatCard
              icon={FiUsers}
              label="Lượt SV đã tham gia"
              value={totalStudentsCount}
              color="blue"
            />
          </div>

          {/* Pending Events */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Danh sách chờ cấp phép
                </h2>
                <p className="text-slate-600 text-sm mt-1">
                  {pendingEvents.length} sự kiện chờ xử lý
                </p>
              </div>
              <button
                onClick={handleExportReport}
                className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-900 transition-all shadow-md hover:shadow-lg"
              >
                <FiDownload className="w-4 h-4" /> Xuất báo cáo
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-slate-500">
                Đang tải dữ liệu...
              </div>
            ) : pendingEvents.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pendingEvents.map((event) => (
                  <EventCard
                    key={event.MaSK}
                    event={event}
                    onSelect={(e) => {
                      setSelectedEvent(e);
                      setIsModalOpen(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <FiCheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <p className="text-lg font-semibold text-slate-900 mb-1">
                  Không có sự kiện chờ duyệt
                </p>
                <p className="text-slate-600">Tất cả hồ sơ đã được xử lý</p>
              </div>
            )}
          </div>

          {/* Processed Events */}
          <div className="space-y-6 pt-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Sự kiện đã xử lý
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Lịch sử phê duyệt và các hoạt động đang/đã diễn ra
              </p>
            </div>

            {processedEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {processedEvents.map((event) => (
                  <div
                    key={event.MaSK}
                    onClick={() => {
                      setSelectedEvent(event);
                      setIsModalOpen(true);
                    }}
                    className="cursor-pointer"
                  >
                    <ApprovedEventCard event={event} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-xl border border-slate-200">
                <p className="text-slate-600">
                  Chưa có sự kiện nào trong lịch sử
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <FinalApprovalModal
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
