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
        this._xal = new Xal(this._tokenStore)
    }

    run(){
        if(this._commander.args[0] == 'auth'){

            if(this._tokenStore.hasValidAuthTokens()){
                console.log('You are already authenticated. To show the tokens, run `xbox-xal-auth show`. To re-authenticate, run `xbox-xal-auth logout` first.')
                return
            }

            this._xal.getRedirectUri().then((redirect) => {
                if(redirect){
                    console.log('Please authenticate using the following url:', redirect.sisuAuth.MsaOauthRedirect)

                    const readline = require('readline').createInterface({
                        input: process.stdin,
                        output: process.stdout
                    });
        
                    readline.question('Enter redirect uri: ', async redirectUri => {
                        readline.close()
                        // await this.loadTokensUsingCode(redirectUri, result.SessionId)
                        const loggedIn = await this._xal.authenticateUser(this._tokenStore, redirect, redirectUri)
                        if(loggedIn === true){
                            this._xal.refreshTokens(this._tokenStore)
                            console.log('Authentication succeeded!')
                        } else {
                            console.log('Authentication failed!')
                        }
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

    actionShow(){
        
        console.log('Current authentication status:')
        console.log(' UserToken: isAuthenticated('+this._tokenStore._userToken?.isValid()+') Seconds remaining:', this._tokenStore._userToken?.getSecondsValid())
        console.log(' SisuToken: isAuthenticated('+this._tokenStore._sisuToken?.isValid()+') Seconds remaining:', this._tokenStore._sisuToken?.getSecondsValid())
        console.log(' ')
        console.log(' User Hash:', this._tokenStore._sisuToken?.getUserHash())
        console.log(' Gamertag:', this._tokenStore._sisuToken?.getGamertag())
    }

    actionRefresh(){
        if(this._tokenStore._userToken === undefined){
            console.log('Please authenticate first using `xbox-auth auth`.')
            return
        }

        this._xal.refreshTokens(this._tokenStore).then((token) => {
            console.log('Tokens have been refreshed')

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

            console.log('Tokens:\n- MSAL Token:', JSON.stringify(tokens.msalToken, null, 4), '\n- Web Token:', JSON.stringify(tokens.webToken, null, 4))
            console.log('Offering tokens:\n- xHome:', JSON.stringify(tokens.xhomeToken, null, 4), '\n- xCloud:', JSON.stringify(tokens.gpuToken, null, 4))
        }).catch((error) => {
            console.log('Failed to retrieve tokens:', error)
        })
        
    }

    async retrieveTokens(){
        const msalToken = await this._xal.getMsalToken(this._tokenStore)
        const webToken = await this._xal.getWebToken(this._tokenStore)
        const streamingTokens = await this._xal.getStreamingToken(this._tokenStore)

        const gpuToken = streamingTokens.xCloudToken
        const xhomeToken = streamingTokens.xHomeToken

        return { msalToken, webToken, xhomeToken, gpuToken }
    }
}

new Auth().run()