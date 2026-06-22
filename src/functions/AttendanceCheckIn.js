const { app } = require('@azure/functions');
const { validateToken, getBearerToken } = require('../utils/auth');
const { attendanceService, employeeService } = require('../utils/container');

app.http('AttendanceCheckIn', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

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
        let decodedToken;
        // try {
        //     decodedToken = await validateToken(token);
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

        // 3. Extract identity details from claims
        // const userId   = (decodedToken && (decodedToken.oid || decodedToken.sub)) || 'mock-user-id';
        // const userName  = (decodedToken && decodedToken.name)                       || 'Mock User';
        // const userEmail = (decodedToken && (decodedToken.preferred_username || decodedToken.unique_name || decodedToken.upn)) || 'mock.user@example.com';

        // 4. Handle HTTP GET: Retrieve attendance history for the authenticated user
        if (request.method === 'GET') {
            const employeeId = request.query.get('employeeId');

            if (!employeeId) {
                return {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ error: 'Bad Request', message: "'employeeId' query parameter is required." })
                };
            }

            const employee = await employeeService.getEmployeeByEmployeeId(employeeId);
            if (!employee) {
                return {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ error: 'Not Found', message: `Employee '${employeeId}' not found or inactive.` })
                };
            }

            const userId    = employee.employeeId;
            const userName  = `${employee.firstName} ${employee.lastName}`;
            const userEmail = employee.email;

            try {
                const records = await attendanceService.getHistory(userId);

                return {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user: { id: userId, name: userName, email: userEmail },
                        records
                    })
                };
            } catch (error) {
                context.error(`Failed to fetch attendance records: ${error.message}`);
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

        // 5. Handle HTTP POST: Save new attendance record
        if (request.method === 'POST') {
            // Parse and validate request body
            let requestBody;
            try {
                requestBody = await request.json();
            } catch (e) {
                return {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        error: 'Bad Request', 
                        message: 'Request body must be valid JSON.' 
                    })
                };
            }

            const { type, location, notes } = requestBody;
            // Accept both camelCase (employeeId) and lowercase (employeeid)
            const employeeId = requestBody.employeeId || requestBody.employeeid || requestBody.employee_id;

            // Step 2: Validate employeeId is provided
            if (!employeeId) {
                return {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ error: 'Bad Request', message: "'employeeId' is required." })
                };
            }

            // Step 3: Look up the employee in the database
            const employee = await employeeService.getEmployeeByEmployeeId(employeeId);
            if (!employee) {
                return {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ error: 'Not Found', message: `Employee '${employeeId}' not found or inactive.` })
                };
            }

            const userId    = employee.employeeId;
            const userName  = `${employee.firstName} ${employee.lastName}`;
            const userEmail = employee.email;

            try {
                // Step 4: Check if a record of this type already exists today
                const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
                const existingRecords = await attendanceService.getHistory(userId);

                const alreadyRecorded = existingRecords.some(record =>
                    new Date(record.timestamp).toISOString().startsWith(today) && record.type === type
                );

                if (alreadyRecorded) {
                    return {
                        status: 409,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            error: 'Conflict', 
                            message: `You have already recorded '${type}' for today.` 
                        })
                    };
                }

                // Step 5: Record the attendance
                const record = await attendanceService.recordAttendance({
                    userId,
                    userName,
                    userEmail,
                    type,
                    location,
                    notes,
                });

                return {
                    status: 201,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: 'Attendance successfully recorded.',
                        record
                    })
                };
            } catch (error) {
                context.error(`Failed to record attendance: ${error.message}`);

                // Business validation errors (e.g. invalid type) should surface as 400
                const isValidationError = error.message.includes("'type'") || error.message.includes("identity");
                return {
                    status: isValidationError ? 400 : 500,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        error: isValidationError ? 'Bad Request' : 'Internal Server Error', 
                        message: error.message 
                    })
                };
            }
        }

    }
});
