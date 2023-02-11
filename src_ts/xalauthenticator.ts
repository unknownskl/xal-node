const {
    xalauthenticator_default,
    xalauthenticator_count,
    xalauthenticator_get_code_challenge,
    xalauthenticator_get_device_token,
    xalauthenticator_generate_random_state,
    xalauthenticator_do_sisu_authentication,
    xalauthenticator_exchange_code_for_token,
    xalauthenticator_do_sisu_authorization,
} = require("../dist/index.node");

export default class XalAuthenticator {

    // client_params
    // app_params
    // client_id

    constructor(){
    }

    new() {
        return xalauthenticator_default()
    }

    count() {
        return xalauthenticator_count()
    }

    get_code_challenge() {
        return xalauthenticator_get_code_challenge()
    }

    get_device_token() {
        return xalauthenticator_get_device_token()
    }

    generate_random_state() {
        return xalauthenticator_generate_random_state()
    }

    do_sisu_authentication() {
        return xalauthenticator_do_sisu_authentication()
    }

    do_sisu_authorization(sisu_session_id:String, wl_token:String, device_token:String) {
        return xalauthenticator_do_sisu_authorization(sisu_session_id, wl_token, device_token)
    }

    exchange_code_for_token(code:String, code_verifier:String) {
        return xalauthenticator_exchange_code_for_token(code, code_verifier)
    }

}