/**
 * CTSVEventStatisticsPage - Thống kê sự kiện (chỉ Phòng CTSV)
 */

import { useState, useEffect, useCallback, useMemo } from "react";
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
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterKhoa, setFilterKhoa] = useState("all");
  const [filterLop, setFilterLop] = useState("all");

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

  const khoaOptions = useMemo(() => {
    const counts = {};
    participants.forEach((p) => {
      const khoa = (p.tenKhoa || "").trim();
      if (!khoa) return;
      counts[khoa] = (counts[khoa] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name, "vi"));
  }, [participants]);

  const lopOptions = useMemo(() => {
    const source =
      filterKhoa === "all"
        ? participants
        : participants.filter((p) => (p.tenKhoa || "").trim() === filterKhoa);
    const counts = {};
    source.forEach((p) => {
      const lop = (p.tenLop || "").trim();
      if (!lop) return;
      counts[lop] = (counts[lop] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name, "vi"));
  }, [participants, filterKhoa]);

  const filteredParticipants = useMemo(() => {
    const kw = searchKeyword.trim().toLowerCase();
    return participants.filter((p) => {
      if (filterKhoa !== "all" && (p.tenKhoa || "").trim() !== filterKhoa) {
        return false;
      }
      if (filterLop !== "all" && (p.tenLop || "").trim() !== filterLop) {
        return false;
      }
      if (!kw) return true;
      const maSV = (p.maSV || "").trim().toLowerCase();
      const hoTen = (p.hoTen || "").toLowerCase();
      const email = (p.email || "").toLowerCase();
      return maSV.includes(kw) || hoTen.includes(kw) || email.includes(kw);
    });
  }, [participants, searchKeyword, filterKhoa, filterLop]);

  const hasActiveFilters =
    searchKeyword.trim() !== "" || filterKhoa !== "all" || filterLop !== "all";

  const handleKhoaChange = (value) => {
    setFilterKhoa(value);
    setFilterLop("all");
  };

  const handleClearFilters = () => {
    setSearchKeyword("");
    setFilterKhoa("all");
    setFilterLop("all");
  };

  const handleExport = () => {
    if (filteredParticipants.length === 0) {
      setToast({
        message: hasActiveFilters
          ? "Không có sinh viên phù hợp với bộ lọc hiện tại"
          : "Sự kiện chưa có sinh viên đăng ký",
        type: "error",
      });
      return;
    }
    exportParticipantsToExcel(filteredParticipants, event?.TenSK, id);
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

        <div className="mb-4 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="self-start px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700"
          >
            Xuất báo cáo Excel
            {hasActiveFilters ? " (theo bộ lọc)" : ""}
          </button>
        </div>

        {/* Bộ lọc danh sách sinh viên */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-4 space-y-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg
                className="w-4 h-4 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="search"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm mã SV, họ tên, email..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={() => setSearchKeyword("")}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                aria-label="Xóa tìm kiếm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap">
            <FilterSelect
              label="Khoa"
              value={filterKhoa}
              onChange={handleKhoaChange}
              options={khoaOptions}
              allLabel="Tất cả khoa"
            />
            <FilterSelect
              label="Lớp"
              value={filterLop}
              onChange={setFilterLop}
              options={lopOptions}
              allLabel="Tất cả lớp"
              disabled={filterKhoa === "all"}
              disabledHint="Chọn khoa trước"
            />
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>

          <p className="text-xs text-slate-500">
            Hiển thị{" "}
            <span className="font-semibold text-slate-700">
              {filteredParticipants.length}
            </span>{" "}
            / {participants.length} sinh viên
          </p>
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
                ) : filteredParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      Không có sinh viên phù hợp với bộ lọc
                    </td>
                  </tr>
                ) : (
                  filteredParticipants.map((p, idx) => (
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

function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel,
  disabled = false,
  disabledHint,
}) {
  return (
    <div className="flex flex-col gap-1 min-w-[160px] flex-1 sm:max-w-xs">
      <label className="text-xs font-medium text-slate-500">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
      >
        <option value="all">{disabled && disabledHint ? disabledHint : allLabel}</option>
        {!disabled &&
          options.map((opt) => (
            <option key={opt.name} value={opt.name}>
              {opt.name} ({opt.count})
            </option>
          ))}
      </select>
    </div>
  );
}
