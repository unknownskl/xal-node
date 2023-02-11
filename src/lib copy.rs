use neon::prelude::*;
// use xal::*;
use xal::authenticator::XalAuthenticator;
// use tokio::task::block_in_place;
// use tokio::runtime::Runtime;
use lazy_static::lazy_static; // 1.4.0
use std::sync::Mutex;

lazy_static! {
    static ref XAL_INSTANCES: Mutex<Vec<XalAuthenticator>> = Mutex::new(vec![]);
}

fn hello(mut cx: FunctionContext) -> JsResult<JsString> {
    Ok(cx.string("hello node"))
}

fn init(mut cx: FunctionContext) -> JsResult<JsObject> {
    let mut xal = XalAuthenticator::default();

    XAL_INSTANCES.lock().unwrap().push(xal);

    let obj = cx.empty_object();
    let test = cx.string("test");
    obj.set(&mut cx, "instances", test)?;


    // let (code_challenge, code_verifier) = XalAuthenticator::get_code_challenge();

    // // let device_token = block_in_place(|| async {
    // let rt = Runtime::new().unwrap();
    // let device_token = rt.block_on(async {
    //     let device_code = xal.get_device_token().await;
    //     return device_code
    // });

    // // dbg!(device_token);

    // Ok(cx.string(device_token.unwrap().token_data.token))
    Ok(obj)
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("hello", hello)?;
    cx.export_function("init", init)?;
    Ok(())
}
