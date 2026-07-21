const db = require("../database/DatabaseFactory");
const TimeManage = require("../models/TimeManage");

/**
 * ============================================
 * Attendance Repository
 * 出勤管理リポジトリ
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

    /**
     * Get users still clocked in today
     */
    async getStillClockedInUsers() {
        const sql = `
            SELECT
                u.MAILADDRESS as mail
            FROM TIMEMANAGE t
            INNER JOIN USERINFO u ON t.USERNO = u.USERNO
            WHERE t.DATE_ = TO_CHAR(SYSDATE, 'YYYYMMDD')
              AND t.STARTHOUR IS NOT NULL
              AND (t.ENDHOUR IS NULL OR t.ENDHOUR = '')
              AND u.MAILADDRESS IS NOT NULL
              AND NOT EXISTS (
                    SELECT 1
                    FROM ZANGYOU o
                    WHERE o.USERNO = t.USERNO
                    AND o.REQDATE = t.DATE_
                )
        `;

        const result = await db.getConnection().execute(sql);
        const rows = Array.isArray(result) ? result[0] : result.rows || [];

        return rows;
    }
}

module.exports = new AttendanceRepository();
