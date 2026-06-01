/**
 * CTSVEventOverviewPage - Trang xem sự kiện dành riêng cho Phòng CTSV
 * (không dùng EventDetailPage của sinh viên)
 */

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../utils/apiClient";
import Toast from "../../components/ui/Toast";
import { exportParticipantsToExcel } from "./ctsvExportUtils";

function formatDateTime(isoString) {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CTSVEventOverviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchEvent = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/api/ctsv/events/${id}/detail`);
      setEvent(res.data.data);
    } catch (err) {
      console.error(err);
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleExport = async () => {
    if (!event) return;
    const maSK = (event.MaSK || id || "").trim();
    setExporting(true);
    try {
      const res = await apiClient.get(`/api/ctsv/events/${maSK}/participants`);
      const participants = res.data.data ?? [];
      if (participants.length === 0) {
        setToast({
          message: "Sự kiện chưa có sinh viên đăng ký",
          type: "error",
        });
        return;
      }
      exportParticipantsToExcel(participants, event.TenSK, maSK);
      setToast({ message: "Xuất báo cáo thành công", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({
        message:
          err.response?.data?.error?.message || "Lỗi khi xuất báo cáo",
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

  const registered = event.soNguoiDaDangKy ?? 0;
  const capacity = event.SoNguoiToiDa ?? 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-teal-600 mb-4"
        >
          Quay lại danh sách
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {event.UrlAnh && (
            <img
              src={event.UrlAnh}
              alt={event.TenSK}
              className="w-full h-48 object-cover"
            />
          )}

          <div className="p-6">
            <p className="text-sm font-medium text-teal-700 mb-1">
              Phòng CTSV
            </p>
            <p className="text-sm text-indigo-600 mb-1">{event.TenCLB}</p>
            <h1 className="text-2xl font-bold text-slate-900 mb-4">
              {event.TenSK}
            </h1>

            <div className="space-y-3 text-sm text-slate-600 mb-6">
              <p>
                <span className="font-medium text-slate-500">Bắt đầu: </span>
                {formatDateTime(event.ThoiGianBatDau)}
              </p>
              <p>
                <span className="font-medium text-slate-500">Kết thúc: </span>
                {formatDateTime(event.ThoiGianKetThuc)}
              </p>
              <p>
                <span className="font-medium text-slate-500">Địa điểm: </span>
                {event.DiaDiem || "-"}
              </p>
              <p>
                <span className="font-medium text-slate-500">Đăng ký: </span>
                {registered}
                {capacity > 0 ? ` / ${capacity} chỗ` : ""}
              </p>
              {event.MoTa && (
                <p className="pt-2 border-t border-slate-100 whitespace-pre-line">
                  {event.MoTa}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  navigate(`/ctsv/events/${(event.MaSK || id).trim()}/statistics`)
                }
                className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors"
              >
                Chi tiết sự kiện
              </button>
              <button
                type="button"
                disabled={exporting}
                onClick={handleExport}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-60 transition-colors"
              >
                {exporting ? "Đang xuất..." : "Xuất báo cáo"}
              </button>
            </div>
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
