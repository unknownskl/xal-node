mod token_store;
mod rs_xal_authenticator;

use rs_xal_authenticator::{RsXalAuthenticator};

use neon::prelude::*;

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    // cx.export_function("tokenstore_load", token_store::load)?;
    // cx.export_function("tokenstore_save", token_store::save)?;

    cx.export_function("xalauthenticatorNew", RsXalAuthenticator::js_new)?;
    cx.export_function("xalauthenticatorClose", RsXalAuthenticator::js_close)?;
    cx.export_function("xalauthenticatorGetDeviceToken", RsXalAuthenticator::js_get_device_token)?;
    cx.export_function("xalauthenticatorGenerateRandomState", RsXalAuthenticator::js_generate_random_state)?;
    cx.export_function("xalauthenticatorGetCodeChallenge", RsXalAuthenticator::js_get_code_challenge)?;
    cx.export_function("xalauthenticatorDoSisuAuthentication", RsXalAuthenticator::js_do_sisu_authentication)?;
    cx.export_function("xalauthenticatorDoSisuAuthorization", RsXalAuthenticator::js_do_sisu_authorization)?;
    cx.export_function("xalauthenticatorExchangeCodeForToken", RsXalAuthenticator::js_exchange_code_for_token)?;
    cx.export_function("xalauthenticatorDoXstsAuthorization", RsXalAuthenticator::js_do_xsts_authorization)?;
    cx.export_function("xalauthenticatorExchangeRefreshTokenForXcloudTransferToken", RsXalAuthenticator::js_exchange_refresh_token_for_xcloud_transfer_token)?;

    Ok(())
}
