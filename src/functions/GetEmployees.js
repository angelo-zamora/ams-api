const { app } = require('@azure/functions');
const { validateToken, getBearerToken } = require('../utils/auth');
const { employeeService } = require('../utils/container');

app.http('GetEmployees', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`GetEmployees processed request for url "${request.url}"`);

        // 1. Extract Bearer token from header (Commented out for development)
        // const token = getBearerToken(request);
        // if (!token) {
        //     return {
        //         status: 401,
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify({ 
        //             error: 'Unauthorized', 
        //             message: 'Missing or invalid Authorization header. Expected format: Bearer <Token>.' 
        //         })
        //     };
        // }

        // 2. Validate token against Microsoft Entra configuration (Commented out for development)
        // try {
        //     await validateToken(token);
        // } catch (error) {
        //     context.error(`Authentication validation failed: ${error.message}`);
        //     return {
        //         status: 401,
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify({ 
        //             error: 'Unauthorized', 
        //             message: `Token validation failed: ${error.message}` 
        //         })
        //     };
        // }

        // 3. Parse search filters from URL query parameters
        const name       = request.query.get('name')       || undefined;
        const department = request.query.get('department') || undefined;
        const office     = request.query.get('office')     || undefined;

        try {
            const employees = await employeeService.getEmployees({ name, department, office });

            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: employees,
                    total: employees.length
                })
            };
        } catch (error) {
            context.error(`Failed to retrieve employees from database: ${error.message}`);
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
