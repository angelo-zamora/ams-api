/**
 * ============================================
 * Database Configuration
 * データベース設定
 * Author: CRESS-INFO Angelo
 * Date: 2026/07/14
 * ============================================
 */
module.exports = {
    client: process.env.DB_CLIENT,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectString: process.env.DB_CONNECT_STRING
};