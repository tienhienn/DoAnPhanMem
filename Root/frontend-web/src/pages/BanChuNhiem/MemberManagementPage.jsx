/**
 * MemberManagementPage - Quản lý nhân sự Câu lạc bộ
 *
 * Chức năng:
 * - Xem danh sách thành viên theo trạng thái (Thành viên chính thức, Ban chủ nhiệm, Đơn xin gia nhập, Đã rời CLB)
 * - Thêm thành viên mới
 * - Sửa chức vụ thành viên
 * - Xóa thành viên khỏi CLB
 * - Duyệt/Từ chối đơn xin gia nhập
 * - Xuất danh sách thành viên
 * - Giao diện 100% đồng bộ với EventManagementPage.jsx
 */

import { useState } from "react";
import {
  FiPlus,
  FiDownload,
  FiCheck,
  FiX,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

// ============================================
// MOCK DATA
// ============================================
const MOCK_MEMBERS = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    mssv: "2021001",
    role: "Thành viên",
    joinDate: "2024-01-15",
    contribution: 85,
    status: "active",
  },
  {
    id: 2,
    name: "Trần Thị Bảo",
    mssv: "2021002",
    role: "Thành viên",
    joinDate: "2024-02-20",
    contribution: 92,
    status: "active",
  },
  {
    id: 3,
    name: "Lê Minh Chính",
    mssv: "2021003",
    role: "Thành viên",
    joinDate: "2024-01-10",
    contribution: 78,
    status: "active",
  },
  {
    id: 4,
    name: "Phạm Thị Dung",
    mssv: "2020001",
    role: "Chủ nhiệm CLB",
    joinDate: "2023-09-01",
    contribution: 98,
    status: "active",
  },
  {
    id: 5,
    name: "Đỗ Hoàng Em",
    mssv: "2020002",
    role: "Phó chủ nhiệm",
    joinDate: "2023-10-15",
    contribution: 95,
    status: "active",
  },
  {
    id: 6,
    name: "Võ Hữu Tài",
    mssv: "2023001",
    role: "Thành viên",
    joinDate: "2024-05-10",
    contribution: 0,
    status: "pending",
  },
];

