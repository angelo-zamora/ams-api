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
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

/**
 * Checks if a timestamp falls within a range of months (inclusive)
 * @param {string} timestamp - ISO-8601 timestamp string
 * @param {string} startMonth - Start month string in 'YYYY-MM' format
 * @param {string} endMonth - End month string in 'YYYY-MM' format
 * @returns {boolean} True if within range, false otherwise
 */
function isRecordInMonthRange(timestamp, startMonth, endMonth) {
    const date = new Date(timestamp);
    
    // startMonth boundary: First millisecond of the start month
    if (startMonth) {
        const startDate = new Date(`${startMonth}-01T00:00:00.000Z`);
        if (date < startDate) return false;
    }
    
    // endMonth boundary: Exclusive start of the month following the endMonth
    if (endMonth) {
        const [year, month] = endMonth.split('-').map(Number);
        // JS Date month is 0-indexed. Passing `month` as the 2nd argument (instead of month-1) 
        // yields the 1st day of the next month (e.g. for '2026-01', constructions yields Feb 1st)
        const endDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
        if (date >= endDate) return false;
    }
    
    return true;
}

app.http('GetAttendanceHistory', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`GetAttendanceHistory processed request for url "${request.url}"`);

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

        // 3. Load attendance records and parse query filters
        try {
            let records = await readRecords();

            const targetUserId = request.query.get('userId');
            const monthQuery = request.query.get('month');
            const startMonth = request.query.get('startMonth');
            const endMonth = request.query.get('endMonth');

            // Filter by user ID if provided
            if (targetUserId) {
                records = records.filter(record => record.userId === targetUserId);
            }

            // Filter by date/month
            if (monthQuery) {
                // Exact single month filter (checks if ISO string prefix matches 'YYYY-MM')
                records = records.filter(record => record.timestamp && record.timestamp.startsWith(monthQuery));
            } else if (startMonth || endMonth) {
                // Month range filter (e.g. December 'YYYY-12' to January 'YYYY-01')
                records = records.filter(record => record.timestamp && isRecordInMonthRange(record.timestamp, startMonth, endMonth));
            }

            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: records,
                    total: records.length
                })
            };

        } catch (error) {
            context.error(`Failed to retrieve attendance history: ${error.message}`);
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
