mod token_store;
mod xal_authenticator;

use neon::prelude::*;

// fn hello(mut cx: FunctionContext) -> JsResult<JsString> {
//     Ok(cx.string("hello node"))
// }

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("tokenstore_load", token_store::load)?;
    // cx.export_function("tokenstore_save", token_store::save)?;

    // cx.export_function("xalauthenticator_default", xal_authenticator::default)?;
    // cx.export_function("xalauthenticator_count", xal_authenticator::count)?;

    cx.export_function("xalauthenticator_get_code_challenge", xal_authenticator::get_code_challenge)?;
    cx.export_function("xalauthenticator_get_device_token", xal_authenticator::get_device_token)?;
    cx.export_function("xalauthenticator_generate_random_state", xal_authenticator::generate_random_state)?;
    cx.export_function("xalauthenticator_do_sisu_authentication", xal_authenticator::do_sisu_authentication)?;
    cx.export_function("xalauthenticator_exchange_code_for_token", xal_authenticator::exchange_code_for_token)?;
    cx.export_function("xalauthenticator_do_sisu_authorization", xal_authenticator::do_sisu_authorization)?;


    let xal_version = cx.string("0.2.1");
    cx.export_value("xal_rs_version", xal_version)?;
    Ok(())
}
