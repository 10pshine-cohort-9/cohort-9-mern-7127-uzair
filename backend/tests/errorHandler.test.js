const chai = require('chai');
const { expect } = chai;
const errorHandler = require('../src/middleware/errorHandler');

describe('errorHandler middleware', () => {
  it('returns the error\'s own status and message when set', () => {
    let statusCode;
    let jsonBody;

    const req = { path: '/test', method: 'GET' };
    const res = {
      status(code) { statusCode = code; return this; },
      json(body) { jsonBody = body; return this; },
    };

    const err = new Error('Something specific broke');
    err.statusCode = 422;

    errorHandler(err, req, res, () => {});

    expect(statusCode).to.equal(422);
    expect(jsonBody).to.deep.equal({ message: 'Something specific broke' });
  });

  it('defaults to 500 and hides the real message when no statusCode is set', () => {
    let statusCode;
    let jsonBody;

    const req = { path: '/test', method: 'GET' };
    const res = {
      status(code) { statusCode = code; return this; },
      json(body) { jsonBody = body; return this; },
    };

    const err = new Error('Some internal detail that should not leak');

    errorHandler(err, req, res, () => {});

    expect(statusCode).to.equal(500);
    expect(jsonBody.message).to.equal('Something went wrong. Please try again.');
  });
});