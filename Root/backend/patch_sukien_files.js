const { getPool, sql } = require("./db");

async function runPatch() {
  try {
    const pool = await getPool();
    console.log("Connected to DB, running ALTER TABLE...");

    // Thêm cột FileDinhKem
    try {
      await pool.request().query(`
        IF NOT EXISTS (
            SELECT * FROM sys.columns 
            WHERE Name = N'FileDinhKem' AND Object_ID = Object_ID(N'SU_KIEN')
        )
        BEGIN
            ALTER TABLE SU_KIEN ADD FileDinhKem NVARCHAR(255) NULL;
            PRINT 'Added FileDinhKem column.';
        END
        ELSE
        BEGIN
            PRINT 'FileDinhKem column already exists.';
        END
      `);
    } catch (e) {
      console.error("Error adding FileDinhKem:", e.message);
    }

    // Thêm cột FileCTSVXacNhan
    try {
      await pool.request().query(`
        IF NOT EXISTS (
            SELECT * FROM sys.columns 
            WHERE Name = N'FileCTSVXacNhan' AND Object_ID = Object_ID(N'SU_KIEN')
        )
        BEGIN
            ALTER TABLE SU_KIEN ADD FileCTSVXacNhan NVARCHAR(255) NULL;
            PRINT 'Added FileCTSVXacNhan column.';
        END
        ELSE
        BEGIN
            PRINT 'FileCTSVXacNhan column already exists.';
        END
      `);
    } catch (e) {
      console.error("Error adding FileCTSVXacNhan:", e.message);
    }

    console.log("Patch completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Patch failed:", err);
    process.exit(1);
  }
}

runPatch();
