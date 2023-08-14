const {
    xalauthenticatorNew,
    xalauthenticatorClose,
    xalauthenticatorGetDeviceToken,
    xalauthenticatorGenerateRandomState,
    xalauthenticatorGetCodeChallenge,
    xalauthenticatorDoSisuAuthentication,
    xalauthenticatorExchangeCodeForToken,
    xalauthenticatorDoSisuAuthorization,
    xalauthenticatorDoXstsAuthorization,
    xalauthenticatorExchangeRefreshTokenForXcloudTransferToken,
} = require("../dist/xal-node.node");

interface authFlowTokens {
    sisu_local_code_verifier: string,
    sisu_session_id: string,
    sisu_device_token: any,
    redirect_uri: string,
}

export default class XalAuthenticator {
    handler

    constructor(){

        this.handler = new xalauthenticatorNew()
    }

    close() {
        xalauthenticatorClose.call(this.handler)
    }

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
        return new Promise((resolve, reject) => {
            xalauthenticatorDoSisuAuthorization.call(this.handler, sisu_session_id, user_token, device_token).then((rs_resolve) => {
                resolve(JSON.parse(rs_resolve))
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

    do_xsts_authorization(device_token:String, title_token:String, user_token:String, relayingparty:String) {
        return new Promise((resolve, reject) => {
            xalauthenticatorDoXstsAuthorization.call(this.handler, device_token, title_token, user_token, relayingparty).then((rs_resolve) => {
                resolve(JSON.parse(rs_resolve))
            }).catch((error) => {
                reject(error)
            })
        })
    }


    exchange_refresh_token_for_xcloud_transfer_token(refresh_token:String) {
        return new Promise((resolve, reject) => {
            xalauthenticatorExchangeRefreshTokenForXcloudTransferToken.call(this.handler, refresh_token).then((rs_resolve) => {
                resolve(JSON.parse(rs_resolve))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    _authFlowTokens:authFlowTokens = {
        sisu_local_code_verifier: '',
        sisu_session_id: '',
        sisu_device_token: {},
        redirect_uri: '',
    }

    flow_retrieve_devicetoken(){
        return new Promise((resolve, reject) => {
            this.get_device_token().then((device_token:any) => {            
                this.do_sisu_authentication(device_token.Token).then((sisu_response:any) => {
                    
                    this._authFlowTokens = {
                        sisu_local_code_verifier: sisu_response.local_code_verifier,
                        sisu_session_id: sisu_response.sisu_session_id,
                        sisu_device_token: device_token,
                        redirect_uri: sisu_response.msal_response.MsaOauthRedirect,
                    }

                    resolve(this._authFlowTokens)

                }).catch((error) => {
                    reject(error)
                })
                
            }).catch((error) => {
                reject(error)
            })
        })
    }

    flow_do_codeauth(code){
        return new Promise((resolve, reject) => {
            this.exchange_code_for_token(code, this._authFlowTokens.sisu_local_code_verifier).then((res5:any) => {
                this.do_sisu_authorization(this._authFlowTokens.sisu_session_id, res5.access_token, this._authFlowTokens.sisu_device_token.Token).then((res6:any) => {

                    resolve({
                        code_token: res5,
                        sisu_token: res6
                    })

                }).catch((error) => {
                    reject(error)
                })
        
            }).catch((error) => {
                reject(error)
            })
        })
    }



    flow_retrieve_xststoken(code_token, sisu_token){
        return new Promise((resolve, reject) => {
            this.do_xsts_authorization(sisu_token.DeviceToken, sisu_token.TitleToken.Token, sisu_token.UserToken.Token, "http://gssv.xboxlive.com/").then((xsts_token:any) => {
                resolve(xsts_token)
        
            }).catch((error) => {
                reject(error)
            })
        })
    }

}