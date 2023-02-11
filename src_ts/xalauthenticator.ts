const {
    xalauthenticatorNew,
    xalauthenticatorGetDeviceToken,
    xalauthenticatorGenerateRandomState,
    xalauthenticatorGetCodeChallenge,
    xalauthenticatorDoSisuAuthentication,
    xalauthenticatorExchangeCodeForToken,
    xalauthenticatorDoSisuAuthorization,
} = require("../dist/index.node");

const moduleAll = require("../dist/index.node");

export default class XalAuthenticator {

    // client_params
    // app_params
    // client_id

    handler

    constructor(){

        this.handler = new xalauthenticatorNew()
    }

    // new() {
    //     return xalauthenticator_default()
    // }

    // count() {
    //     return xalauthenticator_count()
    // }

    get_code_challenge() {
        return new Promise((resolve, reject) => {
            xalauthenticatorGetCodeChallenge.call(this.handler).then((rs_resolve) => {
                resolve(rs_resolve)
            }).catch((error) => {
                reject(error)
            })
        })
    }

    get_device_token() {
        return new Promise((resolve, reject) => {
            xalauthenticatorGetDeviceToken.call(this.handler).then((rs_resolve) => {
                resolve(JSON.parse(rs_resolve))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    generate_random_state() {
        return new Promise((resolve, reject) => {
            xalauthenticatorGenerateRandomState.call(this.handler).then((rs_resolve) => {
                resolve(rs_resolve)
            }).catch((error) => {
                reject(error)
            })
        })
    }

    do_sisu_authentication(device_token:String) {
        return new Promise((resolve, reject) => {
            xalauthenticatorDoSisuAuthentication.call(this.handler, device_token).then((rs_resolve) => {
                rs_resolve.msal_response = JSON.parse(rs_resolve.msal_response)
                resolve(rs_resolve)
            }).catch((error) => {
                reject(error)
            })
        })
    }

    do_sisu_authorization(sisu_session_id:String, user_token:String, device_token:String) {
        console.log(sisu_session_id, user_token, device_token)
        return new Promise((resolve, reject) => {
            xalauthenticatorDoSisuAuthorization.call(this.handler, sisu_session_id, user_token, device_token).then((rs_resolve) => {
                // rs_resolve.msal_response = JSON.parse(rs_resolve.msal_response)
                console.log(rs_resolve)
                resolve(rs_resolve)
            }).catch((error) => {
                reject(error)
            })
        })
    }

    exchange_code_for_token(code:String, local_verifier:String) {
        return new Promise((resolve, reject) => {
            xalauthenticatorExchangeCodeForToken.call(this.handler, code, local_verifier).then((rs_resolve) => {
                resolve(JSON.parse(rs_resolve))
            }).catch((error) => {
                reject(error)
            })
        })
    }

}