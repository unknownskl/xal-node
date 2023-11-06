import Http from './lib/http'
import crypto from 'crypto'
import { exportJWK } from 'jose'

const UUID = require('uuid-1345')
const nextUUID = () => UUID.v3({ namespace: '6ba7b811-9dad-11d1-80b4-00c04fd430c8', name: Date.now().toString() })

interface TokenData {
    IssueInstant: string
    NotAfter: string
    Token: string
    DisplayClaims: any
}

interface DeviceToken extends TokenData {
    DisplayClaims: {
        xdi: {
            did: string
            dcs: number
        }
    }
}

interface TitleToken extends TokenData {
    DisplayClaims: {
        xti: {
            tid: string
        }
    }
}

interface UserToken extends TokenData {
    DisplayClaims: {
        xui: {
            uhs: string
        }
    }
}

interface CodeChallange {
    value: string
    method: string
    verifier: string
}

interface SisuAuthenticationResponse {
    MsaOauthRedirect: string
    MsaRequestParameters: {}
    SessionId: string
}

interface SisuAuthorizationResponse {
    DeviceToken: string
    TitleToken: TitleToken
    UserToken: UserToken
    AuthorizationToken
    WebPage: string
    Sandbox: string
    UseModernGamertag: boolean
    Flow: string
}

interface AccessToken {
    token_type: string
    expires_in: number
    scope: string
    access_token: string
    refresh_token: string
    user_id: string
}

interface XstsAuthorizationResponse extends TokenData {
    DisplayClaims: {
        xui: {
            uhs: string
        }
    }
}

export default class Xal {

    keys
    jwtKeys

    _app = {
        AppId: '000000004c20a908', //'000000004c12ae6f', // 0000000048183522 = working, but minecraft --<<< 000000004c12ae6f works, xbox app
        TitleId: '328178078', //'328178078', // 1016898439 = working
        RedirectUri: 'ms-xal-000000004c20a908://auth'
    }

    getKeys(){
        return new Promise((resolve, reject) => {
            if(this.keys === undefined){
                this.keys = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' })

                this.jwtKeys = {
                    raw: this.keys
                }

                exportJWK(this.keys.publicKey).then(jwk => {
                    const jwkKey = { ...jwk, alg: 'ES256', use: 'sig' }
                    this.jwtKeys = {
                        raw: this.keys,
                        jwt: jwkKey
                    }
                    resolve(this.jwtKeys)
                })

            } else {
                resolve(this.jwtKeys)
            }
        })
    }

    codeChallange

    getCodeChallange() {
        return new Promise<CodeChallange>((resolve, reject) => {
            if(this.codeChallange === undefined){
                const code_verifier = Buffer.from(crypto.pseudoRandomBytes(32)).toString('base64url')

                const code_challenge = crypto
                    .createHash("sha256")
                    .update(code_verifier)
                    .digest();

                this.codeChallange = {
                    value: code_challenge.toString('base64url'),
                    method: 'S256',
                    verifier: code_verifier,
                }
            }

            resolve(this.codeChallange)
        })
    }

    getRandomState(bytes = 64) {
        return crypto.randomBytes(bytes).toString('base64url')
    }

    getDeviceToken() {
        return new Promise<DeviceToken>((resolve, reject) => {
            this.getKeys().then((jwtKeys:any) => {

                const payload = {
                    Properties: {
                        AuthMethod: 'ProofOfPossession',
                        Id: `{${nextUUID()}}`,
                        DeviceType: 'Android',
                        SerialNumber: `{${nextUUID()}}`,
                        Version: '15.0',
                        ProofKey: {
                            'use': 'sig',
                            'alg': 'ES256',
                            'kty': 'EC',
                            'crv': 'P-256',
                            'x': jwtKeys.jwt.x,
                            'y': jwtKeys.jwt.y
                        }
                    },
                    RelyingParty: 'http://auth.xboxlive.com',
                    TokenType: 'JWT'
                }
            
                const body = JSON.stringify(payload)
                const signature = this.sign('https://device.auth.xboxlive.com/device/authenticate', '', body, jwtKeys).toString('base64')
                const headers = { ...{
                    'x-xbl-contract-version': '1',
                    'Cache-Control': 'no-store, must-revalidate, no-cache'
                }, Signature: signature }
            
                const HttpClient = new Http()
                HttpClient.postRequest('device.auth.xboxlive.com', '/device/authenticate', headers, body).then((response) => {
                    resolve((response.body() as DeviceToken))

                }).catch((error) => {
                    reject(error)
                })
            })
        })
    }

