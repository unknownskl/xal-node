const test = require('node:test')
const assert = require('node:assert').strict

const xal = require('../')
const TokenStore = new xal.TokenStore()

test('TokenStore should have an handler returned', (t) => {
    assert.notDeepStrictEqual(TokenStore, undefined, "xal.TokenStore should not be undefined")
});

test('TokenStore should have default values set when no tokens are present', (t) => {
    assert.deepStrictEqual(TokenStore.hasValidAuthTokens(), false, "hasValidAuthTokens should return false")
});

test('TokenStore should have a token set when a dummy token is set (user)', (t) => {
    TokenStore.setUserToken({ data: 'dummy', expires_in: 10 })

    assert.deepStrictEqual(TokenStore.hasValidAuthTokens(), false, "hasValidAuthTokens should return false")
    assert.notDeepStrictEqual(TokenStore._userToken, undefined, "_userToken should not return undefined")
    assert.deepStrictEqual(TokenStore._sisuToken, undefined, "_sisuToken should return undefined")
    assert.deepStrictEqual(TokenStore._userToken.data.data, 'dummy', "_userToken should return the dummy data")
});

test('TokenStore should have a token set when a dummy token is set (user + sisu)', (t) => {
    TokenStore.setUserToken({ data: 'dummyUser', expires_in: 10 })
    TokenStore.setSisuToken({ data: 'dummySisu' })

    assert.deepStrictEqual(TokenStore.hasValidAuthTokens(), true, "hasValidAuthTokens should return true")
    assert.notDeepStrictEqual(TokenStore._userToken, undefined, "_userToken should not return undefined")
    assert.notDeepStrictEqual(TokenStore._sisuToken, undefined, "_sisuToken should not return undefined")
    assert.deepStrictEqual(TokenStore._userToken.data.data, 'dummyUser', "_userToken should return the dummy data")
    assert.deepStrictEqual(TokenStore._sisuToken.data.data, 'dummySisu', "_userToken should return the dummy data")
});