const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

const XalLibrary = new require('../')
console.log(XalLibrary)

// const tokenStore = new XalLibrary.TokenStore()
// const result = tokenStore.load('.tokens.json')
// console.log('result', result)

const xalAuthenticator = new XalLibrary.XalAuthenticator()

xalAuthenticator.get_device_token().then((device_token) => {
  console.log(device_token)

  xalAuthenticator.do_sisu_authentication(device_token.Token).then((res4) => {
    // console.log('do_sisu_authentication:', res4)
    console.log('Redirect URI:', res4.msal_response.MsaOauthRedirect)
    console.log('Session ID:', res4.sisu_session_id)
  
    readline.question('Enter redirect uri: ', redirectUri => {
      readline.close();
  
      const url = new URL(redirectUri)
      const code = url.searchParams.get('code')
      const state = url.searchParams.get('state')
  
      xalAuthenticator.exchange_code_for_token(code, res4.local_code_verifier).then((res5) => {
        console.log('Retrieved token:', res5)
  
        xalAuthenticator.do_sisu_authorization(res4.sisu_session_id, res5.access_token, device_token.Token).then((res6) => {
          console.log('res6:', res6)

          xalAuthenticator.do_xsts_authorization(res6.DeviceToken, res6.TitleToken.Token, res6.UserToken.Token, "http://gssv.xboxlive.com/").then((res7) => {
            console.log('res7:', res7)

            xalAuthenticator.exchange_refresh_token_for_xcloud_transfer_token(res5.refresh_token).then((res8) => {
              console.log('res8:', res8)
    
            }).catch((error8) => {
              console.log('exchange_refresh_token_for_xcloud_transfer_token error:', error8)
            })
  
          }).catch((error7) => {
            console.log('do_xsts_authorization error:', error7)
          })



        }).catch((error6) => {
          console.log('do_sisu_authorization error:', error6)
        })
  
      }).catch((error5) => {
        console.log('exchange_code_for_token error:', error5)
      })
    })
    
  }).catch((error4) => {
    console.log('do_sisu_authentication error:', error4)
  })

}).catch((error1) => {
  console.log('get_device_token error:', error1)
})