    doSisuAuthentication(deviceToken:DeviceToken, codeChallange:CodeChallange, state){
        return new Promise<SisuAuthenticationResponse>((resolve, reject) => {
            this.getKeys().then((jwtKeys:any) => {

                const payload = {
                    AppId: this._app.AppId,
                    TitleId: this._app.TitleId,
                    RedirectUri: this._app.RedirectUri,
                    DeviceToken: deviceToken.Token,
                    Sandbox: "RETAIL",
                    TokenType: "code",
                    Offers: ["service::user.auth.xboxlive.com::MBI_SSL"],
                    Query: {
                        display: 'android_phone',
                        code_challenge: codeChallange.value,
                        code_challenge_method: codeChallange.method,
                        state: state,
                    },
                }
            
                const body = JSON.stringify(payload)
                const signature = this.sign('https://sisu.xboxlive.com/authenticate', '', body, jwtKeys).toString('base64')
                const headers = { ...{
                    'x-xbl-contract-version': '1',
                    'Cache-Control': 'no-store, must-revalidate, no-cache',
                }, Signature: signature }
            
                const HttpClient = new Http()
                HttpClient.postRequest('sisu.xboxlive.com', '/authenticate', headers, body).then((response) => {
                    // Add SessionId to response object
                    const resBody = { SessionId: response.headers['x-sessionid'], ...response.body() }
                    resolve(( resBody as SisuAuthenticationResponse))

                }).catch((error) => {
                    reject(error)
                })
            })
        })
    }

    doSisuAuthorization(accessToken:AccessToken, deviceToken:DeviceToken, SessionId:string){
        return new Promise<SisuAuthorizationResponse>((resolve, reject) => {
            this.getKeys().then((jwtKeys:any) => {

                const payload = {
                    AccessToken: 't='+accessToken.access_token,
                    AppId: this._app.AppId,
                    DeviceToken: deviceToken.Token,
                    Sandbox: "RETAIL",
                    SiteName: "user.auth.xboxlive.com",
                    SessionId: SessionId,
                    UseModernGamertag: true,
                    ProofKey: {
                        'use': 'sig',
                        'alg': 'ES256',
                        'kty': 'EC',
                        'crv': 'P-256',
                        'x': jwtKeys.jwt.x,
                        'y': jwtKeys.jwt.y
                    }
                }
                
                const body = JSON.stringify(payload)
                const signature = this.sign('https://sisu.xboxlive.com/authorize', '', body, jwtKeys).toString('base64')
                const headers = {
                    'x-xbl-contract-version': '1',
                    'Cache-Control': 'no-store, must-revalidate, no-cache',
                    signature: signature
                }
            
                const HttpClient = new Http()
                HttpClient.postRequest('sisu.xboxlive.com', '/authorize', headers, body).then((response) => {
                    resolve(( response.body() as SisuAuthorizationResponse))

                }).catch((error) => {
                    reject(error)
                })
            })
        })
    }

