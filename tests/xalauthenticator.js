const test = require('node:test')
const assert = require('node:assert').strict

const XalLibrary = new require('../dist/lib').default
const xal = new XalLibrary.XalAuthenticator()

test('XalAuthenticator should have an handler returned', (t) => {
    assert.notDeepStrictEqual(xal.handler, undefined, "xal.handler should not be undefined");
});

xal.close()