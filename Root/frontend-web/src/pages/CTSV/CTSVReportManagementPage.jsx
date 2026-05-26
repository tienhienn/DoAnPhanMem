import { useState, useEffect } from "react";
import {
  FiCheck,
  FiX,
  FiEye,
  FiFileText,
  FiAlertTriangle,
  FiLoader,
  FiMessageSquare,
} from "react-icons/fi";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const STATUS_CONFIG = {
  submitted: {
    label: "Chờ xét duyệt",
    bg: "bg-amber-100",
    text: "text-amber-700",
  },
  approved: {
    label: "Đã phê duyệt",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
  },
  tu_choi: { label: "Bị từ chối", bg: "bg-rose-100", text: "text-rose-700" },
};

export default function CTSVReportManagementPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/ctsv/reports`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setReports(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const pendingCount = reports.filter(
    (r) => r.TrangThai === "submitted",
  ).length;
  const filteredReports =
    filter === "all" ? reports : reports.filter((r) => r.TrangThai === filter);

  const handleApprove = async (id) => {
    if (
      !confirm(
        "Bạn chắc chắn muốn duyệt văn bản này? Nếu là đơn giải thể, CLB sẽ lập tức bị vô hiệu hóa.",
      )
    )
      return;
    try {
      setLoading(true);
      await axios.patch(
        `${API_BASE_URL}/ctsv/reports/${id}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      alert("Đã phê duyệt thành công!");
      setIsModalOpen(false);
      fetchReports();
    } catch (err) {
      alert("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (!rejectNotes.trim()) {
      alert("Vui lòng nhập lý do từ chối vào ô ghi chú!");
      return;
    }
    try {
      setLoading(true);
      await axios.patch(
        `${API_BASE_URL}/ctsv/reports/${id}/reject`,
        { LyDoTuChoi: rejectNotes },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      alert("Đã từ chối hồ sơ!");
      setIsModalOpen(false);
      fetchReports();
    } catch (err) {
      alert("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleViewFile = (link) => {
    const url = `${API_BASE_URL.replace("/api", "")}${link}`;
    window.open(url, "_blank");
  };

  const openModal = (report) => {
    setSelectedReport(report);
    setRejectNotes("");
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Tiếp nhận Báo cáo & Đơn thư CLB
          </h1>
          <p className="text-slate-600 mt-2">
            Phòng CTSV: <span className="font-semibold">{user?.hoTen}</span>
          </p>
        </div>

        {/* Lọc Trạng Thái */}
        <div className="flex gap-2">
          {[
            { key: "all", label: "Tất cả" },
            { key: "submitted", label: "Chờ xét duyệt" },
            { key: "approved", label: "Đã duyệt" },
            { key: "tu_choi", label: "Từ chối" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-5 py-2 rounded-full font-bold transition-all ${filter === tab.key ? "bg-blue-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"}`}
            >
              {tab.label}{" "}
              {tab.key === "submitted" && pendingCount > 0 && (
                <span className="ml-2 bg-rose-500 text-white px-2 py-0.5 rounded-full text-xs">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Danh sách */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-6 gap-4 bg-slate-50 px-6 py-4 border-b border-slate-200 font-bold text-xs text-slate-500 uppercase">
            <div className="col-span-2">Tên văn bản</div>
            <div>CLB nộp</div>
            <div>Loại</div>
            <div>Ngày nộp</div>
            <div>Trạng thái</div>
          </div>
          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <FiLoader className="w-8 h-8 mx-auto animate-spin opacity-50" />
            </div>
          ) : filteredReports.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredReports.map((report) => {
                const config = STATUS_CONFIG[report.TrangThai];
                const isDanger = report.loaiHoSo === "Đơn giải thể";
                return (
                  <div
                    key={report.MaHoSo}
                    onClick={() => openModal(report)}
                    className={`grid grid-cols-6 gap-4 px-6 py-4 transition-colors cursor-pointer ${isDanger && report.TrangThai === "submitted" ? "bg-rose-50/50 hover:bg-rose-50" : "hover:bg-blue-50/30"}`}
                  >
                    <div className="col-span-2 flex items-center gap-3">
                      {isDanger ? (
                        <FiAlertTriangle className="text-rose-500 flex-shrink-0" />
                      ) : (
                        <FiFileText className="text-blue-500 flex-shrink-0" />
                      )}
                      <span className="font-semibold text-slate-800 line-clamp-1">
                        {report.TieuDe}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 truncate">
                      {report.TenCLB}
                    </div>
                    <div
                      className={`text-sm font-bold ${isDanger ? "text-rose-600" : "text-slate-600"}`}
                    >
                      {report.loaiHoSo}
                    </div>
                    <div className="text-sm text-slate-500">
                      {new Date(report.NgayGui).toLocaleDateString("vi-VN")}
                    </div>
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text}`}
                      >
                        {config.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
              Không có hồ sơ nào trong mục này.
            </div>
          )}
        </div>
      </div>

      {/* Modal Duyệt */}
      {isModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div
              className={`px-8 py-6 text-white flex justify-between ${selectedReport.loaiHoSo === "Đơn giải thể" ? "bg-gradient-to-r from-rose-600 to-red-600" : "bg-gradient-to-r from-blue-600 to-cyan-600"}`}
            >
              <div>
                <h2 className="text-xl font-bold">Thẩm định Văn bản</h2>
                <p className="text-sm opacity-90">{selectedReport.loaiHoSo}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)}>
                <FiX size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="col-span-2">
                  <p className="text-xs font-bold text-slate-500 uppercase">
                    Tiêu đề
                  </p>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {selectedReport.TieuDe}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">
                    Câu lạc bộ
                  </p>
                  <p className="font-semibold text-slate-800 mt-1">
                    {selectedReport.TenCLB}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">
                    Người đại diện nộp
                  </p>
                  <p className="font-semibold text-slate-800 mt-1">
                    {selectedReport.NguoiGui}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">
                  Nội dung tóm tắt
                </p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedReport.NoiDung || "Không có nội dung"}
                </div>
              </div>

              {selectedReport.FileDinhKem && (
                <button
                  onClick={() => handleViewFile(selectedReport.FileDinhKem)}
                  className="w-full py-4 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 font-bold hover:bg-blue-50 flex items-center justify-center gap-2 transition-colors"
                >
                  <FiEye size={20} /> Xem tệp đính kèm bản cứng
                </button>
              )}

              {selectedReport.TrangThai === "submitted" && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 uppercase mb-2">
                    <FiMessageSquare className="inline mr-2" /> Ghi chú / Phản
                    hồi
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Nhập lý do nếu từ chối..."
                    value={rejectNotes}
                    onChange={(e) => setRejectNotes(e.target.value)}
                    className="w-full p-4 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              )}
            </div>

            <div className="px-8 py-5 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 font-bold text-slate-600 hover:bg-slate-200 rounded-xl"
              >
                Đóng
              </button>
              {selectedReport.TrangThai === "submitted" && (
                <>
                  <button
                    onClick={() => handleReject(selectedReport.MaHoSo)}
                    disabled={loading}
                    className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl flex items-center gap-2"
                  >
                    <FiX /> Từ chối
                  </button>
                  <button
                    onClick={() => handleApprove(selectedReport.MaHoSo)}
                    disabled={loading}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-2"
                  >
                    <FiCheck /> Phê duyệt
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
