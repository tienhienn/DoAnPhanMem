import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import {
  Users,
  Calendar,
  Flag,
  Info,
  UserPlus,
  CheckCircle,
  Clock,
  ChevronLeft,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import EventCard from "../components/events/EventCard";

export default function ClubDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enterManagementMode } = useAuth();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joinStatus, setJoinStatus] = useState(null); // 'none', 'pending', 'joined'
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinReason, setJoinReason] = useState("");
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [userClubRole, setUserClubRole] = useState(null);
  const [leaveError, setLeaveError] = useState(null);
  const [clubEvents, setClubEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  useEffect(() => {
    fetchClubDetails();
  }, [id]);

  const fetchClubDetails = async () => {
    try {
      setLoading(true);
      setEventsLoading(true);

      const [clubRes, myClubsRes, requestsRes, eventsRes] = await Promise.all([
        apiClient.get(`/api/clubs/${id}`),
        apiClient.get("/api/students/me/clubs"),
        apiClient.get("/api/students/me/club-requests"),
        apiClient.get("/api/events", { params: { clubId: id } }),
      ]);

      const clubData = clubRes.data;
      const myClubsData = myClubsRes.data;
      const requestsData = requestsRes.data;

      if (eventsRes.data.success) {
        setClubEvents(eventsRes.data.data || []);
      }

      if (clubData.success) {
        setClub(clubData.data);

        // Determine join status
        const myClubInfo = myClubsData.success
          ? myClubsData.data.find((c) => c.MaCLB === id)
          : null;
        if (myClubInfo) {
          setJoinStatus("joined");
          setUserClubRole(myClubInfo.VaiTroCLB);
        } else if (requestsData.success) {
          const pendingReq = requestsData.data.find(
            (req) => req.MaCLB === id && req.TrangThai === "cho_duyet",
          );
          if (pendingReq) setJoinStatus("pending");
          else setJoinStatus("none");
          setUserClubRole(null);
        } else {
          setJoinStatus("none");
          setUserClubRole(null);
        }
      } else {
        setError(clubData.error?.message || "Không tìm thấy CLB");
      }
    } catch (err) {
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
      setEventsLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post(`/api/clubs/${id}/join`, {
        lyDoThamGia: joinReason,
      });
      const result = response.data;

      if (result.success) {
        setShowJoinModal(false);
        setJoinStatus("pending");
        alert(result.message);
      } else {
        alert(result.message || "Có lỗi xảy ra");
      }
    } catch (err) {
      alert(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          "Lỗi kết nối server",
      );
    }
  };

  const handleLeaveClub = async () => {
    try {
      setLeaveLoading(true);
      setLeaveError(null);
      const response = await apiClient.post(`/api/clubs/${id}/leave`);
      if (response.data.success) {
        setShowLeaveModal(false);
        fetchClubDetails();
      } else {
        setLeaveError(response.data.message || "Có lỗi xảy ra khi rời CLB");
      }
    } catch (err) {
      setLeaveError(
        err.response?.data?.message ||
          err.response?.data?.error?.message ||
          "Không thể rời câu lạc bộ",
      );
    } finally {
      setLeaveLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
  if (!club) return null;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <Link
        to="/clubs"
        className="inline-flex items-center text-gray-500 hover:text-indigo-600 transition-colors font-medium text-sm mb-2"
      >
        <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại danh sách
      </Link>

      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
        {/* Cover */}
        <div className="h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative"></div>

        <div className="px-6 md:px-10 pb-10">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 md:-mt-20 relative z-10 mb-8">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-3xl p-1.5 shadow-md">
              <div className="w-full h-full bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-5xl">
                {club.Logo ? (
                  <img
                    src={club.Logo}
                    alt=""
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  club.TenCLB.charAt(0)
                )}
              </div>
            </div>

            <div className="flex-1 space-y-2 mb-2">
              <h1 className="text-3xl font-extrabold text-gray-900">
                {club.TenCLB}
              </h1>
              {club.TenTiengAnh && (
                <p className="text-gray-500 font-medium text-base -mt-1">
                  {club.TenTiengAnh} {club.TenVietTat && `(${club.TenVietTat})`}
                </p>
              )}
              {club.Slogan && (
                <p className="italic text-indigo-600 font-medium text-sm">
                  "{club.Slogan}"
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-sm mt-2">
                <span className="bg-indigo-50 text-indigo-600 font-semibold px-3 py-1 rounded-lg">
                  {club.LinhVuc || "Khác"}
                </span>
                <span className="flex items-center gap-1 text-gray-500 font-medium bg-gray-50 px-3 py-1 rounded-lg">
                  <Users className="w-4 h-4" /> {club.SoThanhVienHienTai}/
                  {club.SoThanhVienToiDa} Thành viên
                </span>
              </div>
            </div>

            <div className="w-full md:w-auto mb-2 text-center">
              {joinStatus === "joined" ? (
                <div className="flex flex-col gap-2">
                  <button
                    disabled
                    className="w-full md:w-auto px-6 py-3 bg-green-50 text-green-600 font-bold rounded-xl flex items-center justify-center gap-2 border border-green-200"
                  >
                    <CheckCircle className="w-5 h-5" /> Đã tham gia
                  </button>
                  {userClubRole === "Chủ nhiệm" && (
                    <button
                      onClick={() => {
                        enterManagementMode(id);
                        navigate("/bcn-management");
                      }}
                      className="w-full md:w-auto px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all transform hover:scale-[1.02]"
                    >
                      Quản lý CLB
                    </button>
                  )}
                  {userClubRole === "Chủ nhiệm" ? (
                    <span className="text-xs text-red-500 font-semibold max-w-[200px] inline-block text-center mt-1">
                      ⚠️ Chủ nhiệm không thể rời CLB
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setLeaveError(null);
                        setShowLeaveModal(true);
                      }}
                      className="w-full md:w-auto px-6 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl flex items-center justify-center gap-2 border border-red-200 transition-colors text-sm"
                    >
                      Rời câu lạc bộ
                    </button>
                  )}
                </div>
              ) : joinStatus === "pending" ? (
                <button
                  disabled
                  className="w-full md:w-auto px-6 py-3 bg-amber-50 text-amber-600 font-bold rounded-xl flex items-center justify-center gap-2 border border-amber-200"
                >
                  <Clock className="w-5 h-5" /> Đang chờ duyệt
                </button>
              ) : (
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all transform hover:scale-105"
                >
                  <UserPlus className="w-5 h-5" /> Tham gia CLB
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-indigo-500" /> Giới thiệu khái
                  quát
                </h2>
                <div className="prose prose-indigo text-gray-600 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  {club.MoTa ? (
                    club.MoTa.split("\n").map((line, i) => (
                      <p key={i}>{line}</p>
                    ))
                  ) : (
                    <p className="italic text-gray-400">
                      Chưa có thông tin giới thiệu.
                    </p>
                  )}
                </div>
              </section>

              {club.TonChiMucDich && (
                <section>
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Flag className="w-5 h-5 text-indigo-500" /> Tôn chỉ & Mục
                    đích hoạt động
                  </h2>
                  <div className="prose prose-indigo text-gray-600 bg-gray-50 p-6 rounded-2xl border border-gray-100 whitespace-pre-line">
                    {club.TonChiMucDich}
                  </div>
                </section>
              )}

              {club.PhamViHoatDong && (
                <section>
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-500" /> Lĩnh vực &
                    Phạm vi hoạt động
                  </h2>
                  <div className="prose prose-indigo text-gray-600 bg-gray-50 p-6 rounded-2xl border border-gray-100 whitespace-pre-line">
                    {club.PhamViHoatDong}
                  </div>
                </section>
              )}

              {club.QuyenLoiTrachNhiem && (
                <section>
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-indigo-500" /> Quyền
                    lợi & Trách nhiệm thành viên
                  </h2>
                  <div className="prose prose-indigo text-gray-600 bg-gray-50 p-6 rounded-2xl border border-gray-100 whitespace-pre-line">
                    {club.QuyenLoiTrachNhiem}
                  </div>
                </section>
              )}

              {/* Club Events Section */}
              <section className="pt-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-500" /> Sự kiện của câu lạc bộ
                </h2>
                {eventsLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                  </div>
                ) : clubEvents.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-100 text-gray-400 text-sm font-medium">
                    Hiện chưa có sự kiện sắp diễn ra nào.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {clubEvents.map((event) => (
                      <EventCard
                        key={event.maSK.trim()}
                        event={{
                          ...event,
                          name: event.tenSK,
                          clubName: event.tenCLB,
                          startDateTime: event.thoiGianBatDau,
                          endDateTime: event.thoiGianKetThuc,
                          location: event.diaDiem,
                          maxCapacity: event.soNguoiToiDa,
                          registeredCount: event.soNguoiDaDangKy,
                          imageUrl: event.urlAnh,
                          diemRenLuyen: event.diemRenLuyen,
                        }}
                        registrationStatus="unregistered"
                        onClick={() => {
                          navigate(`/events/${event.maSK.trim()}`);
                        }}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Thông tin chung
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-sm">
                    <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
                    <div>
                      <p className="text-gray-500 font-medium mb-0.5">
                        Ngày thành lập
                      </p>
                      <p className="text-gray-800 font-semibold">
                        {new Date(club.NgayThanhLap).toLocaleDateString(
                          "vi-VN",
                        )}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <Flag className="w-5 h-5 text-gray-400 shrink-0" />
                    <div>
                      <p className="text-gray-500 font-medium mb-0.5">
                        Trạng thái
                      </p>
                      <p className="text-green-600 font-semibold">
                        {club.TrangThai}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <Users className="w-5 h-5 text-gray-400 shrink-0" />
                    <div>
                      <p className="text-gray-500 font-medium mb-0.5">
                        Chủ nhiệm
                      </p>
                      <p className="text-gray-800 font-semibold">
                        {club.TenChuNhiem || "Chưa cập nhật"}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">
                Đăng ký tham gia
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Gửi yêu cầu tới {club.TenCLB}
              </p>
            </div>
            <form onSubmit={handleJoin} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do tham gia <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={joinReason}
                  onChange={(e) => setJoinReason(e.target.value)}
                  placeholder="Hãy chia sẻ lý do bạn muốn tham gia CLB này..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                ></textarea>
                <p className="text-xs text-gray-500 mt-2">
                  Ban chủ nhiệm sẽ xem xét dựa trên lý do của bạn.
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Gửi yêu cầu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 bg-red-50">
              <h2 className="text-xl font-bold text-red-800">Rời câu lạc bộ</h2>
              <p className="text-sm text-red-500 mt-1">
                Xác nhận rời khỏi {club.TenCLB}
              </p>
            </div>
            <div className="p-6">
              {leaveError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
                  {leaveError}
                </div>
              )}
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Bạn có chắc chắn muốn rời câu lạc bộ **{club.TenCLB}**? Hành
                động này sẽ hủy bỏ tư cách thành viên hiện tại của bạn.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  disabled={leaveLoading}
                  onClick={() => setShowLeaveModal(false)}
                  className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={leaveLoading}
                  onClick={handleLeaveClub}
                  className="px-5 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors shadow-sm"
                >
                  {leaveLoading ? "Đang thực hiện..." : "Xác nhận rời"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