    exchangeCodeForToken(code:string, codeVerifier){
        return new Promise<AccessToken>((resolve, reject) => {
            this.getKeys().then((jwtKeys:any) => {

                const payload = {
                    'client_id': this._app.AppId,
                    'code': code,
                    'code_verifier': codeVerifier,
                    'grant_type': 'authorization_code',
                    'redirect_uri': this._app.RedirectUri,
                    'scope': 'service::user.auth.xboxlive.com::MBI_SSL'
                }
                
                const body = new URLSearchParams(payload).toString()
                const headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cache-Control': 'no-store, must-revalidate, no-cache',
                }
            
                const HttpClient = new Http()
                HttpClient.postRequest('login.live.com', '/oauth20_token.srf', headers, body).then((response) => {
                    resolve((response.body() as AccessToken))

                }).catch((error) => {
                    reject(error)
                })
            })
        })
    }

    doXstsAuthorization(deviceToken:string, titleToken:string, userToken:string, relyingParty:string){
        return new Promise<XstsAuthorizationResponse>((resolve, reject) => {
            this.getKeys().then((jwtKeys:any) => {

                const payload = {
                    Properties: {
                        SandboxId: 'RETAIL',
                        DeviceToken: deviceToken,
                        TitleToken: titleToken,
                        UserTokens: [userToken]
                    },
                    RelyingParty: relyingParty,
                    TokenType: 'JWT'
                }
            
                const body = JSON.stringify(payload)
                const signature = this.sign('https://xsts.auth.xboxlive.com/xsts/authorize', '', body, jwtKeys).toString('base64')
                const headers = { ...{
                    'x-xbl-contract-version': '1',
                    'Cache-Control': 'no-store, must-revalidate, no-cache',
                }, Signature: signature }
            
                const HttpClient = new Http()
                HttpClient.postRequest('xsts.auth.xboxlive.com', '/xsts/authorize', headers, body).then((response) => {
                    resolve(( response.body() as XstsAuthorizationResponse))

                }).catch((error) => {
                    reject(error)
                })
            })
        })
    }

    exchangeRefreshTokenForXcloudTransferToken(refreshToken:string){
        return new Promise<AccessToken>((resolve, reject) => {
            this.getKeys().then((jwtKeys:any) => {

                const payload = {
                    client_id: this._app.AppId,
                    grant_type: 'refresh_token',
                    scope: 'service::http://Passport.NET/purpose::PURPOSE_XBOX_CLOUD_CONSOLE_TRANSFER_TOKEN',
                    refresh_token: refreshToken,
                    code: '',
                    code_verifier: '',
                    redirect_uri: '',
                }
                
                const body = new URLSearchParams(payload).toString()
                const headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cache-Control': 'no-store, must-revalidate, no-cache',
                }
            
                const HttpClient = new Http()
                HttpClient.postRequest('login.live.com', '/oauth20_token.srf', headers, body).then((response) => {
                    resolve((response.body() as AccessToken))

                }).catch((error) => {
                    reject(error)
                })
            })
        })
    }

    // Credits to https://github.com/PrismarineJS/prismarine-auth for the signing part
    sign(url, authorizationToken, payload, jwtKeys) {
        const windowsTimestamp = (BigInt((Date.now() / 1000) | 0) + BigInt(11644473600)) * BigInt(10000000)
        const pathAndQuery = new URL(url).pathname
    
        const allocSize = 5 + 9 + 5 + pathAndQuery.length + 1 + authorizationToken.length + 1 + payload.length + 1
        const buf = Buffer.alloc(allocSize)
        buf.writeInt32BE(1)
        buf.writeUInt8(0, 4)
        buf.writeBigUInt64BE(windowsTimestamp, 5)
        buf.writeUInt8(0, 13)
        let offset = 14

        Buffer.from('POST').copy(buf, offset)
        buf.writeUInt8(0, offset+4)
        offset = offset+4+1

        Buffer.from(pathAndQuery).copy(buf, offset)
        buf.writeUInt8(0, offset+pathAndQuery.length)
        offset = offset+pathAndQuery.length+1

        Buffer.from(authorizationToken).copy(buf, offset)
        buf.writeUInt8(0, offset+authorizationToken.length)
        offset = offset+authorizationToken.length+1

        Buffer.from(payload).copy(buf, offset)
        buf.writeUInt8(0, offset+payload.length)
        offset = offset+payload.length+1

        const signature = crypto.sign('SHA256', buf, { key: jwtKeys.raw.privateKey, dsaEncoding: 'ieee-p1363' })
    
        const header = Buffer.alloc(signature.length + 12)
        header.writeInt32BE(1)
        header.writeBigUInt64BE(windowsTimestamp, 4)
        Buffer.from(signature).copy(header, 12)
    
        return header
    }
}





