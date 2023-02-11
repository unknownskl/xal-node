// use neon::prelude::*;
// use xal::utils::TokenStore;

// // trait TokenStore {
// //     fn default(&self);
// // }

// // struct MyTokenStore {
// //     // fields go here
// // }

// // impl Default for MyTokenStore {
// //     fn default() -> MyTokenStore {
// //         MyTokenStore { /* fields */ }
// //     }
// // }

// // impl TokenStore for MyTokenStore {
// //     fn default(&self) {
// //         // implementation goes here
// //     }
// // }
// // pub fn default() -> MyTokenStore {
// //     MyTokenStore::default()
// // }

// pub fn default() {
// }

// // pub fn load(filepath: &str) {
// //     // let test = TokenStore::load(filepath);
// //     let mut ts = TokenStore::load(filepath);
// //     // return ts
// // }

// pub fn load(mut cx: FunctionContext) -> JsResult<JsObject> {
//     let filepath = cx.argument::<JsString>(0)?.value(&mut cx);

//     let mut tokenStore = TokenStore::load(filepath.as_str());

//     let obj = cx.empty_object();
//     // obj.clone_from(tokenStore.as_object());
    
//     let test = cx.string("test");
//     obj.set(&mut cx, "instances", test)?;

//     let test2 = cx.string(filepath.as_str());
//     obj.set(&mut cx, "token_file", test2)?;

//     Ok(obj)
// }

// // pub fn save(mut cx: FunctionContext) -> JsResult<JsObject> {
// //     let filepath = cx.argument::<JsString>(0)?.value(&mut cx);

// //     let ts = TokenStore {
// //         app_params: xal.app_params(),
// //         client_params: xal.client_params(),
// //         wl_token: wl_token_clone,
// //         sisu_tokens: auth_response,
// //         gssv_token,
// //         xcloud_transfer_token: transfer_token,
// //         updated: Utc::now(),
// //     };
// //     ts.save(TOKENS_FILEPATH)?
// // }