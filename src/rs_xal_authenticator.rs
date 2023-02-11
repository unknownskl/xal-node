use neon::prelude::*;
use tokio::runtime::Runtime;

use xal::{authenticator::XalAuthenticator};

use oauth2::PkceCodeVerifier;
use oauth2::RefreshToken;

use neon::types::Finalize;
use neon::types::Deferred;
use neon::prelude::Context;
use neon::event::Channel;
use neon::result::NeonResult;

use std::sync::mpsc;
use std::thread;

type XalCallback = Box<dyn FnOnce(&mut XalAuthenticator, &Channel, Deferred) + Send>;

pub struct RsXalAuthenticator {
    tx: mpsc::Sender<XalPromise>
}

enum XalPromise {
    Callback(Deferred, XalCallback),
    Close,
}

impl RsXalAuthenticator {
    fn new<'a, C>(cx: &mut C) -> Self
    where
        C: Context<'a>,
    {

        let (tx, rx) = mpsc::channel::<XalPromise>();
        let mut xal = XalAuthenticator::default();
        let channel = cx.channel();

        thread::spawn(move || {
            while let Ok(message) = rx.recv() {
                match message {
                    XalPromise::Callback(deferred, f) => {
                        f(&mut xal, &channel, deferred)
                    }
                    XalPromise::Close => break,
                }
            }
        });

        Self { tx }
    }

    fn close(&self) -> Result<(), mpsc::SendError<XalPromise>> {
        self.tx.send(XalPromise::Close)
    }

    fn send(
        &self,
        deferred: Deferred,
        callback: impl FnOnce(&mut XalAuthenticator, &Channel, Deferred) + Send + 'static,
    ) -> Result<(), mpsc::SendError<XalPromise>> {
        self.tx
            .send(XalPromise::Callback(deferred, Box::new(callback)))
    }

}

impl Finalize for RsXalAuthenticator {}


trait SendResultExt {
    fn into_rejection<'a, C: Context<'a>>(self, cx: &mut C) -> NeonResult<()>;
}

impl SendResultExt for Result<(), mpsc::SendError<XalPromise>> {
    fn into_rejection<'a, C: Context<'a>>(self, cx: &mut C) -> NeonResult<()> {
        self.or_else(|err| {
            let msg = err.to_string();

            match err.0 {
                XalPromise::Callback(deferred, _) => {
                    let err = cx.error(msg)?;
                    deferred.reject(cx, err);
                    Ok(())
                }
                XalPromise::Close => cx.throw_error("Expected XalPromise::Callback"),
            }
        })
    }
}

//
// JS bridge functions
//

impl RsXalAuthenticator {

    pub fn js_new(mut cx: FunctionContext) -> JsResult<JsBox<RsXalAuthenticator>> {
        let xal = RsXalAuthenticator::new(&mut cx);

        Ok(cx.boxed(xal))
    }

    pub fn js_close(mut cx: FunctionContext) -> JsResult<JsUndefined> {
        // Get the `this` value as a `JsBox<Database>`
        cx.this()
            .downcast_or_throw::<JsBox<RsXalAuthenticator>, _>(&mut cx)?
            .close()
            .or_else(|err| cx.throw_error(err.to_string()))?;

        Ok(cx.undefined())
    }

    pub fn js_get_device_token(mut cx: FunctionContext) -> JsResult<JsPromise> {
        let (deferred, promise) = cx.promise();
        let xal = cx.this().downcast_or_throw::<JsBox<RsXalAuthenticator>, _>(&mut cx)?;

        xal.send(deferred, move |handle, channel, deferred| {
            let rt = Runtime::new().unwrap();
            let result = rt.block_on(async {
                let auth_response = handle
                    .get_device_token()
                    .await.unwrap();
                    
                return serde_json::to_string(&auth_response)
            });
            

            deferred.settle_with(channel, move |mut cx| {
                Ok(cx.string(result.unwrap()))
            });
        })
        .into_rejection(&mut cx)?;

        Ok(promise)
    }

    pub fn js_generate_random_state(mut cx: FunctionContext) -> JsResult<JsPromise> {
        let (deferred, promise) = cx.promise();
        let xal = cx.this().downcast_or_throw::<JsBox<RsXalAuthenticator>, _>(&mut cx)?;

        xal.send(deferred, move |_handle, channel, deferred| {
            let result = XalAuthenticator::generate_random_state();

            deferred.settle_with(channel, move |mut cx| {
                Ok(cx.string(result))
            });
        })
        .into_rejection(&mut cx)?;

        Ok(promise)
    }

    pub fn js_get_code_challenge(mut cx: FunctionContext) -> JsResult<JsPromise> {
        let (deferred, promise) = cx.promise();
        let xal = cx.this().downcast_or_throw::<JsBox<RsXalAuthenticator>, _>(&mut cx)?;

        xal.send(deferred, move |_handle, channel, deferred| {
            let (code_challenge, code_verifier) = XalAuthenticator::get_code_challenge();

            deferred.settle_with(channel, move |mut cx| {
                let result = cx.empty_object();

                let code_challenge_cx = cx.string(code_challenge.as_str());
                result.set(&mut cx, "code_challenge", code_challenge_cx)?;

                let code_verifier_cx = cx.string(code_verifier.secret().as_str());
                result.set(&mut cx, "code_verifier", code_verifier_cx)?;

                Ok(result)
            });
        })
        .into_rejection(&mut cx)?;

        Ok(promise)
    }



