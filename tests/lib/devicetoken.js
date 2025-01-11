const test = require('node:test')
const assert = require('node:assert').strict

const DeviceToken = require('../../dist/lib/tokens/devicetoken').default

test('DeviceToken should have an handler returned', (t) => {
    assert.notDeepStrictEqual(DeviceToken, undefined, "DeviceToken should not be undefined")
});

test('DeviceToken should have default values set when no tokens are present', (t) => {
    const deviceToken = new DeviceToken({})

    assert.deepStrictEqual(deviceToken.isValid(), false, "isValid should return false")
    assert(deviceToken.getSecondsValid() <= 0, "getSecondsValid should return a value lower then zero")
});

test('DeviceToken should have a token set when a dummy token is set (device)', (t) => {
    var IssueDate = new Date();
    var NotAfterDate = new Date();
    NotAfterDate.setDate(NotAfterDate.getDate() + 14);
    
    const deviceToken = new DeviceToken({
        "IssueInstant": IssueDate.toISOString(),
        "NotAfter": NotAfterDate.toISOString(),
        "Token": "dummytoken",
        "DisplayClaims": {
            "xdi": {
                "did": "F700000000000000",
                "dcs": "3"
            }
        }
    })
    
    assert.deepStrictEqual(deviceToken.isValid(), true, 'hasValidAuthTokens should return true');
    assert(deviceToken.getSecondsValid() >= 1, 'getSecondsValid should a positive value');
});