import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  X,
  Send,
  Paperclip,
  UploadCloud,
  Calendar,
  FileText,
  MessageCircle,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const StudentTaskPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionData, setSubmissionData] = useState({
    submissionNote: "",
    submissionFile: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchStudentTasks();
  }, []);

  const fetchStudentTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/tasks/student/my-tasks`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTasks(res.data.data || []);
    } catch (error) {
      console.error("Lỗi lấy nhiệm vụ:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function để mở file
  const handleViewFile = (fileLink) => {
    if (!fileLink) {
      alert("Không có file để xem");
      return;
    }

    // Nếu là link web (Google Drive, Dropbox...) thì mở trực tiếp
    if (fileLink.startsWith("http://") || fileLink.startsWith("https://")) {
      window.open(fileLink, "_blank", "noopener,noreferrer");
      return;
    }

    // Nếu là đường dẫn file của hệ thống (/uploads/...)
    // Loại bỏ chữ '/api' khỏi API_BASE_URL để có domain gốc
    const backendDomain = API_BASE_URL.replace("/api", "");

    // Xóa dấu '/' ở đầu fileLink nếu có để tránh bị nối thành: domain.com//uploads
    const cleanFileLink = fileLink.startsWith("/")
      ? fileLink.substring(1)
      : fileLink;

    const fullUrl = `${backendDomain}/${cleanFileLink}`;
    console.log("📂 Opening file:", fullUrl);
    window.open(fullUrl, "_blank", "noopener,noreferrer");
  };

  // Helper function để tải file
  const handleDownloadFile = (fileLink, fileName) => {
    if (!fileLink) {
      alert("Không có file để tải");
      return;
    }

    // Nếu là link ngoài thì chỉ mở tab mới
    if (fileLink.startsWith("http://") || fileLink.startsWith("https://")) {
      window.open(fileLink, "_blank", "noopener,noreferrer");
      return;
    }

    const backendDomain = API_BASE_URL.replace("/api", "");
    const cleanFileLink = fileLink.startsWith("/")
      ? fileLink.substring(1)
      : fileLink;
    const fullUrl = `${backendDomain}/${cleanFileLink}`;

    console.log("⬇️ Downloading file:", fullUrl);

    const link = document.createElement("a");
    link.href = fullUrl;
    link.download = fileName || "file";
    link.setAttribute("target", "_blank");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    return (
      new Date(deadline) < new Date() &&
      new Date(deadline).toDateString() !== new Date().toDateString()
    );
  };

  const getStatusBadge = (status) => {
    const configs = {
      todo: {
        style: "bg-slate-100 text-slate-700 border-slate-200",
        label: "📋 Chưa làm",
        color: "slate",
      },
      in_progress: {
        style: "bg-blue-100 text-blue-700 border-blue-200",
        label: "⚙️ Đang làm",
        color: "blue",
      },
      reviewing: {
        style:
          "bg-amber-100 text-amber-700 border-amber-200 shadow-sm animate-pulse",
        label: "👀 Chờ duyệt",
        color: "amber",
      },
      done: {
        style: "bg-emerald-100 text-emerald-700 border-emerald-200",
        label: "✅ Hoàn thành",
        color: "emerald",
      },
    };
    return configs[status] || configs.todo;
  };

  const handleOpenSubmit = (task) => {
    setSelectedTask(task);
    setSubmissionData({
      submissionNote: task.submissionNote || "",
      submissionFile: null,
    });
    setShowSubmitModal(true);
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!submissionData.submissionNote.trim()) {
      alert("Vui lòng nhập ghi chú báo cáo!");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("submissionNote", submissionData.submissionNote);

      if (submissionData.submissionFile) {
        formData.append("file", submissionData.submissionFile);
      }

      await axios.patch(
        `${API_BASE_URL}/tasks/${selectedTask.id}/submit`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      alert("Báo cáo nhiệm vụ đã được gửi thành công!");
      setShowSubmitModal(false);
      setSubmissionData({
        submissionNote: "",
        submissionFile: null,
      });
      fetchStudentTasks();
    } catch (error) {
      alert(
        "Lỗi khi gửi báo cáo: " +
          (error.response?.data?.error?.message || error.message),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    reviewing: tasks.filter((t) => t.status === "reviewing").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin">
            <Clock className="w-12 h-12 text-blue-600 mx-auto" />
          </div>
          <p className="text-slate-600 mt-4 font-medium">
            Đang tải danh sách nhiệm vụ...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
          Nhiệm vụ của tôi
        </h1>
        <p className="text-slate-600">
          Quản lý và hoàn thành các nhiệm vụ được giao
        </p>
      </div>

      {/* Thống kê nhanh */}
      {tasks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div
            onClick={() => setFilterStatus("all")}
            className={`rounded-2xl p-6 shadow-sm border cursor-pointer transition-all ${filterStatus === "all" ? "bg-slate-100 border-slate-400 ring-2 ring-slate-200" : "bg-white border-slate-100 hover:bg-slate-50"}`}
          >
            <p className="text-slate-600 text-sm font-medium mb-2">
              Tổng nhiệm vụ
            </p>
            <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div
            onClick={() => setFilterStatus("todo")}
            className={`rounded-2xl p-6 shadow-sm border cursor-pointer transition-all ${filterStatus === "todo" ? "bg-slate-100 border-slate-400 ring-2 ring-slate-200" : "bg-white border-slate-100 hover:bg-slate-50"}`}
          >
            <p className="text-slate-600 text-sm font-medium mb-2">Chưa làm</p>
            <p className="text-3xl font-bold text-slate-600">{stats.todo}</p>
          </div>
          <div
            onClick={() => setFilterStatus("reviewing")}
            className={`rounded-2xl p-6 shadow-sm border cursor-pointer transition-all ${filterStatus === "reviewing" ? "bg-amber-100 border-amber-400 ring-2 ring-amber-200" : "bg-amber-50/30 border-amber-200 hover:bg-amber-100/50"}`}
          >
            <p className="text-amber-800 text-sm font-bold mb-2">Chờ duyệt</p>
            <p className="text-3xl font-bold text-amber-600">
              {stats.reviewing}
            </p>
          </div>
          <div
            onClick={() => setFilterStatus("done")}
            className={`rounded-2xl p-6 shadow-sm border cursor-pointer transition-all ${filterStatus === "done" ? "bg-emerald-100 border-emerald-400 ring-2 ring-emerald-200" : "bg-white border-emerald-200 hover:bg-emerald-50"}`}
          >
            <p className="text-emerald-700 text-sm font-bold mb-2">
              Hoàn thành
            </p>
            <p className="text-3xl font-bold text-emerald-600">{stats.done}</p>
          </div>
        </div>
      )}

      {/* Danh sách nhiệm vụ */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium text-lg">
              Bạn không có nhiệm vụ nào
            </p>
            <p className="text-slate-500 text-sm mt-2">
              Những nhiệm vụ sẽ được hiển thị ở đây khi Ban chủ nhiệm giao cho
              bạn
            </p>
          </div>
        ) : (
          tasks
            .filter((task) => filterStatus === "all" || task.status === filterStatus)
            .map((task) => {
            const badge = getStatusBadge(task.status);
            const overdue = isOverdue(task.deadline) && task.status !== "done";

            return (
              <div
                key={task.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6 space-y-4">
                  {/* Task Title & Status */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-slate-900">
                          {task.title}
                        </h3>
                        {task.attachmentLink && (
                          <Paperclip
                            className="w-5 h-5 text-blue-500"
                            title="Có tài liệu đính kèm"
                          />
                        )}
                      </div>
                      <p className="text-slate-600 text-sm">
                        Sự kiện:{" "}
                        <span className="font-semibold">{task.eventName}</span>{" "}
                        | CLB:{" "}
                        <span className="font-semibold">{task.clubName}</span>
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold border whitespace-nowrap ${badge.style}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  {/* Deadline */}
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-sm">
                      Hạn chót:{" "}
                      <span
                        className={`font-semibold ${overdue ? "text-red-600" : ""}`}
                      >
                        {formatDate(task.deadline)}
                      </span>
                    </span>
                    {overdue && (
                      <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">
                        Quá hạn
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {task.description && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <p className="text-sm text-slate-700">
                        <span className="font-semibold text-slate-800">
                          Mô tả:
                        </span>{" "}
                        {task.description}
                      </p>
                    </div>
                  )}

                  {/* BCN Attachment */}
                  {task.attachmentLink && (
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                      <p className="text-xs text-blue-600 font-semibold mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> TÀI LIỆU BCN GIAO
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleViewFile(task.attachmentLink)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors text-xs font-medium cursor-pointer"
                        >
                          <FileText className="w-3 h-3" /> Mở
                        </button>
                        <button
                          onClick={() =>
                            handleDownloadFile(task.attachmentLink)
                          }
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium cursor-pointer"
                        >
                          <UploadCloud className="w-3 h-3" /> Tải
                        </button>
                      </div>
                    </div>
                  )}

                  {/* BCN Feedback */}
                  {task.bcnFeedback && (
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                      <p className="text-xs text-amber-700 font-semibold mb-2 flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" /> PHẢN HỒI BCN
                      </p>
                      <p className="text-sm text-amber-900 italic">
                        "{task.bcnFeedback}"
                      </p>
                    </div>
                  )}

                  {/* Submission Status */}
                  {task.status === "reviewing" || task.submissionLink ? (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <p className="text-xs text-slate-600 font-semibold mb-2">
                        ✓ ĐÃ GỬI BÁO CÁO
                      </p>
                      {task.submissionNote && (
                        <p className="text-sm text-slate-700 mb-2">
                          <span className="font-semibold">Ghi chú:</span>{" "}
                          {task.submissionNote}
                        </p>
                      )}
                      {task.submissionLink && (
                        <button
                          onClick={() => handleViewFile(task.submissionLink)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors text-xs font-medium cursor-pointer"
                        >
                          <FileText className="w-3 h-3" /> Xem báo cáo
                        </button>
                      )}
                      <p className="text-xs text-slate-500 mt-2">
                        Nộp lúc: {formatDate(task.submittedAt)}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenSubmit(task)}
                      disabled={task.status === "done"}
                      className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" /> Gửi báo cáo
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: GỬI BÁO CÁO */}
      {/* ========================================================================= */}
      {showSubmitModal && selectedTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-8 py-5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-3xl sticky top-0">
              <div>
                <h3 className="text-xl font-bold">Gửi báo cáo nhiệm vụ</h3>
                <p className="text-blue-100 text-sm opacity-90 mt-1">
                  {selectedTask.title}
                </p>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitTask} className="p-8 space-y-6">
              {/* Task Info */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-500 font-semibold mb-1">
                  SỰ KIỆN
                </p>
                <p className="text-slate-900 font-semibold">
                  {selectedTask.eventName}
                </p>
                <p className="text-xs text-slate-600 mt-2">
                  CLB:{" "}
                  <span className="font-semibold">{selectedTask.clubName}</span>
                </p>
                <p className="text-xs text-slate-600">
                  Người giao:{" "}
                  <span className="font-semibold">
                    {selectedTask.assignerName}
                  </span>
                </p>
              </div>

              {/* Ghi chú báo cáo */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Ghi chú báo cáo *
                  <span className="text-xs text-slate-500 font-normal ml-1">
                    (Mô tả công việc đã hoàn thành)
                  </span>
                </label>
                <textarea
                  rows="4"
                  required
                  value={submissionData.submissionNote}
                  onChange={(e) =>
                    setSubmissionData({
                      ...submissionData,
                      submissionNote: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Mô tả chi tiết công việc bạn đã hoàn thành, kết quả đạt được, và bất kỳ khó khăn nào gặp phải..."
                />
              </div>

              {/* Tập tin đính kèm */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tài liệu/ Kết quả (nếu có)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-blue-300 text-blue-600 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                    <UploadCloud className="w-5 h-5" />
                    <span className="font-medium truncate">
                      {submissionData.submissionFile
                        ? submissionData.submissionFile.name
                        : "Tải lên file (.pdf, .zip, .docx...)"}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) =>
                        setSubmissionData({
                          ...submissionData,
                          submissionFile: e.target.files[0],
                        })
                      }
                    />
                  </label>

                  {submissionData.submissionFile && (
                    <button
                      type="button"
                      onClick={() =>
                        setSubmissionData({
                          ...submissionData,
                          submissionFile: null,
                        })
                      }
                      className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Xóa file"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Lưu ý */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-xs text-blue-800 font-semibold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Sau khi gửi, Ban chủ nhiệm sẽ xem xét báo cáo của bạn. Bạn
                    có thể cập nhật nếu nhận được phản hồi.
                  </span>
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  {submitting ? "Đang gửi..." : "Gửi báo cáo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTaskPage;
