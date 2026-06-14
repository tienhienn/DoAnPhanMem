import { useState, useEffect, useRef } from "react";
import {
  FiCheckCircle,
  FiAlertCircle,
  FiUpload,
  FiCalendar,
  FiUser,
  FiPlusCircle,
  FiSearch,
  FiClock,
  FiUsers,
  FiInfo,
  FiRefreshCw,
  FiUserCheck,
  FiUserX,
  FiCamera,
  FiAward,
  FiSend,
  FiCheck
} from "react-icons/fi";
import apiClient from "../../utils/apiClient";
import jsQR from "jsqr";

export default function QRAttendancePage() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [loading, setLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Participants State
  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "attended" | "absent"

  // Active Tab: "qr" | "manual"
  const [activeTab, setActiveTab] = useState("qr");

  // Manual Input State
  const [manualStudentId, setManualStudentId] = useState("");

  // Scan result state
  const [result, setResult] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchApprovedEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchParticipants(selectedEventId);
      setResult(null);
    } else {
      setParticipants([]);
    }
  }, [selectedEventId]);

  const fetchApprovedEvents = async () => {
    try {
      setEventsLoading(true);
      setError(null);
      const response = await apiClient.get("/api/bcn/events");
      const allEvents = response.data.data || [];
      const approved = allEvents.filter(
        (e) =>
          (e.KhoaDuyet === 1 || e.KhoaDuyet === true) &&
          (e.PhongCTSVDuyet === 1 || e.PhongCTSVDuyet === true) &&
          e.TrangThai !== "huy"
      );
      setEvents(approved);
      if (approved.length > 0) {
        setSelectedEventId(approved[0].MaSK);
      }
    } catch (err) {
      console.error("Error fetching approved events:", err);
      setError("Không thể tải danh sách sự kiện");
    } finally {
      setEventsLoading(false);
    }
  };

  const fetchParticipants = async (eventId) => {
    try {
      setParticipantsLoading(true);
      const response = await apiClient.get(`/api/bcn/events/${eventId}/participants`);
      setParticipants(response.data.data || []);
    } catch (err) {
      console.error("Error fetching participants:", err);
    } finally {
      setParticipantsLoading(false);
    }
  };

  const getEventStatus = (event) => {
    if (!event) return { code: "unknown", label: "Không xác định", color: "text-slate-400 bg-slate-100 border-slate-200" };
    const now = new Date();
    const start = new Date(event.ThoiGianBatDau);
    const end = new Date(event.ThoiGianKetThuc);

    if (now < start) {
      return { code: "upcoming", label: "Chuẩn bị diễn ra", color: "bg-blue-50 text-blue-700 border-blue-100" };
    } else if (now >= start && now <= end) {
      return { code: "ongoing", label: "Đang diễn ra", color: "bg-emerald-50 text-emerald-700 border-emerald-100" };
    } else {
      return { code: "ended", label: "Đã kết thúc", color: "bg-rose-50 text-rose-700 border-rose-100" };
    }
  };

  const handleAttendanceAPI = async (payload) => {
    setLoading(true);
    setResult(null);
    try {
      const response = await apiClient.post("/api/bcn/events/attendance", payload);
      const data = response.data;

      const newCheckIn = {
        id: Date.now(),
        maND: data.data.maND,
        hoTen: data.data.hoTen,
        tenSK: data.data.tenSK,
        diemRenLuyen: data.data.diemRenLuyen || 0,
        anhDaiDien: data.data.anhDaiDien,
        gioiTinh: data.data.gioiTinh,
        time: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        }),
        status: data.data.alreadyAttended ? "already" : "success",
        message: data.message
      };

      setResult(newCheckIn);
      setManualStudentId("");
      
      // Refresh the participant list to reflect checked-in status immediately
      fetchParticipants(selectedEventId);
    } catch (err) {
      console.error("Attendance API Error:", err);
      const errMsg = err.response?.data?.error?.message || "Đã có lỗi xảy ra khi điểm danh";
      const errorCheckIn = {
        id: Date.now(),
        status: "error",
        message: errMsg,
        time: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        })
      };
      setResult(errorCheckIn);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const selectedEvent = events.find((ev) => ev.MaSK === selectedEventId);
    const status = getEventStatus(selectedEvent);
    if (status.code !== "ongoing") {
      alert(`Không thể điểm danh do sự kiện ${status.label.toLowerCase()}`);
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, img.width, img.height);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            // Check if the QR code belongs to the selected event
            const parts = code.data.trim().split('-');
            if (parts.length === 4 && parts[0] === 'UTE' && parts[1] === 'UDN') {
              const scannedEventId = parts[3].trim();
              if (scannedEventId !== selectedEventId) {
                setResult({
                  id: Date.now(),
                  status: "error",
                  message: `Mã QR thuộc sự kiện khác (${scannedEventId}), không khớp với sự kiện đang chọn!`,
                  time: new Date().toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                  })
                });
                setLoading(false);
                return;
              }
            } else {
              setResult({
                id: Date.now(),
                status: "error",
                message: "Mã QR không đúng định dạng của hệ thống UTE-UDN",
                time: new Date().toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit"
                })
              });
              setLoading(false);
              return;
            }

            // Found QR code and matches, call backend
            handleAttendanceAPI({ qrValue: code.data, maSK: selectedEventId });
          } else {
            setResult({
              id: Date.now(),
              status: "error",
              message: "Không tìm thấy mã QR trong hình ảnh này. Hãy thử ảnh chụp rõ hơn.",
              time: new Date().toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
              })
            });
            setLoading(false);
          }
        } catch (canvasErr) {
          console.error("Canvas processing error:", canvasErr);
          setResult({
            id: Date.now(),
            status: "error",
            message: "Lỗi xử lý hình ảnh",
            time: new Date().toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit"
            })
          });
          setLoading(false);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!selectedEventId) {
      alert("Vui lòng chọn sự kiện trước khi điểm danh");
      return;
    }
    const selectedEvent = events.find((ev) => ev.MaSK === selectedEventId);
    const status = getEventStatus(selectedEvent);
    if (status.code !== "ongoing") {
      alert(`Không thể điểm danh do sự kiện ${status.label.toLowerCase()}`);
      return;
    }
    if (!manualStudentId.trim()) {
      alert("Vui lòng nhập mã sinh viên");
      return;
    }
    handleAttendanceAPI({
      maND: manualStudentId.trim(),
      maSK: selectedEventId
    });
  };

  const selectedEvent = events.find((e) => e.MaSK === selectedEventId);
  const statusInfo = getEventStatus(selectedEvent);

  // Filter participants based on search term and status tab
  const filteredParticipants = participants.filter((p) => {
    const matchesSearch = !searchTerm.trim() || (
      (p.hoTen && p.hoTen.toLowerCase().includes(searchTerm.toLowerCase().trim())) ||
      (p.maND && p.maND.toLowerCase().includes(searchTerm.toLowerCase().trim())) ||
      (p.tenLop && p.tenLop.toLowerCase().includes(searchTerm.toLowerCase().trim()))
    );

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "attended" && p.TrangThai === "da_diem_danh") ||
      (statusFilter === "absent" && p.TrangThai !== "da_diem_danh");

    return matchesSearch && matchesStatus;
  });

  const totalRegistered = participants.length;
  const totalAttended = participants.filter((p) => p.TrangThai === "da_diem_danh").length;
  const totalAbsent = totalRegistered - totalAttended;
  const attendedPercentage = totalRegistered > 0 ? Math.round((totalAttended / totalRegistered) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Premium SaaS Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-white relative overflow-hidden">
          {/* Subtle Radial Glow */}
          <div className="absolute -right-24 -top-24 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Cổng Nghiệp Vụ
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">Real-time Connection</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                Điểm Danh Sự Kiện
              </h1>
              <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
                Hệ thống ghi nhận điểm danh tự động của Ban Chủ Nhiệm. Hỗ trợ quét ảnh QR mã hóa và cộng điểm rèn luyện tự động vào hồ sơ sinh viên.
              </p>
            </div>
            
            <div className="flex items-center gap-3 bg-slate-800/60 backdrop-blur-md rounded-2xl p-4 border border-slate-700/50 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                <FiCamera className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Báo cáo trực quan</p>
                <p className="text-sm font-bold text-white">Quét thông tin ảnh</p>
              </div>
            </div>
          </div>
        </div>

        {eventsLoading ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 text-sm font-semibold tracking-wide">Đang đồng bộ dữ liệu sự kiện...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50/50 border border-rose-100 rounded-3xl p-8 text-center shadow-sm max-w-lg mx-auto">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiAlertCircle className="w-6 h-6" />
            </div>
            <p className="text-slate-800 font-bold mb-1 text-base">Không thể hoàn tất kết nối</p>
            <p className="text-rose-600 text-sm mb-5">{error}</p>
            <button
              onClick={fetchApprovedEvents}
              className="px-5 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors shadow-sm"
            >
              Yêu cầu kết nối lại
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm space-y-4 max-w-xl mx-auto">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto border border-slate-100">
              <FiCalendar className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Không tìm thấy sự kiện phù hợp</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
              Câu lạc bộ của bạn hiện không có sự kiện nào được duyệt hoặc đang diễn ra để thực hiện ghi nhận điểm danh.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Management Controls */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Event Selector Widget */}
              <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-5 transition-all hover:border-slate-300/60">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Bước 1: Chọn Sự Kiện Mục Tiêu
                  </label>
                  <select
                    value={selectedEventId}
                    onChange={(e) => {
                      setSelectedEventId(e.target.value);
                      setResult(null);
                    }}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all cursor-pointer text-sm"
                  >
                    {events.map((e) => {
                      const status = getEventStatus(e);
                      return (
                        <option key={e.MaSK} value={e.MaSK}>
                          [{status.label}] {e.TenSK}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {selectedEvent && (
                  <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/40 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2.5">
                      <p className="flex items-center gap-2.5 text-slate-600">
                        <FiCalendar className="text-indigo-500 w-4 h-4 shrink-0" />
                        <span><strong className="text-slate-800">Bắt đầu:</strong> {new Date(selectedEvent.ThoiGianBatDau).toLocaleString("vi-VN")}</span>
                      </p>
                      <p className="flex items-center gap-2.5 text-slate-600">
                        <FiClock className="text-indigo-500 w-4 h-4 shrink-0" />
                        <span><strong className="text-slate-800">Kết thúc:</strong> {new Date(selectedEvent.ThoiGianKetThuc).toLocaleString("vi-VN")}</span>
                      </p>
                    </div>
                    <div className="space-y-2.5">
                      <p className="flex items-center gap-2.5 text-slate-600">
                        <FiUserCheck className="text-indigo-500 w-4 h-4 shrink-0" />
                        <span><strong className="text-slate-800">Địa điểm:</strong> {selectedEvent.DiaDiem || "Trực tuyến / Phòng họp"}</span>
                      </p>
                      <p className="flex items-center gap-2.5 text-slate-600">
                        <FiAward className="text-amber-500 w-4 h-4 shrink-0" />
                        <span>
                          <strong className="text-slate-800">Điểm hoạt động:</strong>{" "}
                          <span className="font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                            +{selectedEvent.DiemRenLuyen} ĐRL
                          </span>
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Notice Messages */}
              {statusInfo.code === "upcoming" && (
                <div className="bg-blue-50/60 border border-blue-100 rounded-3xl p-5 flex items-start gap-3.5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <FiInfo className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-blue-900">Sự kiện chưa đến giờ hoạt động</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Lịch trình bắt đầu lúc {new Date(selectedEvent.ThoiGianBatDau).toLocaleString("vi-VN")}. Hệ thống chỉ cấp phép ghi nhận điểm danh khi sự kiện đang diễn ra.
                    </p>
                  </div>
                </div>
              )}

              {statusInfo.code === "ended" && (
                <div className="bg-rose-50/60 border border-rose-100 rounded-3xl p-5 flex items-start gap-3.5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <FiAlertCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-rose-900">Thời gian điểm danh đã khóa</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Sự kiện này đã kết thúc lúc {new Date(selectedEvent.ThoiGianKetThuc).toLocaleString("vi-VN")}. Hệ thống chuyển sang chế độ **Chỉ xem danh sách**, không thể bổ sung hồ sơ điểm danh.
                    </p>
                  </div>
                </div>
              )}

              {statusInfo.code === "ongoing" && (
                <div className="bg-emerald-50/60 border border-emerald-100 rounded-3xl p-5 flex items-start gap-3.5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <FiCheckCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-emerald-900">Cổng điểm danh trực tuyến đang mở</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Sự kiện đang diễn ra. Hãy chọn tải ảnh QR của sinh viên hoặc nhập mã số sinh viên trực tiếp để ghi nhận tham gia.
                    </p>
                  </div>
                </div>
              )}

              {/* Dynamic Check-in Interface (Tabs) */}
              <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="flex border-b border-slate-100 p-2 bg-slate-50/80 gap-1">
                  <button
                    onClick={() => setActiveTab("qr")}
                    className={`flex-1 py-3 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all ${
                      activeTab === "qr"
                        ? "bg-white text-indigo-600 shadow-sm border border-slate-200/40"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <FiCamera className="w-4 h-4" />
                    Quét Ảnh Mã QR
                  </button>
                  <button
                    onClick={() => setActiveTab("manual")}
                    className={`flex-1 py-3 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all ${
                      activeTab === "manual"
                        ? "bg-white text-indigo-600 shadow-sm border border-slate-200/40"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <FiUserCheck className="w-4 h-4" />
                    Nhập Mã Thủ Công
                  </button>
                </div>

                <div className="p-6">
                  {activeTab === "qr" ? (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-800">
                          Tải Lên File Ảnh QR Sinh Viên
                        </h3>
                        <p className="text-xs text-slate-400">
                          Hệ thống hỗ trợ quét mã QR xuất ra từ thẻ sự kiện của sinh viên để xác thực.
                        </p>
                      </div>

                      <div 
                        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-8 bg-slate-50/50 transition-all group relative min-h-[180px] ${
                          statusInfo.code === "ongoing"
                            ? "border-slate-200 hover:border-indigo-400 hover:bg-slate-50 cursor-pointer"
                            : "border-slate-100 opacity-60 cursor-not-allowed"
                        }`}
                        onClick={() => {
                          if (statusInfo.code === "ongoing") {
                            fileInputRef.current?.click();
                          }
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={statusInfo.code !== "ongoing"}
                        />
                        <div className={`p-4 rounded-2xl mb-3 transition-colors ${
                          statusInfo.code === "ongoing"
                            ? "bg-indigo-50 text-indigo-500 group-hover:bg-indigo-100"
                            : "bg-slate-100 text-slate-300"
                        }`}>
                          <FiUpload className="w-6 h-6" />
                        </div>
                        <span className={`text-sm font-bold transition-colors ${
                          statusInfo.code === "ongoing"
                            ? "text-slate-700 group-hover:text-indigo-600"
                            : "text-slate-400"
                        }`}>
                          {statusInfo.code === "ongoing" ? "Kéo thả hoặc Click chọn ảnh QR" : "Cổng quét QR đã khóa"}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1.5">
                          Hỗ trợ định dạng PNG, JPG, JPEG
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-800">
                          Nhập Mã Số Sinh Viên Ghi Nhận
                        </h3>
                        <p className="text-xs text-slate-400">
                          Sử dụng khi sinh viên quên thẻ hoặc mã QR không thể giải mã trên thiết bị.
                        </p>
                      </div>

                      <form onSubmit={handleManualSubmit} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder={statusInfo.code === "ongoing" ? "Ví dụ: 23115053122116..." : "Giao dịch ghi tay đã đóng"}
                            value={manualStudentId}
                            onChange={(e) => setManualStudentId(e.target.value)}
                            disabled={statusInfo.code !== "ongoing"}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={loading || !manualStudentId.trim() || statusInfo.code !== "ongoing"}
                          className="px-6 py-3.5 bg-indigo-600 text-white rounded-2xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-md disabled:bg-slate-150 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <FiSend className="w-4 h-4" />
                          Xác Nhận
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Processing Indicator */}
              {loading && (
                <div className="bg-white rounded-3xl p-6 text-center border border-slate-150 shadow-sm flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Hệ thống đang lưu trữ dữ liệu điểm danh...</span>
                </div>
              )}

              {/* Redesigned Premium Live Result Card */}
              {result && !loading && (
                <div className={`rounded-3xl p-6 border shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-300 ${
                  result.status === "success" 
                    ? "bg-emerald-50/50 border-emerald-100" 
                    : result.status === "already"
                    ? "bg-amber-50/50 border-amber-100"
                    : "bg-rose-50/50 border-rose-100"
                }`}>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    
                    {/* User Avatar Representation (Male/Female/Default) */}
                    {result.status !== "error" && (
                      <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200/60 p-1 shrink-0 shadow-sm relative">
                        {result.anhDaiDien ? (
                          <img
                            src={result.anhDaiDien}
                            alt=""
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 font-extrabold text-xl">
                            {result.hoTen?.charAt(0)}
                          </div>
                        )}
                        {/* Little gender or status dot indicator */}
                        <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-extrabold ${
                          result.gioiTinh === "Nam" ? "bg-blue-500" : "bg-pink-500"
                        }`}>
                          {result.gioiTinh === "Nam" ? "M" : "F"}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h4 className={`text-base font-extrabold ${
                          result.status === "success" 
                            ? "text-emerald-950" 
                            : result.status === "already"
                            ? "text-amber-950"
                            : "text-rose-950"
                        }`}>
                          {result.status === "success" 
                            ? "Điểm Danh Thành Công" 
                            : result.status === "already"
                            ? "Trùng Lặp Dữ Liệu"
                            : "Lỗi Hệ Thống"}
                        </h4>
                        
                        <span className="text-[10px] text-slate-400 font-bold font-mono">
                          {result.time}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {result.message}
                      </p>
                      
                      {result.status === "success" && (
                        <div className="mt-3 pt-3 border-t border-dashed border-emerald-100 flex flex-wrap gap-2.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/50 px-2 py-0.5 rounded-lg">
                            <FiCheck className="w-3.5 h-3.5" /> Ghi nhận trạng thái
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100/50 px-2 py-0.5 rounded-lg">
                            <FiAward className="w-3.5 h-3.5 text-amber-600" /> Cộng +{result.diemRenLuyen} ĐRL
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-100/50 px-2 py-0.5 rounded-lg">
                            <FiSend className="w-3.5 h-3.5 text-indigo-600" /> Đã gửi thông báo
                          </span>
                        </div>
                      )}

                      {result.status !== "error" && (
                        <div className="mt-4 pt-3 border-t border-slate-200/40 grid grid-cols-2 gap-4 text-xs text-left">
                          <div>
                            <span className="text-slate-400 block mb-0.5">Sinh viên tham dự</span>
                            <span className="font-extrabold text-slate-800 flex items-center gap-1">
                              <FiUser className="w-3.5 h-3.5 text-slate-400" />
                              {result.hoTen}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">Mã số sinh viên</span>
                            <span className="font-mono font-extrabold text-slate-800 tracking-wider">
                              {result.maND}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Right Column: Registered Students Sidebar Registry */}
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 flex flex-col h-[650px] lg:col-span-1">
              
              {/* Card Header & Metrics */}
              <div className="pb-4 border-b border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiUsers className="text-indigo-600 w-5 h-5" />
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                      Sinh Viên Đăng Ký
                    </h3>
                  </div>
                  <button
                    onClick={() => selectedEventId && fetchParticipants(selectedEventId)}
                    disabled={participantsLoading}
                    className="p-1.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-indigo-600 transition-colors border border-slate-100"
                    title="Đồng bộ danh sách"
                  >
                    <FiRefreshCw className={`w-3.5 h-3.5 ${participantsLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Registry Dashboard Stats */}
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-50 border border-slate-150/60 rounded-xl py-2 px-1">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-tight mb-0.5">Đăng ký</span>
                      <span className="text-sm font-extrabold text-slate-800">{totalRegistered}</span>
                    </div>
                    <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-xl py-2 px-1">
                      <span className="text-[10px] text-emerald-600 block uppercase font-bold tracking-tight mb-0.5">Đã ĐD</span>
                      <span className="text-sm font-extrabold text-emerald-700">{totalAttended}</span>
                    </div>
                    <div className="bg-slate-100/70 border border-slate-200/60 rounded-xl py-2 px-1">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-tight mb-0.5">Vắng</span>
                      <span className="text-sm font-extrabold text-slate-600">{totalAbsent}</span>
                    </div>
                  </div>

                  {/* Percentage Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                      <span>TỶ LỆ THAM GIA</span>
                      <span className="text-indigo-600">{attendedPercentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                        style={{ width: `${attendedPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Navigation Search & Status Filter Tabs */}
                <div className="space-y-2">
                  <div className="relative">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm MSSV, Họ tên..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-semibold"
                    />
                  </div>

                  {/* Filter Sub-Tabs */}
                  <div className="flex gap-1 bg-slate-50 border border-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => setStatusFilter("all")}
                      className={`flex-1 py-1 px-2 text-[10px] font-extrabold rounded-lg uppercase tracking-wide transition-all ${
                        statusFilter === "all"
                          ? "bg-white text-indigo-600 shadow-sm border border-slate-200/20"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      Tất cả
                    </button>
                    <button
                      onClick={() => setStatusFilter("attended")}
                      className={`flex-1 py-1 px-2 text-[10px] font-extrabold rounded-lg uppercase tracking-wide transition-all ${
                        statusFilter === "attended"
                          ? "bg-white text-emerald-600 shadow-sm border border-slate-200/20"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      Đã ĐD
                    </button>
                    <button
                      onClick={() => setStatusFilter("absent")}
                      className={`flex-1 py-1 px-2 text-[10px] font-extrabold rounded-lg uppercase tracking-wide transition-all ${
                        statusFilter === "absent"
                          ? "bg-white text-slate-600 shadow-sm border border-slate-200/20"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      Vắng
                    </button>
                  </div>
                </div>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto pt-4 space-y-2 pr-1 scrollbar-thin">
                {participantsLoading ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                    <div className="w-6 h-6 border-2 border-slate-250 border-t-indigo-600 rounded-full animate-spin mb-2" />
                    <span className="text-xs">Đang nạp danh sách...</span>
                  </div>
                ) : filteredParticipants.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12 space-y-3">
                    <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center">
                      <FiUserX className="w-5 h-5 opacity-50" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-extrabold text-slate-600">
                        {searchTerm ? "Không có kết quả lọc" : "Danh sách trống"}
                      </p>
                      <p className="text-[10px] max-w-[180px] mx-auto text-slate-400 leading-relaxed">
                        {searchTerm ? "Vui lòng nhập từ khóa tìm kiếm hoặc đổi danh mục lọc." : "Sự kiện hiện tại chưa có thành viên đăng ký hợp lệ."}
                      </p>
                    </div>
                  </div>
                ) : (
                  filteredParticipants.map((p) => {
                    const isAttended = p.TrangThai === "da_diem_danh";
                    return (
                      <div
                        key={p.maND}
                        className={`p-3 rounded-2xl border transition-all hover:scale-[1.01] duration-200 ${
                          isAttended
                            ? "bg-emerald-50/20 border-emerald-100 hover:bg-emerald-50/40"
                            : "bg-white border-slate-200/50 hover:bg-slate-50/50"
                        } flex items-center justify-between gap-3`}
                      >
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <p className="font-extrabold text-slate-800 text-xs truncate">
                            {p.hoTen || "Không có tên"}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <span className="font-mono font-extrabold tracking-wider text-slate-500">{p.maND}</span>
                            {p.tenLop && (
                              <>
                                <span>•</span>
                                <span className="font-bold text-slate-400 truncate max-w-[80px]">{p.tenLop}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          {isAttended ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold px-2 py-1 rounded-xl text-[9px] uppercase tracking-wider">
                              Đã ĐD
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-400 border border-slate-200/60 font-bold px-2 py-1 rounded-xl text-[9px] uppercase tracking-wider">
                              Vắng
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
