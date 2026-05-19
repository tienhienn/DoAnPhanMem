/**
 * FinanceAndLogisticsPage - Quản lý Tài chính & Cơ sở vật chất
 *
 * Chức năng:
 * - Tab 1: Quản lý Quỹ (Thu/Chi) - Thống kê và lịch sử giao dịch
 * - Tab 2: Mượn Cơ sở vật chất - Quản lý phiếu mượn thiết bị
 * - Giao diện kế thừa 100% từ EventManagementPage
 */

import { useState } from "react";
import {
  FiPlus,
  FiX,
  FiEye,
  FiCheck,
  FiAlertCircle,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiPackage,
  FiClock,
  FiAlertTriangle,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

// ============================================
// MOCK DATA - TRANSACTIONS
// ============================================
const MOCK_TRANSACTIONS = [
  {
    id: 1,
    content: "Thu tiền từ sự kiện Hackathon",
    type: "Thu",
    amount: 500000,
    date: "2026-05-20",
    performer: "Trần Văn A",
  },
  {
    id: 2,
    content: "Chi tiền mua đồ uống sự kiện",
    type: "Chi",
    amount: 200000,
    date: "2026-05-19",
    performer: "Nguyễn Thị B",
  },
  {
    id: 3,
    content: "Thu tiền từ sự kiện Hội thảo",
    type: "Thu",
    amount: 300000,
    date: "2026-05-18",
    performer: "Lê Văn C",
  },
  {
    id: 4,
    content: "Chi tiền thuê địa điểm",
    type: "Chi",
    amount: 1500000,
    date: "2026-05-17",
    performer: "Phạm Thị D",
  },
  {
    id: 5,
    content: "Thu tiền từ sự kiện Roadshow",
    type: "Thu",
    amount: 250000,
    date: "2026-05-16",
    performer: "Hoàng Văn E",
  },
];

// ============================================
// MOCK DATA - CLUB EVENTS (for dropdown)
// ============================================
const MOCK_CLUB_EVENTS = [
  { id: 1, name: "Hội thảo Python Advanced" },
  { id: 2, name: "Hackathon Innovation 2026" },
  { id: 3, name: "Lễ tuyên dương Sinh viên Xuất sắc 2025" },
  { id: 4, name: "Roadshow Tuyển dụng Công ty X" },
  { id: 5, name: "Buổi tư vấn Du học Úc" },
];

// ============================================
// MOCK DATA - EQUIPMENT BORROWING
// ============================================
const MOCK_EQUIPMENTS = [
  {
    id: 1,
    name: "Máy chiếu Epson EB-2250U",
    event: "Hội thảo Python Advanced",
    borrowDate: "2026-05-15",
    returnDate: "2026-05-15",
    status: "returned",
    performer: "Trần Văn A",
  },
  {
    id: 2,
    name: "Bộ âm thanh Yamaha",
    event: "Hackathon Innovation 2026",
    borrowDate: "2026-05-20",
    returnDate: "2026-05-21",
    status: "in_use",
    performer: "Nguyễn Thị B",
  },
  {
    id: 3,
    name: "Bàn ghế sự kiện (50 bộ)",
    event: "Lễ tuyên dương Sinh viên",
    borrowDate: "2026-05-25",
    returnDate: "2026-05-25",
    status: "pending",
    performer: "Lê Văn C",
  },
  {
    id: 4,
    name: "Máy quay video Sony",
    event: "Roadshow Tuyển dụng",
    borrowDate: "2026-05-28",
    returnDate: "2026-05-28",
    status: "overdue",
    performer: "Phạm Thị D",
  },
  {
    id: 5,
    name: "Laptop Dell XPS 15",
    event: "Buổi tư vấn Du học",
    borrowDate: "2026-05-22",
    returnDate: "2026-05-22",
    status: "returned",
    performer: "Hoàng Văn E",
  },
];

// ============================================
// STAT CARD COMPONENT
// ============================================
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    blue: "text-blue-600",
    emerald: "text-emerald-600",
    rose: "text-rose-600",
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 font-medium">{label}</p>
          <p className={`text-3xl font-bold mt-2 ${colorClasses[color]}`}>
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]} opacity-20`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
};

// ============================================
// TRANSACTION MODAL
// ============================================
const TransactionModal = ({ isOpen, onClose, onSave, userFullName }) => {
  const [formData, setFormData] = useState({
    content: "",
    type: "Thu",
    amount: "",
    date: "",
    performer: "Nguyễn Thị Quản",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || "" : value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.content.trim() || !formData.amount || !formData.date) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }
    onSave(formData);
    setFormData({
      content: "",
      type: "Thu",
      amount: "",
      date: "",
      performer: "Ban chủ nhiệm CLB",
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
          <h2 className="text-xl font-bold text-white">Thêm giao dịch</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiX className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Nội dung giao dịch
            </label>
            <input
              type="text"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Nhập nội dung giao dịch"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Type & Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Loại
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              >
                <option value="Thu">Thu</option>
                <option value="Chi">Chi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Số tiền (VNĐ)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Nhập số tiền"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Date & Performer */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Ngày giao dịch
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Người thực hiện
              </label>
              <input
                type="text"
                name="performer"
                value={formData.performer}
                readOnly
                className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 cursor-not-allowed outline-none"
              />
              <p className="text-xs text-slate-500 mt-1">
                Mặc định: Ban chủ nhiệm CLB
              </p>
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
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm"
          >
            Thêm giao dịch
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// EQUIPMENT BORROWING MODAL
// ============================================
const EquipmentBorrowModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    event: "",
    borrowDate: "",
    returnDate: "",
    performer: "Nguyễn Thị Quản",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (
      !formData.name.trim() ||
      !formData.event.trim() ||
      !formData.borrowDate ||
      !formData.returnDate
    ) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }
    onSave(formData);
    setFormData({
      name: "",
      event: "",
      borrowDate: "",
      returnDate: "",
      performer: "Ban chủ nhiệm CLB",
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
          <h2 className="text-xl font-bold text-white">Lập phiếu mượn</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiX className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Equipment Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Tên thiết bị
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên thiết bị"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Event */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Sự kiện
            </label>
            <select
              name="event"
              value={formData.event}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">-- Chọn sự kiện --</option>
              {MOCK_CLUB_EVENTS.map((evt) => (
                <option key={evt.id} value={evt.name}>
                  {evt.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Ngày mượn
              </label>
              <input
                type="date"
                name="borrowDate"
                value={formData.borrowDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Hẹn trả
              </label>
              <input
                type="date"
                name="returnDate"
                value={formData.returnDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Performer */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Người mượn
            </label>
            <input
              type="text"
              name="performer"
              value={formData.performer}
              readOnly
              className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 cursor-not-allowed outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              Mặc định: Ban chủ nhiệm CLB
            </p>
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
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm"
          >
            Lập phiếu
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function FinanceAndLogisticsPage() {
  const { user } = useAuth();
  const [activeMainTab, setActiveMainTab] = useState("finance");
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [equipments, setEquipments] = useState(MOCK_EQUIPMENTS);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);

  // ============================================
  // FINANCE TAB CALCULATIONS
  // ============================================
  const totalFund = transactions.reduce((sum, t) => {
    return t.type === "Thu" ? sum + t.amount : sum - t.amount;
  }, 0);

  const totalIncome = transactions
    .filter((t) => t.type === "Thu")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "Chi")
    .reduce((sum, t) => sum + t.amount, 0);

  // ============================================
  // EQUIPMENT TAB CALCULATIONS
  // ============================================
  const borrowingCount = equipments.filter((e) => e.status === "in_use").length;
  const overdueCount = equipments.filter((e) => e.status === "overdue").length;

  // ============================================
  // HANDLERS
  // ============================================
  const handleAddTransaction = (formData) => {
    const newTransaction = {
      id: Math.max(...transactions.map((t) => t.id), 0) + 1,
      ...formData,
    };
    setTransactions((prev) => [newTransaction, ...prev]);
    setIsTransactionModalOpen(false);
  };

  const handleAddEquipment = (formData) => {
    const newEquipment = {
      id: Math.max(...equipments.map((e) => e.id), 0) + 1,
      ...formData,
      status: "pending",
    };
    setEquipments((prev) => [newEquipment, ...prev]);
    setIsEquipmentModalOpen(false);
  };

  const handleReturnEquipment = (id) => {
    setEquipments((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: "returned" } : e)),
    );
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Tài chính & Cơ sở vật chất
            </h1>
            <p className="text-slate-600 mt-2">
              Đã đăng nhập: <span className="font-semibold">{user?.hoTen}</span>
            </p>
          </div>

          {/* Main Tabs */}
          <div className="flex gap-4">
            <button
              onClick={() => setActiveMainTab("finance")}
              className={`px-6 py-3 rounded-xl text-base font-bold transition-all ${
                activeMainTab === "finance"
                  ? "bg-blue-100 text-blue-700 shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
              }`}
            >
              Quản lý Quỹ (Thu/Chi)
            </button>
            <button
              onClick={() => setActiveMainTab("equipment")}
              className={`px-6 py-3 rounded-xl text-base font-bold transition-all ${
                activeMainTab === "equipment"
                  ? "bg-blue-100 text-blue-700 shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
              }`}
            >
              Mượn Cơ sở vật chất
            </button>
          </div>

          {/* ============================================ */}
          {/* VIEW 1: FINANCE MANAGEMENT */}
          {/* ============================================ */}
          {activeMainTab === "finance" && (
            <div className="space-y-8">
              {/* Action Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setIsTransactionModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white shadow-sm hover:shadow-md px-6 py-3 rounded-lg font-semibold transition-all"
                >
                  <FiPlus className="w-5 h-5" />
                  Thêm giao dịch
                </button>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-3 gap-6">
                <StatCard
                  icon={FiDollarSign}
                  label="Tổng Quỹ hiện tại"
                  value={`${totalFund.toLocaleString("vi-VN")}đ`}
                  color="blue"
                />
                <StatCard
                  icon={FiTrendingUp}
                  label="Tổng Thu tháng này"
                  value={`${totalIncome.toLocaleString("vi-VN")}đ`}
                  color="emerald"
                />
                <StatCard
                  icon={FiTrendingDown}
                  label="Tổng Chi tháng này"
                  value={`${totalExpense.toLocaleString("vi-VN")}đ`}
                  color="rose"
                />
              </div>

              {/* Transactions Table */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
                {/* Table Header */}
                <div className="grid grid-cols-5 gap-4 bg-slate-50 px-6 py-4 border-b border-slate-200">
                  {[
                    "Nội dung",
                    "Loại",
                    "Số tiền",
                    "Ngày giao dịch",
                    "Người thực hiện",
                  ].map((h) => (
                    <div
                      key={h}
                      className="text-xs font-bold text-slate-500 uppercase"
                    >
                      {h}
                    </div>
                  ))}
                </div>

                {/* Table Body */}
                {transactions.length > 0 ? (
                  <div className="divide-y divide-slate-200">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="grid grid-cols-5 gap-4 px-6 py-4 hover:bg-blue-50 transition-colors border-b border-slate-100"
                      >
                        <div className="font-semibold text-slate-800 truncate">
                          {transaction.content}
                        </div>
                        <div className="text-sm text-slate-600">
                          {transaction.type}
                        </div>
                        <div
                          className={`text-sm font-bold ${
                            transaction.type === "Thu"
                              ? "text-emerald-600"
                              : "text-rose-600"
                          }`}
                        >
                          {transaction.type === "Thu" ? "+" : "-"}
                          {transaction.amount.toLocaleString("vi-VN")}đ
                        </div>
                        <div className="text-sm text-slate-600">
                          {transaction.date}
                        </div>
                        <div className="text-sm text-slate-600">
                          {transaction.performer}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-12 text-center text-slate-500">
                    Không có giao dịch nào
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* VIEW 2: EQUIPMENT BORROWING */}
          {/* ============================================ */}
          {activeMainTab === "equipment" && (
            <div className="space-y-8">
              {/* Action Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setIsEquipmentModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white shadow-sm hover:shadow-md px-6 py-3 rounded-lg font-semibold transition-all"
                >
                  <FiPlus className="w-5 h-5" />
                  Lập phiếu mượn
                </button>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-2 gap-6">
                <StatCard
                  icon={FiPackage}
                  label="Đang mượn"
                  value={borrowingCount}
                  color="blue"
                />
                <StatCard
                  icon={FiAlertTriangle}
                  label="Quá hạn trả"
                  value={overdueCount}
                  color="rose"
                />
              </div>

              {/* Equipment Borrowing Table */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
                {/* Table Header */}
                <div className="grid grid-cols-6 gap-4 bg-slate-50 px-6 py-4 border-b border-slate-200">
                  {[
                    "Tên thiết bị",
                    "Sự kiện",
                    "Ngày mượn",
                    "Hẹn trả",
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

                {/* Table Body */}
                {equipments.length > 0 ? (
                  <div className="divide-y divide-slate-200">
                    {equipments.map((equipment) => {
                      const statusConfig = {
                        pending: {
                          label: "Chờ Khoa duyệt",
                          bg: "bg-amber-100",
                          text: "text-amber-700",
                        },
                        in_use: {
                          label: "Đang sử dụng",
                          bg: "bg-blue-100",
                          text: "text-blue-700",
                        },
                        returned: {
                          label: "Đã trả",
                          bg: "bg-emerald-100",
                          text: "text-emerald-700",
                        },
                        overdue: {
                          label: "Quá hạn",
                          bg: "bg-rose-100",
                          text: "text-rose-700",
                        },
                      };

                      const config = statusConfig[equipment.status];

                      return (
                        <div
                          key={equipment.id}
                          className="grid grid-cols-6 gap-4 px-6 py-4 hover:bg-blue-50 transition-colors border-b border-slate-100"
                        >
                          <div className="font-semibold text-slate-800 truncate">
                            {equipment.name}
                          </div>
                          <div className="text-sm text-slate-600 truncate">
                            {equipment.event}
                          </div>
                          <div className="text-sm text-slate-600">
                            {equipment.borrowDate}
                          </div>
                          <div className="text-sm text-slate-600">
                            {equipment.returnDate}
                          </div>
                          <div className="flex items-center">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
                            >
                              {config.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                              title="Xem phiếu"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                            {equipment.status !== "returned" && (
                              <button
                                onClick={() =>
                                  handleReturnEquipment(equipment.id)
                                }
                                className="p-2 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors"
                                title="Báo cáo đã trả"
                              >
                                <FiCheck className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-6 py-12 text-center text-slate-500">
                    Không có phiếu mượn nào
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSave={handleAddTransaction}
        userFullName={user?.hoTen}
      />

      <EquipmentBorrowModal
        isOpen={isEquipmentModalOpen}
        onClose={() => setIsEquipmentModalOpen(false)}
        onSave={handleAddEquipment}
      />
    </div>
  );
}
