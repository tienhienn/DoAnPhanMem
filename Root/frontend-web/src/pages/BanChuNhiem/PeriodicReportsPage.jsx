/**
 * PeriodicReportsPage - Báo cáo & Văn bản hành chính
 *
 * Chức năng:
 * - Tạo báo cáo mới (Báo cáo Tháng, Tổng kết Học kỳ, Nhiệm kỳ)
 * - Quản lý danh sách báo cáo (Bản nháp, Đã nộp, Đã duyệt)
 * - Tải xuống báo cáo đã duyệt
 * - Nộp đơn xin giải thể CLB
 * - Giao diện kế thừa 100% từ EventManagementPage
 */

import { useState } from "react";
import {
  FiPlus,
  FiX,
  FiEdit2,
  FiTrash2,
  FiDownload,
  FiEye,
  FiUploadCloud,
  FiFileText,
  FiCalendar,
  FiAlertTriangle,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

// ============================================
// MOCK DATA - REPORTS
// ============================================
const MOCK_REPORTS = [
  {
    id: 1,
    name: "Báo cáo hoạt động tháng 5/2026",
    type: "Báo cáo Tháng",
    summary:
      "Tổng hợp các hoạt động của CLB trong tháng 5 bao gồm: Hội thảo Python, Hackathon Innovation, và các sự kiện khác.",
    submittedDate: "2026-05-31",
    status: "submitted",
    fileName: "Báo cáo_Tháng_5_2026.pdf",
  },
  {
    id: 2,
    name: "Báo cáo tổng kết học kỳ I năm học 2025-2026",
    type: "Tổng kết Học kỳ",
    summary:
      "Báo cáo tổng kết toàn bộ hoạt động của CLB trong học kỳ I, bao gồm thành tích, những thách thức và kế hoạch phát triển.",
    submittedDate: "2026-01-15",
    status: "approved",
    fileName: "Báo cáo_HK1_2025-2026.pdf",
  },
  {
    id: 3,
    name: "Báo cáo tổng kết nhiệm kỳ Ban chủ nhiệm 2024-2025",
    type: "Tổng kết Nhiệm kỳ",
    summary:
      "Báo cáo chi tiết về các thành tích, những bài học kinh nghiệm và đề xuất cho Ban chủ nhiệm kỳ tiếp theo.",
    submittedDate: "2025-12-20",
    status: "approved",
    fileName: "Báo cáo_Nhiệm_kỳ_2024-2025.pdf",
  },
  {
    id: 4,
    name: "Báo cáo hoạt động tháng 4/2026 (Bản nháp)",
    type: "Báo cáo Tháng",
    summary: "Báo cáo hoạt động tháng 4 đang được soạn thảo, chưa hoàn thành.",
    submittedDate: null,
    status: "draft",
    fileName: null,
  },
];

// ============================================
// STATUS BADGE CONFIG
// ============================================
const STATUS_CONFIG = {
  draft: {
    label: "Bản nháp",
    bg: "bg-slate-100",
    text: "text-slate-700",
  },
  submitted: {
    label: "Đã nộp / Chờ duyệt",
    bg: "bg-amber-100",
    text: "text-amber-700",
  },
  approved: {
    label: "CTSV đã duyệt",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
  },
};

// ============================================
// REPORT CARD COMPONENT
// ============================================
const ReportCard = ({ report, onEdit, onDelete, onDownload, onView }) => {
  const statusConfig = STATUS_CONFIG[report.status];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all flex flex-col h-full">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-lg bg-rose-50">
          <FiFileText className="w-10 h-10 text-rose-500" />
        </div>
        <span
          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}
        >
          {statusConfig.label}
        </span>
      </div>

      {/* Card Body */}
      <div className="flex-1">
        <h3 className="text-lg font-bold text-slate-800 mt-4 line-clamp-2">
          {report.name}
        </h3>
        <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
          <FiCalendar className="w-4 h-4" />
          {report.submittedDate || "Chưa nộp"}
        </p>
        <p className="text-sm text-slate-600 mt-3 line-clamp-3">
          {report.summary}
        </p>
      </div>

      {/* Card Footer */}
      <div className="mt-auto pt-4 border-t border-slate-100 flex justify-end gap-2">
        {report.status === "draft" ? (
          <>
            <button
              onClick={() => onEdit(report)}
              className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
              title="Sửa"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(report.id)}
              className="p-2 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
              title="Xóa"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onDownload(report)}
              className="p-2 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors"
              title="Tải xuống"
            >
              <FiDownload className="w-4 h-4" />
            </button>
            <button
              onClick={() => onView(report)}
              className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
              title="Xem chi tiết"
            >
              <FiEye className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ============================================
// CREATE REPORT MODAL
// ============================================
const CreateReportModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "Báo cáo Tháng",
    summary: "",
    file: null,
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        file: file.name,
      }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        file: file.name,
      }));
    }
  };

  const handleSaveDraft = () => {
    if (!formData.name.trim()) {
      alert("Vui lòng nhập tên báo cáo");
      return;
    }
    onSave(formData, "draft");
    setFormData({
      name: "",
      type: "Báo cáo Tháng",
      summary: "",
      file: null,
    });
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.summary.trim() || !formData.file) {
      alert("Vui lòng điền đầy đủ thông tin và tải lên file");
      return;
    }
    onSave(formData, "submitted");
    setFormData({
      name: "",
      type: "Báo cáo Tháng",
      summary: "",
      file: null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-white">Tạo báo cáo mới</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiX className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Report Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Tên báo cáo
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên báo cáo"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Report Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Loại báo cáo
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
            >
              <option value="Báo cáo Tháng">Báo cáo Tháng</option>
              <option value="Tổng kết Học kỳ">Tổng kết Học kỳ</option>
              <option value="Tổng kết Nhiệm kỳ">Tổng kết Nhiệm kỳ</option>
            </select>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Tóm tắt hoạt động
            </label>
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              placeholder="Nhập tóm tắt nội dung báo cáo..."
              rows="5"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none"
            />
          </div>

          {/* File Upload Dropzone */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Tải lên file báo cáo
            </label>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="w-full p-8 border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 rounded-xl flex flex-col items-center justify-center transition-colors cursor-pointer"
            >
              <FiUploadCloud className="w-12 h-12 text-blue-500 mb-3" />
              <p className="text-sm font-semibold text-slate-700 text-center">
                Kéo thả file báo cáo (PDF, DOCX) vào đây hoặc click để chọn
              </p>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.docx,.doc"
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all cursor-pointer"
              >
                Chọn file
              </label>
              {formData.file && (
                <p className="text-xs text-emerald-600 font-semibold mt-3">
                  ✓ {formData.file}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-8 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-all"
          >
            Hủy
          </button>
          <button
            onClick={handleSaveDraft}
            className="px-6 py-2 border-2 border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-all"
          >
            Lưu nháp
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm"
          >
            Nộp báo cáo
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function PeriodicReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);

  // ============================================
  // HANDLERS
  // ============================================
  const handleCreateReport = () => {
    setEditingReport(null);
    setIsModalOpen(true);
  };

  const handleEditReport = (report) => {
    setEditingReport(report);
    setIsModalOpen(true);
  };

  const handleDeleteReport = (id) => {
    if (confirm("Bạn chắc chắn muốn xóa báo cáo này?")) {
      setReports((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleDownloadReport = (report) => {
    alert(`Tải xuống: ${report.fileName}`);
    // Thực tế sẽ gọi API để tải file
  };

  const handleViewReport = (report) => {
    alert(`Xem chi tiết báo cáo: ${report.name}`);
    // Thực tế sẽ mở modal xem chi tiết
  };

  const handleSaveReport = (formData, status) => {
    if (editingReport) {
      setReports((prev) =>
        prev.map((r) =>
          r.id === editingReport.id
            ? {
                ...r,
                ...formData,
                status,
                submittedDate:
                  status === "submitted"
                    ? new Date().toISOString().split("T")[0]
                    : r.submittedDate,
                fileName: formData.file || r.fileName,
              }
            : r,
        ),
      );
    } else {
      const newReport = {
        id: Math.max(...reports.map((r) => r.id), 0) + 1,
        ...formData,
        status,
        submittedDate:
          status === "submitted"
            ? new Date().toISOString().split("T")[0]
            : null,
        fileName: formData.file || null,
      };
      setReports((prev) => [newReport, ...prev]);
    }
    setIsModalOpen(false);
    setEditingReport(null);
  };

  const handleDissolveCLB = () => {
    if (
      confirm(
        "Bạn chắc chắn muốn nộp đơn xin giải thể CLB? Hành động này không thể hoàn tác.",
      )
    ) {
      alert(
        "Đơn xin giải thể CLB đã được nộp. Vui lòng chờ phê duyệt từ CTSV.",
      );
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8 relative pb-24">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-slate-800">
              Báo cáo & Văn bản hành chính
            </h1>
            <button
              onClick={handleCreateReport}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-sm transition-all"
            >
              <FiPlus className="w-5 h-5" />
              Tạo báo cáo mới
            </button>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.length > 0 ? (
              reports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onEdit={handleEditReport}
                  onDelete={handleDeleteReport}
                  onDownload={handleDownloadReport}
                  onView={handleViewReport}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-slate-200">
                <FiFileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-slate-900 mb-1">
                  Không có báo cáo nào
                </p>
                <p className="text-slate-600">Hãy tạo báo cáo mới để bắt đầu</p>
              </div>
            )}
          </div>

          {/* Danger Zone - Dissolve CLB */}
          <div className="absolute bottom-8 right-8">
            <button
              onClick={handleDissolveCLB}
              className="px-6 py-3 bg-white border-2 border-rose-500 text-rose-600 font-bold rounded-xl hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2 shadow-sm"
            >
              <FiAlertTriangle className="w-5 h-5" />
              Nộp đơn xin giải thể CLB
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <CreateReportModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingReport(null);
        }}
        onSave={handleSaveReport}
      />
    </div>
  );
}
