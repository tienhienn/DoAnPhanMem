// /**
//  * EventManagementPage - Quản lý sự kiện theo phân quyền
//  *
//  * Role mapping (từ JWT):
//  * - BCN  → Tạo/Sửa/Xóa/Nộp sự kiện của CLB
//  * - KHOA → Duyệt/Từ chối sự kiện ở bước pending_faculty
//  * - CTSV → Duyệt/Từ chối sự kiện ở bước pending_student_affairs
//  *
//  * Trang này chỉ được truy cập bởi BCN, KHOA, CTSV (xem App.jsx).
//  * Không có màn hình đăng nhập riêng — dùng AuthContext.
//  */

// import { useState } from "react";
// import {
//   FiPlus,
//   FiX,
//   FiEdit2,
//   FiTrash2,
//   FiCheck,
//   FiAlertCircle,
// } from "react-icons/fi";
// import { useAuth } from "../context/AuthContext";
// import EventFormModal from "../components/events/EventFormModal";

// // ============================================
// // MOCK DATA (sẽ thay bằng API call thực)
// // ============================================
// const MOCK_EVENTS = [
//   {
//     id: 1,
//     name: "Hội thảo Python Advanced",
//     startTime: "2026-05-15 09:00",
//     endTime: "2026-05-15 11:30",
//     location: "Phòng A101, Tòa A",
//     quota: 100,
//     points: 1.5,
//     description: "Hội thảo nâng cao về Python, xử lý dữ liệu và Web Development.",
//     status: "draft",
//     createdBy: "Ban chủ nhiệm",
//     feedback: "",
//   },
//   {
//     id: 2,
//     name: "Hackathon Innovation 2026",
//     startTime: "2026-05-20 08:00",
//     endTime: "2026-05-21 17:00",
//     location: "Sân vận động trường",
//     quota: 200,
//     points: 3.0,
//     description: "Cuộc thi hackathon quy mô lớn, hỗ trợ startup khởi nghiệp.",
//     status: "pending_faculty",
//     createdBy: "Ban chủ nhiệm",
//     feedback: "",
//   },
//   {
//     id: 3,
//     name: "Buổi tư vấn Du học Úc",
//     startTime: "2026-05-22 14:00",
//     endTime: "2026-05-22 16:00",
//     location: "Phòng hội trường B",
//     quota: 150,
//     points: 0.5,
//     description: "Tư vấn chi tiết về chương trình du học tại các trường Đại học Úc hàng đầu.",
//     status: "pending_student_affairs",
//     createdBy: "Ban chủ nhiệm",
//     feedback: "",
//   },
//   {
//     id: 4,
//     name: "Lễ tuyên dương Sinh viên Xuất sắc 2025",
//     startTime: "2026-05-25 19:00",
//     endTime: "2026-05-25 21:00",
//     location: "Nhà văn hóa sinh viên",
//     quota: 300,
//     points: 2.0,
//     description: "Lễ tuyên dương và khen thưởng các sinh viên có thành tích xuất sắc trong năm học.",
//     status: "approved",
//     createdBy: "Ban chủ nhiệm",
//     feedback: "Sự kiện hay, ủng hộ",
//   },
//   {
//     id: 5,
//     name: "Roadshow Tuyển dụng Công ty X",
//     startTime: "2026-05-28 10:00",
//     endTime: "2026-05-28 12:00",
//     location: "Phòng C205",
//     quota: 80,
//     points: 1.0,
//     description: "Công ty X tuyển dụng các sinh viên ngành Công Nghệ Thông Tin.",
//     status: "rejected",
//     createdBy: "Ban chủ nhiệm",
//     feedback: "Sự kiện chưa đủ thông tin chi tiết. Vui lòng cập nhật lại nội dung trước khi nộp.",
//   },
// ];

