const test = require('node:test')
const assert = require('node:assert').strict

const XalLibrary = new require('../dist/lib').default
const xal = new XalLibrary.XalAuthenticator()

test('XalAuthenticator should have an handler returned', (t) => {
    assert.notDeepStrictEqual(xal.handler, undefined, "xal.handler should not be undefined")
});

test('XalAuthenticator should retrieve a deviceToken', (t) => {
    const xal2 = new XalLibrary.XalAuthenticator()

    xal2.get_device_token().then((device_token) => {
        console.log('RESULT:', device_token)
        assert.notDeepStrictEqual(device_token.Token, undefined, "Device token should not be undefined")
        assert.notDeepStrictEqual(device_token.DisplayClaims, undefined, "DisplayClaims should not be undefined")

        xal2.close()
    }).catch((error) => {
        console.log(error)
        assert.fail('Failed to retrieve deviceTokens')
    })
});

xal.close()