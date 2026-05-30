/**
 * KhoaDashboardPage - Tổng quan hoạt động cho Cán bộ Khoa
 * ✅ StatCard thống kê nhanh
 * ✅ Biểu đồ hoạt động 6 tháng
 * ✅ Top 5 sinh viên tích cực
 * ✅ Báo cáo CLB gần đây
 * ✅ Gửi thông báo đến CLB
 */

import { useState, useEffect, useCallback } from "react";
import {
  FiCalendar, FiUsers, FiFileText, FiRefreshCw,
  FiAlertCircle, FiLoader, FiBell, FiSend, FiAward,
} from "react-icons/fi";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../utils/apiClient";

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const THANG = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];

const HOSO_STATUS = {
  submitted: { label: "Chờ duyệt",  bg: "bg-amber-100",   text: "text-amber-700"   },
  approved:  { label: "Đã duyệt",   bg: "bg-emerald-100", text: "text-emerald-700" },
  draft:     { label: "Bản nháp",   bg: "bg-slate-100",   text: "text-slate-600"   },
  tu_choi:   { label: "Bị từ chối", bg: "bg-rose-100",    text: "text-rose-700"    },
};

// ─────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, sub }) => {
  const colorClasses = {
    blue:    "bg-blue-50 border-blue-200 text-blue-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    purple:  "bg-purple-50 border-purple-200 text-purple-700",
    amber:   "bg-amber-50 border-amber-200 text-amber-700",
  };
  return (
    <div className={`rounded-2xl border p-5 transition-all hover:shadow-lg ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{label}</p>
          <p className="text-3xl font-bold mt-1">{value ?? "—"}</p>
          {sub && <p className="text-xs opacity-60 mt-1">{sub}</p>}
        </div>
        <Icon className="w-10 h-10 opacity-25" />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function KhoaDashboardPage() {
  const { user } = useAuth();

  // ── State ────────────────────────────────────────────────
  const [stats, setStats]           = useState(null);
  const [chartData, setChartData]   = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [reports, setReports]       = useState([]);
  const [clubs, setClubs]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // Notify form
  const [notifyForm, setNotifyForm] = useState({ maCLB: "", tieuDe: "", noiDung: "", loaiTB: "Thông báo" });
  const [notifySending, setNotifySending] = useState(false);
  const [notifySuccess, setNotifySuccess] = useState(false);

  // ── Fetch tất cả data ────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, chartRes, studentsRes, reportsRes, clubsRes] = await Promise.all([
        apiClient.get("/api/khoa/dashboard/stats"),
        apiClient.get("/api/khoa/dashboard/chart"),
        apiClient.get("/api/khoa/dashboard/top-students"),
        apiClient.get("/api/khoa/dashboard/reports"),
        apiClient.get("/api/khoa/clubs"),
      ]);
      setStats(statsRes.data?.data);
      // Format chart data
      const raw = chartRes.data?.data || [];
      setChartData(raw.map((r) => ({
        name: `${THANG[r.Thang - 1]}/${r.Nam}`,
        "Sự kiện": r.SoSuKien,
        "Sinh viên": r.SoSinhVienThamGia,
      })));
      setTopStudents(studentsRes.data?.data || []);
      setReports(reportsRes.data?.data || []);
      setClubs(clubsRes.data?.data || []);
    } catch {
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Gửi thông báo ────────────────────────────────────────
  const handleSendNotify = async () => {
    if (!notifyForm.tieuDe.trim() || !notifyForm.noiDung.trim()) {
      alert("Vui lòng nhập tiêu đề và nội dung thông báo");
      return;
    }
    setNotifySending(true);
    try {
      await apiClient.post("/api/khoa/dashboard/notify", notifyForm);
      setNotifySuccess(true);
      setNotifyForm({ maCLB: "", tieuDe: "", noiDung: "", loaiTB: "Thông báo" });
      setTimeout(() => setNotifySuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Gửi thất bại. Vui lòng thử lại.");
    } finally {
      setNotifySending(false);
    }
  };

  // ── RENDER ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Tổng Quan Hoạt Động</h1>
              <p className="text-slate-600 mt-2">
                Cán bộ Khoa: <span className="font-semibold">{user?.hoTen}</span>
              </p>
            </div>
            <button
              onClick={fetchAll}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Làm mới
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl px-6 py-4 flex items-center gap-3">
              <FiAlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
              <p className="text-rose-700 text-sm font-medium">{error}</p>
              <button onClick={fetchAll} className="ml-auto text-rose-600 underline text-sm">Thử lại</button>
            </div>
          )}

          {/* Stat Cards */}
          {loading ? (
            <div className="text-center py-12 text-slate-500">
              <FiLoader className="w-10 h-10 mx-auto mb-3 animate-spin opacity-40" />
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={FiCalendar} label="Sự kiện đã duyệt"     value={stats?.TongSKDaDuyet}        color="blue"    sub="Tổng từ trước đến nay" />
                <StatCard icon={FiUsers}    label="Sinh viên tham gia"    value={stats?.TongSinhVienThamGia}  color="emerald" sub="Lượt đăng ký được duyệt" />
                <StatCard icon={FiUsers}    label="CLB đang hoạt động"    value={stats?.TongCLBHoatDong}      color="purple"  sub="Trong toàn khoa" />
                <StatCard icon={FiFileText} label="Báo cáo chờ duyệt"    value={stats?.BaoCaoChoDuyet}       color="amber"   sub="Cần xử lý" />
              </div>

              {/* Biểu đồ */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-6">📈 Hoạt động 6 tháng gần nhất</h2>
                {chartData.length === 0 ? (
                  <p className="text-center text-slate-400 py-8">Chưa có dữ liệu</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Sự kiện"   fill="#6366f1" radius={[4,4,0,0]} />
                      <Bar dataKey="Sinh viên" fill="#06b6d4" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Row: Top SV + Báo cáo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Top 5 Sinh viên */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                  <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FiAward className="w-5 h-5 text-amber-500" />
                    Top 5 Sinh viên tích cực
                  </h2>
                  {topStudents.length === 0 ? (
                    <p className="text-center text-slate-400 py-6">Chưa có dữ liệu</p>
                  ) : (
                    <div className="space-y-3">
                      {topStudents.map((sv, idx) => (
                        <div key={sv.MaND} className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white
                            ${idx === 0 ? "bg-amber-400" : idx === 1 ? "bg-slate-400" : idx === 2 ? "bg-orange-400" : "bg-blue-200 text-blue-700"}
                          `}>
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-800">{sv.hoTen}</p>
                            <p className="text-xs text-slate-500">{sv.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-blue-600">{sv.SoSuKienThamGia} SK</p>
                            <p className="text-xs text-slate-400">{sv.diemRenLuyen} điểm RL</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Báo cáo CLB gần đây */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                  <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FiFileText className="w-5 h-5 text-blue-500" />
                    Báo cáo CLB gần đây
                  </h2>
                  {reports.length === 0 ? (
                    <p className="text-center text-slate-400 py-6">Chưa có báo cáo</p>
                  ) : (
                    <div className="space-y-3">
                      {reports.map((r) => {
                        const cfg = HOSO_STATUS[r.TrangThai] || HOSO_STATUS.draft;
                        return (
                          <div key={r.MaHoSo} className="flex items-start justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">{r.TieuDe}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{r.TenCLB} · {r.loaiHoSo}</p>
                            </div>
                            <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
                              {cfg.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Gửi thông báo */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <FiBell className="w-5 h-5 text-indigo-500" />
                  Gửi thông báo đến CLB
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Chọn CLB */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Gửi đến</label>
                    <select
                      value={notifyForm.maCLB}
                      onChange={(e) => setNotifyForm((p) => ({ ...p, maCLB: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm bg-white"
                    >
                      <option value="">Tất cả CLB</option>
                      {clubs.map((c) => (
                        <option key={c.MaCLB} value={c.MaCLB}>{c.TenCLB}</option>
                      ))}
                    </select>
                  </div>

                  {/* Loại thông báo */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Loại thông báo</label>
                    <select
                      value={notifyForm.loaiTB}
                      onChange={(e) => setNotifyForm((p) => ({ ...p, loaiTB: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm bg-white"
                    >
                      <option>Thông báo</option>
                      <option>Nhắc nhở</option>
                      <option>Cảnh báo</option>
                      <option>Khen thưởng</option>
                    </select>
                  </div>
                </div>

                {/* Tiêu đề */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Tiêu đề</label>
                  <input
                    type="text"
                    value={notifyForm.tieuDe}
                    onChange={(e) => setNotifyForm((p) => ({ ...p, tieuDe: e.target.value }))}
                    placeholder="Nhập tiêu đề thông báo..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                  />
                </div>

                {/* Nội dung */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Nội dung</label>
                  <textarea
                    value={notifyForm.noiDung}
                    onChange={(e) => setNotifyForm((p) => ({ ...p, noiDung: e.target.value }))}
                    placeholder="Nhập nội dung thông báo..."
                    rows="4"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none resize-none text-sm"
                  />
                </div>

                <div className="flex items-center justify-between">
                  {notifySuccess && (
                    <p className="text-emerald-600 text-sm font-semibold">✅ Gửi thông báo thành công!</p>
                  )}
                  <button
                    onClick={handleSendNotify}
                    disabled={notifySending}
                    className="ml-auto flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
                  >
                    {notifySending
                      ? <FiLoader className="w-4 h-4 animate-spin" />
                      : <FiSend className="w-4 h-4" />
                    }
                    Gửi thông báo
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}