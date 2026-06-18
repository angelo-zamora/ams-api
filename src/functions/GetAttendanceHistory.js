const { app } = require('@azure/functions');
const { validateToken, getBearerToken } = require('../utils/auth');
const { attendanceService } = require('../utils/container');

app.http('GetAttendanceHistory', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`GetAttendanceHistory processed request for url "${request.url}"`);

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

        // 3. Parse query filters from URL parameters
        const userId     = request.query.get('userId')     || null;
        const month      = request.query.get('month')      || null;
        const startMonth = request.query.get('startMonth') || null;
        const endMonth   = request.query.get('endMonth')   || null;

        try {
            const records = await attendanceService.getHistory(userId || undefined, {
                userId: userId || undefined,
                month:  month  || undefined,
                startMonth: startMonth || undefined,
                endMonth:   endMonth   || undefined,
            });

            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: records,
                    total: records.length
                })
            };
        } catch (error) {
            context.error(`Failed to retrieve attendance history from database: ${error.message}`);
            return {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    error: 'Internal Server Error', 
                    message: 'Could not fetch attendance records.' 
                })
            };
        }
    }
});
