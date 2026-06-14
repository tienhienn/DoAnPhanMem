/**
 * Dữ liệu mẫu cho hệ thống quản lý câu lạc bộ HCMUTE
 * File này có thể được thay thế bằng API call thực tế sau này
 */

// Thông tin sinh viên mẫu
export const mockStudent = {
  studentId: "22110001",
  fullName: "Nguyễn Văn An",
  email: "22110001@hcmute.edu.vn",
  clubMemberships: ["CLB Công Nghệ", "CLB Âm Nhạc"],
};

// Danh sách sự kiện mẫu (≥6 sự kiện, ≥3 câu lạc bộ)
export const mockEvents = [
  // ===== CLB Công Nghệ (club-001) =====
  {
    id: "evt-001",
    name: "Workshop React Native: Xây Dựng App Di Động",
    description:
      "Buổi workshop thực hành xây dựng ứng dụng di động đa nền tảng với React Native. Học viên sẽ được hướng dẫn từ cài đặt môi trường, tạo project, đến triển khai ứng dụng lên thiết bị thực. Phù hợp cho sinh viên đã có kiến thức cơ bản về JavaScript và React.",
    clubName: "CLB Công Nghệ",
    clubId: "club-001",
    startDateTime: "2025-09-15T08:00:00",
    endDateTime: "2025-09-15T12:00:00",
    location: "Phòng B2-01, Tòa nhà B, HCMUTE",
    maxCapacity: 50,
    registeredCount: 32,
    imageUrl:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop",
    status: "upcoming",
  },
  {
    id: "evt-002",
    name: "Hackathon HCMUTE 2025: Giải Pháp Công Nghệ Xanh",
    description:
      "Cuộc thi lập trình 24 giờ với chủ đề phát triển bền vững và công nghệ xanh. Các đội thi gồm 3-5 thành viên sẽ cùng nhau xây dựng giải pháp công nghệ giải quyết các vấn đề môi trường tại Việt Nam. Giải thưởng tổng trị giá 50 triệu đồng.",
    clubName: "CLB Công Nghệ",
    clubId: "club-001",
    startDateTime: "2025-08-20T07:00:00",
    endDateTime: "2025-08-21T07:00:00",
    location: "Hội trường A, HCMUTE",
    maxCapacity: 100,
    registeredCount: 100,
    imageUrl:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop",
    status: "upcoming",
  },
  {
    id: "evt-003",
    name: "Seminar: Trí Tuệ Nhân Tạo Trong Kỹ Thuật",
    description:
      "Buổi seminar chuyên sâu về ứng dụng AI và Machine Learning trong các lĩnh vực kỹ thuật. Diễn giả là các kỹ sư và nhà nghiên cứu đến từ các công ty công nghệ hàng đầu tại TP.HCM. Nội dung bao gồm: Computer Vision, NLP, và AI trong tự động hóa công nghiệp.",
    clubName: "CLB Công Nghệ",
    clubId: "club-001",
    startDateTime: "2025-07-10T14:00:00",
    endDateTime: "2025-07-10T17:00:00",
    location: "Phòng C3-05, Tòa nhà C, HCMUTE",
    maxCapacity: 80,
    registeredCount: 75,
    imageUrl:
      "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&auto=format&fit=crop",
    status: "ended",
  },

  // ===== CLB Âm Nhạc (club-002) =====
  {
    id: "evt-004",
    name: "Đêm Nhạc Acoustic: Giai Điệu Mùa Hè",
    description:
      "Đêm nhạc acoustic với sự tham gia của các ban nhạc sinh viên HCMUTE. Chương trình gồm các tiết mục biểu diễn guitar, piano và hát live với những ca khúc nhẹ nhàng, sâu lắng. Đây là cơ hội để các tài năng âm nhạc của trường được tỏa sáng và giao lưu cùng khán giả.",
    clubName: "CLB Âm Nhạc",
    clubId: "club-002",
    startDateTime: "2025-09-05T18:30:00",
    endDateTime: "2025-09-05T21:30:00",
    location: "Sân khấu ngoài trời, Khu A, HCMUTE",
    maxCapacity: 200,
    registeredCount: 143,
    imageUrl:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop",
    status: "upcoming",
  },
  {
    id: "evt-005",
    name: "Lớp Học Guitar Cơ Bản Cho Người Mới Bắt Đầu",
    description:
      "Khóa học guitar cơ bản dành cho sinh viên chưa có kinh nghiệm. Học viên sẽ được học các hợp âm cơ bản, kỹ thuật gảy đàn và tập các bài nhạc đơn giản. Lớp học diễn ra trong 4 buổi liên tiếp, mỗi buổi 2 tiếng. Đàn guitar được CLB cung cấp cho học viên trong quá trình học.",
    clubName: "CLB Âm Nhạc",
    clubId: "club-002",
    startDateTime: "2025-08-25T09:00:00",
    endDateTime: "2025-08-25T11:00:00",
    location: "Phòng tập nhạc, Tòa nhà D, HCMUTE",
    maxCapacity: 20,
    registeredCount: 18,
    imageUrl:
      "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&auto=format&fit=crop",
    status: "upcoming",
  },

  // ===== CLB Thể Thao (club-003) =====
  {
    id: "evt-006",
    name: "Giải Bóng Đá Mini HCMUTE Cup 2025",
    description:
      "Giải bóng đá mini thường niên dành cho sinh viên HCMUTE. Các đội thi đấu theo thể thức vòng tròn tính điểm, sau đó vào vòng loại trực tiếp. Mỗi đội gồm 5 cầu thủ chính và 2 dự bị. Giải thưởng gồm cúp vô địch, huy chương và phần thưởng tiền mặt cho 3 đội đứng đầu.",
    clubName: "CLB Thể Thao",
    clubId: "club-003",
    startDateTime: "2025-09-20T07:00:00",
    endDateTime: "2025-09-20T17:00:00",
    location: "Sân bóng đá mini, Khu thể thao HCMUTE",
    maxCapacity: 120,
    registeredCount: 88,
    imageUrl:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop",
    status: "upcoming",
  },
  {
    id: "evt-007",
    name: "Buổi Tập Yoga Buổi Sáng: Khởi Động Năng Lượng",
    description:
      "Buổi tập yoga ngoài trời dành cho sinh viên muốn cải thiện sức khỏe và tinh thần. Huấn luyện viên có chứng chỉ quốc tế sẽ hướng dẫn các bài tập phù hợp cho người mới bắt đầu. Mang theo thảm yoga cá nhân (hoặc mượn tại chỗ), mặc trang phục thoải mái.",
    clubName: "CLB Thể Thao",
    clubId: "club-003",
    startDateTime: "2025-08-28T06:00:00",
    endDateTime: "2025-08-28T07:30:00",
    location: "Sân cỏ trước Tòa nhà A, HCMUTE",
    maxCapacity: 40,
    registeredCount: 40,
    imageUrl:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop",
    status: "ongoing",
  },
  {
    id: "evt-008",
    name: "Giải Cầu Lông Sinh Viên Mở Rộng",
    description:
      "Giải cầu lông dành cho sinh viên HCMUTE và các trường đại học lân cận. Thi đấu theo các nội dung: đơn nam, đơn nữ và đôi nam nữ. Đây là cơ hội để sinh viên giao lưu, rèn luyện thể chất và thể hiện tài năng thể thao. Đăng ký theo cá nhân, ban tổ chức sẽ ghép cặp đôi.",
    clubName: "CLB Thể Thao",
    clubId: "club-003",
    startDateTime: "2025-07-05T08:00:00",
    endDateTime: "2025-07-05T17:00:00",
    location: "Nhà thi đấu đa năng, HCMUTE",
    maxCapacity: 64,
    registeredCount: 64,
    imageUrl:
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop",
    status: "ended",
  },
];

// Trạng thái đăng ký ban đầu (rỗng - chưa đăng ký sự kiện nào)
// Cấu trúc: { [eventId]: RegistrationStatus }
// RegistrationStatus: "unregistered" | "registered" | "attended"
export const mockRegistrations = {};
