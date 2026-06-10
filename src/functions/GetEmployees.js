const { app } = require('@azure/functions');
const fs = require('fs').promises;
const path = require('path');
const { validateToken, getBearerToken } = require('../utils/auth');

const EMPLOYEES_FILE_PATH = path.join(__dirname, '..', '..', 'employees.json');

/**
 * Reads all employees from the local mock JSON database
 * @returns {Promise<Array>} List of employee records
 */
async function readEmployees() {
    try {
        const data = await fs.readFile(EMPLOYEES_FILE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

app.http('GetEmployees', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`GetEmployees processed request for url "${request.url}"`);

        // 1. Extract Bearer token from header
        const token = getBearerToken(request);
        if (!token) {
            return {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    error: 'Unauthorized', 
                    message: 'Missing or invalid Authorization header. Expected format: Bearer <Token>.' 
                })
            };
        }

        // 2. Validate token against Microsoft Entra configuration
        try {
            await validateToken(token);
        } catch (error) {
            context.error(`Authentication validation failed: ${error.message}`);
            return {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    error: 'Unauthorized', 
                    message: `Token validation failed: ${error.message}` 
                })
            };
        }

        // 3. Load employee list and parse filters
        try {
            let employees = await readEmployees();

            // Extract filters from URL query parameters
            const nameQuery = request.query.get('name');
            const departmentQuery = request.query.get('department');
            const officeQuery = request.query.get('office');

            // Apply Name filter (searches firstName or lastName case-insensitively)
            if (nameQuery) {
                const search = nameQuery.toLowerCase();
                employees = employees.filter(emp => {
                    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
                    return fullName.includes(search);
                });
            }

            // Apply Department filter (exact match, case-insensitive)
            if (departmentQuery) {
                const search = departmentQuery.toLowerCase();
                employees = employees.filter(emp => 
                    emp.department && emp.department.toLowerCase() === search
                );
            }

            // Apply Office filter (exact match, case-insensitive)
            if (officeQuery) {
                const search = officeQuery.toLowerCase();
                employees = employees.filter(emp => 
                    emp.office && emp.office.toLowerCase() === search
                );
            }

            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: employees,
                    total: employees.length
                })
            };

        } catch (error) {
            context.error(`Failed to retrieve employees: ${error.message}`);
            return {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    error: 'Internal Server Error', 
                    message: 'Could not fetch employee records.' 
                })
            };
        }
    }
});
