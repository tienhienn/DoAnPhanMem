import { useState, useEffect } from "react";
import {
  FiX,
  FiFileText,
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiAward,
  FiAlertCircle,
} from "react-icons/fi";

/**
 * ============================================
 * EVENT FORM MODAL COMPONENT
 * ============================================
 * Component tạo/sửa sự kiện - Tái sử dụng trong nhiều trang
 *
 * Props:
 * - isOpen: boolean - Điều khiển hiển thị/ẩn modal
 * - event: object - Dữ liệu sự kiện (nếu null = mode tạo mới, nếu có = mode edit)
 * - onClose: function - Callback khi đóng modal
 * - onSave: function(formData, action) - Callback khi lưu (action: 'draft' | 'submit')
 */

export default function EventFormModal({ isOpen, event, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    startTime: "",
    endTime: "",
    location: "",
    quota: "",
    points: "",
    description: "",
  });
  const [errors, setErrors] = useState({});

  // Cập nhật form khi event thay đổi
  useEffect(() => {
    if (event) {
      setFormData(event);
    } else {
      setFormData({
        name: "",
        startTime: "",
        endTime: "",
        location: "",
        quota: "",
        points: "",
        description: "",
      });
    }
  }, [event, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Xóa error khi user bắt đầu nhập
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSave = (action) => {
    const newErrors = {};

    // Validation
    if (!formData.name.trim()) {
      newErrors.name = "Tên sự kiện không được để trống";
    }
    if (!formData.startTime) {
      newErrors.startTime = "Vui lòng chọn thời gian bắt đầu";
    }
    if (!formData.endTime) {
      newErrors.endTime = "Vui lòng chọn thời gian kết thúc";
    }
    if (
      formData.startTime &&
      formData.endTime &&
      new Date(formData.startTime) >= new Date(formData.endTime)
    ) {
      newErrors.endTime = "Thời gian kết thúc phải sau thời gian bắt đầu";
    }
    if (!formData.location.trim()) {
      newErrors.location = "Địa điểm không được để trống";
    }
    if (!formData.quota || formData.quota <= 0) {
      newErrors.quota = "Chỉ tiêu sinh viên phải lớn hơn 0";
    }
    if (!formData.points || formData.points < 0) {
      newErrors.points = "Điểm rèn luyện phải >= 0";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Mô tả không được để trống";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Mô tả phải ít nhất 10 ký tự";
    } else if (formData.description.length > 500) {
      newErrors.description = "Mô tả tối đa 500 ký tự";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData, action);
    resetForm();
    setErrors({});
  };

  const resetForm = () => {
    setFormData({
      name: "",
      startTime: "",
      endTime: "",
      location: "",
      quota: "",
      points: "",
      description: "",
    });
  };

  if (!isOpen) return null;

  const InputField = ({
    icon: Icon,
    label,
    name,
    type = "text",
    placeholder,
    min,
    step,
  }) => {
    const hasError = !!errors[name];
    return (
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-2">
          {Icon && <Icon className="w-4 h-4 text-blue-600" />}
          {label} <span className="text-rose-500">*</span>
        </label>
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          min={min}
          step={step}
          className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-all ${
            hasError
              ? "border-rose-500 focus:ring-2 focus:ring-rose-100 focus:border-rose-500 bg-rose-50"
              : "border-slate-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          }`}
        />
        {hasError && (
          <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
            <FiAlertCircle className="w-3 h-3" />
            {errors[name]}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[92vh] overflow-y-auto border border-slate-200">
        {/* ========== HEADER ========== */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-7 flex items-start justify-between gap-4 rounded-t-2xl">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-blue-500/30 rounded-lg">
                <FiFileText className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                {event ? "Cập nhật sự kiện" : "Tạo sự kiện mới"}
              </h2>
            </div>
            <p className="text-blue-100 text-sm ml-11">
              {event
                ? "Chỉnh sửa thông tin chi tiết sự kiện của bạn"
                : "Điền đầy đủ thông tin để tạo sự kiện mới"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors flex-shrink-0"
          >
            <FiX className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* ========== FORM CONTENT ========== */}
        <div className="p-8 space-y-8">
          {/* ===== SECTION 1: THÔNG TIN CƠ BẢN ===== */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full" />
              <h3 className="text-lg font-bold text-slate-800">
                Thông tin sự kiện
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <InputField
                icon={FiFileText}
                label="Tên sự kiện"
                name="name"
                placeholder="VD: Hội thảo Python Advanced"
              />
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-2">
                  <FiCalendar className="w-4 h-4 text-blue-600" />
                  Thời gian Bắt đầu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-all ${
                    errors.startTime
                      ? "border-rose-500 focus:ring-2 focus:ring-rose-100 focus:border-rose-500 bg-rose-50"
                      : "border-slate-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  }`}
                />
                {errors.startTime && (
                  <p className="text-xs text-rose-600 flex items-center gap-1">
                    <FiAlertCircle className="w-3 h-3" />
                    {errors.startTime}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-2">
                  <FiCalendar className="w-4 h-4 text-blue-600" />
                  Thời gian Kết thúc <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-all ${
                    errors.endTime
                      ? "border-rose-500 focus:ring-2 focus:ring-rose-100 focus:border-rose-500 bg-rose-50"
                      : "border-slate-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  }`}
                />
                {errors.endTime && (
                  <p className="text-xs text-rose-600 flex items-center gap-1">
                    <FiAlertCircle className="w-3 h-3" />
                    {errors.endTime}
                  </p>
                )}
              </div>

              <InputField
                icon={FiMapPin}
                label="Địa điểm"
                name="location"
                placeholder="VD: Phòng A101, Tòa A"
              />
            </div>
          </div>

          {/* Visual Divider */}
          <div className="h-px bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />

          {/* ===== SECTION 2: CHỈ TIÊU & ĐIỂM ===== */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-6 bg-gradient-to-b from-emerald-600 to-emerald-400 rounded-full" />
              <h3 className="text-lg font-bold text-slate-800">
                Chỉ tiêu & Điểm rèn luyện
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <InputField
                icon={FiUsers}
                label="Chỉ tiêu sinh viên"
                name="quota"
                type="number"
                placeholder="Số lượng"
                min="1"
              />
              <InputField
                icon={FiAward}
                label="Điểm rèn luyện dự kiến"
                name="points"
                type="number"
                placeholder="Số điểm"
                step="0.5"
                min="0"
              />
            </div>
          </div>

          {/* Visual Divider */}
          <div className="h-px bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />

          {/* ===== SECTION 3: MÔ TẢ ===== */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-6 bg-gradient-to-b from-amber-600 to-amber-400 rounded-full" />
              <h3 className="text-lg font-bold text-slate-800">
                Mô tả chi tiết
              </h3>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-800">
                Mô tả sự kiện <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Nhập mô tả chi tiết về sự kiện, mục tiêu, nội dung chương trình, lợi ích cho sinh viên..."
                rows="5"
                className={`w-full px-4 py-3 border rounded-lg outline-none transition-all resize-none ${
                  errors.description
                    ? "border-rose-500 focus:ring-2 focus:ring-rose-100 focus:border-rose-500 bg-rose-50"
                    : "border-slate-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                }`}
              />
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Tối thiểu 10 ký tự, tối đa 500 ký tự
                </div>
                <div
                  className={`text-xs font-medium ${
                    formData.description.length > 500
                      ? "text-rose-600"
                      : formData.description.length > 400
                        ? "text-amber-600"
                        : "text-slate-500"
                  }`}
                >
                  {formData.description.length}/500
                </div>
              </div>
              {errors.description && (
                <p className="text-xs text-rose-600 flex items-center gap-1">
                  <FiAlertCircle className="w-3 h-3" />
                  {errors.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ========== FOOTER ========== */}
        <div className="sticky bottom-0 border-t border-slate-200 bg-gradient-to-b from-slate-50/80 to-slate-50 px-8 py-5 flex items-center justify-between rounded-b-2xl backdrop-blur-sm">
          <p className="text-xs text-slate-600 font-medium">
            Các trường đánh dấu <span className="text-rose-500">*</span> là bắt
            buộc
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-all hover:border-slate-400"
            >
              Hủy
            </button>
            <button
              onClick={() => handleSave("draft")}
              className="px-6 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-all border border-slate-200"
            >
              📝 Lưu nháp
            </button>
            <button
              onClick={() => handleSave("submit")}
              className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              ✓ Nộp cho Khoa duyệt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
