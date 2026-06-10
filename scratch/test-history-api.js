const path = require('path');
const fs = require('fs').promises;
const jwt = require('jsonwebtoken');
const { app } = require('@azure/functions');

// 1. Setup mock environment
process.env.ENTRA_CLIENT_ID = '3ea61ea9-628d-4c78-b30d-fcccbaf9af3f';
process.env.ENTRA_TENANT_ID = 'common';

const mockUser = {
    oid: 'user-111',
    name: 'Test Tester',
    preferred_username: 'test.tester@example.com',
    tid: 'test-tenant-id-888'
};

// Mock jwt.decode and jwt.verify so we can test the token validation flow without a live connection to Microsoft
const originalDecode = jwt.decode;
jwt.decode = (token, options) => {
    if (token === 'valid-mock-token') {
        return {
            header: { kid: 'mock-kid' },
            payload: { tid: 'test-tenant-id-888' }
        };
    }
    return originalDecode ? originalDecode(token, options) : null;
};

jwt.verify = (token, getKey, options, callback) => {
    if (token === 'valid-mock-token') {
        callback(null, mockUser);
    } else {
        callback(new Error('Signature verification failed (mock verification)'));
    }
};

// 2. Intercept app.http to capture the handler
let getAttendanceHistoryHandler;
const originalHttp = app.http;
app.http = (name, options) => {
    if (name === 'GetAttendanceHistory') {
        getAttendanceHistoryHandler = options.handler;
    }
    if (originalHttp) {
        originalHttp.call(app, name, options);
    }
};

// Load the function which triggers registration
require('../src/functions/GetAttendanceHistory');

// Restore app.http
app.http = originalHttp;

