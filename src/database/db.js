const sql = require("mssql");

const config = {
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DATABASE,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,

    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

let pool;

async function getConnection() {
    if (!pool) {
        pool = await sql.connect(config);
    }
    return pool;
}

module.exports = {
    sql,
    getConnection
};