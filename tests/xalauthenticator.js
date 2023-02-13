const test = require('node:test')
const assert = require('assert')

const XalLibrary = new require('../')

test('synchronous passing test', (t) => {
    // This test passes because it does not throw an exception.
    assert.strictEqual(1, 1);
});