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
  cho_duyet_khoa:          { label: "Chờ Khoa duyệt", bg: "bg-amber-100",   text: "text-amber-700"   },
  pending_student_affairs: { label: "Chờ CTSV duyệt", bg: "bg-blue-100",    text: "text-blue-700"    },
  cho_duyet_ctsv:          { label: "Chờ CTSV duyệt", bg: "bg-blue-100",    text: "text-blue-700"    },
  approved:                { label: "Đã phê duyệt",   bg: "bg-emerald-100", text: "text-emerald-700" },
  da_duyet:                { label: "Đã phê duyệt",   bg: "bg-emerald-100", text: "text-emerald-700" },
  rejected:                { label: "Bị từ chối",     bg: "bg-rose-100",    text: "text-rose-700"    },
  tu_choi:                 { label: "Bị từ chối",     bg: "bg-rose-100",    text: "text-rose-700"    },
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
// EVENT APPROVAL MODAL
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
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-lg" onClick={!loading ? onClose : undefined} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto border border-slate-100">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 px-8 py-6 flex items-center justify-between rounded-t-3xl z-10 text-white">
          <div>
            <h2 className="text-2xl font-bold">Phê Duyệt Sự Kiện</h2>
            <p className="text-blue-100 text-sm mt-1">Phê duyệt cấp Khoa</p>
          </div>
          <button onClick={onClose} disabled={loading} className="p-2 rounded-lg hover:bg-white/20 transition-colors">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-4">Thông tin sự kiện</h3>
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
            </div>
          </div>

          {event.MoTa && (
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">Mô tả chi tiết</h3>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-sm text-slate-700 leading-relaxed">{event.MoTa}</p>
              </div>
            </div>
          )}

          {(event.TrangThai === "cho_duyet_khoa" || event.TrangThai === "pending_faculty") ? (
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
          ) : (
            event.LyDoTuChoi && (
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">
                  <FiMessageSquare className="inline w-4 h-4 mr-2" />Lý do từ chối
                </h3>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {event.LyDoTuChoi}
                  </p>
                </div>
              </div>
            )
          )}
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-8 py-6 flex items-center justify-end gap-3 rounded-b-3xl">
          <button onClick={onClose} disabled={loading} className="px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-all disabled:opacity-50">
            Đóng
          </button>
          {(event.TrangThai === "cho_duyet_khoa" || event.TrangThai === "pending_faculty") && (
            <>
              <button onClick={handleReject} disabled={loading} className="px-6 py-2.5 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 transition-all shadow-md flex items-center gap-2">
                <FiX className="w-4 h-4" /> Từ chối
              </button>
              <button onClick={handleApprove} disabled={loading} className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all shadow-md flex items-center gap-2">
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
const ClubApprovalModal = ({ isOpen, reg, onClose, onApprove, onReject, loading }) => {
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
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-lg" onClick={!loading ? onClose : undefined} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 flex flex-col">
        
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 flex items-center justify-between rounded-t-3xl z-10 text-white flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold">Thẩm Định Hồ Sơ Thành Lập CLB</h2>
            <p className="text-indigo-100 text-sm mt-1">Đơn đăng ký: {reg.TenCLB} (Mã: {reg.MaDKMo})</p>
          </div>
          <button onClick={onClose} disabled={loading} className="p-2 rounded-lg hover:bg-white/20 transition-colors">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8 overflow-y-auto flex-1">
          {/* Section 1: Tờ trình */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b pb-2 flex items-center gap-2"><FiFileText className="text-indigo-600" /> 1. Tờ trình thành lập (BM-CLB-01)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Tên Câu lạc bộ</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">{reg.TenCLB}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Lĩnh vực hoạt động</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">{reg.LinhVuc}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs font-bold text-slate-500 uppercase">Tính cấp thiết / Sự cần thiết thành lập</p>
                <p className="text-sm text-slate-700 leading-relaxed mt-1 whitespace-pre-wrap">{step1.tinhCapThiet || reg.MoTa || "Không có thông tin"}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Điều lệ */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b pb-2 flex items-center gap-2"><FiBookOpen className="text-indigo-600" /> 2. Điều lệ hoạt động CLB (BM-CLB-02)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Tên tiếng Anh</p>
                <p className="text-sm text-slate-800 mt-1">{step2.tenTiengAnh || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Tên viết tắt</p>
                <p className="text-sm text-slate-800 mt-1">{step2.tenVietTat || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Slogan</p>
                <p className="text-sm text-slate-800 mt-1">{step2.slogan || "—"}</p>
              </div>
              <div className="md:col-span-3">
                <p className="text-xs font-bold text-slate-500 uppercase">Giới thiệu tổng quát</p>
                <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{step2.gioiThieu || "—"}</p>
              </div>
              <div className="md:col-span-3">
                <p className="text-xs font-bold text-slate-500 uppercase">Tôn chỉ, mục đích</p>
                <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{step2.tonChiMucDich || "—"}</p>
              </div>
              <div className="md:col-span-3">
                <p className="text-xs font-bold text-slate-500 uppercase">Lĩnh vực & Phạm vi hoạt động</p>
                <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{step2.phamViHoatDong || "—"}</p>
              </div>
              <div className="md:col-span-3">
                <p className="text-xs font-bold text-slate-500 uppercase">Nguyên tắc & Quy chế thành viên</p>
                <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{step2.quyenLoiTrachNhiem || "—"}</p>
              </div>
            </div>
          </div>

          {/* Section 3: BCN lâm thời */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b pb-2 flex items-center gap-2"><FiUsers className="text-indigo-600" /> 3. Danh sách Ban chủ nhiệm lâm thời (BM-CLB-03)</h3>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="min-w-full divide-y divide-slate-200 text-sm text-left">
                <thead className="bg-slate-50 font-semibold text-slate-600">
                  <tr>
                    <th className="px-4 py-2">STT</th>
                    <th className="px-4 py-2">Họ và tên</th>
                    <th className="px-4 py-2">Giới tính</th>
                    <th className="px-4 py-2">Số điện thoại</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Chức danh dự kiến</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {step3.bcnLamThoi && step3.bcnLamThoi.length > 0 ? (
                    step3.bcnLamThoi.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-4 py-2.5 font-medium">{idx + 1}</td>
                        <td className="px-4 py-2.5 font-semibold text-slate-900">{m.hoTen}</td>
                        <td className="px-4 py-2.5 text-slate-600">{m.gioiTinh}</td>
                        <td className="px-4 py-2.5 text-slate-600">{m.sdt || "—"}</td>
                        <td className="px-4 py-2.5 text-slate-600">{m.email}</td>
                        <td className="px-4 py-2.5"><span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-bold">{m.chucVu}</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-slate-400">Không có danh sách đính kèm.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Kế hoạch 12 tháng */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b pb-2 flex items-center gap-2"><FiCalendar className="text-indigo-600" /> 4. Kế hoạch hoạt động 12 tháng (BM-CLB-05)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Mục đích - Yêu cầu</p>
                <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{step4.mucDichYeuCau || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Tiến độ thực hiện</p>
                <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{step4.tienDo || "—"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs font-bold text-slate-500 uppercase">Nội dung hoạt động chi tiết</p>
                <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{step4.noiDungHoatDong || "—"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs font-bold text-slate-500 uppercase">Dự toán Kinh phí hoạt động</p>
                <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{step4.kinhPhiHoatDong || "—"}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {reg.TrangThai === "pending_faculty" && (
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
                <FiMessageSquare className="inline w-4 h-4 mr-2" />
                Ghi chú thẩm định hồ sơ (Bắt buộc khi từ chối)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nhập ghi chú ý kiến chỉ đạo của Khoa..."
                rows="4"
                disabled={loading}
                className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none bg-white disabled:opacity-50"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-8 py-6 flex items-center justify-end gap-3 rounded-b-3xl flex-shrink-0">
          <button onClick={onClose} disabled={loading} className="px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-all disabled:opacity-50">
            Đóng
          </button>
          {reg.TrangThai === "pending_faculty" && (
            <>
              <button onClick={() => {
                if (!notes.trim()) {
                  alert("Vui lòng nhập lý do từ chối vào ô ghi chú.");
                  return;
                }
                onReject(reg.MaDKMo, notes);
              }} disabled={loading} className="px-6 py-2.5 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 transition-all shadow-md flex items-center gap-2">
                <FiX className="w-4 h-4" /> Từ chối thành lập
              </button>
              <button onClick={() => onApprove(reg.MaDKMo, notes)} disabled={loading} className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all shadow-md flex items-center gap-2">
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

  const [activeTab, setActiveTab]         = useState("events"); // "events" | "clubs"
  const [events, setEvents]               = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [fetchLoading, setFetchLoading]   = useState(true);
  const [fetchError, setFetchError]       = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Selection modals
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const [selectedReg, setSelectedReg] = useState(null);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);

  const [activeFilter, setActiveFilter]   = useState("pending_faculty");

  // ── Fetch API ────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setFetchLoading(true);
    setFetchError(null);
    try {
      if (activeTab === "events") {
        // Lấy tất cả sự kiện thuộc Khoa (sử dụng endpoint khoa-specific)
        const res = await apiClient.get("/api/khoa/events");
        const all = res.data?.data || [];
        setEvents(all);
      } else {
        const res = await apiClient.get("/api/clubs/admin/registrations");
        if (res.data.success) {
          setRegistrations(res.data.data);
        }
      }
    } catch (err) {
      console.error("fetchData error:", err.response?.data || err.message);
      setFetchError("Không thể tải danh sách. Vui lòng thử lại.");
    } finally {
      setFetchLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Stats (Events) ─────────────────────────────────────────────
  // Status mapping: backend uses Vietnamese values
  const eventPendingCount  = events.filter((e) => e.TrangThai === "cho_duyet_khoa").length;
  const eventApprovedCount = events.filter((e) => e.TrangThai === "cho_duyet_ctsv").length;
  const eventRejectedCount = events.filter((e) => e.TrangThai === "tu_choi").length;

  const filteredEvents = events.filter((e) => {
    if (activeFilter === "pending_faculty") {
      return e.TrangThai === "cho_duyet_khoa";
    }
    if (activeFilter === "pending_student_affairs") {
      return e.TrangThai === "cho_duyet_ctsv";
    }
    if (activeFilter === "rejected") {
      return e.TrangThai === "tu_choi";
    }
    return e.TrangThai === activeFilter;
  });

  // ── Stats (Clubs) ──────────────────────────────────────────────
  const clubPendingCount  = registrations.filter((r) => r.TrangThai === "cho_duyet_khoa" || r.TrangThai === "pending_faculty").length;
  const clubApprovedCount = registrations.filter((r) => r.TrangThai === "cho_duyet_ctsv" || r.TrangThai === "pending_student_affairs").length;
  const clubRejectedCount = registrations.filter((r) => r.TrangThai === "tu_choi" || r.TrangThai === "rejected").length;

  const filteredRegistrations = registrations.filter((r) => {
    if (activeFilter === "pending_faculty") {
      return r.TrangThai === "cho_duyet_khoa" || r.TrangThai === "pending_faculty";
    }
    if (activeFilter === "pending_student_affairs") {
      return r.TrangThai === "cho_duyet_ctsv" || r.TrangThai === "pending_student_affairs";
    }
    if (activeFilter === "rejected") {
      return r.TrangThai === "tu_choi" || r.TrangThai === "rejected";
    }
    return r.TrangThai === activeFilter;
  });

  const filterLabel = {
    pending_faculty:         "Chờ Khoa duyệt",
    pending_student_affairs: "Đã duyệt bảo trợ",
    rejected:                "Bị từ chối",
  };

  // ── Handlers (Events) ─────────────────────────────────────────────
  const handleSelectEvent = (event) => {
    // Use event data directly from list, no need for additional fetch
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const handleEventApprove = async (eventId, notes) => {
    setActionLoading(true);
    try {
      const res = await apiClient.patch(`/api/khoa/events/${eventId}/approve`);
      if (res.data?.success) {
        alert("Phê duyệt sự kiện thành công!");
        setEvents((prev) =>
          prev.map((e) => {
            if (e.MaSK !== eventId) return e;
            return { ...e, TrangThai: "cho_duyet_ctsv", KhoaDuyet: 1, LyDoTuChoi: null };
          })
        );
        setIsEventModalOpen(false);
        setSelectedEvent(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEventReject = async (eventId, reason) => {
    setActionLoading(true);
    try {
      const res = await apiClient.patch(`/api/khoa/events/${eventId}/reject`, { LyDoTuChoi: reason });
      if (res.data?.success) {
        alert("Từ chối sự kiện thành công!");
        setEvents((prev) =>
          prev.map((e) => {
            if (e.MaSK !== eventId) return e;
            return { ...e, TrangThai: "tu_choi", KhoaDuyet: 0, LyDoTuChoi: reason };
          })
        );
        setIsEventModalOpen(false);
        setSelectedEvent(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Handlers (Clubs) ──────────────────────────────────────────────
  const callRegReview = async (regId, status, feedback) => {
    setActionLoading(true);
    try {
      const res = await apiClient.patch(`/api/clubs/admin/registrations/${regId}/review`, { status, feedback });
      if (res.data.success) {
        alert(res.data.message);
        setRegistrations((prev) =>
          prev.map((r) => {
            if (r.MaDKMo !== regId) return r;
            const newStatus = status === "rejected" ? "rejected" : "pending_student_affairs";
            return { ...r, TrangThai: newStatus, LyDoTuChoi: feedback || null };
          })
        );
        setIsRegModalOpen(false);
        setSelectedReg(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegApprove = (regId, notes) => callRegReview(regId, "approved", notes);
  const handleRegReject  = (regId, reason) => callRegReview(regId, "rejected", reason);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Quản Lý Phê Duyệt Cấp Khoa</h1>
              <p className="text-slate-600 mt-2">
                Cán bộ Khoa: <span className="font-semibold">{user?.hoTen}</span>
              </p>
            </div>
            <button
              onClick={fetchData}
              disabled={fetchLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-all disabled:opacity-50 shadow-sm"
            >
              <FiRefreshCw className={`w-4 h-4 ${fetchLoading ? "animate-spin" : ""}`} />
              Làm mới
            </button>
          </div>

          {/* Top Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => {
                setActiveTab("events");
                setActiveFilter("pending_faculty");
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
                setActiveFilter("pending_faculty");
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

          {/* Error Banner */}
          {fetchError && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl px-6 py-4 flex items-center gap-3">
              <FiAlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
              <p className="text-rose-700 text-sm font-medium">{fetchError}</p>
              <button onClick={fetchData} className="ml-auto text-rose-600 underline text-sm">
                Thử lại
              </button>
            </div>
          )}

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={FiAlertCircle}
              label="Cần duyệt (Pending)"
              value={activeTab === "events" ? eventPendingCount : clubPendingCount}
              color="amber"
              active={activeFilter === "pending_faculty"}
              onClick={() => setActiveFilter("pending_faculty")}
            />
            <StatCard
              icon={FiCheck}
              label="Đã duyệt chuyển CTSV"
              value={activeTab === "events" ? eventApprovedCount : clubApprovedCount}
              color="emerald"
              active={activeFilter === "pending_student_affairs"}
              onClick={() => setActiveFilter("pending_student_affairs")}
            />
            <StatCard
              icon={FiX}
              label="Đơn bị từ chối"
              value={activeTab === "events" ? eventRejectedCount : clubRejectedCount}
              color="rose"
              active={activeFilter === "rejected"}
              onClick={() => setActiveFilter("rejected")}
            />
          </div>

          {/* Table list */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
            {activeTab === "events" ? (
              // Events Rendering
              <>
                <div className="grid grid-cols-6 gap-4 bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 px-6 py-4 border-b border-slate-200 font-bold text-xs text-slate-600 uppercase">
                  <div>Tên sự kiện</div>
                  <div>Thời gian</div>
                  <div>Địa điểm</div>
                  <div>Chỉ tiêu</div>
                  <div>Điểm</div>
                  <div>Trạng thái</div>
                </div>

                {fetchLoading ? (
                  <div className="px-6 py-12 text-center text-slate-500">
                    <FiLoader className="w-8 h-8 mx-auto mb-3 opacity-40 animate-spin" />
                    <p>Đang tải dữ liệu...</p>
                  </div>
                ) : filteredEvents.length > 0 ? (
                  <div className="divide-y divide-slate-200">
                    {filteredEvents.map((event) => (
                      <div
                        key={event.MaSK}
                        onClick={() => handleSelectEvent(event)}
                        className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-slate-200 hover:bg-teal-50/30 transition-colors cursor-pointer"
                      >
                        <div className="font-semibold text-slate-800 truncate">{event.TenSK}</div>
                        <div className="text-sm text-slate-600">{fmt(event.ThoiGianBatDau)}</div>
                        <div className="text-sm text-slate-600 truncate">{event.DiaDiem}</div>
                        <div className="text-sm text-slate-600">{event.SoNguoiToiDa}</div>
                        <div className="text-sm text-slate-600">{event.DiemRenLuyen ?? 0}</div>
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            STATUS_CONFIG[event.TrangThai]?.bg || "bg-slate-100"
                          } ${STATUS_CONFIG[event.TrangThai]?.text || "text-slate-700"}`}>
                            {STATUS_CONFIG[event.TrangThai]?.label}
                          </span>
                          <FiChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-12 text-center text-slate-500">
                    <FiAlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Không có sự kiện nào trong mục "{filterLabel[activeFilter]}"</p>
                  </div>
                )}
              </>
            ) : (
              // Club Registrations Rendering
              <>
                <div className="grid grid-cols-5 gap-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 px-6 py-4 border-b border-slate-200 font-bold text-xs text-slate-600 uppercase">
                  <div>Tên Câu lạc bộ dự kiến</div>
                  <div>Lĩnh vực</div>
                  <div>Sinh viên nộp đơn</div>
                  <div>Ngày nộp</div>
                  <div>Trạng thái</div>
                </div>

                {fetchLoading ? (
                  <div className="px-6 py-12 text-center text-slate-500">
                    <FiLoader className="w-8 h-8 mx-auto mb-3 opacity-40 animate-spin" />
                    <p>Đang tải dữ liệu...</p>
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
                        className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-slate-200 hover:bg-indigo-50/30 transition-colors cursor-pointer"
                      >
                        <div className="font-semibold text-slate-800 truncate">{reg.TenCLB}</div>
                        <div className="text-sm text-slate-600">{reg.LinhVuc}</div>
                        <div className="text-sm text-slate-600">{reg.NguoiDangKy || reg.MaND}</div>
                        <div className="text-sm text-slate-600">{new Date(reg.NgayTao).toLocaleDateString("vi-VN")}</div>
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            STATUS_CONFIG[reg.TrangThai]?.bg || "bg-slate-100"
                          } ${STATUS_CONFIG[reg.TrangThai]?.text || "text-slate-700"}`}>
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
                    <p>Không có hồ sơ thành lập CLB nào trong mục "{filterLabel[activeFilter]}"</p>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>

      {/* Event Approval Modal */}
      <ApprovalModal
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

      {/* Club Registration Approval Modal */}
      <ClubApprovalModal
        isOpen={isRegModalOpen}
        reg={selectedReg}
        onClose={() => {
          if (!actionLoading) {
            setIsRegModalOpen(false);
            setSelectedReg(null);
          }
        }}
        onApprove={handleRegApprove}
        onReject={handleRegReject}
        loading={actionLoading}
      />
    </div>
  );
}