-- =============================================
-- TẠO CƠ SỞ DỮ LIỆU
-- =============================================
-- Xóa cơ sở dữ liệu nếu đã tồn tại
--drop database if exists QUANLYCLB_UTE
IF EXISTS (SELECT * FROM sys.databases WHERE name = 'QUANLYCLB_UTE')
BEGIN
    USE master; -- Chuyển sang cơ sở dữ liệu master để có thể xóa được cơ sở dữ liệu khác
    ALTER DATABASE QUANLYCLB_UTE SET SINGLE_USER WITH ROLLBACK IMMEDIATE; -- Ngắt mọi kết nối
    DROP DATABASE QUANLYCLB_UTE; -- Xóa cơ sở dữ liệu
END
CREATE DATABASE QUANLYCLB_UTE;
GO
USE QUANLYCLB_UTE;
GO

-- =============================================
-- 1. TẠO CÁC BẢNG DANH MỤC ĐỘC LẬP (KHÔNG CÓ KHÓA NGOẠI)
-- =============================================

CREATE TABLE Khoa (
    maKhoa VARCHAR(13) PRIMARY KEY,
    tenKhoa NVARCHAR(100) NOT NULL,
    tenVietTat NVARCHAR(10),
    soDienThoai VARCHAR(15),
    email VARCHAR(50)
);

CREATE TABLE DONVIQUANLY (
    maDVQL VARCHAR(13) PRIMARY KEY,
    tenDVQL NVARCHAR(255) NOT NULL,
    emailLienHien VARCHAR(50),
    soDienThoai VARCHAR(15)
);

CREATE TABLE VAI_TRO (
    VaiTroID VARCHAR(13) PRIMARY KEY,
    tenVaiTro NVARCHAR(50) NOT NULL,
    moTa NVARCHAR(255),
    quyen NVARCHAR(255),
    trangThai BIT DEFAULT 1
);

CREATE TABLE TAI_KHOAN (
    MaND VARCHAR(13) PRIMARY KEY,
    hoTen NVARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    matKhau VARCHAR(255) NOT NULL,       -- bcrypt hash
    soDienThoai VARCHAR(15),
    ngaySinh DATE,
    gioiTinh NVARCHAR(10),
    anhDaiDien NVARCHAR(255),
    trangThai BIT DEFAULT 1,
    lanDangNhapCuoi DATETIME
);

-- =============================================
-- 2. TẠO CÁC BẢNG CÓ KHÓA NGOẠI CẤP 1
-- =============================================

