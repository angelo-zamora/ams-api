const pool = require("./Connection");

/**
 * ============================================
 * Transaction
 * トランサ?クション
 * Author: CRESS-INFO Angelo
 * Date: 2026/07/14
 * ============================================
 */
class Transaction {

    async begin() {
        const connection = await pool.getConnection();
        await connection.beginTransaction();
        return connection;
    }

    async commit(connection) {
        await connection.commit();
        connection.release();
    }

    async rollback(connection) {
        await connection.rollback();
        connection.release();
    }

}

module.exports = new Transaction();