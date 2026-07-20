const config = require("../config/DatabaseConfig");
const oracledb = require("oracledb");

if (process.env.ORACLE_LIB_DIR) {
    try {
        oracledb.initOracleClient({ libDir: process.env.ORACLE_LIB_DIR });
    } catch (err) {
        console.error("Failed to initialize Oracle client:", err);
    }
}

const pool = {
    async execute(sql, params) {
        const connection = await oracledb.getConnection({
            user: config.username,
            password: config.password,
            connectString: config.connectString || config.host
        });

        try {
            return await connection.execute(sql, params || [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        } finally {
            await connection.close();
        }
    }
};

module.exports = pool;