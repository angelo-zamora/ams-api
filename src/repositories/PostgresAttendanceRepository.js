const IAttendanceRepository = require('./IAttendanceRepository');

class PostgresAttendanceRepository extends IAttendanceRepository {
    /**
     * @param {DatabaseProvider} dbProvider - Injected Database Provider
     */
    constructor(dbProvider) {
        super();
        this.db = dbProvider;
    }

    async find(filters = {}) {
        let queryText = `
            SELECT t."USERNO", t."DATE_", t."STATUS", t."STARTHOUR", t."STARTMIN", t."ENDHOUR", t."ENDMIN", t."REASON",
                   e.first_name AS "firstName", e.last_name AS "lastName", e.email AS "userEmail"
            FROM "TIMEMANAGE" t
            LEFT JOIN employees e ON t."USERNO" = e.employee_id
            WHERE 1=1
        `;
        const queryParams = [];
        let paramCounter = 1;

        if (filters.userId) {
            queryText += ` AND t."USERNO" = $${paramCounter++}`;
            queryParams.push(filters.userId);
        }

        if (filters.month) {
            const yyyymm = filters.month.replace('-', '');
            queryText += ` AND t."DATE_" LIKE $${paramCounter++}`;
            queryParams.push(`${yyyymm}%`);
        } else {
            if (filters.startMonth) {
                const yyyymm = filters.startMonth.replace('-', '') + '01';
                queryText += ` AND t."DATE_" >= $${paramCounter++}`;
                queryParams.push(yyyymm);
            }
            if (filters.endMonth) {
                const yyyymm = filters.endMonth.replace('-', '') + '01';
                queryText += ` AND t."DATE_" < $${paramCounter++}`;
                queryParams.push(yyyymm);
            }
        }

        queryText += ` ORDER BY t."DATE_" DESC`;

        const { rows } = await this.db.query(queryText, queryParams);
        
        // Map TIMEMANAGE daily rows back to individual check-in/out events for compatibility
        const mappedRecords = [];
        for (const row of rows) {
            const year = row.DATE_.substring(0, 4);
            const month = row.DATE_.substring(4, 6);
            const day = row.DATE_.substring(6, 8);
            const userName = row.firstName && row.lastName ? `${row.firstName} ${row.lastName}` : 'Unknown';
            const userEmail = row.userEmail || '';
            const userId = row.USERNO ? row.USERNO.trim() : '';

            if (row.STARTHOUR && row.STARTMIN) {
                const checkInTime = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(row.STARTHOUR), parseInt(row.STARTMIN), 0).toISOString();
                mappedRecords.push({
                    id: `${userId}-${row.DATE_}-in`,
                    userId,
                    userName,
                    userEmail,
                    timestamp: checkInTime,
                    type: 'check-in',
                    location: 'Not Specified',
                    notes: row.REASON ? row.REASON.trim() : ''
                });
            }

            if (row.ENDHOUR && row.ENDMIN) {
                const checkOutTime = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(row.ENDHOUR), parseInt(row.ENDMIN), 0).toISOString();
                mappedRecords.push({
                    id: `${userId}-${row.DATE_}-out`,
                    userId,
                    userName,
                    userEmail,
                    timestamp: checkOutTime,
                    type: 'check-out',
                    location: 'Not Specified',
                    notes: row.REASON ? row.REASON.trim() : ''
                });
            }
        }

        // Sort descending by timestamp
        mappedRecords.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        return mappedRecords;
    }

    async create(record) {
        const dateObj = new Date(record.timestamp);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const dateStr = `${year}${month}${day}`;
        
        const hour = dateObj.getHours();
        const min = dateObj.getMinutes();
        
        const udtHour = String(hour).padStart(2, '0');
        const udtMin = String(min).padStart(2, '0');
        const udtSec = String(dateObj.getSeconds()).padStart(2, '0');
        const udtDateStr = `${year}${month}${day}${udtHour}${udtMin}${udtSec}`;
        
        const userNo = String(record.userId).trim();
        const udtUser = (record.userName || record.userId).substring(0, 100);
        const reason = record.notes ? record.notes.substring(0, 100) : '';

        if (record.type === 'check-in') {
            const sql = `
                INSERT INTO "TIMEMANAGE" 
                ("USERNO", "DATE_", "STATUS", "STARTHOUR", "STARTMIN", "UDTDATE", "UDTUSER", "REASON")
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `;
            const params = [
                userNo, dateStr, 1, hour, min, udtDateStr, udtUser, reason
            ];
            await this.db.query(sql, params);
        } else if (record.type === 'check-out') {
            const sql = `
                UPDATE "TIMEMANAGE"
                SET "ENDHOUR" = $1,
                    "ENDMIN" = $2,
                    "UDTDATE" = $3,
                    "UDTUSER" = $4
                WHERE "USERNO" = $5 AND "DATE_" = $6
            `;
            const params = [
                hour, min, udtDateStr, udtUser, userNo, dateStr
            ];
            await this.db.query(sql, params);
        }

        return record;
    }
}

module.exports = PostgresAttendanceRepository;
