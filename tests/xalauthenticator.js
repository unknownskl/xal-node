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
    // console.log('sisuResponse', sisuResponse, codeChallange)

    assert.notDeepStrictEqual(codeChallange.verifier, undefined, "verifier should not be undefined")
    assert.notDeepStrictEqual(sisuResponse.SessionId, undefined, "SessionId should not be undefined")
    assert.notDeepStrictEqual(sisuResponse.MsaOauthRedirect, undefined, "MsaOauthRedirect should not be undefined")
});

// test('XalAuthenticator should retrieve a authentication URL', (t) => {
//     const xal2 = new XalLibrary.XalAuthenticator()

//     xal2.get_device_token().then((device_token) => {   
//         // console.log('RESULT:', device_token)
//         assert.notDeepStrictEqual(device_token.Token, undefined, "Device token should not be undefined")
//         assert.notDeepStrictEqual(device_token.DisplayClaims, undefined, "DisplayClaims should not be undefined")

//         xal2.do_sisu_authentication(device_token.Token).then((sisu_response) => {
//             const _authFlowTokens = {
//                 sisu_local_code_verifier: sisu_response.local_code_verifier,
//                 sisu_session_id: sisu_response.sisu_session_id,
//                 sisu_device_token: device_token,
//                 redirect_uri: sisu_response.msal_response.MsaOauthRedirect,
//             }
//             assert.notDeepStrictEqual(sisu_response.local_code_verifier, undefined, "local_code_verifier should not be undefined")
//             assert.notDeepStrictEqual(sisu_response.sisu_session_id, undefined, "local_code_verifier should not be undefined")
//             assert.notDeepStrictEqual(sisu_response.msal_response.SessionId, undefined, "msal_response.MsaOauthRedirect should not be undefined")
//             assert.notDeepStrictEqual(sisu_response.msal_response.MsaOauthRedirect, undefined, "msal_response.MsaOauthRedirect should not be undefined")

//             // console.log('RESULT:', sisu_response)
//             t()

//         }).catch((error) => {
//             assert.fail('do_sisu_authentication should not fail')
//         })
        
//     }).catch((error) => {
//         console.log(error)
//         assert.fail('Failed to retrieve deviceTokens')
//     })
// });

// xal.close()