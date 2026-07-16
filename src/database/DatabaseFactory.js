const mysql = require("../config/Connection");

/**
 * ============================================
 * Database Factory
 * ????????????
 * Author: CRESS-INFO Angelo
 * Date: 2026/07/14
 * ============================================
 */
class DatabaseFactory {

    getConnection() {
        return mysql;
    }

}

module.exports = new DatabaseFactory();
