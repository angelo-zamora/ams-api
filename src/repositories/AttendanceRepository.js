const db = require("../database/DatabaseFactory");
const TimeManage = require("../models/TimeManage");
const config = require("../config/AppConfig");

/**
 * ============================================
 * Attendance Repository
 * �жд�����ݥ��ȥ�
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
              AND DATE_ = TO_CHAR(
                    SYSTIMESTAMP AT TIME ZONE '${config.timezone}',
                    'YYYYMMDD'
                )
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
            WHERE t.DATE_ = TO_CHAR(
                    SYSTIMESTAMP AT TIME ZONE '${config.timezone}',
                    'YYYYMMDD'
                )
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

    /**
     * Get users who have not clocked in today
     * ̤�жмԤ�������롣
     */
    async getNoClockInUsers()
    {
        const sql = `
            SELECT
                u.USERNO,
                u.MAILADDRESS
            FROM USERINFO u
            WHERE u.MAILADDRESS IS NOT NULL
            AND NOT EXISTS (
                SELECT 1
                FROM TIMEMANAGE t
                WHERE t.USERNO = u.USERNO
                AND t.DATE_ = TO_CHAR(
                    SYSTIMESTAMP AT TIME ZONE '${config.timezone}',
                    'YYYYMMDD'
                )
                AND t.STARTHOUR IS NOT NULL
            )
        `;

        const result = await db.getConnection().execute(sql);
        const rows = Array.isArray(result) ? result[0] : result.rows || [];

        return rows;
    }

    /**
     * Get users who have not clocked out today
     * ̤��мԤ�������롣
     */
    async getStillNoClockOutUsers()
    {
        const sql = `
            SELECT
                u.MAILADDRESS as mail
            FROM TIMEMANAGE t
            INNER JOIN USERINFO u ON t.USERNO = u.USERNO
            WHERE t.DATE_ = TO_CHAR(
                    SYSTIMESTAMP AT TIME ZONE '${config.timezone}',
                    'YYYYMMDD'
                )
              AND t.STARTHOUR IS NOT NULL
              AND (t.ENDHOUR IS NULL OR t.ENDHOUR = '')
              AND u.MAILADDRESS IS NOT NULL
        `;

        const result = await db.getConnection().execute(sql);
        const rows = Array.isArray(result) ? result[0] : result.rows || [];

        return rows;
    }

    /**
     * Get users who have not clocked in today
     * ̤�жмԤ�������롣
     */
    async getNoClockInUsersToday()
    {
        const sql = `
            SELECT
                u.USERNO,
                u.MAILADDRESS
            FROM USERINFO u
            WHERE u.MAILADDRESS IS NOT NULL
            AND NOT EXISTS (
                SELECT 1
                FROM TIMEMANAGE t
                WHERE t.USERNO = u.USERNO
                AND t.DATE_ = TO_CHAR(
                    SYSTIMESTAMP AT TIME ZONE '${config.timezone}',
                    'YYYYMMDD'
                )
                AND t.STARTHOUR IS NOT NULL
            )
        `;

        const result = await db.getConnection().execute(sql);
        const rows = Array.isArray(result) ? result[0] : result.rows || [];

        return rows;
    }

    /**
     * Get employee leave request
     * ���Ȱ��εٲ˿�����������롣
     * @param {string} userNo - The employee's user number.
     * @param {string} date - The date of the leave request in 'YYYYMMDD' format.
     * @returns {Promise<TimeManage|null>} - The leave request if found, otherwise null.
     */
    async getLeaveRequest(userNo, date) {
        const sql = `
            SELECT
            *
            FROM TIMEMANAGE
            WHERE USERNO = :1
              AND DATE_ = :2
            AND STATUS != 0
        `;

        const result = await db.getConnection().execute(sql, [
            userNo, date
        ]);
        const rows = Array.isArray(result) ? result[0] : result.rows || [];

        return rows.length ? TimeManage.fromDbRow(rows[0]) : null;
    }

    /**
     * Get attendance edit history
     * @param {string} userNo - The employee's user number.
     * @param {string} year - The year in 'YYYY' format.
     * @param {string} month - The month in 'MM' format.
     * @returns {Promise<Array>} - The edit history records
     */
    async getEditHistory(userNo, year, month) {
        const sql = `
            SELECT
                h.*,
                u.USERNAME AS "UDTUSERNAME"
            FROM HISTORY h
            LEFT JOIN USERINFO u
                ON INSTR(
                    ',' || REPLACE(u.MailAddress, ' ', '') || ',',
                    ',' || REPLACE(h.UDTUser, ' ', '') || ','
                ) > 0
            WHERE h.REASON IS NOT NULL
            AND h.USERNO = :1
            AND SUBSTR(h.DATE_, 1, 4) = :2
            AND SUBSTR(h.DATE_, 5, 2) = :3
            ORDER BY h.DATE_ DESC, h.UDTDATE DESC
        `;

        const result = await db.getConnection().execute(sql, [
            userNo, year, month
        ]);
        const rows = Array.isArray(result) ? result[0] : result.rows || [];

        return rows;
    }
}

module.exports = new AttendanceRepository();
