#!/usr/bin/env node
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

import fs from 'fs';
import XalLibrary from '../lib'
const xalAuthenticator = new XalLibrary.XalAuthenticator()

// console.log(xalAuthenticator)

if(fs.existsSync('./.xbox.tokens.json')){
    const tokensData = fs.readFileSync('./.xbox.tokens.json')
    const tokens = JSON.parse(tokensData.toString())

    xalAuthenticator.flow_retrieve_xststoken(tokens.stage2.code_token, tokens.stage2.sisu_token).then((xsts_token) => {
        console.log('Retrieved XSTS Token from existing tokens:', xsts_token)

        xalAuthenticator.close()
        readline.close()
    }).catch((error) => {
        console.log('error stage2:', error)
        xalAuthenticator.close()
        readline.close()
    })

} else {

    xalAuthenticator.flow_retrieve_devicetoken().then((data:any) => {
        console.log('Open redirect:', data.redirect_uri)

        readline.question('Enter redirect uri: ', redirectUri => {
            readline.close()
            const url = new URL(redirectUri)

            const error = url.searchParams.get('error')
            if(error){
                const error_description = url.searchParams.get('error_description')
                console.log('authentication', __filename+'[startWebviewHooks()] Received error from oauth:', error_description)
                xalAuthenticator.close()
            }

            const code = url.searchParams.get('code')
            if(code){
                const state = url.searchParams.get('state')

                xalAuthenticator.flow_do_codeauth(code).then((tokens:any) => {
                    // console.log('Tokens:', tokens)
                    fs.writeFileSync('./.xbox.tokens.json', JSON.stringify({
                        stage1: xalAuthenticator._authFlowTokens,
                        stage2: tokens
                    }))
                    console.log('Tokens received and written to file: ./.xbox.tokens.json')

                    xalAuthenticator.flow_retrieve_xststoken(tokens.code_token, tokens.sisu_token).then((xsts_token) => {
                    // console.log('Retrieved XSTS Token using fresh tokens:', xsts_token)
                    // console.log('xsts_token', xsts_token)

                        xalAuthenticator.close()
                    }).catch((error) => {
                        console.log('error stage2:', error)
                        xalAuthenticator.close()
                    })

                    // We should save the above tokens.
                }).catch((error) => {
                    console.log('error stage2:', error)
                    xalAuthenticator.close()
                })
            }
        })

    }).catch((error) => {
        console.log('error stage1:', error)
        xalAuthenticator.close()
    })
}