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
let getEmployeesHandler;
const originalHttp = app.http;
app.http = (name, options) => {
    if (name === 'GetEmployees') {
        getEmployeesHandler = options.handler;
    }
    if (originalHttp) {
        originalHttp.call(app, name, options);
    }
};

// Load the function which triggers registration
require('../src/functions/GetEmployees');

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

        // Parse query string using standard Node URL searchParams
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

// 4. Test Runner
async function runTests() {
    console.log('Starting GetEmployees API Tests...\n');
    let failures = 0;

    const assert = (condition, message) => {
        if (condition) {
            console.log(`  ✅ PASSED: ${message}`);
        } else {
            console.error(`  ❌ FAILED: ${message}`);
            failures++;
        }
    };

    try {
        // --- TEST 1: Unauthorized request (Missing Authorization header) ---
        console.log('Test 1: Request with missing Authorization header');
        const req1 = new MockRequest('GET', 'http://localhost:7071/api/GetEmployees');
        const res1 = await getEmployeesHandler(req1, mockContext);
        
        assert(res1.status === 401, 'Should return 401 status');
        let body1 = JSON.parse(res1.body);
        assert(body1.error === 'Unauthorized', 'Should return "Unauthorized" error message');

        // --- TEST 2: Request with no filters (should return all 5 employees) ---
        console.log('\nTest 2: GET with no filters');
        const req2 = new MockRequest('GET', 'http://localhost:7071/api/GetEmployees', {
            'Authorization': 'Bearer valid-mock-token'
        });
        const res2 = await getEmployeesHandler(req2, mockContext);

        assert(res2.status === 200, 'Should return 200 OK');
        let body2 = JSON.parse(res2.body);
        assert(body2.total === 5, 'Should return total 5 employees');
        assert(body2.items.length === 5, 'Should return 5 items');

        // --- TEST 3: Filter by name (e.g. ?name=Jane) ---
        console.log('\nTest 3: GET filtering by name (?name=Jane)');
        const req3 = new MockRequest('GET', 'http://localhost:7071/api/GetEmployees?name=Jane', {
            'Authorization': 'Bearer valid-mock-token'
        });
        const res3 = await getEmployeesHandler(req3, mockContext);

        assert(res3.status === 200, 'Should return 200 OK');
        let body3 = JSON.parse(res3.body);
        assert(body3.total === 1, 'Should find 1 employee');
        assert(body3.items[0].firstName === 'Jane' && body3.items[0].lastName === 'Doe', 'Should be Jane Doe');

        // --- TEST 4: Filter by department (e.g. ?department=Engineering) ---
        console.log('\nTest 4: GET filtering by department (?department=Engineering)');
        const req4 = new MockRequest('GET', 'http://localhost:7071/api/GetEmployees?department=Engineering', {
            'Authorization': 'Bearer valid-mock-token'
        });
        const res4 = await getEmployeesHandler(req4, mockContext);

        assert(res4.status === 200, 'Should return 200 OK');
        let body4 = JSON.parse(res4.body);
        assert(body4.total === 3, 'Should find 3 Engineering employees');
        assert(body4.items.every(emp => emp.department === 'Engineering'), 'All items should belong to Engineering');

        // --- TEST 5: Filter by office (e.g. ?office=Tokyo) ---
        console.log('\nTest 5: GET filtering by office (?office=Tokyo)');
        const req5 = new MockRequest('GET', 'http://localhost:7071/api/GetEmployees?office=Tokyo', {
            'Authorization': 'Bearer valid-mock-token'
        });
        const res5 = await getEmployeesHandler(req5, mockContext);

        assert(res5.status === 200, 'Should return 200 OK');
        let body5 = JSON.parse(res5.body);
        assert(body5.total === 2, 'Should find 2 employees in Tokyo');
        assert(body5.items.every(emp => emp.office === 'Tokyo'), 'All items should belong to Tokyo office');

        // --- TEST 6: Combined filters (?department=Engineering&office=Tokyo) ---
        console.log('\nTest 6: GET filtering by department and office (?department=Engineering&office=Tokyo)');
        const req6 = new MockRequest('GET', 'http://localhost:7071/api/GetEmployees?department=Engineering&office=Tokyo', {
            'Authorization': 'Bearer valid-mock-token'
        });
        const res6 = await getEmployeesHandler(req6, mockContext);

        assert(res6.status === 200, 'Should return 200 OK');
        let body6 = JSON.parse(res6.body);
        assert(body6.total === 2, 'Should find 2 employees matching combined criteria');
        assert(body6.items.every(emp => emp.department === 'Engineering' && emp.office === 'Tokyo'), 'All matched items must be Engineering and Tokyo');

        // --- TEST 7: Combined filters with no match (?department=HR&office=Tokyo) ---
        console.log('\nTest 7: GET filtering by department and office with no match (?department=HR&office=Tokyo)');
        const req7 = new MockRequest('GET', 'http://localhost:7071/api/GetEmployees?department=HR&office=Tokyo', {
            'Authorization': 'Bearer valid-mock-token'
        });
        const res7 = await getEmployeesHandler(req7, mockContext);

        assert(res7.status === 200, 'Should return 200 OK');
        let body7 = JSON.parse(res7.body);
        assert(body7.total === 0, 'Should return 0 matches');

        // --- TEST 8: Case insensitive name match (e.g. ?name=satoshi) ---
        console.log('\nTest 8: GET filtering by name case-insensitively (?name=satoshi)');
        const req8 = new MockRequest('GET', 'http://localhost:7071/api/GetEmployees?name=satoshi', {
            'Authorization': 'Bearer valid-mock-token'
        });
        const res8 = await getEmployeesHandler(req8, mockContext);

        assert(res8.status === 200, 'Should return 200 OK');
        let body8 = JSON.parse(res8.body);
        assert(body8.total === 1, 'Should find Satoshi');
        assert(body8.items[0].firstName === 'Satoshi', 'First name should match Satoshi');

    } catch (error) {
        console.error('Unexpected error running tests:', error);
        failures++;
    }

    console.log(`\nTests finished with ${failures} failure(s).\n`);
    process.exit(failures > 0 ? 1 : 0);
}

runTests();
