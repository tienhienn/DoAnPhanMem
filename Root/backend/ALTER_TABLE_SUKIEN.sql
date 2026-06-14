-- =============================================
-- ALTER TABLE SU_KIEN: THÊMCỘT DiemRenLuyen VÀ LyDoTuChoi
-- =============================================
USE QUANLYCLB_UTE;
GO

-- Kiểm tra xem cột đã tồn tại chưa, nếu không thì thêm
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
              WHERE TABLE_NAME = 'SU_KIEN' AND COLUMN_NAME = 'DiemRenLuyen')
BEGIN
    ALTER TABLE SU_KIEN 
    ADD DiemRenLuyen FLOAT DEFAULT 0;
    PRINT N'Đã thêm cột DiemRenLuyen';
END
ELSE
    PRINT N'Cột DiemRenLuyen đã tồn tại';
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
              WHERE TABLE_NAME = 'SU_KIEN' AND COLUMN_NAME = 'LyDoTuChoi')
BEGIN
    ALTER TABLE SU_KIEN 
    ADD LyDoTuChoi NVARCHAR(MAX) NULL;
    PRINT N'Đã thêm cột LyDoTuChoi';
END
ELSE
    PRINT N'Cột LyDoTuChoi đã tồn tại';
GO

-- Kiểm tra cấu trúc bảng
SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'SU_KIEN'
ORDER BY ORDINAL_POSITION;
GO
