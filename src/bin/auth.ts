#!/usr/bin/env node
import { Argument, Option, program } from 'commander'
const pkg = require('../../package.json')

import Xal from '../xal'
import TokenStore from '../tokenstore'

class Auth {
    _options = {
        file: {
            default: '.xbox.tokens.json',
            description: 'Load a different token file',
            name: '-F, --file <path>',
        },

        // output: {
        //     default: 'text',
        //     description: 'Sets the output format',
        //     name: '-O, --output <path>',
        //     choices: ['text', 'json'],
        // },
    }

    _commander:typeof program
    _tokenStore:TokenStore
    _xal:Xal

    _state
    _deviceToken

    constructor(){
        this._commander = program
            .version(pkg.version)
            .addArgument(new Argument('command', 'Command to run').choices(['auth', 'show', 'refresh', 'tokens', 'logout']).default('auth'))

        for(const arg in this._options){
            const argData = this._options[arg]
            const option = new Option(argData.name, argData.description)

            if(argData.default)
                option.default(argData.default)

            if(argData.choices)
                option.choices(argData.choices)

            this._commander.addOption(option)
        }

        program.addHelpText('after', `

Example commands:
  $ xbox-xal-auth auth
  $ xbox-xal-auth show
  $ xbox-xal-auth refresh
  $ xbox-xal-auth logout`);

        this._commander.parse();

        // Load tokenstore
        this._tokenStore = new TokenStore()
        this._tokenStore.load(this._commander.opts().file)

        // Load XAL
        this._xal = new Xal()
        if(this._tokenStore._jwtKeys){
            this._xal.setKeys(this._tokenStore._jwtKeys.jwt).then((keys) => {
                // console.log('Keys loaded:', keys)
            }).catch((error) => {
                console.log('Failed to load keys:', error)
            })
        }
    }

    run(){
        // console.log('tokenStore', this._tokenStore)

        if(this._commander.args[0] == 'auth'){

            if(this._tokenStore.hasValidAuthTokens()){
                console.log('You are already authenticated. To show the tokens, run `xbox-xal-auth show`. To re-authenticate, run `xbox-xal-auth logout` first.')
                return
            }

            this.getRedirectUri().then((result) => {
                if(result){
                    console.log('Please authenticate using the following url:', result.MsaOauthRedirect)

                    const readline = require('readline').createInterface({
                        input: process.stdin,
                        output: process.stdout
                    });
        
                    readline.question('Enter redirect uri: ', async redirectUri => {
                        readline.close()
                        await this.loadTokensUsingCode(redirectUri, result.SessionId)
                    })
                }
            }).catch((error) => {
                console.log('error', error)
            })

        } else if(this._commander.args[0] == 'show'){
            this.actionShow()

        } else if(this._commander.args[0] == 'refresh'){
            this.actionRefresh()

        } else if(this._commander.args[0] == 'logout'){
            this.actionLogout()

        } else if(this._commander.args[0] == 'tokens'){
            this.actionTokens()
        }
    }

    async getRedirectUri(){
        try {
            this._deviceToken = await this._xal.getDeviceToken()
            console.log('devicetoken:',this._deviceToken)

            const codeChallange = await this._xal.getCodeChallange()
            this._state = this._xal.getRandomState()
            const sisu = await this._xal.doSisuAuthentication(this._deviceToken, codeChallange, this._state)

            return sisu

        } catch(error){
            console.log('Failed to retrieve a device token. Make sure your date and time of your computer is correct and try again.')
            console.log('Details:', error)
        }

        return false
    }

    async loadTokensUsingCode(redirectUri, sisuSessionId){
        const url = new URL(redirectUri)

        const error = url.searchParams.get('error')
        if(error){
            const error_description = url.searchParams.get('error_description')
            console.log('Authentication failed:', error_description)
        }

        const code = url.searchParams.get('code')
        if(code){
            const state = url.searchParams.get('state')

            if(state != this._state){
                console.log('Authentication failed: State mismatch')
                return
            }
            const codeChallange = await this._xal.getCodeChallange()

            const userToken = await this._xal.exchangeCodeForToken(code, codeChallange.verifier)
            const sisuToken = await this._xal.doSisuAuthorization(userToken, this._deviceToken, sisuSessionId)

            // console.log(userToken, sisuToken)

            this._tokenStore.setUserToken(userToken)
            this._tokenStore.setSisuToken(sisuToken)
            this._tokenStore.setJwtKeys(this._xal.jwtKeys)
            this._tokenStore.save()

            console.log('Authentication succeeded! Tokens written to file:', this._tokenStore._filepath)
        }
    }

    actionShow(){
        // this._tokenStore

        console.log('Current authentication status:')
        console.log(' UserToken: isAuthenticated('+this._tokenStore._userToken?.isValid()+') Seconds remaining:', this._tokenStore._userToken?.getSecondsValid())
        console.log(' SisuToken: isAuthenticated('+this._tokenStore._sisuToken?.isValid()+') Seconds remaining:', this._tokenStore._sisuToken?.getSecondsValid())
        console.log(' ')
        console.log(' User Hash:', this._tokenStore._sisuToken?.getUserHash())
        console.log(' Gamertag:', this._tokenStore._sisuToken?.getGamertag())

        // console.log(this._tokenStore._sisuToken?.data.UserToken.DisplayClaims, this._tokenStore._sisuToken?.data.AuthorizationToken.DisplayClaims)
    }

