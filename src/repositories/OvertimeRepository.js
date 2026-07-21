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
}

module.exports = new OvertimeRepository();
