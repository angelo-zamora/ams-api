const path = require('path');
const fs = require('fs').promises;
const jwt = require('jsonwebtoken');
const { app } = require('@azure/functions');

// 1. Setup mock environment
process.env.ENTRA_CLIENT_ID = '3ea61ea9-628d-4c78-b30d-fcccbaf9af3f';
process.env.ENTRA_TENANT_ID = 'common';

const mockUser = {
    oid: 'test-user-id-999',
    name: 'Alice Johnson',
    preferred_username: 'alice.johnson@example.com',
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
let attendanceCheckInHandler;
const originalHttp = app.http;
app.http = (name, options) => {
    if (name === 'AttendanceCheckIn') {
        attendanceCheckInHandler = options.handler;
    }
    // Still call the original register if needed, but here we just spy
    if (originalHttp) {
        originalHttp.call(app, name, options);
    }
};

// Load the function which triggers registration
require('../src/functions/AttendanceCheckIn');

// Restore app.http
app.http = originalHttp;

// 3. Create mock Request and Context helpers
class MockRequest {
    constructor(method, url, headers = {}, body = null) {
        this.method = method;
        this.url = url;
        // Map headers to a Headers-like object with a .get method
        const headerMap = new Map(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
        this.headers = {
            get: (name) => headerMap.get(name.toLowerCase()) || null
        };
        this._body = body;
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

// 4. Test Runner
async function runTests() {
    console.log('Starting AttendanceCheckIn API Tests...\n');
    let failures = 0;

    // Helper assertion function
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

    // Initialize clean attendance.json for tests
    await fs.writeFile(dbPath, '[]', 'utf8');

    try {
        // --- TEST 1: Unauthorized request (Missing Authorization header) ---
        console.log('\nTest 1: Request with missing Authorization header');
        const req1 = new MockRequest('GET', 'http://localhost:7071/api/AttendanceCheckIn');
        const res1 = await attendanceCheckInHandler(req1, mockContext);
        
        assert(res1.status === 401, 'Should return 401 status');
        let body1 = JSON.parse(res1.body);
        assert(body1.error === 'Unauthorized', 'Should return "Unauthorized" error message');
        assert(body1.message.includes('Missing or invalid Authorization header'), 'Should explain missing header');

        // --- TEST 2: Unauthorized request (Invalid token signature) ---
        console.log('\nTest 2: Request with invalid token');
        const req2 = new MockRequest('GET', 'http://localhost:7071/api/AttendanceCheckIn', {
            'Authorization': 'Bearer invalid-token-123'
        });
        const res2 = await attendanceCheckInHandler(req2, mockContext);

        assert(res2.status === 401, 'Should return 401 status');
        let body2 = JSON.parse(res2.body);
        assert(body2.error === 'Unauthorized', 'Should return "Unauthorized" error message');
        assert(body2.message.includes('Token validation failed'), 'Should explain token validation failed');

        // --- TEST 3: Authorized POST (Check-in) ---
        console.log('\nTest 3: POST Check-in with valid Entra ID token');
        const req3 = new MockRequest('POST', 'http://localhost:7071/api/AttendanceCheckIn', {
            'Authorization': 'Bearer valid-mock-token'
        }, {
            type: 'check-in',
            location: 'Office',
            notes: 'Starting my day from the office'
        });
        const res3 = await attendanceCheckInHandler(req3, mockContext);

        assert(res3.status === 201, 'Should return 201 Created');
        let body3 = JSON.parse(res3.body);
        assert(body3.message === 'Attendance successfully recorded.', 'Should return success message');
        assert(body3.record.type === 'check-in', 'Record type should be "check-in"');
        assert(body3.record.userId === mockUser.oid, `Record userId should match ${mockUser.oid}`);
        assert(body3.record.userName === mockUser.name, `Record userName should match ${mockUser.name}`);
        assert(body3.record.location === 'Office', 'Record location should be "Office"');

        // --- TEST 4: Authorized POST (Check-out) ---
        console.log('\nTest 4: POST Check-out with valid Entra ID token');
        const req4 = new MockRequest('POST', 'http://localhost:7071/api/AttendanceCheckIn', {
            'Authorization': 'Bearer valid-mock-token'
        }, {
            type: 'check-out',
            location: 'Office',
            notes: 'Finished my tasks'
        });
        const res4 = await attendanceCheckInHandler(req4, mockContext);

        assert(res4.status === 201, 'Should return 201 Created');
        let body4 = JSON.parse(res4.body);
        assert(body4.record.type === 'check-out', 'Record type should be "check-out"');

        // --- TEST 5: Authorized GET (History retrieval) ---
        console.log('\nTest 5: GET history with valid Entra ID token');
        const req5 = new MockRequest('GET', 'http://localhost:7071/api/AttendanceCheckIn', {
            'Authorization': 'Bearer valid-mock-token'
        });
        const res5 = await attendanceCheckInHandler(req5, mockContext);

        assert(res5.status === 200, 'Should return 200 OK');
        let body5 = JSON.parse(res5.body);
        assert(body5.user.id === mockUser.oid, 'User payload should match authenticated user ID');
        assert(body5.records.length === 2, 'Should retrieve exactly 2 records for the user');
        assert(body5.records[0].type === 'check-in', 'First record should be check-in');
        assert(body5.records[1].type === 'check-out', 'Second record should be check-out');

        // --- TEST 6: POST Bad Request (Invalid parameters) ---
        console.log('\nTest 6: POST with invalid type parameter');
        const req6 = new MockRequest('POST', 'http://localhost:7071/api/AttendanceCheckIn', {
            'Authorization': 'Bearer valid-mock-token'
        }, {
            type: 'break',
            location: 'Break Room'
        });
        const res6 = await attendanceCheckInHandler(req6, mockContext);

        assert(res6.status === 400, 'Should return 400 Bad Request');
        let body6 = JSON.parse(res6.body);
        assert(body6.error === 'Bad Request', 'Should indicate bad request');
        assert(body6.message.includes("must be either 'check-in' or 'check-out'"), 'Should show validation error message');

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
                // Ignore if it wasn't created
            }
        }
    }

    console.log(`\nTests finished with ${failures} failure(s).\n`);
    process.exit(failures > 0 ? 1 : 0);
}

runTests();
