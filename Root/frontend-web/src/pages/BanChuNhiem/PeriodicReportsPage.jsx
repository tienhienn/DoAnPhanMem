import { useState, useEffect } from "react";
import {
  FiPlus,
  FiX,
  FiDownload,
  FiEye,
  FiUploadCloud,
  FiFileText,
  FiCalendar,
  FiAlertTriangle,
  FiTrash2,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const PeriodicReportsPage = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    type: "Báo cáo Tháng",
    summary: "",
    file: null,
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/bcn/reports`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setReports(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async (status) => {
    if (!formData.title || (!formData.file && status === "submitted")) {
      alert("Vui lòng nhập tiêu đề và đính kèm file!");
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append("title", formData.title);
      data.append("summary", formData.summary);
      data.append("type", formData.type);
      data.append("status", status);
      if (formData.file) data.append("file", formData.file);

      await axios.post(`${API_BASE_URL}/bcn/reports`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      alert(
        status === "submitted" ? "Đã nộp hồ sơ lên CTSV!" : "Đã lưu bản nháp",
      );
      setIsModalOpen(false);
      setFormData({
        title: "",
        type: "Báo cáo Tháng",
        summary: "",
        file: null,
      });
      fetchReports();
    } catch (error) {
      alert("Lỗi khi gửi hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Xóa bản nháp này?")) return;
    await axios.delete(`${API_BASE_URL}/bcn/reports/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    fetchReports();
  };

  // Mở file tải lên
  const handleViewFile = (link) => {
    const url = `${API_BASE_URL.replace("/api", "")}${link}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-800">
            Báo cáo & Văn bản hành chính
          </h1>
          <button
            onClick={() => {
              setFormData({ ...formData, type: "Báo cáo" });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
          >
            <FiPlus /> Tạo báo cáo mới
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div
              key={report.MaHoSo}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col"
            >
              <div className="flex justify-between mb-4">
                <div
                  className={`p-2 rounded-lg ${report.loaiHoSo === "Đơn giải thể" ? "bg-red-50" : "bg-blue-50"}`}
                >
                  <FiFileText
                    className={`w-8 h-8 ${report.loaiHoSo === "Đơn giải thể" ? "text-red-500" : "text-blue-500"}`}
                  />
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    report.TrangThai === "approved"
                      ? "bg-emerald-100 text-emerald-700"
                      : report.TrangThai === "submitted"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {report.TrangThai === "approved"
                    ? "Đã duyệt"
                    : report.TrangThai === "submitted"
                      ? "Đang chờ"
                      : "Bản nháp"}
                </span>
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">
                {report.TieuDe}
              </h3>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                {report.NoiDung}
              </p>

              <div className="mt-auto pt-4 border-t flex justify-between items-center">
                <span className="text-xs text-slate-400">
                  {new Date(report.NgayGui).toLocaleDateString("vi-VN")}
                </span>
                <div className="flex gap-2">
                  {report.FileDinhKem && (
                    <button
                      onClick={() => handleViewFile(report.FileDinhKem)}
                      className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200"
                    >
                      <FiEye />
                    </button>
                  )}
                  {report.TrangThai === "draft" && (
                    <button
                      onClick={() => handleDelete(report.MaHoSo)}
                      className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Nút giải thể đặt ở khu vực Danger Zone */}
        <div className="pt-10 border-t border-slate-200">
          <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex items-center justify-between">
            <div>
              <h3 className="text-red-800 font-bold text-lg">Giải thể CLB</h3>
              <p className="text-red-600 text-sm">
                Nếu CLB không còn đủ nguồn lực hoạt động, bạn có thể nộp đơn xin
                giải thể.
              </p>
            </div>
            <button
              onClick={() => {
                setFormData({
                  title: `Đơn xin giải thể CLB - ${new Date().getFullYear()}`,
                  type: "Đơn giải thể",
                  summary: "",
                  file: null,
                });
                setIsModalOpen(true);
              }}
              className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 flex items-center gap-2"
            >
              <FiAlertTriangle /> Giải thể CLB
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div
              className={`p-6 text-white flex justify-between ${formData.type === "Đơn giải thể" ? "bg-red-600" : "bg-blue-600"}`}
            >
              <h2 className="text-xl font-bold">
                {formData.type === "Đơn giải thể"
                  ? "Nộp đơn giải thể"
                  : "Tạo báo cáo hoạt động"}
              </h2>
              <button onClick={() => setIsModalOpen(false)}>
                <FiX size={24} />
              </button>
            </div>
            <div className="p-8 space-y-5">
              <input
                className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tiêu đề văn bản..."
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
              <textarea
                rows="4"
                className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nội dung tóm tắt..."
                value={formData.summary}
                onChange={(e) =>
                  setFormData({ ...formData, summary: e.target.value })
                }
              />
              <div className="border-2 border-dashed border-slate-200 p-8 rounded-2xl text-center">
                <input
                  type="file"
                  id="fileReport"
                  className="hidden"
                  onChange={(e) =>
                    setFormData({ ...formData, file: e.target.files[0] })
                  }
                />
                <label
                  htmlFor="fileReport"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <FiUploadCloud size={48} className="text-slate-300 mb-2" />
                  <span className="text-slate-500">
                    {formData.file
                      ? formData.file.name
                      : "Tải lên file PDF/Docx bản cứng có chữ ký"}
                  </span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleSave("draft")}
                  className="flex-1 py-4 bg-slate-100 font-bold rounded-xl"
                >
                  Lưu nháp
                </button>
                <button
                  onClick={() => handleSave("submitted")}
                  className={`flex-1 py-4 text-white font-bold rounded-xl ${formData.type === "Đơn giải thể" ? "bg-red-600" : "bg-blue-600"}`}
                >
                  {loading ? "Đang gửi..." : "Xác nhận nộp"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodicReportsPage;