    actionRefresh(){
        this._xal.refreshUserToken(this._tokenStore._userToken?.data.refresh_token).then((token) => {
            this._tokenStore.setUserToken(token)
            this._tokenStore.save()

            this._xal.getDeviceToken().then((deviceToken) => {

                this._xal.doSisuAuthorization(this._tokenStore._userToken?.data, deviceToken).then((tokens) => {
                    this._tokenStore.setSisuToken(tokens)
                    this._tokenStore.save()

                    console.log('Tokens have been refreshed')

                }).catch((error) => {
                    console.log('Failed to refresh sisu token:', error)
                })
            })

        }).catch((error) => {
            console.log('Failed to refresh token:', error)
        })
    }

    actionLogout(){
        this._tokenStore.removeAll()
        console.log('Login data has been removed. You are now logged out.')
    }

    actionTokens(){
        this.retrieveTokens().then((tokens) => {
            //
        }).catch((error) => {
            console.log('Failed to retrieve tokens:', error)
        })
        
    }

    async retrieveTokens(){
        const xstsToken = await this._xal.doXstsAuthorization(this._tokenStore._sisuToken?.data, 'http://gssv.xboxlive.com/')

        const msalToken = await this._xal.exchangeRefreshTokenForXcloudTransferToken(this._tokenStore._userToken?.data.refresh_token)
        const webToken = await this._xal.doXstsAuthorization(this._tokenStore._sisuToken?.data, 'http://xboxlive.com/')

        const xhomeToken = await this._xal.getStreamToken(xstsToken, 'xhome')
        const gpuToken = await this._xal.getStreamToken(xstsToken, 'xgpuweb')
        // const gpuToken = await this._xal.getStreamToken(xstsToken, 'xgpuwebf2p')

        console.log('Tokens:\n- XSTS Token: ', JSON.stringify(xstsToken, null, 4), '\n- MSAL Token:', JSON.stringify(msalToken, null, 4), '\n- Web Token:', JSON.stringify(webToken, null, 4))
        console.log('Offering tokens:\n- xHome:', JSON.stringify(xhomeToken, null, 4), '\n- xCloud:', JSON.stringify(gpuToken, null, 4))
    }
}

new Auth().run()












// const readline = require('readline').createInterface({
//     input: process.stdin,
//     output: process.stdout
// });

// // console.log(xalAuthenticator)

// if(fs.existsSync('./.xbox.tokens.json')){
//     const tokensData = fs.readFileSync('./.xbox.tokens.json')
//     const tokens = JSON.parse(tokensData.toString())

//     xalAuthenticator.flow_retrieve_xststoken(tokens.stage2.code_token, tokens.stage2.sisu_token).then((xsts_token) => {
//         console.log('Retrieved XSTS Token from existing tokens:', xsts_token)

//         tokens.xsts_token = xsts_token
//         fs.writeFileSync('./.xbox.tokens.json', JSON.stringify(tokens))

//         xalAuthenticator.close()
//         readline.close()
//     }).catch((error) => {
//         console.log('error stage2:', error)
//         xalAuthenticator.close()
//         readline.close()
//     })

// } else {

//     xalAuthenticator.flow_retrieve_devicetoken().then((data:any) => {
//         console.log('Open redirect:', data.redirect_uri)

//         readline.question('Enter redirect uri: ', redirectUri => {
//             readline.close()
//             const url = new URL(redirectUri)

//             const error = url.searchParams.get('error')
//             if(error){
//                 const error_description = url.searchParams.get('error_description')
//                 console.log('authentication', __filename+'[startWebviewHooks()] Received error from oauth:', error_description)
//                 xalAuthenticator.close()
//             }

//             const code = url.searchParams.get('code')
//             if(code){
//                 const state = url.searchParams.get('state')

//                 xalAuthenticator.flow_do_codeauth(code).then((tokens:any) => {
//                     // console.log('Tokens:', tokens)
//                     const xaltokens = {
//                         stage1: xalAuthenticator._authFlowTokens,
//                         stage2: tokens,
//                         xsts_token: {}
//                     }
//                     fs.writeFileSync('./.xbox.tokens.json', JSON.stringify(xaltokens))
//                     console.log('Tokens received and written to file: ./.xbox.tokens.json')

//                     xalAuthenticator.flow_retrieve_xststoken(tokens.code_token, tokens.sisu_token).then((xsts_token:any) => {
//                         // console.log('Retrieved XSTS Token using fresh tokens:', xsts_token)
//                         // console.log('xsts_token', xsts_token)
//                         xaltokens.xsts_token = xsts_token
//                         fs.writeFileSync('./.xbox.tokens.json', JSON.stringify(xaltokens))

//                         xalAuthenticator.close()
//                     }).catch((error) => {
//                         console.log('error stage2:', error)
//                         xalAuthenticator.close()
//                     })

//                     // We should save the above tokens.
//                 }).catch((error) => {
//                     console.log('error stage2:', error)
//                     xalAuthenticator.close()
//                 })
//             }
//         })

//     }).catch((error) => {
//         console.log('error stage1:', error)
//         xalAuthenticator.close()
//     })
// }