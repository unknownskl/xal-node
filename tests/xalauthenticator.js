const test = require('node:test')
const assert = require('node:assert').strict

const XalLibrary = require('../')
const xal = new XalLibrary.Xal()

test('XalAuthenticator should have an handler returned', (t) => {
    assert.notDeepStrictEqual(xal, undefined, "xal.handler should not be undefined")
});

test('XalAuthenticator should retrieve a deviceToken', async (t) => {
    const xal2 = new XalLibrary.Xal()

    const deviceToken = await xal2.getDeviceToken()

    assert.notDeepStrictEqual(deviceToken.Token, undefined, "Device token should not be undefined")
    assert.notDeepStrictEqual(deviceToken.DisplayClaims, undefined, "DisplayClaims should not be undefined")
});

test('XalAuthenticator should retrieve a authentication URL', async (t) => {
    const xal2 = new XalLibrary.Xal()

    const deviceToken = await xal2.getDeviceToken()
    assert.notDeepStrictEqual(deviceToken.Token, undefined, "Device token should not be undefined")
    assert.notDeepStrictEqual(deviceToken.DisplayClaims, undefined, "DisplayClaims should not be undefined")

    const codeChallange = await xal2.getCodeChallange()
    const state = xal2.getRandomState()
    const sisuResponse = await xal2.doSisuAuthentication(deviceToken, codeChallange, state)

    assert.notDeepStrictEqual(codeChallange.verifier, undefined, "verifier should not be undefined")
    assert.notDeepStrictEqual(state, undefined, "state should not be undefined")
    assert.notDeepStrictEqual(sisuResponse.SessionId, undefined, "SessionId should not be undefined")
    assert.notDeepStrictEqual(sisuResponse.MsaOauthRedirect, undefined, "MsaOauthRedirect should not be undefined")
});

test('XalAuthenticator refreshUserToken should fail properly', async (t) => {
    const xal2 = new XalLibrary.Xal()

    try {
        await xal2.refreshUserToken('')
        assert.notDeepStrictEqual(true, true, "refreshUserToken should fail")

    } catch (error) {
        assert.notDeepStrictEqual(error, undefined, "Error should not be undefined")
        assert.notDeepStrictEqual(error.expected, true, "refreshUserToken should fail")
        assert.deepStrictEqual(error.statuscode, 400, "Statuscode should be 400")
    }
});

test('XalAuthenticator getStreamToken should fail properly', async (t) => {
    const xal2 = new XalLibrary.Xal()

    try {
        await xal2.getStreamToken('', 'xhome')
        assert.notDeepStrictEqual(true, true, "getStreamToken should fail")

    } catch (error) {
        assert.notDeepStrictEqual(error, undefined, "Error should not be undefined")
        assert.notDeepStrictEqual(error.expected, true, "getStreamToken should fail")
        assert.deepStrictEqual(error.statuscode, 400, "Statuscode should be 400")
    }
});