// ============================================
// STATUS BADGE COMPONENT
// ============================================
const STATUS_CONFIG = {
  active: { label: "Đang hoạt động", bg: "bg-emerald-100", text: "text-emerald-700" },
  pending: { label: "Chờ duyệt", bg: "bg-amber-100", text: "text-amber-700" },
  left: { label: "Đã rời", bg: "bg-rose-100", text: "text-rose-700" },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.active;
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

// ============================================
// ADD/EDIT MEMBER MODAL
// ============================================
const MemberFormModal = ({ isOpen, member, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    member || {
      name: "",
      mssv: "",
      role: "Thành viên",
    }
  );

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.mssv.trim()) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }
    onSave(formData);
  };

  const roleOptions = [
    "Thành viên",
    "Trưởng ban",
    "Phó chủ nhiệm",
    "Chủ nhiệm CLB",
  ];

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
          <h2 className="text-xl font-bold text-white">
            {member ? "Sửa chức vụ" : "Thêm thành viên mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiX className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Member Info (Read-only if editing) */}
          {member && (
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                Thành viên
              </p>
              <p className="text-lg font-bold text-slate-900">{member.name}</p>
              <p className="text-sm text-slate-600 mt-1">{member.mssv}</p>
            </div>
          )}

          {/* Name Input */}
          {!member && (
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Họ và tên
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập họ và tên"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          )}

          {/* MSSV Input */}
          {!member && (
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                MSSV
              </label>
              <input
                type="text"
                name="mssv"
                value={formData.mssv}
                onChange={handleChange}
                placeholder="Nhập MSSV"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          )}

          {/* Role Select */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Vai trò
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
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
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all shadow-sm"
          >
            {member ? "Cập nhật" : "Thêm thành viên"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function MemberManagementPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState(MOCK_MEMBERS);
  const [activeTab, setActiveTab] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  // ============================================
  // TABS CONFIGURATION
  // ============================================
  const tabs = [
    { key: "all", label: "Tất cả" },
    { key: "active", label: "Thành viên chính thức" },
    { key: "bcn", label: "Ban chủ nhiệm" },
    { key: "pending", label: "Đơn xin gia nhập" },
    { key: "left", label: "Đã rời CLB" },
  ];

  // ============================================
  // FILTER MEMBERS
  // ============================================
  const getFilteredMembers = () => {
    if (activeTab === "all") return members;
    if (activeTab === "bcn") {
      return members.filter((m) =>
        ["Chủ nhiệm CLB", "Phó chủ nhiệm", "Trưởng ban"].includes(m.role)
      );
    }
    return members.filter((m) => m.status === activeTab);
  };

  const filteredMembers = getFilteredMembers();

  // ============================================
  // STATISTICS
  // ============================================
  const stats = {
    total: members.length,
    active: members.filter((m) => m.status === "active").length,
    pending: members.filter((m) => m.status === "pending").length,
    left: members.filter((m) => m.status === "left").length,
  };

  // ============================================
  // HANDLERS
  // ============================================
  const handleAddMember = () => {
    setEditingMember(null);
    setIsFormOpen(true);
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

  const handleSaveMember = (formData) => {
    if (editingMember) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === editingMember.id
            ? { ...m, ...formData }
            : m
        )
      );
    } else {
      setMembers((prev) => [
        ...prev,
        {
          ...formData,
          id: Math.max(...prev.map((m) => m.id), 0) + 1,
          joinDate: new Date().toISOString().split("T")[0],
          contribution: 0,
          status: "active",
        },
      ]);
    }
    setIsFormOpen(false);
    setEditingMember(null);
  };

  const handleApproveMember = (id) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: "active" } : m
      )
    );
  };

  const handleRejectMember = (id) => {
    if (window.confirm("Bạn chắc chắn muốn từ chối đơn xin gia nhập?")) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const handleDeleteMember = (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa thành viên này khỏi CLB?")) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const handleExportList = () => {
    alert("Xuất danh sách thành viên (tính năng sẽ được cập nhật)");
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-800">
                Quản lý nhân sự Câu lạc bộ
              </h1>
              <p className="text-slate-500 mt-1">
                Quản lý thành viên và vai trò trong CLB
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddMember}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
              >
                <FiPlus className="w-5 h-5" />
                Thêm thành viên
              </button>
              <button
                onClick={handleExportList}
                className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 font-semibold border border-slate-300 rounded-lg hover:bg-slate-50 transition-all shadow-sm"
              >
                <FiDownload className="w-5 h-5" />
                Xuất danh sách
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-3 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-blue-100 text-blue-700 shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
            {/* Table Header */}
            <div className="grid grid-cols-7 gap-4 bg-slate-50 px-6 py-4 border-b border-slate-200">
              {[
                "Họ và tên",
                "MSSV",
                "Vai trò",
                "Ngày tham gia",
                "Điểm đóng góp",
                "Trạng thái",
                "Hành động",
              ].map((h) => (
                <div key={h} className="text-xs font-bold text-slate-500 uppercase">
                  {h}
                </div>
              ))}
            </div>

            {/* Table Body */}
            {filteredMembers.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="grid grid-cols-7 gap-4 px-6 py-4 hover:bg-blue-50 transition-colors"
                  >
                    {/* Name */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                        {member.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-800 truncate">
                        {member.name}
                      </span>
                    </div>

                    {/* MSSV */}
                    <div className="text-sm text-slate-600">{member.mssv}</div>

                    {/* Role */}
                    <div className="text-sm text-slate-600">{member.role}</div>

                    {/* Join Date */}
                    <div className="text-sm text-slate-600">
                      {new Date(member.joinDate).toLocaleDateString("vi-VN")}
                    </div>

                    {/* Contribution */}
                    <div className="text-sm text-slate-600">{member.contribution}</div>

                    {/* Status */}
                    <div className="flex items-center">
                      <StatusBadge status={member.status} />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {member.status === "pending" ? (
                        <>
                          <button
                            onClick={() => handleApproveMember(member.id)}
                            className="p-2 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors"
                            title="Duyệt"
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRejectMember(member.id)}
                            className="p-2 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                            title="Từ chối"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditMember(member)}
                            className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                            title="Sửa chức vụ"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMember(member.id)}
                            className="p-2 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                            title="Xóa khỏi CLB"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center text-slate-500">
                Không có thành viên nào
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <p className="text-sm text-slate-500 font-medium">Tổng thành viên</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <p className="text-sm text-slate-500 font-medium">Đang hoạt động</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.active}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <p className="text-sm text-slate-500 font-medium">Chờ duyệt</p>
              <p className="text-3xl font-bold text-amber-600 mt-2">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <p className="text-sm text-slate-500 font-medium">Đã rời CLB</p>
              <p className="text-3xl font-bold text-rose-600 mt-2">{stats.left}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <MemberFormModal
        isOpen={isFormOpen}
        member={editingMember}
        onClose={() => {
          setIsFormOpen(false);
          setEditingMember(null);
        }}
        onSave={handleSaveMember}
      />
    </div>
  );
}
