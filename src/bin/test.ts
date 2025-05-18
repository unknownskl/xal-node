#!/usr/bin/env node
import { Xal, TokenRefreshError } from '../lib'
import TokenStore from '../tokenstore'
import Msal from '../msal'
import UserToken from '../lib/tokens/usertoken'

class Auth {

    _tokenStore:TokenStore
    _xal:Xal
    _msal:Msal
    
    constructor() {
        // Load tokenstore
        this._tokenStore = new TokenStore()
        this._tokenStore.load('.xbox.tokens.json')

        // Load XAL
        this._xal = new Xal(this._tokenStore)
        this._msal = new Msal(this._tokenStore)

        this._msal.setDefaultHeaders({
            'Authorization': 'Bearer none',
        })
    }

    start(){
        // // Refresh Token
        // this._xal.refreshTokens(this._tokenStore).then((tokens) => {
        //     console.log('tokens', tokens)
        // }).catch((err) => {
        //     if(err instanceof TokenRefreshError) {
        //         console.log('Failed to refresh tokens. Please authenticate again. Error details:', err)
        //     } else {
        //         console.error('refreshTokens Error:', err)
        //     }
        // })

        // // MSAL Token:
        // this._xal.getMsalToken(this._tokenStore).then((msalToken) => {
        //     console.log('msalToken', msalToken)
        // }).catch((err) => {
        //     console.error(err)
        // })

        // // Web Token:
        // this._xal.getStreamingToken(this._tokenStore).then((webToken) => {
        //     console.log('webToken', webToken, webToken.xHomeToken.getSecondsValid())

        //     setTimeout(() => {
        //         this._xal.getStreamingToken(this._tokenStore).then((webToken) => {
        //             console.log('webToken2', webToken, webToken.xHomeToken.getSecondsValid())
        //         }).catch((err) => {
        //             console.error(err)
        //         })
        //     }, 2000)
        // }).catch((err) => {
        //     console.error(err)
        // })

        // this._msal.doDeviceCodeAuth().then((tokens:any) => {
        //     console.log('authRedirect', tokens)

        //     this._msal.doPollForDeviceCodeAuth(tokens.device_code).then((tokens:any) => {
                

                // // console.log('tokensAuth', tokens)

                // this._msal.refreshUserToken().then((tokens:any) => {
                //     console.log('refreshed tokens...', tokens)
                //     // this._msal.getMsalToken().then((msalToken:any) => {
                    // this._msal.doXstsAuthentication().then((msalToken) => {
                    //     console.log('XstsToken', msalToken)

                        this._msal.getWebToken().then((webToken) => {
                            console.log('WebToken', webToken.data)
                        }).catch((err) => {
                            console.error(err)
                        })

                        this._msal.getStreamingTokens().then((streamingToken) => {
                            console.log('StreamingTokens', streamingToken)
                        }).catch((err) => {
                            console.error(err)
                        })

                        this._msal.getMsalToken().then((msalToken:any) => {
                            console.log('MsalToken', msalToken)
                        }).catch((err) => {
                            console.error(err)
                        })
                        


                        
                //         this._msal.getGssvToken(msalToken.data.Token).then((gssvToken) => {
                //             console.log('GssvToken', gssvToken)

                //             this._msal.getStreamingTokens(gssvToken.data.Token).then((streamingToken) => {
                //                 console.log('StreamingTokens', streamingToken)
                //             }).catch((err) => {
                //                 console.error(err)
                //             })
                //         }).catch((err) => {
                //             console.error(err)
                //         })
                        
                        

                //         console.log('Dump token info:', { ...tokens, ...{ refresh_token: this._msal._refreshToken } })

                    // }).catch((err) => {
                    //     console.error(err)
                    // })

                //     console.log('Dump token info refresh:', { ...tokens, ...{ refresh_token: this._msal._refreshToken } })
                // }).catch((err) => {
                //     console.error(err)
                // })

        //     }).catch((err) => {
        //         console.error(err)
        //     })
        // }).catch((err) => {
        //     console.error(err)
        // })

        // // Streaming Token:
        // this._xal.getStreamingToken(this._tokenStore).then((streamingTokens) => {
        //     console.log('streamingTokens', streamingTokens)
        // }).catch((err) => {
        //     console.error(err)
        // })



        // // Streaming Token:
        // this._xal.getRedirectUri().then((redirectTokens) => {
        //     console.log('redirectTokens', redirectTokens)
        // }).catch((err) => {
        //     console.error(err)
        // })
    }
}

new Auth().start()