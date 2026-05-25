/**
 * BCNManagementPage - Ban chủ nhiệm CLB quản lý sự kiện
 * Tích hợp API backend với đầy đủ các trường dữ liệu từ database
 */

import { useState, useEffect } from "react";
import {
  FiPlus,
  FiX,
  FiEdit2,
  FiTrash2,
  FiSend,
  FiEye,
  FiAlertCircle,
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiDollarSign,
  FiAward,
  FiImage,
  FiType,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const API_BASE_URL =
  `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api`;

// ============================================
// STATUS CONFIG — đầy đủ tất cả trạng thái DB
// ============================================
const STATUS_CONFIG = {
  // Trạng thái flow duyệt (BCN tạo)
  draft: {
    label: "Bản nháp",
    bg: "bg-slate-100",
    text: "text-slate-700",
  },
  cho_duyet_khoa: {
    label: "Chờ Khoa duyệt",
    bg: "bg-blue-100",
    text: "text-blue-700",
  },
  cho_duyet_ctsv: {
    label: "Chờ CTSV duyệt",
    bg: "bg-purple-100",
    text: "text-purple-700",
  },
  da_duyet: {
    label: "✓ Đã cấp phép",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
  },
  tu_choi: {
    label: "✗ Bị từ chối",
    bg: "bg-rose-100",
    text: "text-rose-700",
  },
  // Trạng thái vận hành (sau khi được duyệt)
  sap_dien_ra: {
    label: "🕐 Sắp diễn ra",
    bg: "bg-amber-100",
    text: "text-amber-700",
  },
  dang_dien_ra: {
    label: "🟢 Đang diễn ra",
    bg: "bg-green-100",
    text: "text-green-700",
  },
  da_ket_thuc: {
    label: "Đã kết thúc",
    bg: "bg-slate-100",
    text: "text-slate-500",
  },
  huy: {
    label: "Đã hủy",
    bg: "bg-red-100",
    text: "text-red-600",
  },
};

// Trạng thái nào BCN được phép sửa/xóa/gửi duyệt
const EDITABLE_STATUSES = ["draft", "tu_choi"];
const SUBMITTABLE_STATUSES = ["draft", "tu_choi"];
const DELETABLE_STATUSES = ["draft"];
// Trạng thái chỉ xem
const READONLY_STATUSES = [
  "cho_duyet_khoa",
  "cho_duyet_ctsv",
  "da_duyet",
  "sap_dien_ra",
  "dang_dien_ra",
  "da_ket_thuc",
  "huy",
];

// ============================================
// STAT CARD COMPONENT
// ============================================
const StatCard = ({ icon: Icon, label, value, color = "blue" }) => {
  const colorMap = {
    blue: "bg-blue-100 text-blue-600",
    amber: "bg-amber-100 text-amber-600",
    emerald: "bg-emerald-100 text-emerald-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

// ============================================
// EVENT FORM MODAL
// ============================================
const EventFormModal = ({ isOpen, event, onClose, onSave, loading }) => {
  const [formData, setFormData] = useState(
    event || {
      TenSK: "",
      MoTa: "",
      ThoiGianBatDau: "",
      ThoiGianKetThuc: "",
      DiaDiem: "",
      SoNguoiToiDa: "",
      ChiPhiDuKien: "",
      LoaiSK: "",
      UrlAnh: "",
      DiemRenLuyen: 5,
    },
  );

  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        ThoiGianBatDau: event.ThoiGianBatDau
          ? new Date(event.ThoiGianBatDau).toISOString().slice(0, 16)
          : "",
        ThoiGianKetThuc: event.ThoiGianKetThuc
          ? new Date(event.ThoiGianKetThuc).toISOString().slice(0, 16)
          : "",
      });
    } else {
      setFormData({
        TenSK: "",
        MoTa: "",
        ThoiGianBatDau: "",
        ThoiGianKetThuc: "",
        DiaDiem: "",
        SoNguoiToiDa: "",
        ChiPhiDuKien: "",
        LoaiSK: "",
        UrlAnh: "",
        DiemRenLuyen: 5,
      });
    }
  }, [event, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "SoNguoiToiDa" ||
        name === "ChiPhiDuKien" ||
        name === "DiemRenLuyen"
          ? parseFloat(value) || ""
          : value,
    }));
  };

  const handleSaveDraft = () => {
    if (!formData.TenSK?.trim()) {
      alert("Vui lòng nhập tên sự kiện");
      return;
    }
    if (!formData.ThoiGianBatDau || !formData.ThoiGianKetThuc) {
      alert("Vui lòng nhập thời gian bắt đầu và kết thúc");
      return;
    }
    onSave(formData, "draft");
  };

  const handleSubmit = () => {
    if (!formData.TenSK?.trim()) {
      alert("Vui lòng nhập tên sự kiện");
      return;
    }
    if (!formData.ThoiGianBatDau || !formData.ThoiGianKetThuc) {
      alert("Vui lòng nhập thời gian bắt đầu và kết thúc");
      return;
    }
    onSave(formData, "cho_duyet_khoa");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-lg"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto border border-slate-100">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 px-8 py-8 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {event ? "Chỉnh sửa sự kiện" : "Tạo sự kiện mới"}
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              {event
                ? "Cập nhật thông tin sự kiện"
                : "Lập kế hoạch hoạt động mới"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            <FiX className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              <FiType className="inline mr-2" />
              Tên sự kiện *
            </label>
            <input
              type="text"
              name="TenSK"
              value={formData.TenSK}
              onChange={handleChange}
              placeholder="Nhập tên sự kiện"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                <FiCalendar className="inline mr-2" />
                Thời gian bắt đầu *
              </label>
              <input
                type="datetime-local"
                name="ThoiGianBatDau"
                value={formData.ThoiGianBatDau}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                <FiCalendar className="inline mr-2" />
                Thời gian kết thúc *
              </label>
              <input
                type="datetime-local"
                name="ThoiGianKetThuc"
                value={formData.ThoiGianKetThuc}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              <FiMapPin className="inline mr-2" />
              Địa điểm
            </label>
            <input
              type="text"
              name="DiaDiem"
              value={formData.DiaDiem}
              onChange={handleChange}
              placeholder="Nhập địa điểm tổ chức"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                <FiUsers className="inline mr-2" />
                Số lượng tối đa
              </label>
              <input
                type="number"
                name="SoNguoiToiDa"
                value={formData.SoNguoiToiDa}
                onChange={handleChange}
                placeholder="Số lượng"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                <FiAward className="inline mr-2" />
                Điểm rèn luyện
              </label>
              <input
                type="number"
                name="DiemRenLuyen"
                value={formData.DiemRenLuyen}
                onChange={handleChange}
                step="0.5"
                placeholder="Điểm"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                <FiDollarSign className="inline mr-2" />
                Chi phí dự kiến
              </label>
              <input
                type="number"
                name="ChiPhiDuKien"
                value={formData.ChiPhiDuKien}
                onChange={handleChange}
                placeholder="Chi phí"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Loại sự kiện
              </label>
              <select
                name="LoaiSK"
                value={formData.LoaiSK}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">-- Chọn loại --</option>
                <option value="Workshop">Workshop</option>
                <option value="Cuộc thi">Cuộc thi</option>
                <option value="Sinh hoạt">Sinh hoạt</option>
                <option value="Thể thao">Thể thao</option>
                <option value="Tình nguyện">Tình nguyện</option>
                <option value="Khóa học">Khóa học</option>
                <option value="Seminar">Seminar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                <FiImage className="inline mr-2" />
                URL ảnh
              </label>
              <input
                type="url"
                name="UrlAnh"
                value={formData.UrlAnh}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Mô tả chi tiết
            </label>
            <textarea
              name="MoTa"
              value={formData.MoTa}
              onChange={handleChange}
              placeholder="Nhập mô tả chi tiết về sự kiện..."
              rows="5"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-8 py-6 flex items-center justify-end gap-3 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-all"
          >
            Hủy
          </button>
          <button
            onClick={handleSaveDraft}
            disabled={loading}
            className="px-6 py-2.5 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all disabled:opacity-50"
          >
            {loading ? "Đang lưu..." : "Lưu bản nháp"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            <FiSend className="w-4 h-4" />
            {loading ? "Đang xử lý..." : "Gửi phê duyệt"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// APPROVAL STEPPER COMPONENT
// ============================================
const ApprovalStepper = ({ status }) => {
  const steps = [
    { key: "draft", label: "Tạo mới", icon: "📝" },
    { key: "cho_duyet_khoa", label: "Khoa duyệt", icon: "🏫" },
    { key: "cho_duyet_ctsv", label: "CTSV duyệt", icon: "👥" },
    { key: "da_duyet", label: "Cấp phép", icon: "✅" },
    { key: "sap_dien_ra", label: "Sắp diễn ra", icon: "🕐" },
  ];

  const statusOrder = [
    "draft",
    "cho_duyet_khoa",
    "cho_duyet_ctsv",
    "da_duyet",
    "sap_dien_ra",
    "dang_dien_ra",
    "da_ket_thuc",
  ];
  const currentIndex = statusOrder.indexOf(status);

  return (
    <div className="py-4">
      <div className="flex items-center gap-1">
        {steps.map((step, idx) => (
          <div key={step.key} className="flex items-center flex-1">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all flex-shrink-0 ${
                idx <= currentIndex
                  ? "bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 text-white shadow-lg"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {step.icon}
            </div>
            <span
              className={`ml-1 text-xs font-semibold whitespace-nowrap ${
                idx <= currentIndex ? "text-cyan-600" : "text-slate-400"
              }`}
            >
              {step.label}
            </span>
            {idx < steps.length - 1 && (
              <div
                className={`mx-2 flex-1 h-1 transition-all ${
                  idx < currentIndex ? "bg-cyan-600" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Trạng thái ngoài flow duyệt */}
      {(status === "dang_dien_ra" ||
        status === "da_ket_thuc" ||
        status === "huy") && (
        <div
          className={`mt-3 text-center text-sm font-semibold px-3 py-1.5 rounded-full inline-block ${STATUS_CONFIG[status]?.bg} ${STATUS_CONFIG[status]?.text}`}
        >
          {STATUS_CONFIG[status]?.label}
        </div>
      )}
    </div>
  );
};

// ============================================
// EVENT DETAIL MODAL
// ============================================
const EventDetailModal = ({ isOpen, event, onClose }) => {
  if (!isOpen || !event) return null;

  const formatDate = (date) => new Date(date).toLocaleString("vi-VN");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-lg"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto border border-slate-100">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 px-8 py-8 flex items-center justify-between rounded-t-3xl z-10">
          <h2 className="text-2xl font-bold text-white">Chi tiết sự kiện</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            <FiX className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Approval Stepper */}
          <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 rounded-2xl p-6 border border-blue-100">
            <h3 className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
              Tiến trình phê duyệt
            </h3>
            <ApprovalStepper status={event.TrangThai} />
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
              Tên sự kiện
            </p>
            <p className="text-lg font-bold text-slate-900">{event.TenSK}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: "Thời gian bắt đầu",
                value: formatDate(event.ThoiGianBatDau),
              },
              {
                label: "Thời gian kết thúc",
                value: formatDate(event.ThoiGianKetThuc),
              },
              { label: "Địa điểm", value: event.DiaDiem || "N/A" },
              {
                label: "Số lượng tối đa",
                value: event.SoNguoiToiDa
                  ? `${event.SoNguoiToiDa} thành viên`
                  : "N/A",
              },
              { label: "Điểm rèn luyện", value: `${event.DiemRenLuyen} điểm` },
              {
                label: "Chi phí dự kiến",
                value: `${event.ChiPhiDuKien?.toLocaleString("vi-VN") || 0} VNĐ`,
              },
              { label: "Loại sự kiện", value: event.LoaiSK || "N/A" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-slate-50 rounded-xl p-4 border border-slate-200"
              >
                <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                  {label}
                </p>
                <p className="text-sm font-semibold text-slate-900">{value}</p>
              </div>
            ))}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                Trạng thái
              </p>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[event.TrangThai]?.bg} ${STATUS_CONFIG[event.TrangThai]?.text}`}
              >
                {STATUS_CONFIG[event.TrangThai]?.label || event.TrangThai}
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
              Mô tả chi tiết
            </p>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-sm text-slate-700 leading-relaxed">
                {event.MoTa || "Không có mô tả"}
              </p>
            </div>
          </div>

          {event.TrangThai === "tu_choi" && event.LyDoTuChoi && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
              <div className="flex gap-3">
                <FiAlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-rose-900 mb-1">
                    Lý do từ chối:
                  </p>
                  <p className="text-sm text-rose-700">{event.LyDoTuChoi}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-8 py-6 flex items-center justify-end rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// EVENT CARD COMPONENT
// ============================================
const EventCard = ({ event, onEdit, onDelete, onView, onSubmit }) => {
  const formatDate = (date) => new Date(date).toLocaleDateString("vi-VN");
  const statusCfg = STATUS_CONFIG[event.TrangThai] || {
    label: event.TrangThai,
    bg: "bg-slate-100",
    text: "text-slate-600",
  };

  const canEdit = EDITABLE_STATUSES.includes(event.TrangThai);
  const canDelete = DELETABLE_STATUSES.includes(event.TrangThai);
  const canSubmit = SUBMITTABLE_STATUSES.includes(event.TrangThai);
  const isReadonly = READONLY_STATUSES.includes(event.TrangThai);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 pr-3">
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            {event.TenSK}
          </h3>
          <div className="space-y-1.5 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <FiCalendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>{formatDate(event.ThoiGianBatDau)}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiMapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>{event.DiaDiem || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiUsers className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>{event.SoNguoiToiDa || "N/A"} thành viên</span>
            </div>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${statusCfg.bg} ${statusCfg.text}`}
        >
          {statusCfg.label}
        </span>
      </div>

      <p className="text-sm text-slate-600 mb-4 line-clamp-2">
        {event.MoTa || "Không có mô tả"}
      </p>

      {event.TrangThai === "tu_choi" && event.LyDoTuChoi && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
          <strong>Lý do từ chối:</strong> {event.LyDoTuChoi}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        {/* Nút Xem chi tiết — luôn hiện */}
        <button
          onClick={() => onView(event)}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium text-sm"
        >
          <FiEye className="w-4 h-4" />
          Chi tiết
        </button>

        {/* Nút Sửa — chỉ khi draft hoặc tu_choi */}
        {canEdit && (
          <button
            onClick={() => onEdit(event)}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all font-medium text-sm"
          >
            <FiEdit2 className="w-4 h-4" />
            {event.TrangThai === "tu_choi" ? "Sửa lại" : "Sửa"}
          </button>
        )}

        {/* Nút Xóa — chỉ khi draft */}
        {canDelete && (
          <button
            onClick={() => onDelete(event.MaSK)}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-all font-medium text-sm"
          >
            <FiTrash2 className="w-4 h-4" />
            Xóa
          </button>
        )}

        {/* Nút Gửi duyệt — chỉ khi draft hoặc tu_choi */}
        {canSubmit && (
          <button
            onClick={() => onSubmit(event.MaSK)}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all font-medium text-sm"
          >
            <FiSend className="w-4 h-4" />
            {event.TrangThai === "tu_choi" ? "Gửi lại" : "Gửi duyệt"}
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function BCNManagementPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [detailEvent, setDetailEvent] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/bcn/events`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setEvents(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Không thể tải danh sách sự kiện");
    } finally {
      setLoading(false);
    }
  };

  // Statistics
  const totalEvents = events.length;
  const draftCount = events.filter((e) => e.TrangThai === "draft").length;
  const pendingCount = events.filter(
    (e) => e.TrangThai === "cho_duyet_khoa" || e.TrangThai === "cho_duyet_ctsv",
  ).length;

  const filteredEvents =
    filter === "all" ? events : events.filter((e) => e.TrangThai === filter);

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setIsFormOpen(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleSaveEvent = async (formData, status) => {
    try {
      setLoading(true);
      const payload = { ...formData };
      delete payload.MaCLB;
      delete payload.TrangThai;
      delete payload.MaSK;
      delete payload.NgayTao;
      delete payload.LyDoTuChoi;

      if (editingEvent) {
        await axios.put(
          `${API_BASE_URL}/bcn/events/${editingEvent.MaSK}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        if (status === "cho_duyet_khoa") {
          await axios.patch(
            `${API_BASE_URL}/bcn/events/${editingEvent.MaSK}/submit`,
            {},
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            },
          );
        }
      } else {
        const createRes = await axios.post(
          `${API_BASE_URL}/bcn/events`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        if (status === "cho_duyet_khoa") {
          const newMaSK = createRes.data.data.MaSK;
          await axios.patch(
            `${API_BASE_URL}/bcn/events/${newMaSK}/submit`,
            {},
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            },
          );
        }
      }

      await fetchEvents();
      setIsFormOpen(false);
      setEditingEvent(null);
      alert(
        status === "cho_duyet_khoa"
          ? "Gửi sự kiện để duyệt thành công! Đang chờ Khoa xét duyệt."
          : "Lưu bản nháp thành công!",
      );
    } catch (err) {
      console.error("Error saving event:", err);
      alert("Lỗi: " + (err.response?.data?.error?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (
      confirm(
        "Bạn chắc chắn muốn xóa sự kiện này? Hành động này không thể hoàn tác.",
      )
    ) {
      try {
        setLoading(true);
        await axios.delete(`${API_BASE_URL}/bcn/events/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        await fetchEvents();
        alert("Xóa sự kiện thành công");
      } catch (err) {
        console.error("Error deleting event:", err);
        alert(
          "Lỗi khi xóa sự kiện: " +
            (err.response?.data?.error?.message || err.message),
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewEvent = async (event) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/bcn/events/${event.MaSK}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setDetailEvent(response.data.data);
      setIsDetailOpen(true);
    } catch (err) {
      console.error("Error fetching event details:", err);
      alert(
        "Lỗi khi tải chi tiết sự kiện: " +
          (err.response?.data?.error?.message || err.message),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEvent = async (id) => {
    try {
      setLoading(true);
      await axios.patch(
        `${API_BASE_URL}/bcn/events/${id}/submit`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      await fetchEvents();
      alert("Gửi sự kiện để duyệt thành công! Đang chờ Khoa xét duyệt.");
    } catch (err) {
      console.error("Error submitting event:", err);
      alert(
        "Lỗi khi gửi sự kiện: " +
          (err.response?.data?.error?.message || err.message),
      );
    } finally {
      setLoading(false);
    }
  };

  // Tab filters — chỉ hiện tab có dữ liệu + "Tất cả"
  const filterTabs = [
    { key: "all", label: "Tất cả" },
    { key: "draft", label: "Bản nháp" },
    { key: "cho_duyet_khoa", label: "Chờ Khoa duyệt" },
    { key: "cho_duyet_ctsv", label: "Chờ CTSV duyệt" },
    { key: "da_duyet", label: "Đã cấp phép" },
    { key: "sap_dien_ra", label: "Sắp diễn ra" },
    { key: "dang_dien_ra", label: "Đang diễn ra" },
    { key: "da_ket_thuc", label: "Đã kết thúc" },
    { key: "tu_choi", label: "Bị từ chối" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">
                Quản lý Hoạt động Câu lạc bộ
              </h1>
              <p className="text-slate-600 mt-2">
                Đã đăng nhập:{" "}
                <span className="font-semibold">{user?.hoTen}</span>
              </p>
            </div>
            <button
              onClick={handleCreateEvent}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              <FiPlus className="w-5 h-5" />
              Tạo sự kiện mới
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && !isFormOpen && !isDetailOpen && (
            <div className="text-center py-4 text-slate-500 text-sm">
              Đang tải...
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={FiCalendar}
              label="Tổng sự kiện"
              value={totalEvents}
              color="blue"
            />
            <StatCard
              icon={FiAlertCircle}
              label="Bản nháp"
              value={draftCount}
              color="amber"
            />
            <StatCard
              icon={FiClock}
              label="Đang chờ duyệt"
              value={pendingCount}
              color="emerald"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            {filterTabs.map((tab) => {
              const count =
                tab.key === "all"
                  ? events.length
                  : events.filter((e) => e.TrangThai === tab.key).length;
              if (tab.key !== "all" && count === 0) return null; // Ẩn tab không có dữ liệu
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                    filter === tab.key
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-slate-700 border border-slate-300 hover:border-blue-400"
                  }`}
                >
                  {tab.label}
                  {tab.key !== "all" && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                        filter === tab.key
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Events Grid */}
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.MaSK}
                  event={event}
                  onEdit={handleEditEvent}
                  onDelete={handleDeleteEvent}
                  onView={handleViewEvent}
                  onSubmit={handleSubmitEvent}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <FiCheckCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-900 mb-1">
                Không có sự kiện nào
              </p>
              <p className="text-slate-500">
                {filter === "all"
                  ? "Hãy tạo sự kiện mới để bắt đầu"
                  : "Không có sự kiện ở trạng thái này"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <EventFormModal
        isOpen={isFormOpen}
        event={editingEvent}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
        loading={loading}
      />

      <EventDetailModal
        isOpen={isDetailOpen}
        event={detailEvent}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailEvent(null);
        }}
      />
    </div>
  );
}
