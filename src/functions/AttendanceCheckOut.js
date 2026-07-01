const { app } = require('@azure/functions');
const { validateToken, getBearerToken } = require('../utils/auth');
const { attendanceService, employeeService } = require('../utils/container');

app.http('AttendanceCheckOut', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);
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

        if (request.method === 'POST') {
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

            const { location, notes } = requestBody;
            // Force type to check-out for this endpoint
            const type = 'check-out';
            
            const employeeId = requestBody.employeeId || requestBody.employeeid || requestBody.employee_id;

            if (!employeeId) {
                return {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ error: 'Bad Request', message: "'employeeId' is required." })
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
                const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
                const existingRecords = await attendanceService.getHistory(userId);

                const hasCheckIn = existingRecords.some(record =>
                    new Date(record.timestamp).toISOString().startsWith(today) && record.type === 'check-in'
                );

                if (!hasCheckIn) {
                    return {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            error: 'Bad Request', 
                            message: `Cannot check out: No check-in record found for today.` 
                        })
                    };
                }

                const alreadyCheckedOut = existingRecords.some(record =>
                    new Date(record.timestamp).toISOString().startsWith(today) && record.type === 'check-out'
                );

                if (alreadyCheckedOut) {
                    return {
                        status: 409,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            error: 'Conflict', 
                            message: `You have already recorded a 'check-out' for today.` 
                        })
                    };
                }

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
                        message: 'Check-out successfully recorded.',
                        record
                    })
                };
            } catch (error) {
                context.error(`Failed to record check-out: ${error.message}`);

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
