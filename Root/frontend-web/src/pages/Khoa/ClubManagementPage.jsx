/**
 * ClubManagementPage - Cán bộ Khoa quản lý CLB
 * ✅ Xem danh sách CLB
 * ✅ Xem chi tiết CLB (số TV, số SK, BCN)
 * ✅ Khóa / Mở lại CLB
 * ✅ Tìm kiếm, lọc theo trạng thái
 */

import { useState, useEffect, useCallback } from "react";
import {
  FiUsers,
  FiCalendar,
  FiLock,
  FiUnlock,
  FiSearch,
  FiRefreshCw,
  FiLoader,
  FiAlertCircle,
  FiX,
  FiChevronRight,
  FiInfo,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../utils/apiClient";

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const fmtDate = (dt) =>
  dt ? new Date(dt).toLocaleDateString("vi-VN") : "—";

const STATUS_CONFIG = {
  "Hoạt động":       { label: "Hoạt động",        bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  "Bị khóa":         { label: "Bị khóa",           bg: "bg-rose-100",    text: "text-rose-700",    dot: "bg-rose-500"    },
  "Chờ duyệt":       { label: "Chờ duyệt",         bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-500"   },
  "Không hoạt động": { label: "Không hoạt động",   bg: "bg-gray-100",    text: "text-gray-700",    dot: "bg-gray-400"    },
};

// ─────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, active, onClick }) => {
  const colorClasses = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    rose:    "bg-rose-50 border-rose-200 text-rose-700",
    amber:   "bg-amber-50 border-amber-200 text-amber-700",
    blue:    "bg-blue-50 border-blue-200 text-blue-700",
  };
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border p-5 transition-all hover:shadow-lg cursor-pointer select-none
        ${colorClasses[color]}
        ${active ? "ring-2 ring-offset-2 ring-current shadow-lg scale-[1.02]" : ""}
      `}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <Icon className="w-9 h-9 opacity-30" />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// CLUB DETAIL MODAL
// ─────────────────────────────────────────────────────────────
const ClubDetailModal = ({ isOpen, club, onClose, onUpdateStatus, loading }) => {
  const [newStatus, setNewStatus] = useState("");
  const [lyDo, setLyDo] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (isOpen && club) {
      setNewStatus("");
      setLyDo("");
      setShowConfirm(false);
    }
  }, [isOpen, club?.MaCLB]);

  if (!isOpen || !club) return null;

  const handleConfirm = () => {
    if (newStatus === "Bị khóa" && !lyDo.trim()) {
      alert("Vui lòng nhập lý do khóa CLB");
      return;
    }
    onUpdateStatus(club.MaCLB, newStatus, lyDo);
  };

  const cfg = STATUS_CONFIG[club.TrangThai] || STATUS_CONFIG["Hoạt động"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-lg" onClick={!loading ? onClose : undefined} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-100">

        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 px-8 py-6 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h2 className="text-xl font-bold text-white">{club.TenCLB}</h2>
            <p className="text-blue-100 text-sm mt-1">{club.LinhVuc}</p>
          </div>
          <button onClick={onClose} disabled={loading} className="p-2 rounded-lg hover:bg-white/20 transition-colors">
            <FiX className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Trạng thái hiện tại */}
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${cfg.bg} ${cfg.text}`}>
              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          </div>

          {/* Thông tin tổng quan */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
              <p className="text-2xl font-bold text-blue-700">{club.SoThanhVien}</p>
              <p className="text-xs text-blue-600 mt-1">Thành viên</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
              <p className="text-2xl font-bold text-purple-700">{club.SoSuKien}</p>
              <p className="text-xs text-purple-600 mt-1">Sự kiện</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200 col-span-2">
              <p className="text-sm font-semibold text-slate-700">{fmtDate(club.NgayThanhLap)}</p>
              <p className="text-xs text-slate-500 mt-1">Ngày thành lập</p>
            </div>
          </div>

          {/* Mô tả */}
          {club.MoTa && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Mô tả</p>
              <p className="text-sm text-slate-700 leading-relaxed">{club.MoTa}</p>
            </div>
          )}

          {/* Ban chủ nhiệm */}
          {club.BanChuNhiem?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Ban chủ nhiệm</p>
              <div className="space-y-2">
                {club.BanChuNhiem.map((bcn) => (
                  <div key={bcn.MaTV} className="flex items-center justify-between bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{bcn.hoTen}</p>
                      <p className="text-xs text-slate-500">{bcn.email}</p>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {bcn.VaiTroCLB}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sự kiện gần đây */}
          {club.SuKienGanDay?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Sự kiện gần đây</p>
              <div className="space-y-2">
                {club.SuKienGanDay.map((sk) => {
                  const skCfg = STATUS_CONFIG[sk.TrangThai] || { bg: "bg-slate-100", text: "text-slate-600", label: sk.TrangThai };
                  return (
                    <div key={sk.MaSK} className="flex items-center justify-between bg-slate-50 rounded-xl p-3 border border-slate-200">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{sk.TenSK}</p>
                        <p className="text-xs text-slate-500">{fmtDate(sk.ThoiGianBatDau)}</p>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${skCfg.bg} ${skCfg.text}`}>
                        {sk.TrangThai}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Thay đổi trạng thái */}
          <div className="border-t border-slate-200 pt-6">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Thay đổi trạng thái CLB</p>
            <div className="flex gap-3 mb-4">
              {["Hoạt động", "Bị khóa", "Không hoạt động"].map((s) => (
                <button
                  key={s}
                  onClick={() => { setNewStatus(s); setShowConfirm(true); }}
                  disabled={club.TrangThai === s || loading}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed
                    ${s === "Hoạt động"        ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}
                    ${s === "Bị khóa"          ? "bg-rose-500 hover:bg-rose-600 text-white" : ""}
                    ${s === "Không hoạt động"  ? "bg-gray-400 hover:bg-gray-500 text-white" : ""}
                  `}
                >
                  {s === "Hoạt động" && <FiUnlock className="inline w-4 h-4 mr-1" />}
                  {s === "Bị khóa"   && <FiLock   className="inline w-4 h-4 mr-1" />}
                  {s}
                </button>
              ))}
            </div>

            {/* Confirm section */}
            {showConfirm && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <p className="text-sm font-semibold text-slate-700">
                  Xác nhận chuyển sang: <span className="text-blue-600">"{newStatus}"</span>
                </p>
                <textarea
                  value={lyDo}
                  onChange={(e) => setLyDo(e.target.value)}
                  placeholder={newStatus === "Bị khóa" ? "Nhập lý do khóa CLB (bắt buộc)..." : "Nhập ghi chú (không bắt buộc)..."}
                  rows="3"
                  disabled={loading}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none resize-none text-sm disabled:opacity-50"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowConfirm(false)}
                    disabled={loading}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-100 disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading && <FiLoader className="w-4 h-4 animate-spin" />}
                    Xác nhận
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// CLUB CARD
// ─────────────────────────────────────────────────────────────
const ClubCard = ({ club, onSelect }) => {
  const cfg = STATUS_CONFIG[club.TrangThai] || STATUS_CONFIG["Hoạt động"];
  return (
    <div
      onClick={() => onSelect(club)}
      className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{club.TenCLB}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{club.LinhVuc}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
          <FiChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="text-center">
          <p className="text-lg font-bold text-blue-600">{club.SoThanhVien}</p>
          <p className="text-xs text-slate-500">Thành viên</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-purple-600">{club.SoSuKien}</p>
          <p className="text-xs text-slate-500">Sự kiện</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-semibold text-slate-600">{fmtDate(club.NgayThanhLap)}</p>
          <p className="text-xs text-slate-500">Thành lập</p>
        </div>
      </div>

      {club.TenChuNhiem && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
            {club.TenChuNhiem.charAt(0)}
          </div>
          <p className="text-xs text-slate-600">
            Chủ nhiệm: <span className="font-semibold">{club.TenChuNhiem}</span>
          </p>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function ClubManagementPage() {
  const { user } = useAuth();

  const [clubs, setClubs]                 = useState([]);
  const [fetchLoading, setFetchLoading]   = useState(true);
  const [fetchError, setFetchError]       = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [selectedClub, setSelectedClub]   = useState(null);
  const [isModalOpen, setIsModalOpen]     = useState(false);

  const [search, setSearch]               = useState("");
  const [activeFilter, setActiveFilter]   = useState("all");

  // ── Fetch danh sách CLB ──────────────────────────────────
  const fetchClubs = useCallback(async () => {
    setFetchLoading(true);
    setFetchError(null);
    try {
      const res = await apiClient.get("/api/khoa/clubs");
      setClubs(res.data?.data || []);
    } catch {
      setFetchError("Không thể tải danh sách CLB. Vui lòng thử lại.");
    } finally {
      setFetchLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClubs();
  }, [fetchClubs]);

  // ── Mở modal chi tiết ────────────────────────────────────
  const handleSelectClub = async (club) => {
    try {
      const res = await apiClient.get(`/api/khoa/clubs/${club.MaCLB}`);
      setSelectedClub(res.data?.data || club);
    } catch {
      setSelectedClub(club);
    }
    setIsModalOpen(true);
  };

  // ── Cập nhật trạng thái CLB ──────────────────────────────
  const handleUpdateStatus = async (maCLB, status, lyDo) => {
    setActionLoading(true);
    try {
      await apiClient.patch(`/api/khoa/clubs/${maCLB}/status`, { status, lyDo });
      setClubs((prev) =>
        prev.map((c) => c.MaCLB === maCLB ? { ...c, TrangThai: status } : c)
      );
      setSelectedClub((prev) => prev ? { ...prev, TrangThai: status } : prev);
      setIsModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Thống kê ─────────────────────────────────────────────
  const totalCount    = clubs.length;
  const activeCount   = clubs.filter((c) => c.TrangThai === "Hoạt động").length;
  const lockedCount   = clubs.filter((c) => c.TrangThai === "Bị khóa").length;
  const inactiveCount = clubs.filter((c) => c.TrangThai === "Không hoạt động").length;

  // ── Filter + Search ──────────────────────────────────────
  const filteredClubs = clubs.filter((c) => {
    const matchSearch = !search ||
      c.TenCLB.toLowerCase().includes(search.toLowerCase()) ||
      c.LinhVuc?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = activeFilter === "all" || c.TrangThai === activeFilter;
    return matchSearch && matchStatus;
  });

  // ── RENDER ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Quản Lý CLB Thuộc Khoa</h1>
              <p className="text-slate-600 mt-2">
                Cán bộ Khoa: <span className="font-semibold">{user?.hoTen}</span>
              </p>
            </div>
            <button
              onClick={fetchClubs}
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
              <button onClick={fetchClubs} className="ml-auto text-rose-600 underline text-sm">Thử lại</button>
            </div>
          )}

          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={FiInfo}     label="Tổng CLB"          value={totalCount}    color="blue"    active={activeFilter === "all"}              onClick={() => setActiveFilter("all")} />
            <StatCard icon={FiUsers}    label="Đang hoạt động"    value={activeCount}   color="emerald" active={activeFilter === "Hoạt động"}        onClick={() => setActiveFilter("Hoạt động")} />
            <StatCard icon={FiLock}     label="Bị khóa"           value={lockedCount}   color="rose"    active={activeFilter === "Bị khóa"}          onClick={() => setActiveFilter("Bị khóa")} />
            <StatCard icon={FiCalendar} label="Không hoạt động"   value={inactiveCount} color="amber"   active={activeFilter === "Không hoạt động"}  onClick={() => setActiveFilter("Không hoạt động")} />
          </div>

          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên CLB hoặc lĩnh vực..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Club Grid */}
          {fetchLoading ? (
            <div className="text-center py-16 text-slate-500">
              <FiLoader className="w-10 h-10 mx-auto mb-3 opacity-40 animate-spin" />
              <p>Đang tải danh sách CLB...</p>
            </div>
          ) : filteredClubs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClubs.map((club) => (
                <ClubCard key={club.MaCLB} club={club} onSelect={handleSelectClub} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500">
              <FiAlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Không tìm thấy CLB nào</p>
            </div>
          )}

        </div>
      </div>

      {/* Detail Modal */}
      <ClubDetailModal
        isOpen={isModalOpen}
        club={selectedClub}
        onClose={() => {
          if (!actionLoading) {
            setIsModalOpen(false);
            setSelectedClub(null);
          }
        }}
        onUpdateStatus={handleUpdateStatus}
        loading={actionLoading}
      />
    </div>
  );
}