import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";

export default function StatisticsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await apiClient.get(`/api/events/${id}`);
        setEvent(response.data.data);
      } catch (err) {
        console.error("Lỗi khi tải thông tin thống kê:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [id]);

  if (loading) return <div className="p-10 text-center text-slate-500">Đang tải kịch bản...</div>;
  if (!event) return <div className="p-10 text-center text-red-500">Không tìm thấy sự kiện</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-10">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-indigo-600 font-medium hover:underline"
        >
          ← Quay lại chi tiết
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Kịch bản & Thống kê</h1>
            <p className="opacity-90">{event.tenSK} | {event.tenCLB}</p>
          </div>

          <div className="p-8 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                Chi tiết kịch bản sự kiện
              </h2>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-line text-lg">
                {event.moTa || "Chưa có kịch bản chi tiết cho sự kiện này."}
              </div>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                <p className="text-sm text-indigo-600 font-medium mb-1">Tổng chỗ</p>
                <p className="text-3xl font-bold text-indigo-900">{event.soNguoiToiDa}</p>
              </div>
              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                <p className="text-sm text-emerald-600 font-medium mb-1">Đã đăng ký</p>
                <p className="text-3xl font-bold text-emerald-900">{event.soNguoiDaDangKy}</p>
              </div>
              <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                <p className="text-sm text-amber-600 font-medium mb-1">Tỷ lệ lấp đầy</p>
                <p className="text-3xl font-bold text-amber-900">
                  {Math.round((event.soNguoiDaDangKy / event.soNguoiToiDa) * 100)}%
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
