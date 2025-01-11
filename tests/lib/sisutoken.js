const test = require('node:test')
const assert = require('node:assert').strict

const SisuToken = require('../../dist/lib/tokens/sisutoken').default

test('SisuToken should have an handler returned', (t) => {
    assert.notDeepStrictEqual(SisuToken, undefined, "SisuToken should not be undefined")
});

test('SisuToken should have default values set when no tokens are present', (t) => {
    const sisuToken = new SisuToken({})

    assert.deepStrictEqual(sisuToken.isValid(), false, "isValid should return false")
    assert(sisuToken.getSecondsValid() <= 0, "getSecondsValid should return a value lower then zero")
});

test('SisuToken should have a token set when a dummy token is set (device)', (t) => {
    var IssueDate = new Date();
    var NotAfterDate = new Date();
    NotAfterDate.setDate(NotAfterDate.getDate() + 14);
    
    const sisuToken = new SisuToken({
        "DeviceToken": "dummyDeviceToken",
        "TitleToken": {
          "DisplayClaims": {
            "xti": {
              "tid": "0000000000"
            }
          },
          "IssueInstant": IssueDate.toISOString(),
          "NotAfter": NotAfterDate.toISOString(),
          "Token": "dummyTitleToken"
        },
        "UserToken": {
          "DisplayClaims": {
            "xui": [
              {
                "uhs": "0000000000000000000"
              }
            ]
          },
          "IssueInstant": IssueDate.toISOString(),
          "NotAfter": NotAfterDate.toISOString(),
          "Token": "dummyUserToken"
        },
        "AuthorizationToken": {
          "DisplayClaims": {
            "xui": [
              {
                "gtg": "dummyGamertagUser",
                "xid": "1111111111111111",
                "uhs": "0000000000000000000",
                "mgt": "dummyGamertagUser",
                "umg": "dummyGamertagUser",
                "agg": "Adult",
                "usr": "000 000",
                "prv": "000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000"
              }
            ]
          },
          "IssueInstant": IssueDate.toISOString(),
          "NotAfter": NotAfterDate.toISOString(),
          "Token": "dummyAuthToken"
        },
        "WebPage": "https://sisu.xboxlive.com/client/v33/000000004c20a908/view/index.html",
        "Sandbox": "RETAIL",
        "UseModernGamertag": true,
        "Flow": ""
    })
    
    assert.deepStrictEqual(sisuToken.isValid(), true, 'hasValidAuthTokens should return true');
    assert(sisuToken.getSecondsValid() >= 1, 'getSecondsValid should a positive value');
});