// 3. Create mock Request and Context helpers
class MockRequest {
    constructor(method, url, headers = {}, body = null) {
        this.method = method;
        this.url = url;
        const headerMap = new Map(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
        this.headers = {
            get: (name) => headerMap.get(name.toLowerCase()) || null
        };
        this._body = body;

        const parsedUrl = new URL(url);
        this.query = parsedUrl.searchParams;
    }

    async json() {
        if (!this._body) {
            throw new Error('No body to parse');
        }
        return typeof this._body === 'string' ? JSON.parse(this._body) : this._body;
    }

    async text() {
        return typeof this._body === 'string' ? this._body : JSON.stringify(this._body);
    }
}

const mockContext = {
    log: (...args) => console.log('  [LOG]', ...args),
    error: (...args) => console.error('  [ERROR]', ...args),
    warn: (...args) => console.warn('  [WARN]', ...args)
};

// Seed records containing timestamps in Nov 2025, Dec 2025, Jan 2026, Feb 2026
const seedRecords = [
    {
        id: 'rec-nov',
        userId: 'user-111',
        userName: 'Test Tester',
        timestamp: '2025-11-15T09:00:00.000Z',
        type: 'check-in'
    },
    {
        id: 'rec-dec',
        userId: 'user-111',
        userName: 'Test Tester',
        timestamp: '2025-12-25T10:30:00.000Z',
        type: 'check-in'
    },
    {
        id: 'rec-jan',
        userId: 'user-111',
        userName: 'Test Tester',
        timestamp: '2026-01-05T08:45:00.000Z',
        type: 'check-in'
    },
    {
        id: 'rec-jan-other',
        userId: 'user-222',
        userName: 'Other User',
        timestamp: '2026-01-12T13:00:00.000Z',
        type: 'check-in'
    },
    {
        id: 'rec-feb',
        userId: 'user-111',
        userName: 'Test Tester',
        timestamp: '2026-02-14T17:15:00.000Z',
        type: 'check-out'
    }
];

// 4. Test Runner
async function runTests() {
    console.log('Starting GetAttendanceHistory API Tests...\n');
    let failures = 0;

    const assert = (condition, message) => {
        if (condition) {
            console.log(`  ✅ PASSED: ${message}`);
        } else {
            console.error(`  ❌ FAILED: ${message}`);
            failures++;
        }
    };

    // Backup existing attendance.json if it exists
    const dbPath = path.join(__dirname, '..', 'attendance.json');
    let dbBackup = null;
    try {
        dbBackup = await fs.readFile(dbPath, 'utf8');
        console.log('Backed up existing attendance.json');
    } catch (e) {
        // Doesn't exist, which is fine
    }

    // Seed test database
    await fs.writeFile(dbPath, JSON.stringify(seedRecords, null, 2), 'utf8');

    try {
        // --- TEST 1: Unauthorized request ---
        console.log('\nTest 1: Request with missing Authorization header');
        const req1 = new MockRequest('GET', 'http://localhost:7071/api/GetAttendanceHistory');
        const res1 = await getAttendanceHistoryHandler(req1, mockContext);
        
        assert(res1.status === 401, 'Should return 401 status');

        // --- TEST 2: GET with no filters (should return all 5 seeded records) ---
        console.log('\nTest 2: GET all history without filters');
        const req2 = new MockRequest('GET', 'http://localhost:7071/api/GetAttendanceHistory', {
            'Authorization': 'Bearer valid-mock-token'
        });
        const res2 = await getAttendanceHistoryHandler(req2, mockContext);

        assert(res2.status === 200, 'Should return 200 OK');
        let body2 = JSON.parse(res2.body);
        assert(body2.total === 5, 'Should return total 5 records');

        // --- TEST 3: Range query: December to January (?startMonth=2025-12&endMonth=2026-01) ---
        console.log('\nTest 3: Range query December to January (?startMonth=2025-12&endMonth=2026-01)');
        const req3 = new MockRequest('GET', 'http://localhost:7071/api/GetAttendanceHistory?startMonth=2025-12&endMonth=2026-01', {
            'Authorization': 'Bearer valid-mock-token'
        });
        const res3 = await getAttendanceHistoryHandler(req3, mockContext);

        assert(res3.status === 200, 'Should return 200 OK');
        let body3 = JSON.parse(res3.body);
        // Should contain rec-dec (Dec 25), rec-jan (Jan 5), and rec-jan-other (Jan 12)
        assert(body3.total === 3, 'Should return exactly 3 records');
        const ids = body3.items.map(r => r.id);
        assert(ids.includes('rec-dec'), 'Should include December record');
        assert(ids.includes('rec-jan'), 'Should include January record for user-111');
        assert(ids.includes('rec-jan-other'), 'Should include January record for user-222');
        assert(!ids.includes('rec-nov'), 'Should NOT include November record');
        assert(!ids.includes('rec-feb'), 'Should NOT include February record');

        // --- TEST 4: Single month query: December 2025 (?month=2025-12) ---
        console.log('\nTest 4: Query single month (?month=2025-12)');
        const req4 = new MockRequest('GET', 'http://localhost:7071/api/GetAttendanceHistory?month=2025-12', {
            'Authorization': 'Bearer valid-mock-token'
        });
        const res4 = await getAttendanceHistoryHandler(req4, mockContext);

        assert(res4.status === 200, 'Should return 200 OK');
        let body4 = JSON.parse(res4.body);
        assert(body4.total === 1, 'Should find 1 record');
        assert(body4.items[0].id === 'rec-dec', 'The matching record should be the December record');

        // --- TEST 5: Filter by User ID (?userId=user-111) ---
        console.log('\nTest 5: Filter records by specific user (?userId=user-111)');
        const req5 = new MockRequest('GET', 'http://localhost:7071/api/GetAttendanceHistory?userId=user-111', {
            'Authorization': 'Bearer valid-mock-token'
        });
        const res5 = await getAttendanceHistoryHandler(req5, mockContext);

        assert(res5.status === 200, 'Should return 200 OK');
        let body5 = JSON.parse(res5.body);
        assert(body5.total === 4, 'Should return 4 records belonging to user-111');
        assert(body5.items.every(r => r.userId === 'user-111'), 'All items should belong to user-111');

        // --- TEST 6: Combined filters: December to January for user-111 (?startMonth=2025-12&endMonth=2026-01&userId=user-111) ---
        console.log('\nTest 6: Combined user and date range (?startMonth=2025-12&endMonth=2026-01&userId=user-111)');
        const req6 = new MockRequest('GET', 'http://localhost:7071/api/GetAttendanceHistory?startMonth=2025-12&endMonth=2026-01&userId=user-111', {
            'Authorization': 'Bearer valid-mock-token'
        });
        const res6 = await getAttendanceHistoryHandler(req6, mockContext);

        assert(res6.status === 200, 'Should return 200 OK');
        let body6 = JSON.parse(res6.body);
        assert(body6.total === 2, 'Should find exactly 2 records');
        const ids6 = body6.items.map(r => r.id);
        assert(ids6.includes('rec-dec') && ids6.includes('rec-jan'), 'Should only return user-111 records for Dec and Jan');

    } catch (error) {
        console.error('Unexpected error running tests:', error);
        failures++;
    } finally {
        // Restore backup database if it existed, otherwise delete test database
        if (dbBackup !== null) {
            await fs.writeFile(dbPath, dbBackup, 'utf8');
            console.log('\nRestored original attendance.json from backup');
        } else {
            try {
                await fs.unlink(dbPath);
                console.log('\nCleaned up test attendance.json');
            } catch (e) {
                // Ignore
            }
        }
    }

    console.log(`\nTests finished with ${failures} failure(s).\n`);
    process.exit(failures > 0 ? 1 : 0);
}

runTests();
