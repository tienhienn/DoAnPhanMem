import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../utils/apiClient";
import { useAuth } from "../context/AuthContext";
import {
  Users,
  Calendar,
  Plus,
  Search,
  X,
  Check,
  FileText,
  Info,
  HelpCircle,
} from "lucide-react";

const STATUS_CONFIG = {
  pending_faculty: {
    label: "Chờ Khoa duyệt",
    bg: "bg-amber-50 border-amber-200 text-amber-700",
  },
  pending_student_affairs: {
    label: "Chờ CTSV duyệt",
    bg: "bg-blue-50 border-blue-200 text-blue-700",
  },
  approved: {
    label: "Đã phê duyệt",
    bg: "bg-emerald-50 border-emerald-200 text-emerald-700",
  },
  rejected: {
    label: "Bị từ chối",
    bg: "bg-rose-50 border-rose-200 text-rose-700",
  },
};

export default function ClubsPage() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [myClubs, setMyClubs] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // States for Club Opening Form Modal
  const [isOpenRegister, setIsOpenRegister] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    tenCLB: "",
    linhVuc: "Học thuật",
    maDVQL: "",
    tinhCapThiet: "",
    // Step 2
    tenTiengAnh: "",
    tenVietTat: "",
    slogan: "",
    gioiThieu: "",
    tonChiMucDich: "",
    phamViHoatDong: "",
    quyenLoiTrachNhiem: "",
    // Step 4
    mucDichYeuCau: "",
    noiDungHoatDong: "",
    kinhPhiHoatDong: "",
    tienDo: "",
  });

  // Step 3 list
  const [bcnList, setBcnList] = useState([]);
  const [newBcn, setNewBcn] = useState({
    hoTen: "",
    ngaySinh: "",
    gioiTinh: "Nam",
    sdt: "",
    email: "",
    chucVu: "Thành viên BCN lâm thời",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clubsRes, myClubsRes, regsRes, unitsRes] = await Promise.all([
        apiClient.get("/api/clubs"),
        apiClient.get("/api/students/me/clubs"),
        apiClient.get("/api/clubs/my-registrations"),
        apiClient.get("/api/clubs/units"),
      ]);

      if (clubsRes.data.success) setClubs(clubsRes.data.data);
      if (myClubsRes.data.success) setMyClubs(myClubsRes.data.data);
      if (regsRes.data.success) setMyRegistrations(regsRes.data.data);
      if (unitsRes.data.success) {
        setUnits(unitsRes.data.data);
        if (unitsRes.data.data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            maDVQL: unitsRes.data.data[0].maDVQL,
          }));
        }
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddBcnMember = () => {
    if (!newBcn.hoTen || !newBcn.sdt || !newBcn.email) {
      alert(
        "Vui lòng điền đầy đủ Họ tên, SĐT và Email của thành viên BCN lâm thời.",
      );
      return;
    }
    setBcnList((prev) => [...prev, { ...newBcn, id: Date.now() }]);
    setNewBcn({
      hoTen: "",
      ngaySinh: "",
      gioiTinh: "Nam",
      sdt: "",
      email: "",
      chucVu: "Chủ nhiệm",
    });
  };

  const handleRemoveBcnMember = (id) => {
    setBcnList((prev) => prev.filter((m) => m.id !== id));
  };

  const handleOpenModal = () => {
    setFormData({
      tenCLB: "",
      linhVuc: "Học thuật",
      maDVQL: units[0]?.maDVQL || "",
      tinhCapThiet: "",
      tenTiengAnh: "",
      tenVietTat: "",
      slogan: "",
      gioiThieu: "",
      tonChiMucDich: "",
      phamViHoatDong: "",
      quyenLoiTrachNhiem: "",
      mucDichYeuCau: "",
      noiDungHoatDong: "",
      kinhPhiHoatDong: "",
      tienDo: "",
    });
    // Add current student as the proposed Club Leader
    setBcnList([
      {
        id: "leader",
        hoTen: user?.hoTen || "",
        ngaySinh: "",
        gioiTinh: "Nam",
        sdt: "",
        email: user?.email || "",
        chucVu: "Chủ nhiệm",
      },
    ]);
    setStep(1);
    setIsOpenRegister(true);
  };

  const handleSubmit = async () => {
    if (bcnList.length === 0) {
      alert("Danh sách Ban chủ nhiệm lâm thời phải có ít nhất 1 thành viên.");
      return;
    }
    setSubmitLoading(true);
    try {
      const payload = {
        tenCLB: formData.tenCLB,
        linhVuc: formData.linhVuc,
        maDVQL: formData.maDVQL,
        noiDungHoSo: {
          step1: {
            tinhCapThiet: formData.tinhCapThiet,
          },
          step2: {
            tenTiengAnh: formData.tenTiengAnh,
            tenVietTat: formData.tenVietTat,
            slogan: formData.slogan,
            gioiThieu: formData.gioiThieu,
            tonChiMucDich: formData.tonChiMucDich,
            phamViHoatDong: formData.phamViHoatDong,
            quyenLoiTrachNhiem: formData.quyenLoiTrachNhiem,
          },
          step3: {
            bcnLamThoi: bcnList,
          },
          step4: {
            mucDichYeuCau: formData.mucDichYeuCau,
            noiDungHoatDong: formData.noiDungHoatDong,
            kinhPhiHoatDong: formData.kinhPhiHoatDong,
            tienDo: formData.tienDo,
          },
        },
      };

      const res = await apiClient.post("/api/clubs/register", payload);
      if (res.data.success) {
        alert(res.data.message);
        setIsOpenRegister(false);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Không thể gửi đơn đăng ký.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredClubs = clubs.filter(
    (c) =>
      c.TenCLB.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.LinhVuc?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const myClubIds = myClubs.map((c) => c.MaCLB);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-indigo-50">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" /> Danh sách Câu lạc bộ
          </h1>
          <p className="text-gray-500 mt-1">
            Khám phá và tham gia các hoạt động ngoại khóa
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Tìm kiếm CLB..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <button
            onClick={handleOpenModal}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm hover:shadow transition-all whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /> Đăng ký mở CLB
          </button>
        </div>
      </div>

      {/* Đơn đăng ký mở CLB của tôi */}
      {myRegistrations.length > 0 && !searchTerm && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800 px-2 flex items-center gap-2">
            <span className="w-2 h-6 bg-amber-500 rounded-full"></span> Yêu cầu
            mở CLB của bạn
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myRegistrations.map((reg) => {
              const cfg =
                STATUS_CONFIG[reg.TrangThai] || STATUS_CONFIG.pending_faculty;
              return (
                <div
                  key={reg.MaDKMo}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-400">
                        Mã đơn: {reg.MaDKMo}
                      </span>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${cfg.bg}`}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg mt-2">
                      {reg.TenCLB}
                    </h3>
                    <p className="text-sm text-indigo-600 font-medium mt-1">
                      Lĩnh vực: {reg.LinhVuc} | Quản lý: {reg.tenDVQL}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Ngày nộp:{" "}
                      {new Date(reg.NgayTao).toLocaleDateString("vi-VN")}
                    </p>

                    {reg.LyDoTuChoi && (
                      <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 mt-3">
                        <p className="text-xs font-semibold text-rose-600">
                          Lý do từ chối:
                        </p>
                        <p className="text-sm text-rose-700 mt-0.5">
                          {reg.LyDoTuChoi}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* My Clubs Section */}
      {myClubs.length > 0 && !searchTerm && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800 px-2 flex items-center gap-2">
            <span className="w-2 h-6 bg-green-500 rounded-full"></span> CLB Của
            Tôi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myClubs.map((club) => {
              const isInactive = club.TrangThai !== "Hoạt động";
              return isInactive ? (
                // CLB đã ngừng hoạt động — không cho click vào
                <div
                  key={club.MaCLB}
                  className="group bg-gray-100 rounded-2xl p-5 shadow-sm border border-gray-200 opacity-60"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-gray-400 font-bold text-xl shadow-sm border border-gray-200">
                      {club.Logo ? (
                        <img
                          src={club.Logo}
                          alt=""
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        club.TenCLB.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-400 line-clamp-1 line-through">
                        {club.TenCLB}
                      </h3>
                      <p className="text-sm font-medium text-gray-400 mt-1">
                        {club.VaiTroCLB}
                      </p>
                      <p className="text-xs text-red-400 font-semibold mt-1">
                        ⚠ Câu lạc bộ này đã ngừng hoạt động
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                // CLB bình thường — giữ nguyên Link như cũ
                <Link
                  key={club.MaCLB}
                  to={`/clubs/${club.MaCLB}`}
                  className="group bg-gradient-to-br from-green-50 to-emerald-50/30 rounded-2xl p-5 shadow-sm border border-green-100 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-green-600 font-bold text-xl shadow-sm border border-green-100 group-hover:scale-105 transition-transform">
                      {club.Logo ? (
                        <img
                          src={club.Logo}
                          alt=""
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        club.TenCLB.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 line-clamp-1 group-hover:text-green-700 transition-colors">
                        {club.TenCLB}
                      </h3>
                      <p className="text-sm font-medium text-green-600 mt-1 bg-green-100 inline-block px-2 py-0.5 rounded-md">
                        {club.VaiTroCLB}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* All Clubs */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-800 px-2 flex items-center gap-2">
          <span className="w-2 h-6 bg-indigo-500 rounded-full"></span> Khám phá
        </h2>

        {filteredClubs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500">
              Không tìm thấy câu lạc bộ nào phù hợp.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredClubs.map((club) => (
              <Link
                key={club.MaCLB}
                to={`/clubs/${club.MaCLB}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full hover:-translate-y-1"
              >
                <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-500 relative">
                  <div className="absolute -bottom-8 left-6 w-16 h-16 bg-white p-1 rounded-2xl shadow-sm">
                    <div className="w-full h-full bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-2xl">
                      {club.Logo ? (
                        <img
                          src={club.Logo}
                          alt=""
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        club.TenCLB.charAt(0)
                      )}
                    </div>
                  </div>
                  {myClubIds.includes(club.MaCLB) && (
                    <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-md border border-white/30">
                      Đã tham gia
                    </div>
                  )}
                </div>

                <div className="pt-10 px-6 pb-6 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {club.TenCLB}
                  </h3>
                  <div className="text-xs font-medium text-indigo-500 bg-indigo-50 inline-flex px-2 py-1 rounded-md mb-3 self-start">
                    {club.LinhVuc || "Khác"}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                    {club.MoTa || "Chưa có mô tả"}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4 mt-auto">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" /> {club.SoThanhVienHienTai}/
                      {club.SoThanhVienToiDa}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />{" "}
                      {new Date(club.NgayThanhLap).getFullYear()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Club Registration Modal Form */}
      {isOpenRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            onClick={() => !submitLoading && setIsOpenRegister(false)}
          ></div>
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10 text-white">
              <div>
                <h3 className="text-xl font-bold">Đăng ký mở Câu lạc bộ mới</h3>
                <p className="text-xs text-indigo-100 mt-0.5">
                  Số hóa hồ sơ thành lập CLB chuẩn
                </p>
              </div>
              <button
                onClick={() => !submitLoading && setIsOpenRegister(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between text-sm font-semibold">
              {[
                { number: 1, label: "Tờ trình" },
                { number: 2, label: "Điều lệ CLB" },
                { number: 3, label: "BCN lâm thời" },
                { number: 4, label: "Kế hoạch" },
              ].map((s) => (
                <div key={s.number} className="flex items-center space-x-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border font-bold text-xs ${
                      step === s.number
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                        : step > s.number
                          ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                          : "bg-white border-gray-200 text-gray-400"
                    }`}
                  >
                    {step > s.number ? <Check className="w-4 h-4" /> : s.number}
                  </div>
                  <span
                    className={
                      step === s.number ? "text-indigo-600" : "text-gray-400"
                    }
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Form Body */}
            <div className="p-6 flex-1 space-y-6">
              {/* Step 1: Tờ trình */}
              {step === 1 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-800 text-sm border-b pb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" /> Bảng 1: Tờ
                    trình thành lập (BM-CLB-01)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Tên Câu lạc bộ dự kiến *
                      </label>
                      <input
                        type="text"
                        name="tenCLB"
                        value={formData.tenCLB}
                        onChange={handleInputChange}
                        placeholder="Ví dụ: CLB Tin học Sư phạm"
                        className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Lĩnh vực hoạt động *
                      </label>
                      <select
                        name="linhVuc"
                        value={formData.linhVuc}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      >
                        <option value="Học thuật">
                          Học thuật / Nghiên cứu
                        </option>
                        <option value="Nghệ thuật">Văn hóa Nghệ thuật</option>
                        <option value="Thể thao">Thể dục Thể thao</option>
                        <option value="Tình nguyện">Tình nguyện xã hội</option>
                        <option value="Kỹ năng">Kỹ năng mềm / Khác</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Đơn vị quản lý phê duyệt (Khoa chủ quản/Phòng CTSV) *
                    </label>
                    <select
                      name="maDVQL"
                      value={formData.maDVQL}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      {units.map((u) => (
                        <option key={u.maDVQL} value={u.maDVQL}>
                          {u.tenDVQL}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Tính cấp thiết về việc thành lập CLB *
                    </label>
                    <textarea
                      name="tinhCapThiet"
                      value={formData.tinhCapThiet}
                      onChange={handleInputChange}
                      placeholder="Hãy trình bày lý do, sự cần thiết và giá trị mà CLB mang lại cho trường học và sinh viên..."
                      rows={5}
                      className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Điều lệ */}
              {step === 2 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-800 text-sm border-b pb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-indigo-600" /> Bảng 2: Điều lệ
                    hoạt động CLB (BM-CLB-02)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Tên tiếng Anh
                      </label>
                      <input
                        type="text"
                        name="tenTiengAnh"
                        value={formData.tenTiengAnh}
                        onChange={handleInputChange}
                        placeholder="English Name"
                        className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Tên viết tắt
                      </label>
                      <input
                        type="text"
                        name="tenVietTat"
                        value={formData.tenVietTat}
                        onChange={handleInputChange}
                        placeholder="Vd: IT-CLUB"
                        className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Slogan của CLB
                      </label>
                      <input
                        type="text"
                        name="slogan"
                        value={formData.slogan}
                        onChange={handleInputChange}
                        placeholder="Vd: Share the passion"
                        className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Giới thiệu khái quát về CLB *
                    </label>
                    <textarea
                      name="gioiThieu"
                      value={formData.gioiThieu}
                      onChange={handleInputChange}
                      placeholder="Mô tả ngắn gọn về quá trình hình thành, định hướng sơ bộ..."
                      rows={3}
                      className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Tôn chỉ, mục đích *
                    </label>
                    <textarea
                      name="tonChiMucDich"
                      value={formData.tonChiMucDich}
                      onChange={handleInputChange}
                      placeholder="CLB thành lập nhằm giải quyết mục tiêu gì?"
                      rows={3}
                      className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Lĩnh vực và Phạm vi hoạt động *
                      </label>
                      <textarea
                        name="phamViHoatDong"
                        value={formData.phamViHoatDong}
                        onChange={handleInputChange}
                        placeholder="Các đối tượng, địa bàn, cách thức sinh hoạt định kỳ..."
                        rows={3}
                        className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Quyền lợi và Trách nhiệm thành viên *
                      </label>
                      <textarea
                        name="quyenLoiTrachNhiem"
                        value={formData.quyenLoiTrachNhiem}
                        onChange={handleInputChange}
                        placeholder="Thành viên tham gia được gì và phải tuân thủ nội quy nào?"
                        rows={3}
                        className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: BCN lâm thời */}
              {step === 3 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-800 text-sm border-b pb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" /> Bảng 3: Nhân
                    sự & BCN lâm thời (BM-CLB-03 & 04)
                  </h4>

                  {/* BCN List Table */}
                  <div className="border border-gray-100 rounded-2xl overflow-hidden bg-gray-50 p-4">
                    <span className="text-xs font-bold text-gray-500 uppercase block mb-3">
                      Thành viên BCN lâm thời hiện có ({bcnList.length})
                    </span>
                    {bcnList.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">
                        Chưa có thành viên nào.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {bcnList.map((member) => (
                          <div
                            key={member.id}
                            className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between text-sm shadow-sm"
                          >
                            <div>
                              <p className="font-bold text-gray-800">
                                {member.hoTen}{" "}
                                <span className="text-xs font-normal text-gray-400">
                                  ({member.email})
                                </span>
                              </p>
                              <p className="text-xs text-indigo-600 font-medium">
                                Chức vụ: {member.chucVu}{" "}
                                {member.sdt && `| SĐT: ${member.sdt}`}
                              </p>
                            </div>
                            {member.id !== "leader" && (
                              <button
                                onClick={() => handleRemoveBcnMember(member.id)}
                                className="p-1 text-gray-400 hover:text-rose-500 rounded transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add New BCN Member Form */}
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 space-y-3">
                    <span className="text-xs font-bold text-indigo-600 uppercase block">
                      Thêm nhân sự mới vào danh sách lâm thời
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <input
                          type="text"
                          placeholder="Họ và tên *"
                          value={newBcn.hoTen}
                          onChange={(e) =>
                            setNewBcn((prev) => ({
                              ...prev,
                              hoTen: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-1.5 border rounded-lg text-sm bg-white"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Số điện thoại *"
                          value={newBcn.sdt}
                          onChange={(e) =>
                            setNewBcn((prev) => ({
                              ...prev,
                              sdt: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-1.5 border rounded-lg text-sm bg-white"
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          placeholder="Email liên hệ *"
                          value={newBcn.email}
                          onChange={(e) =>
                            setNewBcn((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-1.5 border rounded-lg text-sm bg-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <select
                          value={newBcn.gioiTinh}
                          onChange={(e) =>
                            setNewBcn((prev) => ({
                              ...prev,
                              gioiTinh: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-1.5 border rounded-lg text-sm bg-white"
                        >
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                        </select>
                      </div>
                      <div className="flex items-center px-3 py-1.5 border rounded-lg text-sm bg-indigo-50 text-indigo-700 font-semibold">
                        👤 Chủ nhiệm
                      </div>
                      <div>
                        <button
                          onClick={handleAddBcnMember}
                          className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition-all"
                        >
                          + Thêm vào danh sách
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Kế hoạch */}
              {step === 4 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-800 text-sm border-b pb-2 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-600" /> Bảng 4:
                    Kế hoạch hoạt động trong 12 tháng (BM-CLB-05)
                  </h4>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Mục đích - Yêu cầu hoạt động *
                    </label>
                    <textarea
                      name="mucDichYeuCau"
                      value={formData.mucDichYeuCau}
                      onChange={handleInputChange}
                      placeholder="Các tiêu chuẩn tổ chức chương trình, giá trị học thuật hay kỹ năng mang lại..."
                      rows={3}
                      className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Nội dung hoạt động chi tiết *
                    </label>
                    <textarea
                      name="noiDungHoatDong"
                      value={formData.noiDungHoatDong}
                      onChange={handleInputChange}
                      placeholder="Kế hoạch chi tiết các sự kiện, các buổi sinh hoạt thường niên..."
                      rows={3}
                      className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Dự kiến kinh phí hoạt động *
                      </label>
                      <textarea
                        name="kinhPhiHoatDong"
                        value={formData.kinhPhiHoatDong}
                        onChange={handleInputChange}
                        placeholder="Nguồn quỹ câu lạc bộ, hội phí thành viên đóng góp, tài trợ (nếu có)..."
                        rows={3}
                        className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Tiến độ thực hiện *
                      </label>
                      <textarea
                        name="tienDo"
                        value={formData.tienDo}
                        onChange={handleInputChange}
                        placeholder="Các mốc thời gian lớn (Tháng 1-3 tuyển thành viên, Tháng 4 tổ chức Đại hội, ...)"
                        rows={3}
                        className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 border-t border-gray-100 bg-gray-50 px-6 py-4 flex items-center justify-between rounded-b-3xl">
              <button
                onClick={() => setStep((prev) => prev - 1)}
                disabled={step === 1 || submitLoading}
                className="px-5 py-2 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50"
              >
                Quay lại
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => !submitLoading && setIsOpenRegister(false)}
                  disabled={submitLoading}
                  className="px-5 py-2 text-gray-500 hover:text-gray-700 font-semibold transition-all"
                >
                  Hủy bỏ
                </button>
                {step < 4 ? (
                  <button
                    onClick={() => {
                      if (
                        step === 1 &&
                        (!formData.tenCLB || !formData.tinhCapThiet)
                      ) {
                        alert(
                          "Vui lòng điền đầy đủ Tên CLB và Tính cấp thiết.",
                        );
                        return;
                      }
                      if (
                        step === 2 &&
                        (!formData.gioiThieu ||
                          !formData.tonChiMucDich ||
                          !formData.phamViHoatDong ||
                          !formData.quyenLoiTrachNhiem)
                      ) {
                        alert(
                          "Vui lòng điền đầy đủ các thông tin bắt buộc trong Điều lệ.",
                        );
                        return;
                      }
                      setStep((prev) => prev + 1);
                    }}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-sm"
                  >
                    Tiếp theo
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={
                      submitLoading ||
                      !formData.mucDichYeuCau ||
                      !formData.noiDungHoatDong ||
                      !formData.kinhPhiHoatDong ||
                      !formData.tienDo
                    }
                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl transition-all shadow-md hover:brightness-110 disabled:opacity-50"
                  >
                    {submitLoading ? "Đang gửi hồ sơ..." : "Gửi đơn đăng ký"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