// // ============================================
// // STATUS BADGE
// // ============================================
// const STATUS_CONFIG = {
//   draft: { label: "Bản nháp", bg: "bg-slate-100", text: "text-slate-700" },
//   pending_faculty: { label: "Chờ Khoa duyệt", bg: "bg-amber-100", text: "text-amber-700" },
//   pending_student_affairs: { label: "Chờ CTSV duyệt", bg: "bg-blue-100", text: "text-blue-700" },
//   approved: { label: "Đã duyệt", bg: "bg-emerald-100", text: "text-emerald-700" },
//   rejected: { label: "Bị từ chối", bg: "bg-rose-100", text: "text-rose-700" },
// };

// const StatusBadge = ({ status }) => {
//   const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
//   return (
//     <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
//       {config.label}
//     </span>
//   );
// };

// // ============================================
// // APPROVAL STEPPER
// // ============================================
// const ApprovalStepper = ({ status }) => {
//   const steps = [
//     { key: "draft", label: "Tạo mới" },
//     { key: "pending_faculty", label: "Khoa duyệt" },
//     { key: "pending_student_affairs", label: "CTSV duyệt" },
//     { key: "approved", label: "Hoàn tất" },
//   ];
//   const statusOrder = ["draft", "pending_faculty", "pending_student_affairs", "approved", "rejected"];
//   const currentIndex = statusOrder.indexOf(status);

//   return (
//     <div className="py-4">
//       <div className="flex items-center gap-2">
//         {steps.map((step, idx) => (
//           <div key={step.key} className="flex items-center">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
//               idx <= currentIndex ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
//             }`}>
//               {idx + 1}
//             </div>
//             <span className={`ml-2 text-xs font-medium ${idx <= currentIndex ? "text-blue-600" : "text-slate-500"}`}>
//               {step.label}
//             </span>
//             {idx < steps.length - 1 && (
//               <div className={`mx-3 flex-1 h-1 transition-all ${idx < currentIndex ? "bg-blue-600" : "bg-slate-200"}`} />
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// // ============================================
// // APPROVAL MODAL
// // ============================================
// const ApprovalModal = ({ isOpen, event, userRole, onClose, onApprove, onReject }) => {
//   const [reason, setReason] = useState("");

//   const isReadOnly =
//     userRole === "BCN" ||
//     !["pending_faculty", "pending_student_affairs"].includes(event?.status);

//   const canApprove =
//     (userRole === "KHOA" && event?.status === "pending_faculty") ||
//     (userRole === "CTSV" && event?.status === "pending_student_affairs");

//   const handleApprove = () => {
//     onApprove(event.id, reason);
//     setReason("");
//   };

//   const handleReject = () => {
//     if (!reason.trim()) {
//       alert("Vui lòng nhập lý do từ chối");
//       return;
//     }
//     onReject(event.id, reason);
//     setReason("");
//   };

//   if (!isOpen || !event) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center">
//       <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
//       <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
//         {/* Header */}
//         <div className={`sticky top-0 bg-gradient-to-r ${isReadOnly ? "from-slate-600 to-slate-500" : "from-blue-600 to-blue-500"} px-8 py-6 flex items-center justify-between rounded-t-2xl`}>
//           <h2 className="text-xl font-bold text-white">
//             {isReadOnly ? "Chi tiết Sự kiện" : "Phê duyệt Sự kiện"}
//           </h2>
//           <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${isReadOnly ? "hover:bg-slate-700" : "hover:bg-blue-700"}`}>
//             <FiX className="w-5 h-5 text-white" />
//           </button>
//         </div>

//         {/* Content */}
//         <div className="p-8 space-y-6">
//           <div className="bg-slate-50 rounded-xl p-6 space-y-4">
//             <div>
//               <h3 className="text-sm font-semibold text-slate-500 uppercase mb-1">Tên sự kiện</h3>
//               <p className="text-lg font-bold text-slate-800">{event.name}</p>
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <h4 className="text-sm font-semibold text-slate-500 uppercase mb-1">Thời gian</h4>
//                 <p className="text-slate-700">{event.startTime}</p>
//               </div>
//               <div>
//                 <h4 className="text-sm font-semibold text-slate-500 uppercase mb-1">Địa điểm</h4>
//                 <p className="text-slate-700">{event.location}</p>
//               </div>
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <h4 className="text-sm font-semibold text-slate-500 uppercase mb-1">Chỉ tiêu SV</h4>
//                 <p className="text-slate-700">{event.quota} sinh viên</p>
//               </div>
//               <div>
//                 <h4 className="text-sm font-semibold text-slate-500 uppercase mb-1">Điểm rèn luyện</h4>
//                 <p className="text-slate-700">{event.points} điểm</p>
//               </div>
//             </div>
//             <div>
//               <h4 className="text-sm font-semibold text-slate-500 uppercase mb-1">Mô tả</h4>
//               <p className="text-slate-700">{event.description}</p>
//             </div>
//           </div>

