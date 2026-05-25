import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ============================================
// BAN CHỦ NHIỆM EVENTS
// ============================================

export const bcnEventService = {
  // Lấy danh sách sự kiện của CLB
  getEventsByClub: async (TrangThai = null) => {
    const params = {};
    if (TrangThai) params.TrangThai = TrangThai;

    const response = await axios.get(`${API_BASE_URL}/bcn/events`, {
      params,
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Lấy chi tiết sự kiện
  getEventDetail: async (MaSK) => {
    const response = await axios.get(`${API_BASE_URL}/bcn/events/${MaSK}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Tạo sự kiện mới (MaCLB được xác định tự động từ club của người dùng)
  createEvent: async (eventData) => {
    // Loại bỏ MaCLB nếu có, vì nó sẽ được xác định tự động từ club của người dùng
    const { MaCLB, ...dataWithoutMaCLB } = eventData;
    
    const response = await axios.post(`${API_BASE_URL}/bcn/events`, dataWithoutMaCLB, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Cập nhật sự kiện
  updateEvent: async (MaSK, eventData) => {
    const response = await axios.put(
      `${API_BASE_URL}/bcn/events/${MaSK}`,
      eventData,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  // Xóa sự kiện
  deleteEvent: async (MaSK) => {
    const response = await axios.delete(`${API_BASE_URL}/bcn/events/${MaSK}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Gửi sự kiện để duyệt
  submitEventForApproval: async (MaSK) => {
    const response = await axios.patch(
      `${API_BASE_URL}/bcn/events/${MaSK}/submit`,
      {},
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  // Duyệt sự kiện (Cán bộ Khoa)
  approveFaculty: async (MaSK) => {
    const response = await axios.patch(
      `${API_BASE_URL}/bcn/events/${MaSK}/approve-faculty`,
      {},
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  // Duyệt sự kiện (Phòng CTSV)
  approveCTSV: async (MaSK) => {
    const response = await axios.patch(
      `${API_BASE_URL}/bcn/events/${MaSK}/approve-ctsv`,
      {},
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  // Từ chối sự kiện
  rejectEvent: async (MaSK, LyDoTuChoi) => {
    const response = await axios.patch(
      `${API_BASE_URL}/bcn/events/${MaSK}/reject`,
      { LyDoTuChoi },
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },
};

// ============================================
// STUDENT EVENTS
// ============================================

export const studentEventService = {
  // Lấy danh sách sự kiện
  getEvents: async (filters = {}) => {
    const response = await axios.get(`${API_BASE_URL}/events`, {
      params: filters,
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Lấy chi tiết sự kiện
  getEventById: async (maSK) => {
    const response = await axios.get(`${API_BASE_URL}/events/${maSK}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Đăng ký sự kiện
  registerEvent: async (maSK) => {
    const response = await axios.post(
      `${API_BASE_URL}/events/${maSK}/register`,
      {},
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  // Hủy đăng ký sự kiện
  cancelRegistration: async (maSK) => {
    const response = await axios.delete(
      `${API_BASE_URL}/events/${maSK}/register`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  // Lấy QR code
  getEventQR: async (maSK) => {
    const response = await axios.get(`${API_BASE_URL}/events/${maSK}/qr`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};
