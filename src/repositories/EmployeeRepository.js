const db = require("../database/DatabaseFactory");

/**
 * ============================================
 * Employee Repository
 * 従業員リポジトリ
 * Author: CRESS-INFO Angelo
 * Date: 2026/07/14
 * ============================================
 */
class EmployeeRepository {

    /**
     * Find employee
     */
    async findByEmail(email) {

        const sql = `
            SELECT
            *
            FROM USERINFO
            WHERE MAILADDRESS = :1
            AND ROWNUM = 1
        `;

        const result = await db.getConnection().execute(sql, [
            email
        ]);
        const rows = Array.isArray(result) ? result[0] : result.rows || [];

        return rows.length ? rows[0] : null;

    }

    /**
     * Find first employee
     */
    async findFirstEmployee() {

        const sql = `
            SELECT
                *
            FROM USERINFO
            WHERE MAILADDRESS IS NOT NULL
            AND ROWNUM = 1
        `;

        const result = await db.getConnection().execute(sql);
        const rows = Array.isArray(result) ? result[0] : result.rows || [];

        return rows.length ? rows[0] : null;
    }

    /**
     * Active employees
     */
    async getActiveEmployees() {

        const sql = `
            SELECT
                employee_email,
                employee_name
            FROM employee
            WHERE status='ACTIVE'
        `;

        const result = await db.getConnection().execute(sql);
        const rows = Array.isArray(result) ? result[0] : result.rows || [];

        return rows;

    }

}

module.exports = new EmployeeRepository();