//           <div className="bg-blue-50 rounded-xl p-6">
//             <h3 className="text-sm font-semibold text-slate-800 mb-4">Tiến trình phê duyệt</h3>
//             <ApprovalStepper status={event.status} />
//           </div>

//           <div>
//             <label className="block text-sm font-semibold text-slate-800 mb-2">
//               {event.status === "rejected" ? "Lý do từ chối" : isReadOnly ? "Ghi chú" : "Lý do phê duyệt / từ chối"}
//             </label>
//             {isReadOnly ? (
//               <div className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-700">
//                 {event.feedback || "Không có ghi chú"}
//               </div>
//             ) : (
//               <textarea
//                 value={reason}
//                 onChange={(e) => setReason(e.target.value)}
//                 placeholder="Nhập lý do hoặc ghi chú của bạn"
//                 rows="4"
//                 className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none"
//               />
//             )}
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="border-t border-slate-200 bg-slate-50 px-8 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
//           <button onClick={onClose} className="px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-all">
//             Đóng
//           </button>
//           {!isReadOnly && canApprove && (
//             <>
//               <button onClick={handleReject} className="px-6 py-2 bg-rose-500 text-white font-medium rounded-lg hover:bg-rose-600 transition-all shadow-sm">
//                 Từ chối
//               </button>
//               <button onClick={handleApprove} className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-all shadow-sm">
//                 Phê duyệt
//               </button>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // ============================================
// // MAIN COMPONENT
// // ============================================
// export default function EventManagementPage() {
//   // Lấy role từ AuthContext — không cần màn hình đăng nhập riêng
//   const { user } = useAuth();
//   const currentUserRole = user?.role; // 'BCN' | 'KHOA' | 'CTSV'

//   const [events, setEvents] = useState(MOCK_EVENTS);
//   const [activeTab, setActiveTab] = useState("all");
//   const [isFormOpen, setIsFormOpen] = useState(false);
//   const [isApprovalOpen, setIsApprovalOpen] = useState(false);
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [editingEvent, setEditingEvent] = useState(null);

//   // ============================================
//   // TABS THEO ROLE
//   // ============================================
//   const getTabsForRole = () => {
//     if (currentUserRole === "BCN") {
//       return [
//         { key: "all", label: "Tất cả" },
//         { key: "draft", label: "Bản nháp" },
//         { key: "pending_faculty", label: "Chờ Khoa duyệt" },
//         { key: "pending_student_affairs", label: "Chờ CTSV duyệt" },
//         { key: "approved", label: "Đã duyệt" },
//         { key: "rejected", label: "Bị từ chối" },
//       ];
//     }
//     if (currentUserRole === "KHOA") {
//       return [{ key: "pending_faculty", label: "Chờ duyệt" }];
//     }
//     // CTSV
//     return [{ key: "pending_student_affairs", label: "Chờ duyệt" }];
//   };

//   const tabs = getTabsForRole();

//   // ============================================
//   // LỌC SỰ KIỆN THEO ROLE + TAB
//   // ============================================
//   const getFilteredEvents = () => {
//     let filtered = events;

//     if (currentUserRole === "KHOA") {
//       filtered = events.filter((e) => e.status === "pending_faculty");
//     } else if (currentUserRole === "CTSV") {
//       filtered = events.filter((e) => e.status === "pending_student_affairs");
//     }

//     if (activeTab !== "all") {
//       filtered = filtered.filter((e) => e.status === activeTab);
//     }

//     return filtered;
//   };

//   const filteredEvents = getFilteredEvents();

