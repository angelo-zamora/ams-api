const db = require("../database/DatabaseFactory");

class UserRepository {

    async getUserInfo(userNo) {

        const sql = `
            SELECT 
                u.USERNO,
                u.USERNAME,
                u.ROLE,
                u.DEPARTMENT,
                u.WORKSPACE,
                u.PROJECTNAME,
                u.PROJECTCODE,
                u.FLEXFILENAME,
                u.MAILADDRESS
            FROM USERINFO u
            WHERE u.USERNO = :1
        `;

        const result = await db.getConnection().execute(sql, [
            userNo
        ]);
        const rows = Array.isArray(result) ? result[0] : result.rows || [];

        return rows.length ? rows[0] : null;

    }

}

module.exports = new UserRepository();
