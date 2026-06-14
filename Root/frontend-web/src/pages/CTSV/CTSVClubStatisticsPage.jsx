/**
 * CTSVClubStatisticsPage - Thống kê câu lạc bộ (chỉ Phòng CTSV)
 */

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../utils/apiClient";
import Toast from "../../components/ui/Toast";
import { exportClubMembersToExcel } from "./ctsvExportUtils";

function formatDate(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("vi-VN");
}

function formatDateTime(isoString) {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleString("vi-VN");
}

export default function CTSVClubStatisticsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [clubRes, membersRes] = await Promise.all([
        apiClient.get(`/api/ctsv/clubs/${id}/detail`),
        apiClient.get(`/api/ctsv/clubs/${id}/members`),
      ]);
      setClub(clubRes.data.data);
      setMembers(membersRes.data.data ?? []);
    } catch (err) {
      console.error(err);
      setClub(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = () => {
    if (members.length === 0) {
      setToast({ message: "CLB chưa có thành viên", type: "error" });
      return;
    }
    exportClubMembersToExcel(members, club?.TenCLB, id);
    setToast({ message: "Xuất báo cáo thành công", type: "success" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 text-center">
        <p className="text-lg font-semibold text-slate-700 mb-2">
          Không tìm thấy câu lạc bộ
        </p>
        <button
          type="button"
          onClick={() => navigate("/student-affairs")}
          className="px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-semibold"
        >
          Quay lại Quản lý CTSV
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(`/ctsv/clubs/${id}`)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-teal-600 mb-4"
        >
          Quay lại
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <p className="text-sm font-medium text-teal-700">Thống kê câu lạc bộ</p>
          <h1 className="text-2xl font-bold text-slate-800 mt-1">{club.TenCLB}</h1>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-500">Lĩnh vực: </span>
              {club.LinhVuc || "-"}
            </p>
            <p>
              <span className="font-medium text-slate-500">Đơn vị quản lý: </span>
              {club.tenDVQL || "-"}
            </p>
            <p>
              <span className="font-medium text-slate-500">Ngày thành lập: </span>
              {formatDate(club.NgayThanhLap)}
            </p>
            <p>
              <span className="font-medium text-slate-500">Trạng thái: </span>
              {club.TrangThai || "-"}
            </p>
          </div>
          {club.MoTa && (
            <p className="mt-4 text-sm text-slate-600 border-t border-slate-100 pt-4 whitespace-pre-line">
              {club.MoTa}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard label="Thành viên" value={club.SoThanhVien ?? 0} />
          <StatCard label="Ban trực thuộc" value={club.SoBanTruc ?? 0} />
          <StatCard label="Tổng sự kiện" value={club.TongSuKien ?? 0} />
          <StatCard label="Sự kiện đã kết thúc" value={club.SuKienDaKetThuc ?? 0} />
        </div>

        {club.DanhSachBan?.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">
              Cơ cấu ban trực thuộc
            </h2>
            <div className="flex flex-wrap gap-2">
              {club.DanhSachBan.map((ban) => (
                <span
                  key={ban.VaiTroCLB}
                  className="px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-medium"
                >
                  {ban.VaiTroCLB}: {ban.SoLuong}
                </span>
              ))}
            </div>
          </div>
        )}

        {club.SuKienGanDay?.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">
              Sự kiện gần đây
            </h2>
            <ul className="space-y-2 text-sm text-slate-600">
              {club.SuKienGanDay.map((ev) => (
                <li key={ev.MaSK} className="flex justify-between gap-2">
                  <span className="truncate">{ev.TenSK}</span>
                  <span className="shrink-0 text-slate-400">
                    {formatDateTime(ev.ThoiGianBatDau)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-4">
          <button
            type="button"
            onClick={handleExport}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700"
          >
            Xuất báo cáo Excel
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-3 text-left font-semibold text-slate-600">STT</th>
                  <th className="p-3 text-left font-semibold text-slate-600">Mã SV</th>
                  <th className="p-3 text-left font-semibold text-slate-600">Họ tên</th>
                  <th className="p-3 text-left font-semibold text-slate-600">Vai trò</th>
                  <th className="p-3 text-left font-semibold text-slate-600">Lớp</th>
                  <th className="p-3 text-left font-semibold text-slate-600">Ngày tham gia</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Chưa có thành viên
                    </td>
                  </tr>
                ) : (
                  members.map((m, idx) => (
                    <tr key={m.maSV || idx} className="border-b border-slate-50">
                      <td className="p-3">{idx + 1}</td>
                      <td className="p-3 font-mono text-xs">{m.maSV}</td>
                      <td className="p-3">{m.hoTen}</td>
                      <td className="p-3">{m.VaiTroCLB}</td>
                      <td className="p-3">{m.tenLop || "-"}</td>
                      <td className="p-3">{formatDate(m.NgayThamGia)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
    </div>
  );
}
