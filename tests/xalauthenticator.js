const test = require('node:test')
const assert = require('node:assert').strict

const XalAuthenticator = new require('../').XalAuthenticator
const xal = new XalAuthenticator()

test('XalAuthenticator should have an handler returned', (t) => {
    assert.notDeepStrictEqual(xal.handler, undefined, "xal.handler should not be undefined");
});

xal.close()