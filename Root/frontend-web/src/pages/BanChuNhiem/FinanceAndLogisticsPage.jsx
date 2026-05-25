import { useState, useEffect } from "react";
import {
  FiPlus,
  FiX,
  FiCheck,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiPackage,
  FiAlertTriangle,
} from "react-icons/fi";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

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

const TransactionModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    content: "",
    type: "Thu",
    amount: "",
    date: "",
  });

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!formData.content.trim() || !formData.amount || !formData.date) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }
    onSave(formData);
    setFormData({ content: "", type: "Thu", amount: "", date: "" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full mx-4">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-white">Thêm giao dịch quỹ</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiX className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Nội dung / Tên khoản tài chính *
            </label>
            <input
              type="text"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none"
              placeholder="VD: Thu tiền quỹ thành viên Tháng 5"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Phân loại
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none"
              >
                <option value="Thu">Thu (Quỹ cộng thêm)</option>
                <option value="Chi">Chi (Quỹ giảm đi)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Số tiền (VNĐ) *
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount: parseFloat(e.target.value) || "",
                  })
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none"
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Ngày thực hiện *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none"
            />
          </div>
        </div>
        <div className="bg-slate-50 px-8 py-4 flex justify-end gap-3 rounded-b-2xl border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Ghi sổ quỹ
          </button>
        </div>
      </div>
    </div>
  );
};