//   // ============================================
//   // HANDLERS
//   // ============================================
//   const handleCreateEvent = () => {
//     setEditingEvent(null);
//     setIsFormOpen(true);
//   };

//   const handleEditEvent = (event) => {
//     if (!["draft", "rejected"].includes(event.status)) {
//       alert("Chỉ có thể sửa sự kiện ở trạng thái Bản nháp hoặc Bị từ chối");
//       return;
//     }
//     setEditingEvent(event);
//     setIsFormOpen(true);
//   };

//   const handleDeleteEvent = (id) => {
//     const event = events.find((e) => e.id === id);
//     if (!["draft", "rejected"].includes(event?.status)) {
//       alert("Chỉ có thể xóa sự kiện ở trạng thái Bản nháp hoặc Bị từ chối");
//       return;
//     }
//     if (window.confirm("Bạn chắc chắn muốn xóa sự kiện này?")) {
//       setEvents((prev) => prev.filter((e) => e.id !== id));
//     }
//   };

//   const handleSaveEvent = (formData, action) => {
//     if (editingEvent) {
//       setEvents((prev) =>
//         prev.map((e) =>
//           e.id === editingEvent.id
//             ? { ...e, ...formData, status: action === "submit" ? "pending_faculty" : "draft" }
//             : e
//         )
//       );
//     } else {
//       const newEvent = {
//         id: Math.max(...events.map((e) => e.id), 0) + 1,
//         ...formData,
//         status: action === "submit" ? "pending_faculty" : "draft",
//         createdBy: user?.hoTen || "Ban chủ nhiệm",
//         feedback: "",
//       };
//       setEvents((prev) => [newEvent, ...prev]);
//     }
//     setIsFormOpen(false);
//     setEditingEvent(null);
//   };

//   const handleApproveEvent = (id, feedback) => {
//     setEvents((prev) =>
//       prev.map((e) =>
//         e.id === id
//           ? {
//               ...e,
//               status: e.status === "pending_faculty" ? "pending_student_affairs" : "approved",
//               feedback,
//             }
//           : e
//       )
//     );
//     setIsApprovalOpen(false);
//     setSelectedEvent(null);
//   };

//   const handleRejectEvent = (id, reason) => {
//     setEvents((prev) =>
//       prev.map((e) => (e.id === id ? { ...e, status: "rejected", feedback: reason } : e))
//     );
//     setIsApprovalOpen(false);
//     setSelectedEvent(null);
//   };

//   const canApproveEvent = (event) => {
//     if (currentUserRole === "KHOA") return event.status === "pending_faculty";
//     if (currentUserRole === "CTSV") return event.status === "pending_student_affairs";
//     return false;
//   };

//   // ============================================
//   // RENDER
//   // ============================================
//   const roleDescriptions = {
//     BCN: "Tạo, sửa và quản lý sự kiện của CLB",
//     KHOA: "Phê duyệt sự kiện từ Ban Chủ Nhiệm",
//     CTSV: "Phê duyệt sự kiện từ Khoa/Phòng Ban",
//   };

//   return (
//     <div className="min-h-screen bg-slate-50">
//       <div className="p-8">
//         <div className="max-w-7xl mx-auto space-y-8">
//           {/* Header */}
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-3xl font-bold text-slate-800">Quản lý Sự kiện</h1>
//               <p className="text-slate-500 mt-1">{roleDescriptions[currentUserRole]}</p>
//             </div>
//             {currentUserRole === "BCN" && (
//               <button
//                 onClick={handleCreateEvent}
//                 className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
//               >
//                 <FiPlus className="w-5 h-5" />
//                 Tạo sự kiện mới
//               </button>
//             )}
//           </div>

//           {/* Filter Tabs */}
//           <div className="flex gap-3 flex-wrap">
//             {tabs.map((tab) => (
//               <button
//                 key={tab.key}
//                 onClick={() => setActiveTab(tab.key)}
//                 className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
//                   activeTab === tab.key
//                     ? "bg-blue-100 text-blue-700 shadow-sm"
//                     : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
//                 }`}
//               >
//                 {tab.label}
//               </button>
//             ))}
//           </div>