CREATE TABLE Lop (
    maLop VARCHAR(13) PRIMARY KEY,
    maKhoa VARCHAR(13),
    tenLop NVARCHAR(50) NOT NULL,
    nienKhoa NVARCHAR(20),
    siSo INT,
    trangThai NVARCHAR(20),
    CONSTRAINT FK_Lop_Khoa FOREIGN KEY (maKhoa) REFERENCES Khoa(maKhoa) 
        ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE NGUOIDUNG_VAITRO (
    MaND VARCHAR(13),
    VaiTroID VARCHAR(13),
    GhiChu NVARCHAR(255),
    PRIMARY KEY (MaND, VaiTroID),
    CONSTRAINT FK_NDVT_TaiKhoan FOREIGN KEY (MaND) REFERENCES TAI_KHOAN(MaND) 
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FK_NDVT_VaiTro FOREIGN KEY (VaiTroID) REFERENCES VAI_TRO(VaiTroID) 
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE SINHVIEN (
    maSV VARCHAR(13) PRIMARY KEY,
    maLop VARCHAR(13),
    diemRenLuyen INT DEFAULT 0,
    CONSTRAINT FK_SV_TaiKhoan FOREIGN KEY (maSV) REFERENCES TAI_KHOAN(MaND) 
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FK_SV_Lop FOREIGN KEY (maLop) REFERENCES Lop(maLop) 
        ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE CANBO (
    maCanBo VARCHAR(13) PRIMARY KEY,
    maDVQL VARCHAR(13),
    chucVu NVARCHAR(50),
    trangThai BIT DEFAULT 1,
    CONSTRAINT FK_CB_TaiKhoan FOREIGN KEY (maCanBo) REFERENCES TAI_KHOAN(MaND) 
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FK_CB_DVQL FOREIGN KEY (maDVQL) REFERENCES DONVIQUANLY(maDVQL) 
        ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE CAULACBO (
    MaCLB VARCHAR(13) PRIMARY KEY,
    maDVQL VARCHAR(13),
    TenCLB NVARCHAR(100) NOT NULL,
    MoTa NVARCHAR(MAX),
    Logo NVARCHAR(255),
    NgayThanhLap DATE,
    SoThanhVienToiDa INT,
    LinhVuc NVARCHAR(50),
    TrangThai NVARCHAR(50),
    CONSTRAINT FK_CLB_DVQL FOREIGN KEY (maDVQL) REFERENCES DONVIQUANLY(maDVQL) 
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE TAI_SAN (
    MaTS VARCHAR(13) PRIMARY KEY,
    MaDVQL VARCHAR(13),
    TenTS NVARCHAR(255) NOT NULL,
    SoLuongTong INT NOT NULL,
    CONSTRAINT FK_TS_DVQL FOREIGN KEY (MaDVQL) REFERENCES DONVIQUANLY(maDVQL) 
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- =============================================
-- 3. TẠO CÁC BẢNG NGHIỆP VỤ LÕI (CẤP 2)
-- =============================================

CREATE TABLE TAI_CHINH (
    MaTC VARCHAR(13) PRIMARY KEY,
    MaCLB VARCHAR(13),
    TenTaiChinh NVARCHAR(100),
    Nam INT,
    TongThu DECIMAL(18,2) DEFAULT 0,
    TongChi DECIMAL(18,2) DEFAULT 0,
    NgayBatDau DATE,
    NgayKetThuc DATE,
    TrangThai NVARCHAR(50),
    NgayTao DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_TC_CLB FOREIGN KEY (MaCLB) REFERENCES CAULACBO(MaCLB) 
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE THANH_VIEN (
    MaTV VARCHAR(13) PRIMARY KEY,
    MaCLB VARCHAR(13),
    MaND VARCHAR(13),
    VaiTroCLB NVARCHAR(50),
    NgayThamGia DATE,
    NgayRoi DATE,
    LyDoRoi NVARCHAR(200),
    DiemDongGop FLOAT DEFAULT 0,
    GhiChu NVARCHAR(255),
    TrangThai NVARCHAR(50),
    CONSTRAINT FK_TV_CLB FOREIGN KEY (MaCLB) REFERENCES CAULACBO(MaCLB) 
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FK_TV_TaiKhoan FOREIGN KEY (MaND) REFERENCES TAI_KHOAN(MaND) 
        ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE SU_KIEN (
    MaSK VARCHAR(13) PRIMARY KEY,
    MaCLB VARCHAR(13),
    TenSK NVARCHAR(150) NOT NULL,
    MoTa NVARCHAR(MAX),
    ThoiGianBatDau DATETIME,
    ThoiGianKetThuc DATETIME,
    DiaDiem NVARCHAR(200),
    SoNguoiToiDa INT,
    ChiPhiDuKien DECIMAL(18,2),
    LoaiSK NVARCHAR(50),
    TrangThai NVARCHAR(50),
    NgayTao DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_SK_CLB FOREIGN KEY (MaCLB) REFERENCES CAULACBO(MaCLB) 
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- =============================================
-- 4. TẠO CÁC BẢNG CHI TIẾT & LỊCH SỬ (CẤP 3)
-- =============================================

CREATE TABLE LICHSU_THANHVIEN (
    MaLS VARCHAR(13) PRIMARY KEY,
    MaTV VARCHAR(13),
    HanhDong NVARCHAR(50),
    VaiTroCu NVARCHAR(50),
    VaiTroMoi NVARCHAR(50),
    LyDo NVARCHAR(200),
    NgayThayDoi DATETIME DEFAULT GETDATE(),
    GhiChu NVARCHAR(255),
    CONSTRAINT FK_LSTV_TV FOREIGN KEY (MaTV) REFERENCES THANH_VIEN(MaTV) 
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE NHIEM_VU (
    MaNV VARCHAR(13) PRIMARY KEY,
    MaCLB VARCHAR(13),
    MaSK VARCHAR(13),
    TenNV NVARCHAR(200) NOT NULL,
    MoTa NVARCHAR(MAX),
    MaTV_PhuTrach VARCHAR(13),
    NguoiGiaoID VARCHAR(13),
    DoUuTien NVARCHAR(50),
    TienDo INT DEFAULT 0,
    NgayBatDau DATE,
    HanChot DATETIME,
    NgayHoanThanh DATETIME,
    TrangThai NVARCHAR(50),
    CONSTRAINT FK_NV_CLB FOREIGN KEY (MaCLB) REFERENCES CAULACBO(MaCLB) ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT FK_NV_SK FOREIGN KEY (MaSK) REFERENCES SU_KIEN(MaSK) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FK_NV_TVPT FOREIGN KEY (MaTV_PhuTrach) REFERENCES THANH_VIEN(MaTV) ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT FK_NV_TaiKhoan FOREIGN KEY (NguoiGiaoID) REFERENCES TAI_KHOAN(MaND) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE PHAN_CONG_NHIEMVU (
    MaPC VARCHAR(13) PRIMARY KEY,
    MaNV VARCHAR(13),
    MaTV VARCHAR(13),
    TienDoCaNhan INT DEFAULT 0,
    NgayPhanCong DATETIME DEFAULT GETDATE(),
    NgayHoanThanh DATETIME,
    GhiChu NVARCHAR(MAX),
    TrangThai NVARCHAR(50),
    CONSTRAINT FK_PC_NV FOREIGN KEY (MaNV) REFERENCES NHIEM_VU(MaNV) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FK_PC_TV FOREIGN KEY (MaTV) REFERENCES THANH_VIEN(MaTV) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE YEU_CAU_THAM_GIA_CLB (
    MaYC VARCHAR(13) PRIMARY KEY,
    MaCLB VARCHAR(13),
    MaSV VARCHAR(13),
    LyDoThamGia NVARCHAR(MAX),
    NgayNop DATETIME DEFAULT GETDATE(),
    TrangThai NVARCHAR(50) DEFAULT 'cho_duyet', -- cho_duyet, da_duyet, tu_choi
    NgayDuyet DATETIME,
    NguoiDuyetID VARCHAR(13),
    LyDoTuChoi NVARCHAR(MAX),
    CONSTRAINT FK_YCTG_CLB FOREIGN KEY (MaCLB) REFERENCES CAULACBO(MaCLB) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FK_YCTG_SV FOREIGN KEY (MaSV) REFERENCES TAI_KHOAN(MaND) ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT FK_YCTG_NguoiDuyet FOREIGN KEY (NguoiDuyetID) REFERENCES TAI_KHOAN(MaND) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE DANGKY_SUKIEN (
    MaDK VARCHAR(13) PRIMARY KEY,
    MaSK VARCHAR(13),
    MaND VARCHAR(13),
    NgayDangKy DATETIME DEFAULT GETDATE(),
    NguoiDuyetID VARCHAR(13),
    LyDoDangKy NVARCHAR(300),
    NgayDuyet DATETIME,
    TrangThai NVARCHAR(50),
    GhiChu NVARCHAR(255),
    CONSTRAINT FK_DK_SK FOREIGN KEY (MaSK) REFERENCES SU_KIEN(MaSK) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FK_DK_TaiKhoan FOREIGN KEY (MaND) REFERENCES TAI_KHOAN(MaND) ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT FK_DK_NguoiDuyet FOREIGN KEY (NguoiDuyetID) REFERENCES TAI_KHOAN(MaND) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE THONG_BAO (
    MaTB VARCHAR(13) PRIMARY KEY,
    MaCLB VARCHAR(13),
    TieuDe NVARCHAR(200) NOT NULL,
    NoiDung NVARCHAR(MAX),
    NguoiGuiID VARCHAR(13),
    SoNguoiNhan INT,
    LoaiTB NVARCHAR(50),
    NgayGui DATETIME DEFAULT GETDATE(),
    TrangThai NVARCHAR(50),
    CONSTRAINT FK_TB_CLB FOREIGN KEY (MaCLB) REFERENCES CAULACBO(MaCLB) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FK_TB_TaiKhoan FOREIGN KEY (NguoiGuiID) REFERENCES TAI_KHOAN(MaND) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE HOSO (
    MaHoSo VARCHAR(13) PRIMARY KEY,
    maCLB VARCHAR(13),
    maNguoiGui VARCHAR(13),
    maNguoiDuyet VARCHAR(13),
    loaiHoSo NVARCHAR(50),
    TieuDe NVARCHAR(200) NOT NULL,
    NoiDung NVARCHAR(MAX),
    FileDinhKem NVARCHAR(255),
    TrangThai NVARCHAR(50),
    NgayGui DATETIME DEFAULT GETDATE(),
    NgayDuyet DATETIME,
    LyDoTuChoi NVARCHAR(300),
    CONSTRAINT FK_HS_CLB FOREIGN KEY (maCLB) REFERENCES CAULACBO(MaCLB) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FK_HS_NguoiGui FOREIGN KEY (maNguoiGui) REFERENCES TAI_KHOAN(MaND) ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT FK_HS_NguoiDuyet FOREIGN KEY (maNguoiDuyet) REFERENCES TAI_KHOAN(MaND) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE KHEN_THUONG_KY_LUAT (
    MaKTKL VARCHAR(13) PRIMARY KEY,
    MaND VARCHAR(13),
    MaCLB VARCHAR(13),
    Loai NVARCHAR(50),
    HinhThuc NVARCHAR(100),
    DiemThayDoi FLOAT,
    LyDo NVARCHAR(MAX),
    NguoiQuyetDinhID VARCHAR(13),
    NgayQuyetDinh DATETIME,
    NgayHieuLuc DATE,
    FileMinhChung NVARCHAR(255),
    TrangThai NVARCHAR(50),
    CONSTRAINT FK_KTKL_TaiKhoan FOREIGN KEY (MaND) REFERENCES TAI_KHOAN(MaND) ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT FK_KTKL_CLB FOREIGN KEY (MaCLB) REFERENCES CAULACBO(MaCLB) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FK_KTKL_QuyetDinh FOREIGN KEY (NguoiQuyetDinhID) REFERENCES TAI_KHOAN(MaND) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE PHIEU_MUON_TRA (
    MaPhieu VARCHAR(13) PRIMARY KEY,
    MaCLB VARCHAR(13),
    MaSK VARCHAR(13),
    NguoiMuonID VARCHAR(13),
    NgayTaoPhieu DATE DEFAULT GETDATE(),
    NgayTraDuKien DATE,
    trangThaiPhieu NVARCHAR(50),
    CONSTRAINT FK_PMT_CLB FOREIGN KEY (MaCLB) REFERENCES CAULACBO(MaCLB) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FK_PMT_SK FOREIGN KEY (MaSK) REFERENCES SU_KIEN(MaSK) ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT FK_PMT_NguoiMuon FOREIGN KEY (NguoiMuonID) REFERENCES TAI_KHOAN(MaND) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE CHI_TIET_PHIEU_MUON (
    MaPhieu VARCHAR(13),
    MaTS VARCHAR(13),
    SoLuongMuon INT NOT NULL,
    tinhTrang NVARCHAR(100),
    PRIMARY KEY (MaPhieu, MaTS),
    CONSTRAINT FK_CTPM_Phieu FOREIGN KEY (MaPhieu) REFERENCES PHIEU_MUON_TRA(MaPhieu) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FK_CTPM_TaiSan FOREIGN KEY (MaTS) REFERENCES TAI_SAN(MaTS) ON UPDATE NO ACTION ON DELETE NO ACTION
);
GO

USE QUANLYCLB_UTE;
ALTER TABLE SU_KIEN ADD DiemRenLuyen FLOAT DEFAULT 0;
ALTER TABLE SU_KIEN ADD LyDoTuChoi NVARCHAR(MAX);
-- =============================================
-- 5. DỮ LIỆU MẪU (SAMPLE DATA)
-- =============================================
-- Mật khẩu mẫu cho tất cả tài khoản: password (chữ thường)
-- bcrypt hash (cost=10): $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi  (hash của "password")
-- =============================================

-- ---------------------------------------------
-- 5.1 Khoa
-- ---------------------------------------------
INSERT INTO Khoa (maKhoa, tenKhoa, tenVietTat, soDienThoai, email) VALUES
('KHOA0000001', N'Khoa Công nghệ Thông tin',       N'CNTT',  '02363650403', 'cntt@ute.udn.vn'),
('KHOA0000002', N'Khoa Điện - Điện tử',             N'DDT',   '02363650404', 'ddt@ute.udn.vn'),
('KHOA0000003', N'Khoa Cơ khí',                     N'CK',    '02363650405', 'ck@ute.udn.vn'),
('KHOA0000004', N'Khoa Kinh tế',                    N'KT',    '02363650406', 'kt@ute.udn.vn');
GO

-- ---------------------------------------------
-- 5.2 Đơn vị quản lý
-- ---------------------------------------------
INSERT INTO DONVIQUANLY (maDVQL, tenDVQL, emailLienHien, soDienThoai) VALUES
('DVQL0000001', N'Đoàn Thanh niên - Hội Sinh viên', 'doan@ute.udn.vn',  '02363650400'),
('DVQL0000002', N'Phòng Công tác Sinh viên',         'ctsv@ute.udn.vn',  '02363650401'),
('DVQL0000003', N'Trung tâm Hỗ trợ Sinh viên',       'httro@ute.udn.vn', '02363650402');
GO

-- ---------------------------------------------
-- 5.3 Vai trò
-- ---------------------------------------------
INSERT INTO VAI_TRO (VaiTroID, tenVaiTro, moTa, quyen, trangThai) VALUES
('VT000000001', N'Sinh viên',      N'Sinh viên thông thường', N'{đăng kí sự kiện}', 1),
('VT000000003', N'Cán bộ khoa/đoàn', N'Cán bộ của Khoa hoặc đoàn', N'{duyệt sự kiện do CLB gửi lên; xem thống kê hoạt động khoa; quản lý thông tin CLB thuộc khoa; theo dõi sự kiện thuộc khoa}',1),
('VT000000004', N'Phòng CTSV', N'Phòng công tác sinh viên', N'{duyệt/từ chối sự kiện cấp trường; xem thống kê toàn trường; quản lý toàn bộ hoạt động sinh viên; khóa/mở hoạt động CLB;quản lý tất cả sự kiện}',1);
GO

-- ---------------------------------------------
-- 5.4 Lớp
-- ---------------------------------------------
INSERT INTO Lop (maLop, maKhoa, tenLop, nienKhoa, siSo, trangThai) VALUES
('LOP00000001', 'KHOA0000001', N'21TCLC_DT2',  N'2021-2025', 35, N'Đang học'),
('LOP00000002', 'KHOA0000001', N'21TCLC_DT3',  N'2021-2025', 33, N'Đang học'),
('LOP00000003', 'KHOA0000002', N'21TCLC_DDT1', N'2021-2025', 36, N'Đang học'),
('LOP00000004', 'KHOA0000003', N'22TCLC_CK1',  N'2022-2026', 34, N'Đang học'),
('LOP00000005', 'KHOA0000004', N'22TCLC_KT1',  N'2022-2026', 32, N'Đang học');
GO

-- ---------------------------------------------
-- 5.5 Tài khoản (matKhau = bcrypt("password"))  ← mật khẩu là "password" chữ thường
-- ---------------------------------------------
INSERT INTO TAI_KHOAN (MaND, hoTen, email, matKhau, soDienThoai, ngaySinh, gioiTinh, trangThai) VALUES
-- Sinh viên
('SV210000001', N'Nguyễn Văn An',      'an.nv@sv.ute.udn.vn',      '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234561', '2003-05-15', N'Nam',  1),
('SV210000002', N'Trần Thị Bình',      'binh.tt@sv.ute.udn.vn',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234562', '2003-08-22', N'Nữ',   1),
('SV210000003', N'Lê Hoàng Cường',     'cuong.lh@sv.ute.udn.vn',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234563', '2003-11-10', N'Nam',  1),
('SV210000004', N'Phạm Thị Dung',      'dung.pt@sv.ute.udn.vn',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234564', '2003-02-28', N'Nữ',   1),
('SV220000005', N'Hoàng Minh Đức',     'duc.hm@sv.ute.udn.vn',     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234565', '2004-07-03', N'Nam',  1),
('SV220000006', N'Võ Thị Hoa',         'hoa.vt@sv.ute.udn.vn',     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234566', '2004-09-17', N'Nữ',   1),
('SV220000007', N'Đặng Quốc Hùng',     'hung.dq@sv.ute.udn.vn',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234567', '2004-01-25', N'Nam',  1),
('SV220000008', N'Bùi Thị Lan',        'lan.bt@sv.ute.udn.vn',     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234568', '2004-04-12', N'Nữ',   1),
-- Tài khoản bị khóa (để test)
('SV210000009', N'Trần Văn Khóa',      'khoa.tv@sv.ute.udn.vn',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234569', '2003-06-20', N'Nam',  0),
-- Cán bộ / Ban quản lý CLB
('CB000000001', N'Nguyễn Thị Quản',    'quan.nt@ute.udn.vn',       '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234570', '1990-03-10', N'Nữ',   1),
('CB000000002', N'Lê Văn Trưởng',      'truong.lv@ute.udn.vn',     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234571', '1988-11-05', N'Nam',  1),
('CB000000003', N'Nguyễn Hữu Thọ',      'tho.nh@ute.udn.vn',     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0896998961', '1960-11-05', N'Nam',  1)
;
GO

-- ---------------------------------------------
-- 5.6 Sinh viên
-- ---------------------------------------------
INSERT INTO SINHVIEN (maSV, maLop, diemRenLuyen) VALUES
('SV210000001', 'LOP00000001', 85),
('SV210000002', 'LOP00000001', 78),
('SV210000003', 'LOP00000002', 90),
('SV210000004', 'LOP00000002', 72),
('SV220000005', 'LOP00000003', 88),
('SV220000006', 'LOP00000004', 65),
('SV220000007', 'LOP00000004', 92),
('SV220000008', 'LOP00000005', 70),
('SV210000009', 'LOP00000001', 50);
GO

-- ---------------------------------------------
-- 5.7 Cán bộ
-- ---------------------------------------------
INSERT INTO CANBO (maCanBo, maDVQL, chucVu, trangThai) VALUES
('CB000000001', 'DVQL0000001', N'Bí thư Đoàn',          1),
('CB000000002', 'DVQL0000002', N'Cán bộ khoa',      1),
('CB000000003', 'DVQL0000003', N'Chuyên viên CTSV',      1);
GO

-- ---------------------------------------------
-- 5.8 Vai trò người dùng
-- ---------------------------------------------
INSERT INTO NGUOIDUNG_VAITRO (MaND, VaiTroID, GhiChu) VALUES
('SV210000001', 'VT000000001', N'Sinh viên thường'),
('SV210000002', 'VT000000001', N'Sinh viên thường'),
('SV210000003', 'VT000000001', N'Sinh viên thường'),
('SV210000004', 'VT000000001', N'Sinh viên thường'),
('SV220000005', 'VT000000001', N'Sinh viên thường'),
('SV220000006', 'VT000000001', N'Sinh viên thường'),
('SV220000007', 'VT000000001', N'Sinh viên thường'),
('SV220000008', 'VT000000001', N'Sinh viên thường'),
('SV210000009', 'VT000000001', N'Tài khoản bị khóa'),
('CB000000001', 'VT000000003', N'Cán bộ Đoàn'),
('CB000000002', 'VT000000003', N'Cán bộ Khoa'),
('CB000000003', 'VT000000004', N'Cán bộ CTSV');
GO

-- ---------------------------------------------
-- 5.9 Câu lạc bộ
-- ---------------------------------------------
INSERT INTO CAULACBO (MaCLB, maDVQL, TenCLB, MoTa, NgayThanhLap, SoThanhVienToiDa, LinhVuc, TrangThai) VALUES
('CLB00000001', 'DVQL0000001', N'CLB Lập trình UTE',
    N'Câu lạc bộ dành cho sinh viên yêu thích lập trình, tổ chức các buổi workshop, hackathon và cuộc thi coding.',
    '2018-09-01', 100, N'Công nghệ', N'Hoạt động'),
('CLB00000002', 'DVQL0000001', N'CLB Tiếng Anh UTE',
    N'Câu lạc bộ giúp sinh viên nâng cao kỹ năng tiếng Anh qua các hoạt động giao lưu, thuyết trình và tranh luận.',
    '2017-03-15', 80,  N'Ngoại ngữ', N'Hoạt động'),
('CLB00000003', 'DVQL0000001', N'CLB Thể thao UTE',
    N'Câu lạc bộ tổ chức các hoạt động thể dục thể thao: bóng đá, cầu lông, bơi lội và các giải đấu nội bộ.',
    '2016-10-20', 150, N'Thể thao',  N'Hoạt động'),
('CLB00000004', 'DVQL0000002', N'CLB Tình nguyện UTE',
    N'Câu lạc bộ tổ chức các hoạt động tình nguyện, từ thiện và hỗ trợ cộng đồng.',
    '2019-05-01', 120, N'Tình nguyện', N'Hoạt động');
GO

-- ---------------------------------------------
-- 5.10 Thành viên CLB
-- ---------------------------------------------
INSERT INTO THANH_VIEN (MaTV, MaCLB, MaND, VaiTroCLB, NgayThamGia, TrangThai) VALUES
('TV000000001', 'CLB00000001', 'SV210000001', N'Chủ nhiệm',    '2021-10-01', N'Hoạt động'),
('TV000000002', 'CLB00000001', 'SV210000002', N'Phó chủ nhiệm','2021-10-01', N'Hoạt động'),
('TV000000003', 'CLB00000001', 'SV210000003', N'Thành viên',   '2022-01-15', N'Hoạt động'),
('TV000000004', 'CLB00000002', 'SV210000004', N'Chủ nhiệm',    '2021-10-01', N'Hoạt động'),
('TV000000005', 'CLB00000002', 'SV220000005', N'Thành viên',   '2022-09-05', N'Hoạt động'),
('TV000000006', 'CLB00000003', 'SV220000006', N'Chủ nhiệm',    '2022-09-01', N'Hoạt động'),
('TV000000007', 'CLB00000003', 'SV220000007', N'Thành viên',   '2022-09-01', N'Hoạt động'),
('TV000000008', 'CLB00000004', 'SV220000008', N'Thành viên',   '2022-10-10', N'Hoạt động');
GO

-- ---------------------------------------------
-- 5.11 Sự kiện
-- Bao gồm đủ các trạng thái để test frontend
-- ---------------------------------------------
INSERT INTO SU_KIEN (MaSK, MaCLB, TenSK, MoTa, ThoiGianBatDau, ThoiGianKetThuc, DiaDiem, SoNguoiToiDa, ChiPhiDuKien, LoaiSK, TrangThai) VALUES
-- Sắp diễn ra
('SK000000001', 'CLB00000001',
    N'Workshop: Nhập môn ReactJS',
    N'Buổi workshop thực hành xây dựng ứng dụng web với ReactJS dành cho sinh viên mới bắt đầu. Mang theo laptop.',
    '2026-06-10 08:00', '2026-06-10 11:30', N'Phòng Lab 201 - Nhà A', 40, 0, N'Workshop', N'sap_dien_ra'),

('SK000000002', 'CLB00000001',
    N'Hackathon UTE 2026',
    N'Cuộc thi lập trình 24 giờ với chủ đề "Chuyển đổi số trong giáo dục". Giải thưởng lên đến 10 triệu đồng.',
    '2026-06-20 07:00', '2026-06-21 07:00', N'Hội trường A - Tầng 1', 60, 5000000, N'Cuộc thi', N'sap_dien_ra'),

('SK000000003', 'CLB00000002',
    N'English Speaking Club - Tháng 6',
    N'Buổi sinh hoạt tiếng Anh hàng tháng với chủ đề "Technology and Future". Tất cả trình độ đều được chào đón.',
    '2026-06-15 14:00', '2026-06-15 16:30', N'Phòng 305 - Nhà B', 30, 0, N'Sinh hoạt', N'sap_dien_ra'),

('SK000000004', 'CLB00000003',
    N'Giải bóng đá mini UTE Cup 2026',
    N'Giải đấu bóng đá mini dành cho sinh viên toàn trường. Đăng ký theo đội (5 người/đội).',
    '2026-07-05 07:30', '2026-07-05 17:00', N'Sân thể thao trường', 100, 200000, N'Thể thao', N'sap_dien_ra'),

('SK000000005', 'CLB00000004',
    N'Ngày hội Tình nguyện Hè 2026',
    N'Hoạt động tình nguyện dọn dẹp môi trường và tặng quà cho trẻ em có hoàn cảnh khó khăn tại huyện Hòa Vang.',
    '2026-07-15 06:00', '2026-07-15 17:00', N'Huyện Hòa Vang, Đà Nẵng', 50, 0, N'Tình nguyện', N'sap_dien_ra'),

-- Đang diễn ra
('SK000000006', 'CLB00000001',
    N'Khóa học Git & GitHub cơ bản',
    N'Khóa học 3 buổi về quản lý mã nguồn với Git và GitHub. Buổi 2/3 đang diễn ra.',
    '2026-05-01 08:00', '2026-06-01 10:00', N'Phòng Lab 203 - Nhà A', 25, 0, N'Khóa học', N'dang_dien_ra'),

-- Đã kết thúc (để test trạng thái)
('SK000000007', 'CLB00000002',
    N'Cuộc thi hùng biện tiếng Anh 2025',
    N'Cuộc thi hùng biện tiếng Anh cấp trường năm học 2024-2025.',
    '2025-12-10 08:00', '2025-12-10 17:00', N'Hội trường B', 80, 0, N'Cuộc thi', N'da_ket_thuc'),

-- Sự kiện đã hết chỗ (để test full capacity)
('SK000000008', 'CLB00000001',
    N'Seminar: AI và Machine Learning',
    N'Buổi seminar về ứng dụng AI trong thực tế với diễn giả từ doanh nghiệp công nghệ.',
    '2026-06-25 09:00', '2026-06-25 12:00', N'Hội trường A', 20, 0, N'Seminar', N'sap_dien_ra');
GO

-- ---------------------------------------------
-- 5.12 Đăng ký sự kiện mẫu
-- ---------------------------------------------
INSERT INTO DANGKY_SUKIEN (MaDK, MaSK, MaND, NgayDangKy, NguoiDuyetID, NgayDuyet, TrangThai, LyDoDangKy) VALUES
-- SV210000001 đăng ký SK1 (đã duyệt) → có QR
('DK000000001', 'SK000000001', 'SV210000001', '2026-05-20 09:00', 'CB000000001', '2026-05-20 10:00', N'da_duyet',      N'Muốn học ReactJS'),
-- SV210000001 đăng ký SK2 (đã duyệt)
('DK000000002', 'SK000000002', 'SV210000001', '2026-05-21 10:00', 'CB000000001', '2026-05-21 11:00', N'da_duyet',      N'Muốn tham gia hackathon'),
-- SV210000002 đăng ký SK1 (đã duyệt)
('DK000000003', 'SK000000001', 'SV210000002', '2026-05-20 11:00', 'CB000000001', '2026-05-20 12:00', N'da_duyet',      N'Quan tâm đến ReactJS'),
-- SV210000003 đăng ký SK1 (chờ duyệt)
('DK000000004', 'SK000000001', 'SV210000003', '2026-05-22 08:30', NULL,           NULL,               N'cho_duyet',     N'Muốn học lập trình web'),
-- SV210000004 đăng ký SK3 (đã duyệt)
('DK000000005', 'SK000000003', 'SV210000004', '2026-05-23 14:00', 'CB000000001', '2026-05-23 15:00', N'da_duyet',      N'Muốn luyện tiếng Anh'),
-- SV220000005 đăng ký SK3 (đã hủy) → test hủy đăng ký
('DK000000006', 'SK000000003', 'SV220000005', '2026-05-24 09:00', NULL,           NULL,               N'da_huy',        N'Đăng ký thử'),
-- SV220000006 đăng ký SK4 (đã duyệt)
('DK000000007', 'SK000000004', 'SV220000006', '2026-05-25 10:00', 'CB000000001', '2026-05-25 11:00', N'da_duyet',      N'Thích bóng đá'),
-- SV220000007 đăng ký SK6 (đã điểm danh) → test trạng thái da_diem_danh
('DK000000008', 'SK000000006', 'SV220000007', '2026-04-30 08:00', 'CB000000001', '2026-04-30 09:00', N'da_diem_danh',  N'Muốn học Git'),
-- Đăng ký cho SK8 để fill đủ 20/20 chỗ (test hết chỗ)
('DK000000009', 'SK000000008', 'SV210000001', '2026-05-01 08:00', 'CB000000001', '2026-05-01 09:00', N'da_duyet', N'Quan tâm AI'),
('DK000000010', 'SK000000008', 'SV210000002', '2026-05-01 08:05', 'CB000000001', '2026-05-01 09:00', N'da_duyet', N'Quan tâm AI'),
('DK000000011', 'SK000000008', 'SV210000003', '2026-05-01 08:10', 'CB000000001', '2026-05-01 09:00', N'da_duyet', N'Quan tâm AI'),
('DK000000012', 'SK000000008', 'SV210000004', '2026-05-01 08:15', 'CB000000001', '2026-05-01 09:00', N'da_duyet', N'Quan tâm AI'),
('DK000000013', 'SK000000008', 'SV220000005', '2026-05-01 08:20', 'CB000000001', '2026-05-01 09:00', N'da_duyet', N'Quan tâm AI'),
('DK000000014', 'SK000000008', 'SV220000006', '2026-05-01 08:25', 'CB000000001', '2026-05-01 09:00', N'da_duyet', N'Quan tâm AI'),
('DK000000015', 'SK000000008', 'SV220000007', '2026-05-01 08:30', 'CB000000001', '2026-05-01 09:00', N'da_duyet', N'Quan tâm AI'),
('DK000000016', 'SK000000008', 'SV220000008', '2026-05-01 08:35', 'CB000000001', '2026-05-01 09:00', N'da_duyet', N'Quan tâm AI'),
('DK000000017', 'SK000000008', 'SV210000009', '2026-05-01 08:40', 'CB000000001', '2026-05-01 09:00', N'da_duyet', N'Quan tâm AI'),
('DK000000018', 'SK000000008', 'CB000000001', '2026-05-01 08:45', 'CB000000001', '2026-05-01 09:00', N'da_duyet', N'Quan tâm AI'),
('DK000000019', 'SK000000008', 'CB000000002', '2026-05-01 08:50', 'CB000000001', '2026-05-01 09:00', N'da_duyet', N'Quan tâm AI'),
('DK000000020', 'SK000000008', 'SV210000001', NULL, NULL, NULL, N'da_duyet', N'Quan tâm AI');
GO

-- Cập nhật SoNguoiToiDa SK8 = 20 để đúng với số đăng ký trên
UPDATE SU_KIEN SET SoNguoiToiDa = 20 WHERE MaSK = 'SK000000008';
GO

-- =============================================
-- 6. KIỂM TRA DỮ LIỆU
-- =============================================
-- Chạy các câu lệnh sau để xác nhận dữ liệu đã được insert đúng:
--
-- SELECT COUNT(*) AS soTaiKhoan   FROM TAI_KHOAN;        -- 11
-- SELECT COUNT(*) AS soSinhVien   FROM SINHVIEN;          -- 9
-- SELECT COUNT(*) AS soCLB        FROM CAULACBO;          -- 4
-- SELECT COUNT(*) AS soSuKien     FROM SU_KIEN;           -- 8
-- SELECT COUNT(*) AS soDangKy     FROM DANGKY_SUKIEN;     -- 20
--
-- Test đăng nhập:
-- Email: an.nv@sv.ute.udn.vn      | Password: password  → Thành công
-- Email: khoa.tv@sv.ute.udn.vn    | Password: password  → HTTP 403 (tài khoản bị khóa)
-- =============================================