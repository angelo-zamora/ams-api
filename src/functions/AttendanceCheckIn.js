const { app } = require('@azure/functions');
const fs = require('fs').promises;
const path = require('path');
const { validateToken, getBearerToken } = require('../utils/auth');

const DB_FILE_PATH = path.join(__dirname, '..', '..', 'attendance.json');

/**
 * Reads all attendance records from the local file database
 * @returns {Promise<Array>} List of attendance records
 */
async function readRecords() {
    try {
        const data = await fs.readFile(DB_FILE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If file does not exist, return an empty array
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

/**
 * Writes all attendance records to the local file database
 * @param {Array} records - List of records to write
 */
async function writeRecords(records) {
    await fs.writeFile(DB_FILE_PATH, JSON.stringify(records, null, 2), 'utf8');
}

app.http('AttendanceCheckIn', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

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
        let decodedToken;
        try {
            decodedToken = await validateToken(token);
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

        // 3. Extract identity details from claims
        const userId = decodedToken.oid || decodedToken.sub;
        const userName = decodedToken.name || 'Unknown User';
        const userEmail = decodedToken.preferred_username || decodedToken.unique_name || decodedToken.upn || '';

        // 4. Handle HTTP GET: Retrieve attendance history for the authenticated user
        if (request.method === 'GET') {
            try {
                const records = await readRecords();
                const userRecords = records.filter(record => record.userId === userId);
                
                return {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user: { id: userId, name: userName, email: userEmail },
                        records: userRecords
                    })
                };
            } catch (error) {
                context.error(`Failed to read records: ${error.message}`);
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
            try {
                let requestBody;
                try {
                    requestBody = await request.json();
                } catch (e) {
                    return {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            error: 'Bad Request', 
                            message: 'Request body must be a valid JSON.' 
                        })
                    };
                }

                const { type, location, notes } = requestBody;

                // Validate request data
                if (!type || (type !== 'check-in' && type !== 'check-out')) {
                    return {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            error: 'Bad Request', 
                            message: "Field 'type' is required and must be either 'check-in' or 'check-out'." 
                        })
                    };
                }

                // Construct new check-in/out record
                const newRecord = {
                    id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
                    userId,
                    userName,
                    userEmail,
                    timestamp: new Date().toISOString(),
                    type,
                    location: location || 'Not Specified',
                    notes: notes || ''
                };

                // Read, append, and save
                const records = await readRecords();
                records.push(newRecord);
                await writeRecords(records);

                return {
                    status: 201,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: 'Attendance successfully recorded.',
                        record: newRecord
                    })
                };
            } catch (error) {
                context.error(`Failed to save record: ${error.message}`);
                return {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        error: 'Internal Server Error', 
                        message: 'Could not record attendance.' 
                    })
                };
            }
        }
    }
});