//           {/* Events Table */}
//           <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
//             <div className="grid grid-cols-7 gap-4 bg-slate-50 px-6 py-4 border-b border-slate-200">
//               {["Tên sự kiện", "Thời gian", "Địa điểm", "Chỉ tiêu", "Điểm", "Trạng thái", "Hành động"].map((h) => (
//                 <div key={h} className="text-xs font-bold text-slate-500 uppercase">{h}</div>
//               ))}
//             </div>

//             {filteredEvents.length > 0 ? (
//               <div className="divide-y divide-slate-200">
//                 {filteredEvents.map((event) => (
//                   <div key={event.id} className="grid grid-cols-7 gap-4 px-6 py-4 hover:bg-blue-50 transition-colors">
//                     <div className="font-semibold text-slate-800 truncate">{event.name}</div>
//                     <div className="text-sm text-slate-600">{event.startTime}</div>
//                     <div className="text-sm text-slate-600 truncate">{event.location}</div>
//                     <div className="text-sm text-slate-600">{event.quota}</div>
//                     <div className="text-sm text-slate-600">{event.points}</div>
//                     <div className="flex items-center">
//                       <StatusBadge status={event.status} />
//                     </div>
//                     <div className="flex items-center gap-2">
//                       {/* Sửa — chỉ BCN, chỉ draft/rejected */}
//                       {currentUserRole === "BCN" && ["draft", "rejected"].includes(event.status) && (
//                         <button
//                           onClick={() => handleEditEvent(event)}
//                           className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
//                           title="Sửa"
//                         >
//                           <FiEdit2 className="w-4 h-4" />
//                         </button>
//                       )}

//                       {/* Phê duyệt — KHOA/CTSV */}
//                       {canApproveEvent(event) && (
//                         <button
//                           onClick={() => { setSelectedEvent(event); setIsApprovalOpen(true); }}
//                           className="p-2 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors"
//                           title="Phê duyệt"
//                         >
//                           <FiCheck className="w-4 h-4" />
//                         </button>
//                       )}

//                       {/* Xem chi tiết — approved/rejected */}
//                       {["approved", "rejected"].includes(event.status) && (
//                         <button
//                           onClick={() => { setSelectedEvent(event); setIsApprovalOpen(true); }}
//                           className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
//                           title="Xem chi tiết"
//                         >
//                           <FiAlertCircle className="w-4 h-4" />
//                         </button>
//                       )}

//                       {/* Xóa — chỉ BCN, chỉ draft/rejected */}
//                       {currentUserRole === "BCN" && ["draft", "rejected"].includes(event.status) && (
//                         <button
//                           onClick={() => handleDeleteEvent(event.id)}
//                           className="p-2 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
//                           title="Xóa"
//                         >
//                           <FiTrash2 className="w-4 h-4" />
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="px-6 py-12 text-center text-slate-500">
//                 Không có sự kiện nào cần xử lý
//               </div>
//             )}
//           </div>

//           {/* Stats — chỉ BCN */}
//           {currentUserRole === "BCN" && (
//             <div className="grid grid-cols-5 gap-4">
//               {tabs.slice(1).map((tab) => {
//                 const count = events.filter((e) => e.status === tab.key).length;
//                 return (
//                   <div key={tab.key} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
//                     <p className="text-sm text-slate-500 font-medium">{tab.label}</p>
//                     <p className="text-3xl font-bold text-blue-600 mt-2">{count}</p>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Modals */}
//       <EventFormModal
//         isOpen={isFormOpen}
//         event={editingEvent}
//         onClose={() => { setIsFormOpen(false); setEditingEvent(null); }}
//         onSave={handleSaveEvent}
//       />

//       <ApprovalModal
//         isOpen={isApprovalOpen}
//         event={selectedEvent}
//         userRole={currentUserRole}
//         onClose={() => { setIsApprovalOpen(false); setSelectedEvent(null); }}
//         onApprove={handleApproveEvent}
//         onReject={handleRejectEvent}
//       />
//     </div>
//   );
// }
