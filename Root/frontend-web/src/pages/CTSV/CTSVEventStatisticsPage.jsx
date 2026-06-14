/**
 * CTSVEventStatisticsPage - Thống kê sự kiện (chỉ Phòng CTSV)
 */

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../utils/apiClient";
import Toast from "../../components/ui/Toast";
import { exportParticipantsToExcel } from "./ctsvExportUtils";

const STATUS_LABELS = {
  cho_duyet: "Chờ duyệt",
  da_duyet: "Đã duyệt",
  da_diem_danh: "Đã điểm danh",
  da_huy: "Đã hủy",
  sap_dien_ra: "Sắp diễn ra",
  dang_dien_ra: "Đang diễn ra",
  da_ket_thuc: "Đã kết thúc",
  da_duyet_sk: "Đã duyệt",
};

function formatDateTime(isoString) {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleString("vi-VN");
}

export default function CTSVEventStatisticsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [evRes, pRes] = await Promise.all([
        apiClient.get(`/api/ctsv/events/${id}/detail`),
        apiClient.get(`/api/ctsv/events/${id}/participants`),
      ]);
      setEvent(evRes.data.data);
      setParticipants(pRes.data.data ?? []);
    } catch (err) {
      console.error(err);
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = () => {
    if (participants.length === 0) {
      setToast({
        message: "Sự kiện chưa có sinh viên đăng ký",
        type: "error",
      });
      return;
    }
    exportParticipantsToExcel(participants, event?.TenSK, id);
    setToast({ message: "Xuất báo cáo thành công", type: "success" });
  };

  const approvedCount = participants.filter((p) =>
    ["da_duyet", "da_diem_danh"].includes(p.TrangThai),
  ).length;
  const attendedCount = participants.filter(
    (p) => p.TrangThai === "da_diem_danh",
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 text-center">
        <p className="text-lg font-semibold text-slate-700 mb-2">
          Không tìm thấy sự kiện
        </p>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-semibold"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(`/ctsv/events/${id}`)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-teal-600 mb-4"
        >
          ← Quay lại
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <p className="text-sm font-medium text-teal-700">{event.TenCLB}</p>
          <h1 className="text-2xl font-bold text-slate-800 mt-1">
            Thống kê sự kiện
          </h1>
          <p className="text-lg text-slate-700 mt-2">{event.TenSK}</p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-500">Địa điểm:</span>{" "}
              {event.DiaDiem || "-"}
            </p>
            <p>
              <span className="font-medium text-slate-500">Bắt đầu:</span>{" "}
              {formatDateTime(event.ThoiGianBatDau)}
            </p>
            <p>
              <span className="font-medium text-slate-500">Kết thúc:</span>{" "}
              {formatDateTime(event.ThoiGianKetThuc)}
            </p>
            <p>
              <span className="font-medium text-slate-500">Trạng thái:</span>{" "}
              {STATUS_LABELS[event.TrangThai?.trim()] || event.TrangThai}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard label="Tổng đăng ký" value={participants.length} />
          <StatCard label="Đã duyệt" value={approvedCount} />
          <StatCard label="Đã điểm danh" value={attendedCount} />
          <StatCard
            label="Sức chứa"
            value={event.SoNguoiToiDa ?? "-"}
          />
        </div>

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
                  <th className="p-3 text-left font-semibold text-slate-600">Email</th>
                  <th className="p-3 text-left font-semibold text-slate-600">Lớp</th>
                  <th className="p-3 text-left font-semibold text-slate-600">Khoa</th>
                  <th className="p-3 text-left font-semibold text-slate-600">Ngày ĐK</th>
                  <th className="p-3 text-left font-semibold text-slate-600">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {participants.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      Chưa có sinh viên đăng ký
                    </td>
                  </tr>
                ) : (
                  participants.map((p, idx) => (
                    <tr key={p.maSV || idx} className="border-b border-slate-50">
                      <td className="p-3">{idx + 1}</td>
                      <td className="p-3 font-mono text-xs">{p.maSV}</td>
                      <td className="p-3">{p.hoTen}</td>
                      <td className="p-3">{p.email}</td>
                      <td className="p-3">{p.tenLop || "-"}</td>
                      <td className="p-3">{p.tenKhoa || "-"}</td>
                      <td className="p-3">{formatDateTime(p.NgayDangKy)}</td>
                      <td className="p-3">
                        {STATUS_LABELS[p.TrangThai] || p.TrangThai}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
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
