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
  FiTrash2
} from "react-icons/fi";
import apiClient from "../../utils/apiClient";
import jsQR from "jsqr";

export default function QRAttendancePage() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [loading, setLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Manual Input State
  const [manualStudentId, setManualStudentId] = useState("");

  // Scan result state
  const [result, setResult] = useState(null);
  // List of recent check-ins for display
  const [recentCheckIns, setRecentCheckIns] = useState([]);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchApprovedEvents();
  }, []);

  const fetchApprovedEvents = async () => {
    try {
      setEventsLoading(true);
      setError(null);
      const response = await apiClient.get("/api/bcn/events");
      // Filter for approved events (KhoaDuyet & PhongCTSVDuyet are true / 1)
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
        time: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        }),
        status: data.data.alreadyAttended ? "already" : "success",
        message: data.message
      };

      setResult(newCheckIn);
      setRecentCheckIns((prev) => [newCheckIn, ...prev].slice(0, 10)); // Limit to last 10
      setManualStudentId("");
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
            // Found QR code, call backend
            handleAttendanceAPI({ qrValue: code.data });
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
    // Reset file input value so user can upload the same file again if needed
    e.target.value = "";
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!selectedEventId) {
      alert("Vui lòng chọn sự kiện trước khi điểm danh");
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

  const clearHistory = () => {
    if (window.confirm("Bạn có muốn xóa lịch sử điểm danh tạm thời này không?")) {
      setRecentCheckIns([]);
    }
  };

  const selectedEvent = events.find((e) => e.MaSK === selectedEventId);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl p-6 sm:p-8 shadow-xl text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Điểm Danh Sự Kiện
              </h1>
              <p className="text-indigo-100 text-sm mt-2 max-w-xl">
                Quét mã QR (tải lên file ảnh) hoặc nhập mã số sinh viên trực tiếp để ghi nhận điểm danh vào hệ thống.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/10 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-white">
                Bảng BCN Vận Hành
              </span>
            </div>
          </div>
        </div>

        {/* Loading State or Errors */}
        {eventsLoading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 text-sm font-medium">Đang tải danh sách sự kiện...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-center shadow-sm">
            <FiAlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
            <p className="text-slate-800 font-semibold mb-1">Không thể tải dữ liệu</p>
            <p className="text-rose-600 text-sm mb-4">{error}</p>
            <button
              onClick={fetchApprovedEvents}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
            <FiCalendar className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">Không tìm thấy sự kiện nào</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Hiện tại không có sự kiện nào đã được duyệt hoặc đang diễn ra để thực hiện điểm danh.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Side: Setup & Input */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Event Selector Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                    Bước 1: Chọn Sự Kiện Cần Điểm Danh
                  </label>
                  <select
                    value={selectedEventId}
                    onChange={(e) => {
                      setSelectedEventId(e.target.value);
                      setResult(null);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all cursor-pointer"
                  >
                    {events.map((e) => (
                      <option key={e.MaSK} value={e.MaSK}>
                        {e.TenSK} ({new Date(e.ThoiGianBatDau).toLocaleDateString("vi-VN")})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedEvent && (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
                    <div className="space-y-2">
                      <p className="flex items-center gap-2">
                        <FiCalendar className="text-indigo-600 w-4 h-4 shrink-0" />
                        <span className="font-semibold text-slate-700">Bắt đầu:</span>{" "}
                        {new Date(selectedEvent.ThoiGianBatDau).toLocaleString("vi-VN")}
                      </p>
                      <p className="flex items-center gap-2">
                        <FiClock className="text-indigo-600 w-4 h-4 shrink-0" />
                        <span className="font-semibold text-slate-700">Kết thúc:</span>{" "}
                        {new Date(selectedEvent.ThoiGianKetThuc).toLocaleString("vi-VN")}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="flex items-center gap-2">
                        <FiCheckCircle className="text-indigo-600 w-4 h-4 shrink-0" />
                        <span className="font-semibold text-slate-700">Địa điểm:</span>{" "}
                        {selectedEvent.DiaDiem || "N/A"}
                      </p>
                      <p className="flex items-center gap-2">
                        <FiPlusCircle className="text-indigo-600 w-4 h-4 shrink-0" />
                        <span className="font-semibold text-slate-700">Điểm cộng:</span>{" "}
                        <span className="font-bold text-amber-600">+{selectedEvent.DiemRenLuyen} điểm hoạt động</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Check-In Methods */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* File Upload QR Check-In */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Cách 1: Tải Ảnh QR
                    </h3>
                    <p className="text-xs text-slate-400">
                      Tải lên file ảnh chứa mã QR điểm danh của sinh viên để giải mã trực tiếp.
                    </p>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-2xl p-6 bg-slate-50 cursor-pointer transition-colors group relative"
                       onClick={() => fileInputRef.current?.click()}>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <FiUpload className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 transition-colors mb-2" />
                    <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">
                      Chọn tệp ảnh QR
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">
                      PNG, JPG, JPEG
                    </span>
                  </div>
                </div>

                {/* Manual Check-In */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Cách 2: Nhập Thủ Công
                    </h3>
                    <p className="text-xs text-slate-400">
                      Nhập mã số sinh viên trực tiếp để điểm danh trong trường hợp không quét được QR.
                    </p>
                  </div>

                  <form onSubmit={handleManualSubmit} className="space-y-3">
                    <div className="relative">
                      <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Nhập mã số sinh viên..."
                        value={manualStudentId}
                        onChange={(e) => setManualStudentId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !manualStudentId.trim()}
                      className="w-full bg-indigo-600 text-white rounded-xl py-2.5 text-xs font-bold hover:bg-indigo-700 transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                      Xác Nhận Điểm Danh
                    </button>
                  </form>
                </div>

              </div>

              {/* Status Indicator Card */}
              {loading && (
                <div className="bg-white rounded-3xl p-6 text-center border border-slate-200 shadow-sm flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                  <span className="text-sm font-semibold text-slate-600">Đang xử lý điểm danh...</span>
                </div>
              )}

              {result && !loading && (
                <div className={`rounded-3xl p-6 border shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                  result.status === "success" 
                    ? "bg-emerald-50 border-emerald-200" 
                    : result.status === "already"
                    ? "bg-amber-50 border-amber-200"
                    : "bg-rose-50 border-rose-200"
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-2xl shrink-0 ${
                      result.status === "success" 
                        ? "bg-emerald-100 text-emerald-600" 
                        : result.status === "already"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-rose-100 text-rose-600"
                    }`}>
                      {result.status === "success" ? (
                        <FiCheckCircle className="w-6 h-6" />
                      ) : (
                        <FiAlertCircle className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className={`text-sm font-extrabold ${
                        result.status === "success" 
                          ? "text-emerald-900" 
                          : result.status === "already"
                          ? "text-amber-900"
                          : "text-rose-900"
                      }`}>
                        {result.status === "success" 
                          ? "Điểm Danh Thành Công!" 
                          : result.status === "already"
                          ? "Đã Điểm Danh Trước Đó"
                          : "Lỗi Điểm Danh"}
                      </h4>
                      <p className="text-xs text-slate-600 font-medium">
                        {result.message}
                      </p>
                      
                      {result.status !== "error" && (
                        <div className="mt-4 pt-4 border-t border-dashed border-slate-200 grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-slate-400 block mb-0.5">Sinh viên</span>
                            <span className="font-bold text-slate-800 flex items-center gap-1">
                              <FiUser className="w-3.5 h-3.5 text-slate-400" />
                              {result.hoTen}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">Mã số sinh viên</span>
                            <span className="font-mono font-bold text-slate-800 tracking-wider">
                              {result.maND}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {result.time}
                    </span>
                  </div>
                </div>
              )}

            </div>

            {/* Right Side: Recent Check-in Logs */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col h-[520px]">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FiClock className="text-indigo-600 w-5 h-5" />
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                    Nhật Ký Điểm Danh
                  </h3>
                </div>
                {recentCheckIns.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Xóa lịch sử"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto pt-4 space-y-3 pr-1 scrollbar-thin">
                {recentCheckIns.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-4 space-y-2">
                    <FiClock className="w-8 h-8 opacity-40" />
                    <p className="text-xs font-semibold">Chưa có lượt điểm danh nào</p>
                    <p className="text-[10px] max-w-[180px] mx-auto">
                      Các sinh viên được quét thành công sẽ hiển thị lịch sử check-in thời gian thực tại đây.
                    </p>
                  </div>
                ) : (
                  recentCheckIns.map((log) => (
                    <div
                      key={log.id}
                      className={`p-3 rounded-2xl border text-xs transition-all animate-in fade-in duration-300 ${
                        log.status === "success"
                          ? "bg-emerald-50/50 border-emerald-100 text-emerald-800"
                          : log.status === "already"
                          ? "bg-amber-50/50 border-amber-100 text-amber-800"
                          : "bg-rose-50/50 border-rose-100 text-rose-800"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono font-bold tracking-wider">{log.maND || "N/A"}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{log.time}</span>
                      </div>
                      <p className="font-extrabold text-slate-800 truncate mb-1">
                        {log.hoTen || "Không rõ tên"}
                      </p>
                      <p className="text-[10px] text-slate-500 line-clamp-1">
                        {log.status === "success"
                          ? "✓ Điểm danh thành công"
                          : log.status === "already"
                          ? "⚠ Đã điểm danh trước đó"
                          : `✗ Thất bại: ${log.message}`}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
