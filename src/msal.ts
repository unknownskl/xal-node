import Http from './lib/http'
import crypto, { subtle, KeyObject } from 'crypto'
import XstsToken from './lib/tokens/xststoken'
import StreamingToken from './lib/tokens/streamingtoken'

export default class Msal {

    private _clientId = '1f907974-e22b-4810-a9de-d9647380c97e'

    _refreshToken = ''

    doDeviceCodeAuth(){
        return new Promise((resolve, reject) => {
            const HttpClient = new Http()
                HttpClient.postRequest('login.microsoftonline.com', '/consumers/oauth2/v2.0/devicecode', {
                    "Content-Type": "application/x-www-form-urlencoded"
                }, "client_id="+this._clientId+"&scope=xboxlive.signin%20openid%20profile%20offline_access").then((response) => {
                    resolve(response.body())

                }).catch((error) => {
                    reject(error)
                })
        })
    }

    doPollForDeviceCodeAuth(deviceCode:string){
        return new Promise((resolve, reject) => {
            const HttpClient = new Http()

            HttpClient.postRequest('login.microsoftonline.com', '/consumers/oauth2/v2.0/token', {
                "Content-Type": "application/x-www-form-urlencoded"
            }, "grant_type=urn:ietf:params:oauth:grant-type:device_code&client_id="+this._clientId+"&device_code="+deviceCode
            ).then((response) => {
                const body = response.body()
                this._refreshToken = body.refresh_token
                resolve(body)

            }).catch((error) => {
                setTimeout(() => {
                    this.doPollForDeviceCodeAuth(deviceCode).then((response) => {
                        resolve(response)
                    }).catch((error) => {
                        reject(error)
                    })
                }, 1000)
            })
        });
    }

    exchangeDeviceCodeForMSAL(){
        return new Promise((resolve, reject) => {
            const HttpClient = new Http()

            HttpClient.postRequest('login.microsoftonline.com', '/consumers/oauth2/v2.0/token', {
                "Content-Type": "application/x-www-form-urlencoded"
            }, "client_id="+this._clientId+"&scope=service::http://Passport.NET/purpose::PURPOSE_XBOX_CLOUD_CONSOLE_TRANSFER_TOKEN%20openid%20profile%20offline_access&grant_type=refresh_token&refresh_token="+this._refreshToken
            ).then((response) => {
                const body = response.body()
                this._refreshToken = body.refresh_token
                resolve(body)

            }).catch((error) => {
                reject(error)
            })
        });
    }

    doXstsAuthorization(userToken:string, relyingParty:string){
        // Possible relyingParty values:
        // - http://xboxlive.com
        // - http://mp.xboxlive.com/
        // - http://gssv.xboxlive.com/
        // - rp://gswp.xboxlive.com/
        return new Promise<XstsToken>((resolve, reject) => {
            const payload = {
                Properties: {
                    SandboxId: 'RETAIL',
                    UserTokens: [userToken]
                },
                RelyingParty: relyingParty,
                TokenType: 'JWT'
            }
        
            const body = JSON.stringify(payload)
            const headers = {
                'x-xbl-contract-version': '1',
                'Cache-Control': 'no-cache',
                'Content-Type': 'application/json',
                'Origin': 'https://www.xbox.com',
                'Referer': 'https://www.xbox.com/',
                'Content-Length': body.length,
                'Accept': '*/*',
                'ms-cv': '0',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
            }
        
            const HttpClient = new Http()
            HttpClient.postRequest('xsts.auth.xboxlive.com', '/xsts/authorize', headers, body).then((response) => {
                resolve(new XstsToken(response.body()))

            }).catch((error) => {
                reject(error)
            })
        })
    }

    refreshUserToken(refreshToken:string){
        return new Promise((resolve, reject) => {
            const payload = {
                'client_id': this._clientId,
                'grant_type': 'refresh_token',
                'refresh_token': refreshToken,
                'scope': 'xboxlive.signin openid profile offline_access'
            }
            
            const body = new URLSearchParams(payload).toString()
            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cache-Control': 'no-store, must-revalidate, no-cache',
            }
        
            const HttpClient = new Http()
            HttpClient.postRequest('login.microsoftonline.com', '/consumers/oauth2/v2.0/token', headers, body).then((response) => {
                resolve(response.body())

            }).catch((error) => {
                reject(error)
            })
        })
    }

    doXstsAuthentication(userToken:string){
        return new Promise<XstsToken>((resolve, reject) => {
            const payload = {
                Properties: {
                    AuthMethod: 'RPS',
                    RpsTicket: 'd='+userToken,
                    SiteName: 'user.auth.xboxlive.com'
                },
                RelyingParty: 'http://auth.xboxlive.com',
                TokenType: 'JWT'
            }
        
            const body = JSON.stringify(payload)
            const headers = {
                'x-xbl-contract-version': '1',
                'Cache-Control': 'no-cache',
                'Content-Type': 'application/json',
                'Origin': 'https://www.xbox.com',
                'Referer': 'https://www.xbox.com/',
            }
        
            const HttpClient = new Http()
            HttpClient.postRequest('user.auth.xboxlive.com', '/user/authenticate', headers, body).then((response) => {
                resolve(new XstsToken(response.body()))

            }).catch((error) => {
                reject(error)
            })
        })
    }

    async getWebToken(userToken:string){
        const token = await this.doXstsAuthorization(userToken, 'http://xboxlive.com')
        return token
    }

    async getGssvToken(userToken:string){
        const token = await this.doXstsAuthorization(userToken, 'http://gssv.xboxlive.com/')
        return token
    }

    async getStreamingTokens(userToken:string){
        // const sisuToken = tokenStore.getSisuToken()
        // if(sisuToken === undefined)
        //     throw new Error('Sisu token is missing. Please authenticate first')

        // const xstsToken = await this.doXstsAuthorization(sisuToken, 'http://gssv.xboxlive.com/')

        // if(this._xhomeToken === undefined || this._xhomeToken.getSecondsValid() <= 60){
            const _xhomeToken = await this.getStreamToken(userToken, 'xhome')
        // }

        // if(this._xcloudToken === undefined || this._xcloudToken.getSecondsValid() <= 60){
        let _xcloudToken:StreamingToken
        try {
            _xcloudToken = await this.getStreamToken(userToken, 'xgpuweb')
        } catch(error){
            _xcloudToken = await this.getStreamToken(userToken, 'xgpuwebf2p')
        }
        // }

        return { xHomeToken: _xhomeToken, xCloudToken: _xcloudToken }
    }

    getStreamToken(userToken:string, offering:string){
        return new Promise<StreamingToken>((resolve, reject) => {
            const payload = {
                'token': userToken,
                'offeringId': offering,
            }
            
            const body = JSON.stringify(payload)
            const headers = {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, must-revalidate, no-cache',
                'x-gssv-client': 'XboxComBrowser',
                'Content-Length': body.length,
            }
        
            const HttpClient = new Http()
            HttpClient.postRequest(offering+'.gssv-play-prod.xboxlive.com', '/v2/login/user', headers, body).then((response) => {
                resolve(new StreamingToken(response.body()))

            }).catch((error) => {
                reject(error)
            })
        })
    }
}