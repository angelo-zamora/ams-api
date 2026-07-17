const db = require("../database/DatabaseFactory");
const TimeManage = require("../models/TimeManage");

/**
 * ============================================
 * Attendance Repository
 * ?????????
 * Author: CRESS-INFO Angelo
 * Date: 2026/07/14
 * ============================================
 */
class AttendanceRepository {

    /**
     * Today's attendance
     */
    async getTodayAttendance(userNo) {

        const sql = `
            SELECT
            *
            FROM TIMEMANAGE
            WHERE USERNO = :1
              AND DATE_ = TO_CHAR(SYSDATE, 'YYYYMMDD')
            AND ROWNUM = 1
        `;

        const result = await db.getConnection().execute(sql, [
            userNo
        ]);
        const rows = Array.isArray(result) ? result[0] : result.rows || [];

        return rows.length ? TimeManage.fromDbRow(rows[0]) : null;

    }
}

module.exports = new AttendanceRepository();
