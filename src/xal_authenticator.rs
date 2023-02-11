use neon::prelude::*;
use xal::{authenticator::XalAuthenticator, models::response::SisuAuthenticationResponse, oauth2::{PkceCodeChallenge, PkceCodeVerifier, PkceCodeChallengeMethod}};
use tokio::runtime::Runtime;
use lazy_static::lazy_static; // 1.4.0
use std::sync::Mutex;

lazy_static! {
    static ref XAL_AUTHENTICATOR:XalAuthenticator = XalAuthenticator::default();
    static ref XAL_INSTANCES: Mutex<Vec<XalAuthenticator>> = Mutex::new(vec![]);
}

// pub fn default(mut cx: FunctionContext) -> JsResult<JsBox<XalAuthenticator>> {
//     let xal = XalAuthenticator::default();

//     Ok(cx.boxed(XalAuthenticator::default()))
// }

// pub fn count(mut cx: FunctionContext) -> JsResult<JsNumber> {
//     // let mut xal = XalAuthenticator::default();
//     // XAL_INSTANCES.lock().unwrap().push(xal);

//     let insert_id:f64 = XAL_INSTANCES.lock().iter().count() as f64;

//     Ok(cx.number(insert_id))
// }

pub fn get_code_challenge(mut cx: FunctionContext) -> JsResult<JsObject> {
    let (code_challenge, code_verifier) = XalAuthenticator::get_code_challenge();

    let obj = cx.empty_object();

    let code_chal = cx.string(code_challenge.as_str());
    obj.set(&mut cx, "code_challenge", code_chal)?;

    let code_method = cx.string(code_challenge.method().as_str());
    obj.set(&mut cx, "code_method", code_method)?;

    Ok(obj)
}

pub fn get_device_token(mut cx: FunctionContext) -> JsResult<JsString> {
    let mut xal = XalAuthenticator::default();
    // let device_token = xal.get_device_token().await?;

    let rt = Runtime::new().unwrap();
    let device_token = rt.block_on(async {
        let device_code = xal.get_device_token().await;
        return device_code.unwrap().token_data.token
    });

    // Ok(cx.string(device_token.unwrap().token_data.token))
    Ok(cx.string(device_token))
}

pub fn generate_random_state(mut cx: FunctionContext) -> JsResult<JsString> {
    let random_state = XalAuthenticator::generate_random_state();

    Ok(cx.string(random_state))
}

struct XalSisuAuthenticationResponse {
    sisu_response: SisuAuthenticationResponse,
    sisu_session_id: String,
}

pub fn do_sisu_authentication(mut cx: FunctionContext) -> JsResult<JsObject> {
    let mut xal = XalAuthenticator::default();
    // get_device_token
    let rt = Runtime::new().unwrap();
    let device_token = rt.block_on(async {
        let device_code = xal.get_device_token().await;
        return device_code.unwrap().token_data.token
    });
    
    // get_code_challenge
    let (code_challenge_s, code_verifier_s) = XalAuthenticator::get_code_challenge();

    // generate_random_state
    let state = XalAuthenticator::generate_random_state();
    
    // let code_challenge_s = PkceCodeChallenge::from_code_verifier_sha256(&PkceCodeVerifier::new(code_challenge));

    let rt = Runtime::new().unwrap();
    let sisu_response = rt.block_on(async {
        let (sisu_response, sisu_session_id) = xal
            .do_sisu_authentication(&device_token, code_challenge_s, &state)
            .await.unwrap();

        return XalSisuAuthenticationResponse {
            sisu_response,
            sisu_session_id
        }
    });

    let obj = cx.empty_object();

    let msa_oauth_redirect = cx.string(sisu_response.sisu_response.msa_oauth_redirect);
    obj.set(&mut cx, "msa_oauth_redirect", msa_oauth_redirect)?;

    let sisu_session_id = cx.string(sisu_response.sisu_session_id);
    obj.set(&mut cx, "sisu_session_id", sisu_session_id)?;

    let code_verifier = cx.string(code_verifier_s.secret().clone());
    obj.set(&mut cx, "code_verifier", code_verifier)?;

    let device_token = cx.string(device_token);
    obj.set(&mut cx, "device_token", device_token)?;

    Ok(obj)
}

struct XalSisuAuthorizationResponse {
    device_token: String,
    title_token: String,
    user_token: String,
}

pub fn do_sisu_authorization(mut cx: FunctionContext) -> JsResult<JsObject> {
    let sisu_session_id = cx.argument::<JsString>(0)?.value(&mut cx);
    let wl_token = cx.argument::<JsString>(1)?.value(&mut cx);
    let device_token = cx.argument::<JsString>(2)?.value(&mut cx);

    let mut xal = XalAuthenticator::default();

    let rt = Runtime::new().unwrap();
    let auth_response = rt.block_on(async {
        let auth_response = xal
            .do_sisu_authorization(
                &sisu_session_id,
                &wl_token,
                &device_token,
            )
            .await.unwrap();
            
        return XalSisuAuthorizationResponse {
            device_token: auth_response.device_token,
            title_token: auth_response.title_token.token_data.token,
            user_token: auth_response.user_token.token_data.token,
        }
    });

    let obj = cx.empty_object();

    let device_token = cx.string(auth_response.device_token);
    obj.set(&mut cx, "device_token", device_token)?;

    let title_token = cx.string(auth_response.title_token);
    obj.set(&mut cx, "title_token", title_token)?;

    let user_token = cx.string(auth_response.user_token);
    obj.set(&mut cx, "user_token", user_token)?;

    Ok(obj)
}

pub fn exchange_code_for_token(mut cx: FunctionContext) -> JsResult<JsString> {
    let code = cx.argument::<JsString>(0)?.value(&mut cx);
    let code2 = cx.argument::<JsString>(0)?.value(&mut cx);
    let code_verifier = cx.argument::<JsString>(1)?.value(&mut cx);

    let mut xal = XalAuthenticator::default();
    let local_code_verifier = PkceCodeVerifier::new(code_verifier);

    let rt = Runtime::new().unwrap();
    let wl_token = rt.block_on(async {
        let wl_token = xal
            .exchange_code_for_token(&code2, local_code_verifier)
            .await
            .expect("Failed exchanging code for token");
        let wl_token_clone = wl_token.clone();
        return wl_token
    });

    Ok(cx.string(wl_token.access_token.secret()))
}