/**
 * CTSVClubOverviewPage - Trang xem CLB dành riêng cho Phòng CTSV
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

export default function CTSVClubOverviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchClub = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/api/ctsv/clubs/${id}/detail`);
      setClub(res.data.data);
    } catch (err) {
      console.error(err);
      setClub(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClub();
  }, [fetchClub]);

  const handleExport = async () => {
    if (!club) return;
    const maCLB = (club.MaCLB || id || "").trim();
    setExporting(true);
    try {
      const res = await apiClient.get(`/api/ctsv/clubs/${maCLB}/members`);
      const members = res.data.data ?? [];
      if (members.length === 0) {
        setToast({ message: "CLB chưa có thành viên", type: "error" });
        return;
      }
      exportClubMembersToExcel(members, club.TenCLB, maCLB);
      setToast({ message: "Xuất báo cáo thành công", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({
        message: err.response?.data?.error?.message || "Lỗi khi xuất báo cáo",
        type: "error",
      });
    } finally {
      setExporting(false);
    }
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
      <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6">
        <button
          type="button"
          onClick={() => navigate("/student-affairs")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-teal-600 mb-4"
        >
          Quay lại Quản lý CTSV
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {club.Logo && (
            <img src={club.Logo} alt={club.TenCLB} className="w-full h-40 object-cover" />
          )}
          <div className="p-6">
            <p className="text-sm font-medium text-teal-700 mb-1">Phòng CTSV</p>
            <h1 className="text-2xl font-bold text-slate-900 mb-4">{club.TenCLB}</h1>

            <div className="space-y-2 text-sm text-slate-600 mb-6">
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
                <span className="font-medium text-slate-500">Thành viên: </span>
                {club.SoThanhVien ?? 0}
                {club.SoThanhVienToiDa ? ` / ${club.SoThanhVienToiDa}` : ""}
              </p>
              {club.MoTa && (
                <p className="pt-2 border-t border-slate-100 whitespace-pre-line">
                  {club.MoTa}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  navigate(`/ctsv/clubs/${(club.MaCLB || id).trim()}/statistics`)
                }
                className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700"
              >
                Chi tiết câu lạc bộ
              </button>
              <button
                type="button"
                disabled={exporting}
                onClick={handleExport}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-60"
              >
                {exporting ? "Đang xuất..." : "Xuất báo cáo"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
