const IEmployeeRepository = require('./IEmployeeRepository');

class PostgresEmployeeRepository extends IEmployeeRepository {
    /**
     * @param {DatabaseProvider} dbProvider - Injected Database Provider
     */
    constructor(dbProvider) {
        super();
        this.db = dbProvider;
    }

    async find(filters = {}) {
        let queryText = `
            SELECT id, employee_id AS "employeeId", first_name AS "firstName", last_name AS "lastName",
                   department, role, status, office, email
            FROM employees
            WHERE 1=1
        `;
        const queryParams = [];
        let paramCounter = 1;

        if (filters.name) {
            queryText += ` AND (first_name || ' ' || last_name) ILIKE $${paramCounter++}`;
            queryParams.push(`%${filters.name}%`);
        }

        if (filters.department) {
            queryText += ` AND LOWER(department) = LOWER($${paramCounter++})`;
            queryParams.push(filters.department);
        }

        if (filters.office) {
            queryText += ` AND LOWER(office) = LOWER($${paramCounter++})`;
            queryParams.push(filters.office);
        }

        queryText += ` ORDER BY id ASC`;

        const { rows } = await this.db.query(queryText, queryParams);
        return rows;
    }

    async findByEmployeeId(employeeId) {
        const query = `
            SELECT id, employee_id AS "employeeId", first_name AS "firstName", last_name AS "lastName",
                   department, role, status, office, email
            FROM employees
            WHERE employee_id = $1
            AND status = 'active'
        `;
        return (await this.db.query(query, [employeeId])).rows[0] || null;
    }
}

module.exports = PostgresEmployeeRepository;
