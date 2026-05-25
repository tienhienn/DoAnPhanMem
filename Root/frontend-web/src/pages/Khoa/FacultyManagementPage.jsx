/**
 * FacultyManagementPage - Cán bộ Khoa duyệt sự kiện
 * ✅ Kết nối API thật
 * ✅ Filter theo StatCard
 * ✅ Duyệt / Từ chối có ghi chú
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
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../utils/apiClient";

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

const STATUS_CONFIG = {
  pending_faculty:         { label: "Chờ Khoa duyệt", bg: "bg-amber-100",   text: "text-amber-700"   },
  pending_student_affairs: { label: "Chờ CTSV duyệt", bg: "bg-blue-100",    text: "text-blue-700"    },
  approved:                { label: "Đã phê duyệt",   bg: "bg-emerald-100", text: "text-emerald-700" },
  rejected:                { label: "Bị từ chối",     bg: "bg-rose-100",    text: "text-rose-700"    },
  sap_dien_ra:             { label: "Sắp diễn ra",    bg: "bg-cyan-100",    text: "text-cyan-700"    },
  dang_dien_ra:            { label: "Đang diễn ra",   bg: "bg-green-100",   text: "text-green-700"   },
  da_ket_thuc:             { label: "Đã kết thúc",    bg: "bg-gray-100",    text: "text-gray-700"    },
  draft:                   { label: "Bản nháp",        bg: "bg-slate-100",   text: "text-slate-700"   },
};

// ─────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, active, onClick }) => {
  const colorClasses = {
    amber:   "bg-amber-50 border-amber-200 text-amber-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    rose:    "bg-rose-50 border-rose-200 text-rose-700",
  };
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border p-6 transition-all hover:shadow-lg cursor-pointer select-none
        ${colorClasses[color]}
        ${active ? "ring-2 ring-offset-2 ring-current shadow-lg scale-[1.02]" : ""}
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

// ─────────────────────────────────────────────────────────────
// APPROVAL STEPPER
// ─────────────────────────────────────────────────────────────
const ApprovalStepper = ({ status }) => {
  const steps = [
    { key: "draft",                   label: "Tạo mới",     icon: "📝" },
    { key: "pending_faculty",         label: "Khoa duyệt",  icon: "🏫" },
    { key: "pending_student_affairs", label: "CTSV duyệt",  icon: "👥" },
    { key: "approved",                label: "Hoàn tất",    icon: "✅" },
  ];

  const order = ["draft", "pending_faculty", "pending_student_affairs", "approved"];
  const currentIndex = order.indexOf(status);

  return (
    <div className="py-4">
      <div className="flex items-center gap-2">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              idx <= currentIndex
                ? "bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 text-white shadow-lg"
                : "bg-slate-200 text-slate-600"
            }`}>
              {step.icon}
            </div>
            <span className={`ml-2 text-xs font-semibold whitespace-nowrap ${
              idx <= currentIndex ? "text-cyan-600" : "text-slate-500"
            }`}>
              {step.label}
            </span>
            {idx < steps.length - 1 && (
              <div className={`mx-2 flex-1 h-1 transition-all ${
                idx < currentIndex ? "bg-cyan-600" : "bg-slate-200"
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// APPROVAL MODAL
// ─────────────────────────────────────────────────────────────
const ApprovalModal = ({ isOpen, event, onClose, onApprove, onReject, loading }) => {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen) setNotes("");
  }, [isOpen, event?.MaSK]);

  if (!isOpen || !event) return null;

  const handleApprove = () => onApprove(event.MaSK, notes);

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
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 px-8 py-6 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Phê Duyệt Sự Kiện</h2>
            <p className="text-blue-100 text-sm mt-1">Phê duyệt từ Cán bộ Khoa</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            <FiX className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Stepper */}
          <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 rounded-2xl p-6 border border-blue-100">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
              Tiến trình phê duyệt
            </h3>
            <ApprovalStepper status={event.TrangThai} />
          </div>

          {/* Thông tin sự kiện */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-4">
              Thông tin sự kiện
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Tên sự kiện</p>
                <p className="text-lg font-bold text-slate-900">{event.TenSK}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Thời gian bắt đầu</p>
                <p className="text-sm font-semibold text-slate-900">{fmt(event.ThoiGianBatDau)}</p>
                <p className="text-xs text-slate-500 mt-1">Kết thúc: {fmt(event.ThoiGianKetThuc)}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Địa điểm</p>
                <p className="text-sm font-semibold text-slate-900">{event.DiaDiem}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Chỉ tiêu sinh viên</p>
                <p className="text-sm font-semibold text-slate-900">{event.SoNguoiToiDa} sinh viên</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Điểm rèn luyện</p>
                <p className="text-sm font-semibold text-slate-900">{event.DiemRenLuyen ?? 0} điểm</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Câu lạc bộ</p>
                <p className="text-sm font-semibold text-slate-900">{event.TenCLB || event.MaCLB}</p>
              </div>
            </div>
          </div>

          {/* Mô tả */}
          {event.MoTa && (
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">
                Mô tả chi tiết
              </h3>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-sm text-slate-700 leading-relaxed">{event.MoTa}</p>
              </div>
            </div>
          )}

          {/* Lý do từ chối trước (nếu có) */}
          {event.LyDoTuChoi && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-rose-600 uppercase mb-2">Lý do từ chối trước đó</p>
              <p className="text-sm text-rose-700">{event.LyDoTuChoi}</p>
            </div>
          )}

          {/* Ghi chú */}
          <div>
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">
              <FiMessageSquare className="inline w-4 h-4 mr-2" />
              Ghi chú phê duyệt của Khoa
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập ghi chú (bắt buộc khi từ chối)..."
              rows="4"
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
            className="px-6 py-2.5 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiX className="w-4 h-4" />}
            Từ chối
          </button>
          <button
            onClick={handleApprove}
            disabled={loading}
            className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiCheck className="w-4 h-4" />}
            Phê duyệt bảo trợ
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// EVENT TABLE ROW
// ─────────────────────────────────────────────────────────────
const EventTableRow = ({ event, onSelect }) => {
  const config = STATUS_CONFIG[event.TrangThai] || STATUS_CONFIG.pending_faculty;
  const isPending = event.TrangThai === "pending_faculty";

  return (
    <div
      onClick={() => isPending && onSelect(event)}
      className={`grid grid-cols-6 gap-4 px-6 py-4 border-b border-slate-200 hover:bg-teal-50/30 transition-colors ${
        isPending ? "cursor-pointer" : ""
      }`}
    >
      <div className="font-semibold text-slate-800 truncate">{event.TenSK}</div>
      <div className="text-sm text-slate-600">{fmt(event.ThoiGianBatDau)}</div>
      <div className="text-sm text-slate-600 truncate">{event.DiaDiem}</div>
      <div className="text-sm text-slate-600">{event.SoNguoiToiDa}</div>
      <div className="text-sm text-slate-600">{event.DiemRenLuyen ?? 0}</div>
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
          {config.label}
        </span>
        {isPending && <FiChevronRight className="w-4 h-4 text-slate-400" />}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function FacultyManagementPage() {
  const { user } = useAuth();

  const [events, setEvents]               = useState([]);
  const [fetchLoading, setFetchLoading]   = useState(true);
  const [fetchError, setFetchError]       = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [activeFilter, setActiveFilter]   = useState("pending_faculty");

  // ── Fetch API ────────────────────────────────────────────
  const fetchEvents = useCallback(async () => {
    setFetchLoading(true);
    setFetchError(null);
    try {
      const statuses = ["pending_faculty", "pending_student_affairs", "approved", "rejected"];
      const responses = await Promise.all(
        statuses.map((s) =>
          apiClient.get("/api/admin/events", { params: { limit: 100, status: s } })
        )
      );
      const all = responses.flatMap((r) => r.data?.data?.events || []);
      const map = new Map();
      all.forEach((e) => map.set(e.MaSK, e));
      setEvents([...map.values()]);
    } catch {
      setFetchError("Không thể tải danh sách. Vui lòng thử lại.");
    } finally {
      setFetchLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // ── Thống kê ─────────────────────────────────────────────
  const pendingCount  = events.filter((e) => e.TrangThai === "pending_faculty").length;
  const approvedCount = events.filter((e) => e.TrangThai === "pending_student_affairs").length;
  const rejectedCount = events.filter((e) => e.TrangThai === "rejected").length;

  const filteredEvents = events.filter((e) => e.TrangThai === activeFilter);

  const filterLabel = {
    pending_faculty:         "Chờ Khoa duyệt",
    pending_student_affairs: "Đã duyệt bảo trợ",
    rejected:                "Bị từ chối",
  };

  // ── Handlers ─────────────────────────────────────────────
  const handleSelectEvent = async (event) => {
    try {
      const res = await apiClient.get(`/api/admin/events/${event.MaSK}`);
      setSelectedEvent(res.data?.data || event);
    } catch {
      setSelectedEvent(event);
    }
    setIsModalOpen(true);
  };

  const callReview = async (eventId, status, feedback) => {
    setActionLoading(true);
    try {
      await apiClient.patch(`/api/admin/events/${eventId}/review`, { status, feedback });
      setEvents((prev) =>
        prev.map((e) => {
          if (e.MaSK !== eventId) return e;
          const newStatus = status === "rejected" ? "rejected" : "pending_student_affairs";
          return { ...e, TrangThai: newStatus, LyDoTuChoi: feedback || null };
        })
      );
      setIsModalOpen(false);
      setSelectedEvent(null);
    } catch (err) {
      alert(err.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = (eventId, notes)  => callReview(eventId, "approved", notes);
  const handleReject  = (eventId, reason) => callReview(eventId, "rejected", reason);

  // ── RENDER ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Quản Lý Phê Duyệt Sự Kiện</h1>
              <p className="text-slate-600 mt-2">
                Cán bộ Khoa: <span className="font-semibold">{user?.hoTen}</span>
              </p>
            </div>
            <button
              onClick={fetchEvents}
              disabled={fetchLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              <FiRefreshCw className={`w-4 h-4 ${fetchLoading ? "animate-spin" : ""}`} />
              Làm mới
            </button>
          </div>

          {/* Error Banner */}
          {fetchError && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl px-6 py-4 flex items-center gap-3">
              <FiAlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
              <p className="text-rose-700 text-sm font-medium">{fetchError}</p>
              <button onClick={fetchEvents} className="ml-auto text-rose-600 underline text-sm">
                Thử lại
              </button>
            </div>
          )}

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={FiAlertCircle}
              label="Cần duyệt (Pending)"
              value={pendingCount}
              color="amber"
              active={activeFilter === "pending_faculty"}
              onClick={() => setActiveFilter("pending_faculty")}
            />
            <StatCard
              icon={FiCheck}
              label="Đã duyệt bảo trợ"
              value={approvedCount}
              color="emerald"
              active={activeFilter === "pending_student_affairs"}
              onClick={() => setActiveFilter("pending_student_affairs")}
            />
            <StatCard
              icon={FiX}
              label="Hồ sơ bị từ chối"
              value={rejectedCount}
              color="rose"
              active={activeFilter === "rejected"}
              onClick={() => setActiveFilter("rejected")}
            />
          </div>

          {/* Events Table */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 px-6 py-4 border-b border-slate-200">
              {["Tên sự kiện", "Thời gian", "Địa điểm", "Chỉ tiêu", "Điểm", "Trạng thái"].map((h) => (
                <div key={h} className="text-xs font-bold text-slate-600 uppercase">{h}</div>
              ))}
            </div>

            {/* Table Body */}
            {fetchLoading ? (
              <div className="px-6 py-12 text-center text-slate-500">
                <FiLoader className="w-8 h-8 mx-auto mb-3 opacity-40 animate-spin" />
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : filteredEvents.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {filteredEvents.map((event) => (
                  <EventTableRow key={event.MaSK} event={event} onSelect={handleSelectEvent} />
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center text-slate-500">
                <FiAlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Không có sự kiện nào trong mục "{filterLabel[activeFilter]}"</p>
              </div>
            )}
          </div>

          {/* Tất cả sự kiện */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Tất cả sự kiện</h2>
            {fetchLoading ? (
              <p className="text-sm text-slate-500">Đang tải...</p>
            ) : events.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có sự kiện nào.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {events.map((event) => {
                  const cfg = STATUS_CONFIG[event.TrangThai];
                  const borderColor = {
                    pending_faculty:         "bg-amber-50 border-amber-200",
                    pending_student_affairs: "bg-blue-50 border-blue-200",
                    approved:                "bg-emerald-50 border-emerald-200",
                    rejected:                "bg-rose-50 border-rose-200",
                    sap_dien_ra:             "bg-cyan-50 border-cyan-200",
                    dang_dien_ra:            "bg-green-50 border-green-200",
                    da_ket_thuc:             "bg-gray-50 border-gray-200",
                  }[event.TrangThai] || "bg-slate-50 border-slate-200";

                  return (
                    <div key={event.MaSK} className={`rounded-xl border p-4 ${borderColor}`}>
                      <p className="font-semibold text-slate-800 text-sm line-clamp-2">{event.TenSK}</p>
                      <p className="text-xs text-slate-600 mt-1">{event.TenCLB || event.MaCLB}</p>
                      <p className="text-xs text-slate-500 mt-1">{fmt(event.ThoiGianBatDau)}</p>
                      {cfg && (
                        <span className={`inline-flex mt-2 items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                          {cfg.label}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Approval Modal */}
      <ApprovalModal
        isOpen={isModalOpen}
        event={selectedEvent}
        onClose={() => {
          if (!actionLoading) {
            setIsModalOpen(false);
            setSelectedEvent(null);
          }
        }}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={actionLoading}
      />
    </div>
  );
}