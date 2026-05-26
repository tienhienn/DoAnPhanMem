/**
 * StudentAffairsPage - Phòng Công tác sinh viên (CTSV) cấp phép hoạt động sự kiện & thành lập CLB
 */

import { useState, useEffect, useCallback } from "react";
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
  FiFileText,
  FiBookOpen,
  FiRefreshCw,
  FiLoader,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../utils/apiClient";

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
// STAT CARD COMPONENT
// ============================================
const StatCard = ({ icon: Icon, label, value, color, active, onClick }) => {
  const colorClasses = {
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    rose: "bg-rose-50 border-rose-200 text-rose-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border p-6 backdrop-blur-sm transition-all hover:shadow-lg cursor-pointer select-none
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

// ============================================
// FINAL APPROVAL MODAL (EVENTS)
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

  useEffect(() => {
    if (isOpen) setOpinion("");
  }, [isOpen, event?.MaSK]);

  if (!isOpen || !event) return null;

  const handleApprove = () => {
    onApprove(event.MaSK, opinion);
  };

  const handleReject = () => {
    if (!opinion.trim()) {
      alert("Vui lòng nhập lý do không cấp phép");
      return;
    }
    onReject(event.MaSK, opinion);
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
            <h2 className="text-2xl font-bold">Phê Duyệt Sự Kiện Cuối Cùng</h2>
            <p className="text-blue-100 text-sm mt-1">
              Phê duyệt cấp Phòng CTSV
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

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                Tên sự kiện
              </p>
              <p className="text-lg font-bold text-slate-900">{event.TenSK}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                CLB tổ chức
              </p>
              <p className="text-sm font-semibold text-teal-700">
                {event.TenCLB || event.MaCLB}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                Thời gian
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {formatDate(event.ThoiGianBatDau)}
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

          {event.TrangThai === "pending_student_affairs" && (
            <div>
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">
                <FiMessageSquare className="inline w-4 h-4 mr-2" />Ý kiến chỉ
                đạo / Lý do từ chối
              </label>
              <textarea
                value={opinion}
                onChange={(e) => setOpinion(e.target.value)}
                placeholder="Nhập ý kiến chỉ đạo hoặc lý do không cấp phép..."
                rows="4"
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
          {event.TrangThai === "pending_student_affairs" && (
            <>
              <button
                onClick={handleReject}
                disabled={loading}
                className="px-6 py-2.5 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 transition-all shadow-md flex items-center gap-2"
              >
                <FiX className="w-4 h-4" /> Từ chối cấp phép
              </button>
              <button
                onClick={handleApprove}
                disabled={loading}
                className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all shadow-md flex items-center gap-2"
              >
                <FiCheck className="w-4 h-4" /> Đồng ý cấp phép
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// CLUB REGISTRATION APPROVAL MODAL (CTSV)
// ============================================
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
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 flex items-center justify-between rounded-t-3xl z-10 text-white flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold">
              Thẩm Định Quyết Định Thành Lập CLB
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              Hồ sơ: {reg.TenCLB} (Đơn vị quản lý: {reg.tenDVQL})
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

        {/* Content */}
        <div className="p-8 space-y-8 overflow-y-auto flex-1">
          {/* Tờ trình */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
              <FiFileText className="text-blue-600" /> 1. Tờ trình thành lập
              (BM-CLB-01)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">
                  Tên Câu lạc bộ dự kiến
                </p>
                <p className="text-sm font-bold text-slate-800 mt-1">
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
                  Tính cấp thiết
                </p>
                <p className="text-sm text-slate-700 leading-relaxed mt-1 whitespace-pre-wrap">
                  {step1.tinhCapThiet || reg.MoTa}
                </p>
              </div>
            </div>
          </div>

          {/* Điều lệ */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
              <FiBookOpen className="text-blue-600" /> 2. Điều lệ hoạt động CLB
              (BM-CLB-02)
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
                  Giới thiệu chung
                </p>
                <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">
                  {step2.gioiThieu || "—"}
                </p>
              </div>
              <div className="md:col-span-3">
                <p className="text-xs font-bold text-slate-500 uppercase">
                  Tôn chỉ, mục đích
                </p>
                <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">
                  {step2.tonChiMucDich || "—"}
                </p>
              </div>
              <div className="md:col-span-3">
                <p className="text-xs font-bold text-slate-500 uppercase">
                  Nguyên tắc & Quyền lợi thành viên
                </p>
                <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">
                  {step2.quyenLoiTrachNhiem || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* BCN lâm thời */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
              <FiUsers className="text-blue-600" /> 3. Danh sách Ban chủ nhiệm
              lâm thời (BM-CLB-03)
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="min-w-full divide-y divide-slate-200 text-sm text-left">
                <thead className="bg-slate-50 font-semibold text-slate-600">
                  <tr>
                    <th className="px-4 py-2">STT</th>
                    <th className="px-4 py-2">Họ và tên</th>
                    <th className="px-4 py-2">Giới tính</th>
                    <th className="px-4 py-2">Số điện thoại</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Chức vụ dự kiến</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {step3.bcnLamThoi?.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 font-medium">{idx + 1}</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-900">
                        {m.hoTen}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">
                        {m.gioiTinh}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">
                        {m.sdt || "—"}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">{m.email}</td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-bold">
                          {m.chucVu}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Kế hoạch */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
              <FiCalendar className="text-blue-600" /> 4. Kế hoạch hoạt động &
              Kinh phí (BM-CLB-05)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">
                  Mục đích yêu cầu
                </p>
                <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">
                  {step4.mucDichYeuCau || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">
                  Tiến độ thực hiện
                </p>
                <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">
                  {step4.tienDo || "—"}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs font-bold text-slate-500 uppercase">
                  Nội dung chi tiết
                </p>
                <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">
                  {step4.noiDungHoatDong || "—"}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs font-bold text-slate-500 uppercase">
                  Kinh phí dự toán
                </p>
                <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">
                  {step4.kinhPhiHoatDong || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {reg.TrangThai === "pending_student_affairs" && (
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
                Ghi chú phê duyệt cuối cùng (Bắt buộc khi từ chối)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nhập ý kiến chỉ đạo hoặc lý do từ chối quyết định thành lập..."
                rows="4"
                disabled={loading}
                className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none bg-white disabled:opacity-50"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-8 py-6 flex items-center justify-end gap-3 rounded-b-3xl flex-shrink-0">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            Đóng
          </button>
          {reg.TrangThai === "pending_student_affairs" && (
            <>
              <button
                onClick={() => {
                  if (!notes.trim()) {
                    alert("Vui lòng điền lý do từ chối quyết định.");
                    return;
                  }
                  onReject(reg.MaDKMo, notes);
                }}
                disabled={loading}
                className="px-6 py-2.5 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 transition-all shadow-md flex items-center gap-2"
              >
                <FiX className="w-4 h-4" /> Từ chối mở CLB
              </button>
              <button
                onClick={() => onApprove(reg.MaDKMo, notes)}
                disabled={loading}
                className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all shadow-md flex items-center gap-2"
              >
                <FiCheck className="w-4 h-4" /> Quyết định thành lập CLB
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN PAGE
// ============================================
export default function StudentAffairsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("events"); // "events" | "clubs"
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const [selectedReg, setSelectedReg] = useState(null);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);

  const [activeFilter, setActiveFilter] = useState("pending_student_affairs");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      if (activeTab === "events") {
        const statuses = ["pending_student_affairs", "approved", "rejected"];
        const responses = await Promise.all(
          statuses.map((s) =>
            apiClient.get("/api/admin/events", {
              params: { limit: 100, status: s },
            }),
          ),
        );
        const all = responses.flatMap((r) => r.data?.data?.events || []);
        const map = new Map();
        all.forEach((e) => map.set(e.MaSK, e));
        setEvents([...map.values()]);
      } else {
        const res = await apiClient.get("/api/clubs/admin/registrations");
        if (res.data.success) {
          setRegistrations(res.data.data);
        }
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Stats (Events) ─────────────────────────────────────────────
  const eventPendingCount = events.filter(
    (e) =>
      e.TrangThai === "pending_student_affairs" &&
      e.KhoaDuyet &&
      !e.PhongCTSVDuyet,
  ).length;
  const eventApprovedCount = events.filter(
    (e) =>
      (e.TrangThai === "approved" ||
        e.TrangThai === "sap_dien_ra" ||
        e.TrangThai === "dang_dien_ra") &&
      e.KhoaDuyet &&
      e.PhongCTSVDuyet,
  ).length;
  const eventRejectedCount = events.filter(
    (e) => e.TrangThai === "rejected",
  ).length;

  const filteredEvents = events.filter((e) => {
    if (activeFilter === "pending_student_affairs") {
      return (
        e.TrangThai === "pending_student_affairs" &&
        e.KhoaDuyet &&
        !e.PhongCTSVDuyet
      );
    }
    if (activeFilter === "approved") {
      return (
        (e.TrangThai === "approved" ||
          e.TrangThai === "sap_dien_ra" ||
          e.TrangThai === "dang_dien_ra") &&
        e.KhoaDuyet &&
        e.PhongCTSVDuyet
      );
    }
    return e.TrangThai === "rejected";
  });

  // ── Stats (Clubs) ──────────────────────────────────────────────
  const clubPendingCount = registrations.filter(
    (r) => r.TrangThai === "pending_student_affairs",
  ).length;
  const clubApprovedCount = registrations.filter(
    (r) => r.TrangThai === "approved",
  ).length;
  const clubRejectedCount = registrations.filter(
    (r) => r.TrangThai === "rejected",
  ).length;

  const filteredRegistrations = registrations.filter(
    (r) => r.TrangThai === activeFilter,
  );

  const filterLabel = {
    pending_student_affairs: "Chờ CTSV duyệt",
    approved: "Đã phê duyệt thành lập",
    rejected: "Bị từ chối",
  };

  // ── Handlers (Events) ──────────────────────────────────────────
  const handleEventApprove = async (maSK, opinion) => {
    try {
      setLoading(true);
      await apiClient.patch(`/api/admin/events/${maSK}/review`, {
        status: "approved",
        feedback: opinion,
      });
      alert("Cấp phép hoạt động sự kiện thành công!");
      setIsEventModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEventReject = async (maSK, opinion) => {
    try {
      setLoading(true);
      await apiClient.patch(`/api/admin/events/${maSK}/review`, {
        status: "rejected",
        feedback: opinion,
      });
      alert("Từ chối sự kiện thành công!");
      setIsEventModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // ── Handlers (Clubs) ───────────────────────────────────────────
  const handleRegApprove = async (regId, opinion) => {
    try {
      setLoading(true);
      await apiClient.patch(`/api/clubs/admin/registrations/${regId}/review`, {
        status: "approved",
        feedback: opinion,
      });
      alert(
        "Quyết định thành lập câu lạc bộ thành công! CLB đã được thêm vào danh sách hoạt động.",
      );
      setIsRegModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRegReject = async (regId, opinion) => {
    try {
      setLoading(true);
      await apiClient.patch(`/api/clubs/admin/registrations/${regId}/review`, {
        status: "rejected",
        feedback: opinion,
      });
      alert("Từ chối đơn đăng ký thành lập CLB thành công!");
      setIsRegModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    alert(
      "Đang trích xuất báo cáo. Chức năng xuất Excel sẽ tự động tải xuống.",
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Quản lý Cấp phép cấp Trường
              </h1>
              <p className="text-slate-600 mt-2">
                Phòng Công Tác Sinh Viên:{" "}
                <span className="font-semibold">{user?.hoTen}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExportReport}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-900 transition-all shadow-sm"
              >
                <FiDownload className="w-4 h-4" /> Xuất báo cáo
              </button>
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                <FiRefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Làm mới
              </button>
            </div>
          </div>

          {/* Top level tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => {
                setActiveTab("events");
                setActiveFilter("pending_student_affairs");
              }}
              className={`px-6 py-3 font-bold text-sm border-b-2 transition-all ${
                activeTab === "events"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Phê duyệt Sự kiện
            </button>
            <button
              onClick={() => {
                setActiveTab("clubs");
                setActiveFilter("pending_student_affairs");
              }}
              className={`px-6 py-3 font-bold text-sm border-b-2 transition-all ${
                activeTab === "clubs"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Phê duyệt Thành lập CLB
            </button>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={FiAlertCircle}
              label="Đơn chờ duyệt (Pending)"
              value={
                activeTab === "events" ? eventPendingCount : clubPendingCount
              }
              color="amber"
              active={activeFilter === "pending_student_affairs"}
              onClick={() => setActiveFilter("pending_student_affairs")}
            />
            <StatCard
              icon={FiCheckCircle}
              label="Đơn đã phê duyệt"
              value={
                activeTab === "events" ? eventApprovedCount : clubApprovedCount
              }
              color="emerald"
              active={activeFilter === "approved"}
              onClick={() => setActiveFilter("approved")}
            />
            <StatCard
              icon={FiX}
              label="Đơn đã từ chối"
              value={
                activeTab === "events" ? eventRejectedCount : clubRejectedCount
              }
              color="rose"
              active={activeFilter === "rejected"}
              onClick={() => setActiveFilter("rejected")}
            />
          </div>

          {/* List Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {activeTab === "events" ? (
              // Events table
              <>
                <div className="grid grid-cols-6 gap-4 bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b font-bold text-xs text-slate-600 uppercase">
                  <div>Tên sự kiện</div>
                  <div>CLB tổ chức</div>
                  <div>Thời gian bắt đầu</div>
                  <div>Địa điểm</div>
                  <div>Quy mô</div>
                  <div>Trạng thái</div>
                </div>

                {loading ? (
                  <div className="px-6 py-12 text-center text-slate-500">
                    Đang tải...
                  </div>
                ) : filteredEvents.length > 0 ? (
                  <div className="divide-y divide-slate-200">
                    {filteredEvents.map((event) => (
                      <div
                        key={event.MaSK}
                        onClick={() => {
                          setSelectedEvent(event);
                          setIsEventModalOpen(true);
                        }}
                        className="grid grid-cols-6 gap-4 px-6 py-4 border-b hover:bg-slate-50/50 cursor-pointer text-sm items-center"
                      >
                        <div className="font-semibold text-slate-800 truncate">
                          {event.TenSK}
                        </div>
                        <div className="text-teal-700 font-medium truncate">
                          {event.TenCLB || event.MaCLB}
                        </div>
                        <div className="text-slate-600">
                          {formatDate(event.ThoiGianBatDau)}
                        </div>
                        <div className="text-slate-600 truncate">
                          {event.DiaDiem}
                        </div>
                        <div className="text-slate-600">
                          {event.SoNguoiToiDa} slot
                        </div>
                        <div>
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              STATUS_CONFIG[event.TrangThai]?.bg ||
                              "bg-slate-100"
                            } ${STATUS_CONFIG[event.TrangThai]?.text || "text-slate-700"}`}
                          >
                            {STATUS_CONFIG[event.TrangThai]?.label}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-12 text-center text-slate-500">
                    Không có sự kiện nào trong danh sách.
                  </div>
                )}
              </>
            ) : (
              // Club Registrations table
              <>
                <div className="grid grid-cols-5 gap-4 bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b font-bold text-xs text-slate-600 uppercase">
                  <div>Tên Câu lạc bộ dự kiến</div>
                  <div>Lĩnh vực</div>
                  <div>Đơn vị quản lý</div>
                  <div>Ngày nộp đơn</div>
                  <div>Trạng thái</div>
                </div>

                {loading ? (
                  <div className="px-6 py-12 text-center text-slate-500">
                    Đang tải...
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
                        className="grid grid-cols-5 gap-4 px-6 py-4 border-b hover:bg-slate-50/50 cursor-pointer text-sm items-center"
                      >
                        <div className="font-semibold text-slate-800 truncate">
                          {reg.TenCLB}
                        </div>
                        <div className="text-slate-600">{reg.LinhVuc}</div>
                        <div className="text-slate-600 truncate">
                          {reg.tenDVQL}
                        </div>
                        <div className="text-slate-600">
                          {new Date(reg.NgayTao).toLocaleDateString("vi-VN")}
                        </div>
                        <div>
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              STATUS_CONFIG[reg.TrangThai]?.bg || "bg-slate-100"
                            } ${STATUS_CONFIG[reg.TrangThai]?.text || "text-slate-700"}`}
                          >
                            {STATUS_CONFIG[reg.TrangThai]?.label}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-12 text-center text-slate-500">
                    Không có hồ sơ đăng ký thành lập CLB nào trong danh sách.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Events approval modal */}
      <FinalApprovalModal
        isOpen={isEventModalOpen}
        event={selectedEvent}
        onClose={() => {
          setIsEventModalOpen(false);
          setSelectedEvent(null);
        }}
        onApprove={handleEventApprove}
        onReject={handleEventReject}
        loading={loading}
      />

      {/* Club registrations approval modal */}
      <ClubApprovalModal
        isOpen={isRegModalOpen}
        reg={selectedReg}
        onClose={() => {
          setIsRegModalOpen(false);
          setSelectedReg(null);
        }}
        onApprove={handleRegApprove}
        onReject={handleRegReject}
        loading={loading}
      />
    </div>
  );
}
