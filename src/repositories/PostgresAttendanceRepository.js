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
            SELECT id, user_id AS "userId", user_name AS "userName", user_email AS "userEmail", 
                   timestamp, type, location, notes 
            FROM attendance_records 
            WHERE 1=1
        `;
        const queryParams = [];
        let paramCounter = 1;

        if (filters.userId) {
            queryText += ` AND user_id = $${paramCounter++}`;
            queryParams.push(filters.userId);
        }

        if (filters.month) {
            queryText += ` AND TO_CHAR(timestamp AT TIME ZONE 'UTC', 'YYYY-MM') = $${paramCounter++}`;
            queryParams.push(filters.month);
        } else {
            if (filters.startMonth) {
                const startDate = `${filters.startMonth}-01T00:00:00.000Z`;
                queryText += ` AND timestamp >= $${paramCounter++}`;
                queryParams.push(startDate);
            }
            if (filters.endMonth) {
                const [year, month] = filters.endMonth.split('-').map(Number);
                const endDateTime = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0)).toISOString();
                queryText += ` AND timestamp < $${paramCounter++}`;
                queryParams.push(endDateTime);
            }
        }

        queryText += ` ORDER BY timestamp DESC`;

        const { rows } = await this.db.query(queryText, queryParams);
        return rows;
    }

    async create(record) {
        const sql = `
            INSERT INTO attendance_records (id, user_id, user_name, user_email, timestamp, type, location, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, user_id AS "userId", user_name AS "userName", user_email AS "userEmail", 
                      timestamp, type, location, notes
        `;
        const params = [
            record.id,
            record.userId,
            record.userName,
            record.userEmail,
            record.timestamp,
            record.type,
            record.location,
            record.notes
        ];
        const { rows } = await this.db.query(sql, params);
        return rows[0];
    }
}

module.exports = PostgresAttendanceRepository;
