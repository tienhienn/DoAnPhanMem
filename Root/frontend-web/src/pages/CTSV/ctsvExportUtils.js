import * as XLSX from "xlsx";

const STATUS_LABELS = {
  cho_duyet: "Chờ duyệt",
  da_duyet: "Đã duyệt",
  da_diem_danh: "Đã điểm danh",
  da_huy: "Đã hủy",
};

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString("vi-VN");
}

/**
 * Xuất danh sách sinh viên đăng ký sự kiện ra file Excel (.xlsx)
 */
export function exportParticipantsToExcel(participants, eventName, eventId) {
  const rows = participants.map((p, index) => ({
    STT: index + 1,
    "Mã sinh viên": (p.maSV || "").trim(),
    "Họ và tên": p.hoTen || "",
    Email: p.email || "",
    "Số điện thoại": p.soDienThoai || "",
    "Tên lớp": p.tenLop || "",
    Khoa: p.tenKhoa || "",
    "Ngày đăng ký": formatDate(p.NgayDangKy),
    "Trạng thái": STATUS_LABELS[p.TrangThai] || p.TrangThai || "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Danh sách đăng ký");

  const safeName = (eventName || "SuKien")
    .replace(/[^\w\u00C0-\u0248\u1E00-\u1EFF ]/g, "")
    .trim()
    .slice(0, 40);
  const fileName = `BaoCao_DangKy_${(eventId || "").trim()}_${safeName || "export"}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Xuất danh sách thành viên CLB ra file Excel (.xlsx)
 */
export function exportClubMembersToExcel(members, clubName, clubId) {
  const rows = members.map((m, index) => ({
    STT: index + 1,
    "Mã sinh viên": (m.maSV || "").trim(),
    "Họ và tên": m.hoTen || "",
    Email: m.email || "",
    "Số điện thoại": m.soDienThoai || "",
    "Tên lớp": m.tenLop || "",
    Khoa: m.tenKhoa || "",
    "Vai trò CLB": m.VaiTroCLB || "",
    "Ngày tham gia": formatDate(m.NgayThamGia),
    "Điểm đóng góp": m.DiemDongGop ?? 0,
    "Trạng thái": m.TrangThai || "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Thành viên CLB");

  const safeName = (clubName || "CLB")
    .replace(/[^\w\u00C0-\u0248\u1E00-\u1EFF ]/g, "")
    .trim()
    .slice(0, 40);
  const fileName = `BaoCao_ThanhVien_${(clubId || "").trim()}_${safeName || "export"}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
