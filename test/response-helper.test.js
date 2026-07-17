const test = require('node:test');
const assert = require('node:assert/strict');
const responseHelper = require('../src/helpers/ResponseHelper');

test('badRequest resolves locale from a request-like object', () => {
  const request = {
    headers: {
      get(name) {
        if (name === 'x-locale') return 'ja';
        return null;
      }
    }
  };

  const result = responseHelper.badRequest('ALREADY_CLOCKED_IN', request);
  assert.equal(result.status, 400);
  assert.equal(result.jsonBody.message, 'すでに出勤済みです。');
});

test('serverError falls back to the original message when no translation key exists', () => {
  const result = responseHelper.serverError(new Error('Custom failure message'), 'en');
  assert.equal(result.status, 500);
  assert.equal(result.jsonBody.message, 'Custom failure message');
});