const EquipmentBorrowModal = ({ isOpen, onClose, onSave, events, assets }) => {
  const [formData, setFormData] = useState({
    assetId: "",
    eventId: "",
    borrowDate: "",
    returnDate: "",
    quantity: 1,
  });

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!formData.assetId || !formData.borrowDate || !formData.returnDate) {
      alert("Vui lòng chọn thiết bị và thời gian mượn trả mẫu!");
      return;
    }
    onSave(formData);
    setFormData({
      assetId: "",
      eventId: "",
      borrowDate: "",
      returnDate: "",
      quantity: 1,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-white">Lập phiếu mượn CSVC</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiX className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Chọn thiết bị / Tài sản nhà trường *
              </label>
              <select
                value={formData.assetId}
                onChange={(e) =>
                  setFormData({ ...formData, assetId: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none"
              >
                <option value="">-- Chọn tài sản --</option>
                {assets.map((ast) => (
                  <option key={ast.MaTS} value={ast.MaTS}>
                    {ast.TenTS} (Tổng kho: {ast.SoLuongTong})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Số lượng mượn *
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Sự kiện mượn phục vụ (nếu có)
            </label>
            <select
              value={formData.eventId}
              onChange={(e) =>
                setFormData({ ...formData, eventId: e.target.value })
              }
              className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none"
            >
              <option value="">
                -- Không có sự kiện / Sinh hoạt thường niên --
              </option>
              {events.map((ev) => (
                <option key={ev.MaSK} value={ev.MaSK}>
                  {ev.TenSK}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Ngày mượn đồ *
              </label>
              <input
                type="date"
                value={formData.borrowDate}
                onChange={(e) =>
                  setFormData({ ...formData, borrowDate: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Hạn trả thiết bị *
              </label>
              <input
                type="date"
                value={formData.returnDate}
                onChange={(e) =>
                  setFormData({ ...formData, returnDate: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none"
              />
            </div>
          </div>
        </div>
        <div className="bg-slate-50 px-8 py-4 flex justify-end gap-3 rounded-b-2xl border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Lập phiếu mượn
          </button>
        </div>
      </div>
    </div>
  );
};

export default function FinanceAndLogisticsPage() {
  const { user } = useAuth();
  const [activeMainTab, setActiveMainTab] = useState("finance");

  const [financeRecords, setFinanceRecords] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [events, setEvents] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);

  const fetchResources = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/bcn/finance-logistics/resources`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setEvents(res.data.events);
      setAssets(res.data.assets);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFinanceRecords = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/bcn/finance-logistics/transactions`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setFinanceRecords(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBorrowings = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/bcn/finance-logistics/borrowings`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setEquipments(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchResources(),
      fetchFinanceRecords(),
      fetchBorrowings(),
    ]).finally(() => setLoading(false));
  }, []);

  // Tính toán quỹ tự động dựa trên cột TongThu và TongChi từ bảng TAI_CHINH
  const totalIncome = financeRecords.reduce(
    (sum, r) => sum + (r.TongThu || 0),
    0,
  );
  const totalExpense = financeRecords.reduce(
    (sum, r) => sum + (r.TongChi || 0),
    0,
  );
  const totalFund = totalIncome - totalExpense;

  const borrowingCount = equipments.filter(
    (e) => e.trangThaiPhieu === "Đang mượn",
  ).length;
  const overdueCount = equipments.filter(
    (e) =>
      e.trangThaiPhieu === "Đang mượn" &&
      new Date(e.NgayTraDuKien) < new Date(),
  ).length;

  const handleAddTransaction = async (formData) => {
    try {
      await axios.post(
        `${API_BASE_URL}/bcn/finance-logistics/transactions`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      fetchFinanceRecords();
      setIsTransactionModalOpen(false);
      alert("Đã ghi sổ dữ liệu tài chính mới!");
    } catch (err) {
      alert("Lỗi khi thêm giao dịch");
    }
  };

  const handleAddEquipment = async (formData) => {
    try {
      await axios.post(
        `${API_BASE_URL}/bcn/finance-logistics/borrowings`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      fetchBorrowings();
      setIsEquipmentModalOpen(false);
      alert("Lập phiếu mượn tài sản thành công!");
    } catch (err) {
      alert("Lỗi hệ thống mượn thiết bị");
    }
  };

  const handleReturnEquipment = async (id) => {
    if (!confirm("Xác nhận thiết bị đã được trả lại kho nguyên vẹn?")) return;
    try {
      await axios.patch(
        `${API_BASE_URL}/bcn/finance-logistics/borrowings/${id}/return`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      fetchBorrowings();
      alert("Xác nhận trả đồ hoàn tất!");
    } catch (err) {
      alert("Lỗi hệ thống trả đồ");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Tài chính & Cơ sở vật chất
            </h1>
            <p className="text-slate-600 mt-2">
              Đăng nhập BCN:{" "}
              <span className="font-semibold">{user?.hoTen}</span>
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setActiveMainTab("finance")}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${activeMainTab === "finance" ? "bg-blue-100 text-blue-700 shadow-sm" : "bg-white text-slate-600 border border-slate-200"}`}
            >
              Quản lý Quỹ CLB (TAI_CHINH)
            </button>
            <button
              onClick={() => setActiveMainTab("equipment")}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${activeMainTab === "equipment" ? "bg-blue-100 text-blue-700 shadow-sm" : "bg-white text-slate-600 border border-slate-200"}`}
            >
              Mượn Cơ sở vật chất trường
            </button>
          </div>

          {loading ? (
            <div className="text-center py-10 text-slate-500">
              Đang đồng bộ dữ liệu với SQL Server...
            </div>
          ) : (
            <>
              {activeMainTab === "finance" && (
                <div className="space-y-8">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setIsTransactionModalOpen(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
                    >
                      <FiPlus className="w-5 h-5" /> Thêm khoản thu/chi
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    <StatCard
                      icon={FiDollarSign}
                      label="Số dư quỹ thực tế"
                      value={`${totalFund.toLocaleString("vi-VN")} đ`}
                      color="blue"
                    />
                    <StatCard
                      icon={FiTrendingUp}
                      label="Tổng lũy kế thu"
                      value={`${totalIncome.toLocaleString("vi-VN")} đ`}
                      color="emerald"
                    />
                    <StatCard
                      icon={FiTrendingDown}
                      label="Tổng lũy kế chi"
                      value={`${totalExpense.toLocaleString("vi-VN")} đ`}
                      color="rose"
                    />
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                    <div className="grid grid-cols-5 gap-4 bg-slate-50 px-6 py-4 border-b border-slate-200 font-bold text-slate-500 text-xs uppercase">
                      <div>Mục thu chi</div>
                      <div>Năm</div>
                      <div>Số tiền phân bổ</div>
                      <div>Ngày ghi nhận</div>
                      <div>Trạng thái</div>
                    </div>
                    {financeRecords.length > 0 ? (
                      <div className="divide-y divide-slate-100">
                        {financeRecords.map((r) => {
                          const isThu = r.TongThu > 0;
                          const amountDisplay = isThu ? r.TongThu : r.TongChi;
                          return (
                            <div
                              key={r.MaTC}
                              className="grid grid-cols-5 gap-4 px-6 py-4 hover:bg-blue-50 transition-colors items-center"
                            >
                              <div className="font-semibold text-slate-800 truncate">
                                {r.TenTaiChinh}
                              </div>
                              <div className="text-sm text-slate-600">
                                {r.Nam}
                              </div>
                              <div
                                className={`text-sm font-bold ${isThu ? "text-emerald-600" : "text-rose-600"}`}
                              >
                                {isThu ? "+" : "-"}
                                {amountDisplay.toLocaleString("vi-VN")} đ
                              </div>
                              <div className="text-sm text-slate-600">
                                {new Date(r.NgayBatDau).toLocaleDateString(
                                  "vi-VN",
                                )}
                              </div>
                              <div className="text-sm">
                                <span className="px-2 py-0.5 text-xs bg-slate-100 rounded-md font-medium text-slate-600">
                                  {r.TrangThai}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-slate-500">
                        Chưa có bản ghi tài chính nào được lưu
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeMainTab === "equipment" && (
                <div className="space-y-8">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setIsEquipmentModalOpen(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
                    >
                      <FiPlus className="w-5 h-5" /> Lập phiếu mượn đồ
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <StatCard
                      icon={FiPackage}
                      label="Thiết bị đang mượn hoạt động"
                      value={borrowingCount}
                      color="blue"
                    />
                    <StatCard
                      icon={FiAlertTriangle}
                      label="Hồ sơ thiết bị quá hạn trả"
                      value={overdueCount}
                      color="rose"
                    />
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                    <div className="grid grid-cols-6 gap-4 bg-slate-50 px-6 py-4 border-b border-slate-200 font-bold text-slate-500 text-xs uppercase">
                      <div>Tên thiết bị mượn</div>
                      <div>Sự kiện phục vụ</div>
                      <div>Ngày lập phiếu</div>
                      <div>Ngày hẹn trả</div>
                      <div>Trạng thái</div>
                      <div>Hành động</div>
                    </div>
                    {equipments.length > 0 ? (
                      <div className="divide-y divide-slate-100">
                        {equipments.map((eq) => {
                          const isOverdue =
                            eq.trangThaiPhieu === "Đang mượn" &&
                            new Date(eq.NgayTraDuKien) < new Date();
                          return (
                            <div
                              key={eq.MaPhieu}
                              className="grid grid-cols-6 gap-4 px-6 py-4 hover:bg-blue-50 transition-colors items-center"
                            >
                              <div className="font-semibold text-slate-800 truncate">
                                {eq.TenTS} (x{eq.SoLuongMuon})
                              </div>
                              <div className="text-sm text-slate-600 truncate">
                                {eq.TenSK || "Mượn nội bộ CLB"}
                              </div>
                              <div className="text-sm text-slate-600">
                                {new Date(eq.NgayTaoPhieu).toLocaleDateString(
                                  "vi-VN",
                                )}
                              </div>
                              <div
                                className={`text-sm ${isOverdue ? "text-rose-600 font-bold" : "text-slate-600"}`}
                              >
                                {new Date(eq.NgayTraDuKien).toLocaleDateString(
                                  "vi-VN",
                                )}
                              </div>
                              <div>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${eq.trangThaiPhieu === "Đã trả" ? "bg-emerald-100 text-emerald-700" : isOverdue ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"}`}
                                >
                                  {isOverdue
                                    ? "Quá hạn trả"
                                    : eq.trangThaiPhieu}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                {eq.trangThaiPhieu !== "Đã trả" && (
                                  <button
                                    onClick={() =>
                                      handleReturnEquipment(eq.MaPhieu)
                                    }
                                    className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100"
                                    title="Báo cáo hoàn trả đồ"
                                  >
                                    <FiCheck size={18} />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-slate-500">
                        Không có phiếu mượn cơ sở vật chất nào
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSave={handleAddTransaction}
      />
      <EquipmentBorrowModal
        isOpen={isEquipmentModalOpen}
        onClose={() => setIsEquipmentModalOpen(false)}
        onSave={handleAddEquipment}
        events={events}
        assets={assets}
      />
    </div>
  );
}
