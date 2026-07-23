const db = require("../database/DatabaseFactory");
const Zangyou = require("../models/Zangyou");

/**
 * ============================================
 * Attendance Repository
 * 出勤管理リポジトリ
 * Author: CRESS-INFO Angelo
 * Date: 2026/07/21
 * ============================================
 */
class OvertimeRepository {

    /*
     * Get employee overtime request
     * 従業員の残業申請を取得する。
     */
    async getOvertime(userNo, reqDate) {

        const sql = `
            SELECT
            *
            FROM ZANGYOU
            WHERE USERNO = :1
              AND REQDATE = :2
            AND ROWNUM = 1
        `;

        const result = await db.getConnection().execute(sql, [
            userNo, reqDate
        ]);
        const rows = Array.isArray(result) ? result[0] : result.rows || [];

        return rows.length ? Zangyou.fromDbRow(rows[0]) : null;

    }

    /*
     * Get employee overtime request still clocked in
     * 従業員の残業申請中の従業員を取得する。
     */
    async getUsersOnOvertimeStillClockedIn() {
        const sql = `
            SELECT
                u.USERNO,
                u.MAILADDRESS AS mail,
                t.DATE_,
                t.STARTHOUR,
                t.STARTMIN,
                t.ENDHOUR,
                o.STARTHOUR AS OT_STARTHOUR,
                o.STARTMIN AS OT_STARTMIN,
                o.ENDHOUR AS OT_ENDHOUR,
                o.ENDMIN AS OT_ENDMIN
            FROM TIMEMANAGE t
            INNER JOIN USERINFO u
                ON t.USERNO = u.USERNO
            INNER JOIN ZANGYOU o
                ON o.USERNO = t.USERNO
            AND o.REQDATE = t.DATE_
            WHERE t.DATE_ = TO_CHAR(SYSDATE, 'YYYYMMDD')
            AND t.STARTHOUR IS NOT NULL
            AND (t.ENDHOUR IS NULL OR t.ENDHOUR = '')
            AND u.MAILADDRESS IS NOT NULL
        `;

        const result = await db.getConnection().execute(sql);
        return result.rows || [];
    }
}

module.exports = new OvertimeRepository();
