const test = require('node:test');
const assert = require('node:assert/strict');
const { getTodayDateExpression, buildHistoryQuery } = require('../src/database/QueryHelper');

test('uses Oracle-compatible date functions when the DB client is oracle', () => {
  assert.equal(getTodayDateExpression('oracle'), 'TRUNC(SYSDATE)');
  assert.equal(getTodayDateExpression('mysql'), 'CURDATE()');
});

test('builds an Oracle-compatible history query with a row limit clause', () => {
  const sql = buildHistoryQuery('oracle', 10);
  assert.match(sql, /FETCH FIRST 10 ROWS ONLY/);
  assert.doesNotMatch(sql, /LIMIT 10/);
});
