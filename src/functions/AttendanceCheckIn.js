const { app } = require('@azure/functions');
const { validateToken, getBearerToken } = require('../utils/auth');
const { attendanceService } = require('../utils/container');
const { sendMail } = require('../utils/msGraph');

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
        const userId   = (decodedToken && (decodedToken.oid || decodedToken.sub)) || 'mock-user-id';
        const userName  = (decodedToken && decodedToken.name)                       || 'Mock User';
        const userEmail = (decodedToken && (decodedToken.preferred_username || decodedToken.unique_name || decodedToken.upn)) || 'angelo.zamora@cress-m.com';

        // 4. Handle HTTP GET: Retrieve attendance history for the authenticated user
        if (request.method === 'GET') {
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

            try {
                const record = await attendanceService.recordAttendance({
                    userId,
                    userName,
                    userEmail,
                    type,
                    location,
                    notes,
                });

                // Send notification email on check-in only
                if (record.type === 'check-in') {
                    try {
                        const subject = `Clock-in: ${userName} at ${new Date(record.timestamp).toLocaleString()}`;
                        const bodyHtml = `<p>${userName} (${userEmail}) checked in at <strong>${record.timestamp}</strong>.</p>` +
                            `<p>Location: ${record.location}</p>` +
                            (record.notes ? `<p>Notes: ${record.notes}</p>` : '');

                        // sendMail expects (toRecipients[], subject, htmlBody)
                        const toRecipients = [];
                        if (userEmail) toRecipients.push(userEmail);
                        if (process.env.MS_USER_EMAIL && !toRecipients.includes(process.env.MS_USER_EMAIL)) {
                            toRecipients.push(process.env.MS_USER_EMAIL);
                        }

                        if (toRecipients.length > 0) {
                            await sendMail(toRecipients, subject, bodyHtml);
                        }
                    } catch (mailErr) {
                        context.error(`Failed to send clock-in email: ${mailErr.message}`);
                        // Do not fail the attendance recording because of email failure
                    }
                }

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
