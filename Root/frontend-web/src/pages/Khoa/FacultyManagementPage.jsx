/**
 * FacultyManagementPage - Cán bộ Khoa duyệt sự kiện và duyệt thành lập CLB
 */

import { useState, useEffect, useCallback } from "react";
import {
  FiCheck,
  FiX,
  FiAlertCircle,
  FiMessageSquare,
  FiChevronRight,
  FiRefreshCw,
  FiLoader,
  FiFileText,
  FiUsers,
  FiBookOpen,
  FiCalendar,
  FiMapPin,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../utils/apiClient";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const fmt = (dt) =>
  dt
    ? new Date(dt).toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

// Gộp chung Status của cả Sự kiện (Tiếng Việt) và CLB (Tiếng Anh)
const STATUS_CONFIG = {
  // Sự kiện
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

  // CLB
  pending_faculty: {
    label: "Chờ Khoa duyệt",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badgeBg: "bg-amber-100",
    text: "text-amber-700",
  },
  pending_student_affairs: {
    label: "Chờ CTSV duyệt",
    bg: "bg-blue-50",
    border: "border-blue-200",
    badgeBg: "bg-blue-100",
    text: "text-blue-700",
  },
  approved: {
    label: "Đã phê duyệt",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badgeBg: "bg-emerald-100",
    text: "text-emerald-700",
  },
  rejected: {
    label: "Bị từ chối",
    bg: "bg-rose-50",
    border: "border-rose-200",
    badgeBg: "bg-rose-100",
    text: "text-rose-700",
  },
};

// ─────────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, active, onClick }) => {
  const colorClasses = {
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    rose: "bg-rose-50 border-rose-200 text-rose-700",
  };
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border p-6 transition-all ${onClick ? "cursor-pointer hover:shadow-lg" : ""} 
        ${colorClasses[color]} ${active ? "ring-2 ring-offset-2 ring-current shadow-lg scale-[1.02]" : ""}
      `}
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
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all flex-shrink-0 ${idx <= currentIndex ? "bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 text-white shadow-lg" : "bg-slate-200 text-slate-500"}`}
            >
              {step.icon}
            </div>
            <span
              className={`ml-1 text-xs font-semibold whitespace-nowrap ${idx <= currentIndex ? "text-cyan-600" : "text-slate-400"}`}
            >
              {step.label}
            </span>
            {idx < steps.length - 1 && (
              <div
                className={`mx-2 flex-1 h-1 transition-all ${idx < currentIndex ? "bg-cyan-600" : "bg-slate-200"}`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// EVENT APPROVAL MODAL
// ─────────────────────────────────────────────────────────────
const EventApprovalModal = ({
  isOpen,
  event,
  onClose,
  onApprove,
  onReject,
  loading,
}) => {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen) setNotes("");
  }, [isOpen, event?.MaSK]);

  if (!isOpen || !event) return null;

  const handleReject = () => {
    if (!notes.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }
    onReject(event.MaSK, notes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-lg"
        onClick={!loading ? onClose : undefined}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto border border-slate-100">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 px-8 py-6 flex items-center justify-between rounded-t-3xl z-10 text-white">
          <div>
            <h2 className="text-2xl font-bold">Phê Duyệt Sự Kiện</h2>
            <p className="text-blue-100 text-sm mt-1">Phê duyệt cấp Khoa</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 rounded-2xl p-6 border border-blue-100">
            <h3 className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
              Tiến trình
            </h3>
            <ApprovalStepper status={event.TrangThai} />
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-4">
              Thông tin sự kiện
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                  Tên sự kiện
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {event.TenSK}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                  CLB Tổ chức
                </p>
                <p className="text-sm font-semibold text-teal-700">
                  {event.TenCLB}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                  Địa điểm
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {event.DiaDiem}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                  Thời gian bắt đầu
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {fmt(event.ThoiGianBatDau)}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                  Thời gian kết thúc
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {fmt(event.ThoiGianKetThuc)}
                </p>
              </div>
            </div>
          </div>

          {event.MoTa && (
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">
                Mô tả chi tiết
              </h3>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {event.MoTa}
                </p>
              </div>
            </div>
          )}

          {event.TrangThai === "cho_duyet_khoa" && (
            <div>
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">
                <FiMessageSquare className="inline w-4 h-4 mr-2" /> Ghi chú phê
                duyệt của Khoa
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nhập ghi chú (bắt buộc khi từ chối)..."
                rows="4"
                disabled={loading}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
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
          {event.TrangThai === "cho_duyet_khoa" && (
            <>
              <button
                onClick={handleReject}
                disabled={loading}
                className="px-6 py-2.5 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 transition-all shadow-md flex items-center gap-2"
              >
                <FiX className="w-4 h-4" /> Từ chối
              </button>
              <button
                onClick={() => onApprove(event.MaSK, notes)}
                disabled={loading}
                className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all shadow-md flex items-center gap-2"
              >
                <FiCheck className="w-4 h-4" /> Phê duyệt bảo trợ
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// CLUB REGISTRATION APPROVAL MODAL (READ ONLY)
// ─────────────────────────────────────────────────────────────
const ClubApprovalModal = ({
  isOpen,
  reg,
  onClose,
  onApprove,
  onReject,
  loading,
}) => {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen) setNotes("");
  }, [isOpen, reg?.MaDKMo]);

  if (!isOpen || !reg) return null;

  const data = reg.NoiDungHoSo || {};
  const step1 = data.step1 || {};
  const step2 = data.step2 || {};
  const step3 = data.step3 || {};
  const step4 = data.step4 || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-lg"
        onClick={!loading ? onClose : undefined}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 flex flex-col">
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 flex items-center justify-between rounded-t-3xl z-10 text-white flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold">
              Thẩm Định Hồ Sơ Thành Lập CLB
            </h2>
            <p className="text-indigo-100 text-sm mt-1">
              Đơn đăng ký: {reg.TenCLB}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto flex-1">
          {/* Section 1: Tờ trình */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
              <FiFileText className="text-indigo-600" /> 1. Tờ trình thành lập
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">
                  Tên Câu lạc bộ
                </p>
                <p className="text-sm font-semibold text-slate-800 mt-1">
                  {reg.TenCLB}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">
                  Lĩnh vực hoạt động
                </p>
                <p className="text-sm font-semibold text-slate-800 mt-1">
                  {reg.LinhVuc}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs font-bold text-slate-500 uppercase">
                  Sự cần thiết thành lập
                </p>
                <p className="text-sm text-slate-700 leading-relaxed mt-1 whitespace-pre-wrap">
                  {step1.tinhCapThiet || reg.MoTa || "Không có thông tin"}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Điều lệ */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
              <FiBookOpen className="text-indigo-600" /> 2. Điều lệ hoạt động
              CLB
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">
                  Tên tiếng Anh
                </p>
                <p className="text-sm text-slate-800 mt-1">
                  {step2.tenTiengAnh || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">
                  Tên viết tắt
                </p>
                <p className="text-sm text-slate-800 mt-1">
                  {step2.tenVietTat || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">
                  Slogan
                </p>
                <p className="text-sm text-slate-800 mt-1">
                  {step2.slogan || "—"}
                </p>
              </div>
              <div className="md:col-span-3">
                <p className="text-xs font-bold text-slate-500 uppercase">
                  Giới thiệu tổng quát
                </p>
                <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">
                  {step2.gioiThieu || "—"}
                </p>
              </div>
            </div>
          </div>

          {reg.TrangThai === "pending_faculty" && (
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
                <FiMessageSquare className="inline w-4 h-4 mr-2" /> Ghi chú thẩm
                định hồ sơ
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nhập ghi chú ý kiến chỉ đạo của Khoa..."
                rows="4"
                disabled={loading}
                className="w-full px-4 py-3 border border-slate-300 rounded-2xl outline-none"
              />
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-8 py-6 flex items-center justify-end gap-3 rounded-b-3xl flex-shrink-0">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            Đóng
          </button>
          {reg.TrangThai === "pending_faculty" && (
            <>
              <button
                onClick={() => {
                  if (!notes.trim()) {
                    alert("Vui lòng nhập lý do từ chối");
                    return;
                  }
                  onReject(reg.MaDKMo, notes);
                }}
                disabled={loading}
                className="px-6 py-2.5 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 transition-all shadow-md flex items-center gap-2"
              >
                <FiX className="w-4 h-4" /> Từ chối thành lập
              </button>
              <button
                onClick={() => onApprove(reg.MaDKMo, notes)}
                disabled={loading}
                className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all shadow-md flex items-center gap-2"
              >
                <FiCheck className="w-4 h-4" /> Đồng ý thông qua Khoa
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function FacultyManagementPage() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("events"); // "events" | "clubs"
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const [selectedReg, setSelectedReg] = useState(null);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);

  // States lọc dữ liệu
  const [eventFilter, setEventFilter] = useState("all");
  const [clubFilter, setClubFilter] = useState("pending_faculty");

  // ── Fetch API ────────────────────────────────────────────
  const fetchEventsData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/khoa/events`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setEvents(res.data.data || []);
    } catch (err) {
      console.error("Lỗi lấy sự kiện:", err);
    }
  };

  const fetchClubsData = async () => {
    try {
      const res = await apiClient.get("/api/clubs/admin/registrations");
      setRegistrations(res.data.data || []);
    } catch (err) {
      console.error("Lỗi lấy đăng ký CLB:", err);
    }
  };

  const fetchData = useCallback(async () => {
    setFetchLoading(true);
    if (activeTab === "events") await fetchEventsData();
    else await fetchClubsData();
    setFetchLoading(false);
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Stats & Filtering (Events) ─────────────────────────────────────────────
  const getEventGroup = (e) => {
    if (e.TrangThai === "cho_duyet_khoa") return "cho_khoa";
    if (e.TrangThai === "cho_duyet_ctsv") return "cho_ctsv";
    if (
      ["da_duyet", "sap_dien_ra", "dang_dien_ra", "da_ket_thuc"].includes(
        e.TrangThai,
      )
    )
      return "da_duyet";
    if (e.TrangThai === "tu_choi") return "tu_choi";
    return "khac";
  };

  const eventPendingCount = events.filter(
    (e) => e.TrangThai === "cho_duyet_khoa",
  ).length;
  const eventApprovedCount = events.filter((e) =>
    [
      "cho_duyet_ctsv",
      "da_duyet",
      "sap_dien_ra",
      "dang_dien_ra",
      "da_ket_thuc",
    ].includes(e.TrangThai),
  ).length;
  const eventRejectedCount = events.filter(
    (e) => e.TrangThai === "tu_choi",
  ).length;
  const pendingEventsList = events.filter(
    (e) => e.TrangThai === "cho_duyet_khoa",
  );
  const filteredEventsList =
    eventFilter === "all"
      ? events
      : events.filter((e) => getEventGroup(e) === eventFilter);

  // ── Stats & Filtering (Clubs) ──────────────────────────────────────────────
  const clubPendingCount = registrations.filter(
    (r) => r.TrangThai === "pending_faculty",
  ).length;
  const clubApprovedCount = registrations.filter(
    (r) =>
      r.TrangThai === "pending_student_affairs" || r.TrangThai === "approved",
  ).length;
  const clubRejectedCount = registrations.filter(
    (r) => r.TrangThai === "rejected",
  ).length;
  const filteredRegistrations = registrations.filter(
    (r) => r.TrangThai === clubFilter,
  );

  // ── Handlers (Events) ─────────────────────────────────────────────
  const handleEventApprove = async (eventId, notes) => {
    setActionLoading(true);
    try {
      await axios.patch(
        `${API_BASE_URL}/khoa/events/${eventId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      alert("Phê duyệt sự kiện thành công!");
      setIsEventModalOpen(false);
      fetchEventsData();
    } catch (err) {
      alert("Lỗi duyệt sự kiện");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEventReject = async (eventId, notes) => {
    setActionLoading(true);
    try {
      await axios.patch(
        `${API_BASE_URL}/khoa/events/${eventId}/reject`,
        { LyDoTuChoi: notes },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      alert("Từ chối sự kiện thành công!");
      setIsEventModalOpen(false);
      fetchEventsData();
    } catch (err) {
      alert("Lỗi từ chối sự kiện");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Handlers (Clubs) ──────────────────────────────────────────────
  const callRegReview = async (regId, status, feedback) => {
    setActionLoading(true);
    try {
      const res = await apiClient.patch(
        `/api/clubs/admin/registrations/${regId}/review`,
        { status, feedback },
      );
      if (res.data.success) {
        alert(res.data.message);
        setIsRegModalOpen(false);
        fetchClubsData();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi xử lý");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Quản Lý Phê Duyệt Cấp Khoa
              </h1>
              <p className="text-slate-600 mt-2">
                Cán bộ Khoa:{" "}
                <span className="font-semibold">{user?.hoTen}</span>
              </p>
            </div>
            <button
              onClick={fetchData}
              disabled={fetchLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-all shadow-sm"
            >
              <FiRefreshCw
                className={`w-4 h-4 ${fetchLoading ? "animate-spin" : ""}`}
              />{" "}
              Làm mới
            </button>
          </div>

          {/* Top Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => {
                setActiveTab("events");
              }}
              className={`px-6 py-3 font-bold text-sm border-b-2 transition-all ${activeTab === "events" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              Phê duyệt Sự kiện
            </button>
            <button
              onClick={() => {
                setActiveTab("clubs");
              }}
              className={`px-6 py-3 font-bold text-sm border-b-2 transition-all ${activeTab === "clubs" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              Phê duyệt Thành lập CLB
            </button>
          </div>

          {/* Content */}
          {activeTab === "events" ? (
            // ==================== TAB SỰ KIỆN ====================
            <div className="space-y-6">
              {/* Stat Cards (Chỉ xem) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  icon={FiAlertCircle}
                  label="Sự kiện cần duyệt"
                  value={eventPendingCount}
                  color="amber"
                />
                <StatCard
                  icon={FiCheck}
                  label="Khoa đã duyệt"
                  value={eventApprovedCount}
                  color="emerald"
                />
                <StatCard
                  icon={FiX}
                  label="Sự kiện bị từ chối"
                  value={eventRejectedCount}
                  color="rose"
                />
              </div>

              {/* Bảng Cần duyệt ngay */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-100 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-amber-800">
                    Sự kiện cần hành động ngay
                  </h2>
                </div>
                <div className="grid grid-cols-6 gap-4 bg-slate-50 px-6 py-3 border-b border-slate-200 font-bold text-xs text-slate-500 uppercase">
                  <div>Tên sự kiện</div>
                  <div>Câu lạc bộ</div>
                  <div>Thời gian</div>
                  <div>Địa điểm</div>
                  <div>Chỉ tiêu</div>
                  <div>Trạng thái</div>
                </div>
                {fetchLoading ? (
                  <div className="p-8 text-center text-slate-500">
                    <FiLoader className="w-8 h-8 mx-auto animate-spin opacity-50" />
                  </div>
                ) : pendingEventsList.length > 0 ? (
                  <div className="divide-y divide-slate-200">
                    {pendingEventsList.map((event) => (
                      <div
                        key={event.MaSK}
                        onClick={() => {
                          setSelectedEvent(event);
                          setIsEventModalOpen(true);
                        }}
                        className="grid grid-cols-6 gap-4 px-6 py-4 hover:bg-amber-50/30 cursor-pointer"
                      >
                        <div className="font-semibold text-slate-800 truncate">
                          {event.TenSK}
                        </div>
                        <div className="text-sm font-medium text-teal-600 truncate">
                          {event.TenCLB}
                        </div>
                        <div className="text-sm text-slate-600">
                          {fmt(event.ThoiGianBatDau)}
                        </div>
                        <div className="text-sm text-slate-600 truncate">
                          {event.DiaDiem}
                        </div>
                        <div className="text-sm text-slate-600">
                          {event.SoNguoiToiDa}
                        </div>
                        <div>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                            Chờ Khoa duyệt
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500">
                    <FiCheck className="w-10 h-10 mx-auto mb-2 text-emerald-400 opacity-50" />
                    <p>Đã xử lý hết yêu cầu duyệt</p>
                  </div>
                )}
              </div>

              {/* Lưới tất cả sự kiện */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-6">
                  Thống kê toàn bộ sự kiện
                </h2>
                <div className="flex gap-2 flex-wrap mb-6">
                  {[
                    { key: "all", label: "Tất cả" },
                    { key: "cho_khoa", label: "Chờ Khoa duyệt" },
                    { key: "cho_ctsv", label: "Đã đẩy lên CTSV" },
                    { key: "da_duyet", label: "Đã cấp phép / Đã diễn ra" },
                    { key: "tu_choi", label: "Bị từ chối" },
                  ].map((tab) => {
                    const count =
                      tab.key === "all"
                        ? events.length
                        : events.filter((e) => getEventGroup(e) === tab.key)
                            .length;
                    if (tab.key !== "all" && count === 0) return null;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setEventFilter(tab.key)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${eventFilter === tab.key ? "bg-blue-600 text-white shadow-md" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                      >
                        {tab.label}{" "}
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${eventFilter === tab.key ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {filteredEventsList.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredEventsList.map((event) => {
                      const config =
                        STATUS_CONFIG[event.TrangThai] || STATUS_CONFIG.draft;
                      return (
                        <div
                          key={event.MaSK}
                          onClick={() => {
                            setSelectedEvent(event);
                            setIsEventModalOpen(true);
                          }}
                          className={`rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all ${config.bg} ${config.border}`}
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
                            <FiUsers className="w-3.5 h-3.5" />{" "}
                            <span className="truncate">{event.TenCLB}</span>
                          </p>
                          <div className="flex items-center justify-between gap-2 mt-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1.5 whitespace-nowrap">
                              <FiCalendar className="w-3.5 h-3.5" />{" "}
                              {new Date(
                                event.ThoiGianBatDau,
                              ).toLocaleDateString("vi-VN")}
                            </span>
                            <span className="flex items-center gap-1.5 truncate">
                              <FiMapPin className="w-3.5 h-3.5 shrink-0" />{" "}
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
                  <p className="text-slate-500 text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    Không tìm thấy sự kiện nào ở trạng thái này
                  </p>
                )}
              </div>
            </div>
          ) : (
            // ==================== TAB CLB ====================
            <div className="space-y-6">
              {/* Stat Cards (Có Filter) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  icon={FiAlertCircle}
                  label="Cần duyệt (Pending)"
                  value={clubPendingCount}
                  color="amber"
                  active={clubFilter === "pending_faculty"}
                  onClick={() => setClubFilter("pending_faculty")}
                />
                <StatCard
                  icon={FiCheck}
                  label="Đã duyệt chuyển CTSV"
                  value={clubApprovedCount}
                  color="emerald"
                  active={clubFilter === "pending_student_affairs"}
                  onClick={() => setClubFilter("pending_student_affairs")}
                />
                <StatCard
                  icon={FiX}
                  label="Đơn bị từ chối"
                  value={clubRejectedCount}
                  color="rose"
                  active={clubFilter === "rejected"}
                  onClick={() => setClubFilter("rejected")}
                />
              </div>

              {/* Bảng CLB */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
                <div className="grid grid-cols-5 gap-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 px-6 py-4 border-b border-slate-200 font-bold text-xs text-slate-600 uppercase">
                  <div>Tên Câu lạc bộ dự kiến</div>
                  <div>Lĩnh vực</div>
                  <div>Sinh viên nộp đơn</div>
                  <div>Ngày nộp</div>
                  <div>Trạng thái</div>
                </div>
                {fetchLoading ? (
                  <div className="p-8 text-center text-slate-500">
                    <FiLoader className="w-8 h-8 mx-auto animate-spin opacity-50" />
                  </div>
                ) : filteredRegistrations.length > 0 ? (
                  <div className="divide-y divide-slate-200">
                    {filteredRegistrations.map((reg) => (
                      <div
                        key={reg.MaDKMo}
                        onClick={() => {
                          setSelectedReg(reg);
                          setIsRegModalOpen(true);
                        }}
                        className="grid grid-cols-5 gap-4 px-6 py-4 hover:bg-indigo-50/30 cursor-pointer"
                      >
                        <div className="font-semibold text-slate-800 truncate">
                          {reg.TenCLB}
                        </div>
                        <div className="text-sm text-slate-600">
                          {reg.LinhVuc}
                        </div>
                        <div className="text-sm text-slate-600">
                          {reg.NguoiDangKy || reg.MaND}
                        </div>
                        <div className="text-sm text-slate-600">
                          {new Date(reg.NgayTao).toLocaleDateString("vi-VN")}
                        </div>
                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[reg.TrangThai]?.bg || "bg-slate-100"} ${STATUS_CONFIG[reg.TrangThai]?.text || "text-slate-700"}`}
                          >
                            {STATUS_CONFIG[reg.TrangThai]?.label}
                          </span>
                          <FiChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-12 text-center text-slate-500">
                    <FiAlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Không có hồ sơ thành lập CLB nào trong mục này</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <EventApprovalModal
        isOpen={isEventModalOpen}
        event={selectedEvent}
        onClose={() => {
          if (!actionLoading) {
            setIsEventModalOpen(false);
            setSelectedEvent(null);
          }
        }}
        onApprove={handleEventApprove}
        onReject={handleEventReject}
        loading={actionLoading}
      />
      <ClubApprovalModal
        isOpen={isRegModalOpen}
        reg={selectedReg}
        onClose={() => {
          if (!actionLoading) {
            setIsRegModalOpen(false);
            setSelectedReg(null);
          }
        }}
        onApprove={(id, notes) => callRegReview(id, "approved", notes)}
        onReject={(id, notes) => callRegReview(id, "rejected", notes)}
        loading={actionLoading}
      />
    </div>
  );
}