interface authFlowTokens {
    sisu_local_code_verifier: string,
    sisu_session_id: string,
    sisu_device_token: any,
    redirect_uri: string,
}

export class XalAuthenticator {
    handler:Xal

    constructor(){
        this.handler = new Xal()
    }

    close() {
        //
    }

    get_code_challenge() {
        return new Promise((resolve, reject) => {
            this.handler.getCodeChallange().then((result) => {
                resolve(result)
            }).catch((error) => {
                reject(error)
            })
        })
    }

    get_device_token() {
        return new Promise((resolve, reject) => {
            this.handler.getDeviceToken().then((result) => {
                resolve(result)
            }).catch((error) => {
                reject(error)
            })
        })
    }

    generate_random_state() {
        return new Promise((resolve, reject) => {
            // xalauthenticatorGenerateRandomState.call(this.handler).then((rs_resolve) => {
            //     resolve(rs_resolve)
            // }).catch((error) => {
            //     reject(error)
            // })
        })
    }

    do_sisu_authentication(device_token:string) {
        return new Promise((resolve, reject) => {
            const Token:DeviceToken = {
                Token: device_token,
                IssueInstant: '',
                NotAfter: '',
                DisplayClaims: {
                    xdi: {
                        did: '',
                        dcs: 0,
                    }
                },
            }
            const state = this.handler.getRandomState()
            this.handler.getCodeChallange().then((codeChallange) => {
                this.handler.doSisuAuthentication(Token, codeChallange, state).then((result) => {
                    resolve({
                        local_code_verifier: codeChallange.verifier,
                        sisu_session_id: result.SessionId,
                        msal_response: result,
                    })
                }).catch((error) => {
                    reject(error)
                })
            })
            
        })
    }

    do_sisu_authorization(sisu_session_id:string, user_token:string, device_token:string) {
        return new Promise((resolve, reject) => {
            const UserToken:AccessToken = {
                token_type: '',
                expires_in: 0,
                scope: '',
                access_token: user_token,
                refresh_token: '',
                user_id: '',
            }
            const DeviceToken:DeviceToken = {
                Token: device_token,
                IssueInstant: '',
                NotAfter: '',
                DisplayClaims: {
                    xdi: {
                        did: '',
                        dcs: 0,
                    }
                },
            }
            this.handler.doSisuAuthorization(UserToken, DeviceToken, sisu_session_id).then((result) => {
                resolve(result)
            }).catch((error) => {
                reject(error)
            })
        })
    }

    exchange_code_for_token(code:string, local_verifier:string) {
        return new Promise((resolve, reject) => {
            this.handler.exchangeCodeForToken(code, local_verifier).then((result) => {
                resolve(result)
            }).catch((error) => {
                reject(error)
            })
        })
    }

    do_xsts_authorization(device_token:string, title_token:string, user_token:string, relayingparty:string) {
        return new Promise((resolve, reject) => {
            this.handler.doXstsAuthorization(device_token, title_token, user_token, relayingparty).then((result) => {
                resolve(result)
            }).catch((error) => {
                reject(error)
            })
        })
    }


    exchange_refresh_token_for_xcloud_transfer_token(refresh_token:String) {
        return new Promise((resolve, reject) => {
            // xalauthenticatorExchangeRefreshTokenForXcloudTransferToken.call(this.handler, refresh_token).then((rs_resolve) => {
            //     resolve(JSON.parse(rs_resolve))
            // }).catch((error) => {
            //     reject(error)
            // })
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
            console.log(code_token, sisu_token)
            this.do_xsts_authorization(sisu_token.DeviceToken, sisu_token.TitleToken.Token, sisu_token.UserToken.Token, "http://gssv.xboxlive.com/").then((xsts_token:any) => {
                resolve(xsts_token)
        
            }).catch((error) => {
                reject(error)
            })
        })
    }

}