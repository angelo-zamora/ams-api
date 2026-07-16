/**
 * ============================================
 * Attendance Repository
 * ∂–¬’•ÅE›•∏•»•ÅE
 * ============================================
 */

const db = require("../../database/DatabaseFactory");
const TimeManage = require("../../models/TimeManage");

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
     * Clock In
     */
    async clockIn(employeeEmail) {

        const sql = `
            INSERT INTO attendance
            (
                employee_email,
                clock_in,
                created_at
            )
            VALUES
            (
                ?,
                SYSDATE,
                SYSDATE
            )
        `;

        const result = await db.getConnection().execute(sql, [
            employeeEmail
        ]);

        return result;

    }

    /**
     * Clock Out
     */
    async clockOut(employeeEmail) {

        const sql = `
            UPDATE attendance
            SET
                clock_out = SYSDATE,
                updated_at = SYSDATE
            WHERE employee_email = :1
              AND TRUNC(clock_in) = TRUNC(SYSDATE)
        `;

        const result = await db.getConnection().execute(sql, [
            employeeEmail
        ]);

        return result;

    }

    /**
     * Attendance History
     */
    async getHistory(employeeEmail, limit = 30) {

        const sql = `
            SELECT
                clock_in,
                clock_out
            FROM attendance
            WHERE employee_email = :employeeEmail
            ORDER BY clock_in DESC
            FETCH FIRST ${limit} ROWS ONLY
        `;

        const result = await db.getConnection().execute(sql, { employeeEmail });
        const rows = Array.isArray(result) ? result[0] : result.rows || [];

        return rows;

    }

}

module.exports = new AttendanceRepository();