    pub fn js_do_sisu_authentication(mut cx: FunctionContext) -> JsResult<JsPromise> {
        let device_token = cx.argument::<JsString>(0)?.value(&mut cx);

        let (deferred, promise) = cx.promise();
        let xal = cx.this().downcast_or_throw::<JsBox<RsXalAuthenticator>, _>(&mut cx)?;

        xal.send(deferred, move |handle, channel, deferred| {
            let rt = Runtime::new().unwrap();
            // Get code_challange
            let (code_challenge, code_verifier) = XalAuthenticator::get_code_challenge();

            // Get State
            let state = XalAuthenticator::generate_random_state();

            let (sisu_result, sisu_session_id) = rt.block_on(async {
                let (auth_response, session_id) = handle
                    .do_sisu_authentication(&device_token, code_challenge, state.as_str())
                    .await.unwrap();
                    
                return (serde_json::to_string(&auth_response), session_id)
            });

            deferred.settle_with(channel, move |mut cx| {
                // Ok(cx.string(result.unwrap()))
                let result = cx.empty_object();

                let sisu_result_cx = cx.string(sisu_result.unwrap());
                result.set(&mut cx, "msal_response", sisu_result_cx)?;

                let code_verifier_cx = cx.string(code_verifier.secret());
                result.set(&mut cx, "local_code_verifier", code_verifier_cx)?;

                let sisu_session_cx = cx.string(sisu_session_id);
                result.set(&mut cx, "sisu_session_id", sisu_session_cx)?;

                Ok(result)
            });
        })
        .into_rejection(&mut cx)?;

        Ok(promise)
    }

    pub fn js_do_sisu_authorization(mut cx: FunctionContext) -> JsResult<JsPromise> {
        let sisu_session_id = cx.argument::<JsString>(0)?.value(&mut cx);
        let user_token = cx.argument::<JsString>(1)?.value(&mut cx);
        let device_token = cx.argument::<JsString>(2)?.value(&mut cx);

        let (deferred, promise) = cx.promise();
        let xal = cx.this().downcast_or_throw::<JsBox<RsXalAuthenticator>, _>(&mut cx)?;

        xal.send(deferred, move |handle, channel, deferred| {
            let rt = Runtime::new().unwrap();
            let sisu_result  = rt.block_on(async {
                let auth_response = handle
                    .do_sisu_authorization(&sisu_session_id, user_token.as_str(), device_token.as_str())
                    .await.unwrap();
                    
                return serde_json::to_string(&auth_response)
            });

            deferred.settle_with(channel, move |mut cx| {
                Ok(cx.string(sisu_result.unwrap()))
            });
        })
        .into_rejection(&mut cx)?;

        Ok(promise)
    }


    pub fn js_exchange_code_for_token(mut cx: FunctionContext) -> JsResult<JsPromise> {
        let code = cx.argument::<JsString>(0)?.value(&mut cx);
        let local_verifier = cx.argument::<JsString>(1)?.value(&mut cx);

        let (deferred, promise) = cx.promise();
        let xal = cx.this().downcast_or_throw::<JsBox<RsXalAuthenticator>, _>(&mut cx)?;

        xal.send(deferred, move |handle, channel, deferred| {
            let rt = Runtime::new().unwrap();
            let local_code_verifier = PkceCodeVerifier::new(local_verifier);

            let result = rt.block_on(async {
                let auth_response = handle
                    .exchange_code_for_token(&code, local_code_verifier)
                    .await.unwrap();
                    
                return serde_json::to_string(&auth_response)
            });

            deferred.settle_with(channel, move |mut cx| {

                Ok(cx.string(result.unwrap()))
            });
        })
        .into_rejection(&mut cx)?;

        Ok(promise)
    }


    pub fn js_do_xsts_authorization(mut cx: FunctionContext) -> JsResult<JsPromise> {
        let device_token = cx.argument::<JsString>(0)?.value(&mut cx);
        let title_token = cx.argument::<JsString>(1)?.value(&mut cx);
        let user_token = cx.argument::<JsString>(2)?.value(&mut cx);
        let relaying_party = cx.argument::<JsString>(3)?.value(&mut cx);

        let (deferred, promise) = cx.promise();
        let xal = cx.this().downcast_or_throw::<JsBox<RsXalAuthenticator>, _>(&mut cx)?;

        xal.send(deferred, move |handle, channel, deferred| {
            let rt = Runtime::new().unwrap();
            let result = rt.block_on(async {
                let auth_response = handle
                .do_xsts_authorization(
                    device_token.as_str(),
                    title_token.as_str(),
                    user_token.as_str(),
                    relaying_party.as_str(),
                ).await.unwrap();
                
                return serde_json::to_string(&auth_response)
            });

            deferred.settle_with(channel, move |mut cx| {

                Ok(cx.string(result.unwrap()))
            });
        })
        .into_rejection(&mut cx)?;

        Ok(promise)
    }

    pub fn js_exchange_refresh_token_for_xcloud_transfer_token(mut cx: FunctionContext) -> JsResult<JsPromise> {
        let refresh_token = cx.argument::<JsString>(0)?.value(&mut cx);
        let refresh_token_oauth = RefreshToken::new(refresh_token.to_owned());

        let (deferred, promise) = cx.promise();
        let xal = cx.this().downcast_or_throw::<JsBox<RsXalAuthenticator>, _>(&mut cx)?;

        xal.send(deferred, move |handle, channel, deferred| {
            let rt = Runtime::new().unwrap();
            let result = rt.block_on(async {
                let auth_response = handle
                .exchange_refresh_token_for_xcloud_transfer_token(&refresh_token_oauth)
                .await.unwrap();
                
                return serde_json::to_string(&auth_response)
            });

            deferred.settle_with(channel, move |mut cx| {

                Ok(cx.string(result.unwrap()))
            });
        })
        .into_rejection(&mut cx)?;

        Ok(promise)
    }


}