import { useState, useEffect } from "react";
import {
  FiPlus,
  FiDownload,
  FiCheck,
  FiX,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL =
  `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api`;

// ============================================
// STATUS BADGE COMPONENT
// ============================================
const STATUS_CONFIG = {
  active: {
    label: "Đang hoạt động",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
  },
  pending: { label: "Chờ duyệt", bg: "bg-amber-100", text: "text-amber-700" },
  left: { label: "Đã rời", bg: "bg-rose-100", text: "text-rose-700" },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.active;
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
};

// ============================================
// ADD/EDIT MEMBER MODAL
// ============================================
const MemberFormModal = ({ isOpen, member, onClose, onSave, loading }) => {
  const [formData, setFormData] = useState({
    name: "",
    mssv: "",
    role: "Thành viên",
  });
  const [khoas, setKhoas] = useState([]);
  const [lops, setLops] = useState([]);
  const [sinhViens, setSinhViens] = useState([]);
  const [selectedKhoa, setSelectedKhoa] = useState("");
  const [selectedLop, setSelectedLop] = useState("");
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData({ name: member.name, mssv: member.mssv, role: member.role });
    } else {
      setFormData({ name: "", mssv: "", role: "Thành viên" });
      setSelectedKhoa("");
      setSelectedLop("");
      setSinhViens([]);
    }
  }, [member, isOpen]);

  // Lấy danh sách Khoa khi modal mở
  useEffect(() => {
    if (isOpen && !member) {
      fetchKhoas();
    }
  }, [isOpen, member]);

  const fetchKhoas = async () => {
    try {
      setLoadingData(true);
      const res = await axios.get(`${API_BASE_URL}/bcn/members/khoas`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setKhoas(res.data.data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách khoa:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleKhoaChange = async (e) => {
    const maKhoa = e.target.value;
    setSelectedKhoa(maKhoa);
    setSelectedLop("");
    setSinhViens([]);

    if (!maKhoa) return;

    try {
      setLoadingData(true);
      const res = await axios.get(
        `${API_BASE_URL}/bcn/members/khoas/${maKhoa}/lops`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setLops(res.data.data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách lớp:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLopChange = async (e) => {
    const maLop = e.target.value;
    setSelectedLop(maLop);
    setSinhViens([]);

    if (!maLop) return;

    try {
      setLoadingData(true);
      const res = await axios.get(
        `${API_BASE_URL}/bcn/members/lops/${maLop}/sinhviens`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setSinhViens(res.data.data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách sinh viên:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSinhVienSelect = (e) => {
    const selectedId = e.target.value;
    const selected = sinhViens.find((sv) => sv.id === selectedId);
    if (selected) {
      setFormData({
        ...formData,
        name: selected.name,
        mssv: selected.mssv,
      });
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    if (!formData.mssv.trim()) {
      alert("Vui lòng chọn sinh viên");
      return;
    }
    onSave(formData);
  };

  const roleOptions = [
    "Thành viên",
    "Trưởng ban",
    "Chủ nhiệm",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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

        <div className="p-8 space-y-6">
          {member && (
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                Thành viên
              </p>
              <p className="text-lg font-bold text-slate-900">{member.name}</p>
              <p className="text-sm text-slate-600 mt-1">{member.mssv}</p>
            </div>
          )}

          {!member && (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Chọn Khoa *
                </label>
                <select
                  value={selectedKhoa}
                  onChange={handleKhoaChange}
                  disabled={loadingData}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all disabled:bg-slate-100"
                >
                  <option value="">-- Chọn Khoa --</option>
                  {khoas.map((khoa) => (
                    <option key={khoa.id} value={khoa.id}>
                      {khoa.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Chọn Lớp *
                </label>
                <select
                  value={selectedLop}
                  onChange={handleLopChange}
                  disabled={!selectedKhoa || loadingData}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all disabled:bg-slate-100"
                >
                  <option value="">-- Chọn Lớp --</option>
                  {lops.map((lop) => (
                    <option key={lop.id} value={lop.id}>
                      {lop.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Chọn Sinh viên *
                </label>
                <select
                  onChange={handleSinhVienSelect}
                  disabled={!selectedLop || loadingData}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all disabled:bg-slate-100"
                >
                  <option value="">-- Chọn Sinh viên --</option>
                  {sinhViens.map((sv) => (
                    <option key={sv.id} value={sv.id}>
                      {sv.name} ({sv.mssv})
                    </option>
                  ))}
                </select>
                {sinhViens.length === 0 && selectedLop && !loadingData && (
                  <p className="text-xs text-amber-600 mt-1">
                    Tất cả sinh viên trong lớp này đã là thành viên của CLB.
                  </p>
                )}
              </div>

              {formData.mssv && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-xs font-semibold text-blue-600 uppercase mb-2">
                    Sinh viên được chọn
                  </p>
                  <p className="text-lg font-bold text-slate-900">
                    {formData.name}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">{formData.mssv}</p>
                </div>
              )}
            </>
          )}

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

        <div className="border-t border-slate-200 bg-slate-50 px-8 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={loading || loadingData}
            className="px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || loadingData}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all shadow-sm disabled:opacity-50"
          >
            {loading ? "Đang lưu..." : member ? "Cập nhật" : "Thêm thành viên"}
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
  const [members, setMembers] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/bcn/members`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMembers(res.data.data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách:", err);
      alert("Không thể tải danh sách thành viên.");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredMembers = () => {
    if (activeTab === "all") return members;
    if (activeTab === "bcn") {
      return members.filter(
        (m) =>
          [
            "Chủ nhiệm",
            "Trưởng ban",
          ].includes(m.role) && m.status === "active",
      );
    }
    return members.filter((m) => m.status === activeTab);
  };

  const filteredMembers = getFilteredMembers();

  const stats = {
    total: members.length,
    active: members.filter((m) => m.status === "active").length,
    pending: members.filter((m) => m.status === "pending").length,
    left: members.filter((m) => m.status === "left").length,
  };

  const handleAddMember = () => {
    setEditingMember(null);
    setIsFormOpen(true);
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

  const handleSaveMember = async (formData) => {
    try {
      setLoading(true);
      if (editingMember) {
        await axios.put(
          `${API_BASE_URL}/bcn/members/${editingMember.id}/role`,
          { role: formData.role },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        alert("Cập nhật chức vụ thành công.");
      } else {
        await axios.post(
          `${API_BASE_URL}/bcn/members`,
          { mssv: formData.mssv, role: formData.role },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        alert("Đã thêm thành viên mới.");
      }
      setIsFormOpen(false);
      fetchMembers();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.error?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleApproveMember = async (id) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/bcn/members/requests/${id}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      fetchMembers();
      alert("Đã duyệt đơn gia nhập!");
    } catch (err) {
      alert("Lỗi khi duyệt đơn!");
    }
  };

  const handleRejectMember = async (id) => {
    if (window.confirm("Bạn chắc chắn muốn từ chối đơn xin gia nhập này?")) {
      try {
        await axios.patch(
          `${API_BASE_URL}/bcn/members/requests/${id}/reject`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        fetchMembers();
      } catch (err) {
        alert("Lỗi khi từ chối đơn!");
      }
    }
  };

  const handleDeleteMember = async (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa thành viên này khỏi CLB?")) {
      try {
        await axios.delete(`${API_BASE_URL}/bcn/members/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        fetchMembers();
      } catch (err) {
        alert("Lỗi khi xóa thành viên!");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-800">
                Quản lý nhân sự Câu lạc bộ
              </h1>
              <p className="text-slate-500 mt-1">
                Quản lý thành viên và xét duyệt đơn xin gia nhập
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddMember}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-sm"
              >
                <FiPlus className="w-5 h-5" /> Thêm thành viên
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 font-semibold border border-slate-300 rounded-lg hover:bg-slate-50 transition-all shadow-sm"
              >
                <FiDownload className="w-5 h-5" /> Xuất danh sách
              </button>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            {[
              { key: "all", label: "Tất cả" },
              { key: "active", label: "Thành viên chính thức" },
              { key: "bcn", label: "Ban chủ nhiệm" },
              { key: "pending", label: "Đơn xin gia nhập" },
              { key: "left", label: "Đã rời CLB" },
            ].map((tab) => (
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

          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
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
                <div
                  key={h}
                  className="text-xs font-bold text-slate-500 uppercase"
                >
                  {h}
                </div>
              ))}
            </div>

            {loading ? (
              <div className="px-6 py-12 text-center text-slate-500">
                Đang tải dữ liệu...
              </div>
            ) : filteredMembers.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="grid grid-cols-7 gap-4 px-6 py-4 hover:bg-blue-50 transition-colors items-center"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                        {member.name?.charAt(0) || "U"}
                      </div>
                      <span className="font-semibold text-slate-800 truncate">
                        {member.name}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600">{member.mssv}</div>
                    <div className="text-sm text-slate-600">{member.role}</div>
                    <div className="text-sm text-slate-600">
                      {new Date(member.joinDate).toLocaleDateString("vi-VN")}
                    </div>
                    <div className="text-sm text-slate-600">
                      {member.contribution}
                    </div>
                    <div className="flex items-center">
                      <StatusBadge status={member.status} />
                    </div>

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
                      ) : member.status === "active" ? (
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
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center text-slate-500">
                Không có thành viên nào trong mục này.
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <p className="text-sm text-slate-500 font-medium">Tổng hồ sơ</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {stats.total}
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <p className="text-sm text-slate-500 font-medium">
                Đang hoạt động
              </p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">
                {stats.active}
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <p className="text-sm text-slate-500 font-medium">
                Đơn chờ duyệt
              </p>
              <p className="text-3xl font-bold text-amber-600 mt-2">
                {stats.pending}
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <p className="text-sm text-slate-500 font-medium">Đã rời CLB</p>
              <p className="text-3xl font-bold text-rose-600 mt-2">
                {stats.left}
              </p>
            </div>
          </div>
        </div>
      </div>

      <MemberFormModal
        isOpen={isFormOpen}
        member={editingMember}
        onClose={() => {
          setIsFormOpen(false);
          setEditingMember(null);
        }}
        onSave={handleSaveMember}
        loading={loading}
      />
    </div>
  );
}
