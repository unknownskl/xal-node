// console.log(require('..').hello())

// console.log(require('..').init())

const XalLibrary = new require('../')
console.log(XalLibrary)

// const tokenStore = new XalLibrary.TokenStore()
// const result = tokenStore.load('.tokens.json')
// console.log('result', result)

const xalAuthenticator = new XalLibrary.XalAuthenticator()

// console.log(xalAuthenticator.count())
// console.log(xalAuthenticator.new())
// console.log(xalAuthenticator.count())
// console.log(xalAuthenticator.new())
// console.log(xalAuthenticator.count())




const device_token = xalAuthenticator.get_device_token()
console.log('device_token', device_token)

// const code_challenge = xalAuthenticator.get_code_challenge()
// console.log('code_challenge', code_challenge)

// const state = xalAuthenticator.generate_random_state()
// console.log('state', state)

// console.log(device_token, code_challenge, state)




// const sisu = xalAuthenticator.do_sisu_authentication()
// console.log('sisu', sisu)

const sisu = {
    msa_oauth_redirect: 'https://login.live.com/oauth20_authorize.srf?lw=1&fl=dob,easi2&xsup=1&display=android_phone&code_challenge=HMm89q3temH4Kb7upbDv-PUMy9pZ6mypeiq86X-aXtk&code_challenge_method=S256&state=NDE5ZDVhMjYtZGIwZC00MTAxLWJiNWYtODAzOTg1ZjY3ZDc1&client_id=000000004C20A908&response_type=code&scope=service%3A%3Auser.auth.xboxlive.com%3A%3AMBI_SSL&redirect_uri=ms-xal-public-beta-000000004c20a908%3A%2F%2Fauth&nopa=2',
    sisu_session_id: '9962c4f01fba4b169ab78bbd30ec26243',
    code_verifier: 'QGe9RN6cDxAIOH5TfyQNvKRGVUh5s_99KRxRGINNi9I',
    device_token: 'eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkExMjhDQkMtSFMyNTYiLCJ6aXAiOiJERUYiLCJ4NXQiOiJxcEQtU2ZoOUg3NFFHOXlMN1hSZXJ5RmZvbk0iLCJjdHkiOiJKV1QifQ.vUShQ8geBpBZZQoxghnpfFGLmYDkr4U4mw_w5e8aZiIQFfrhP2LhmRiqXj1YZBedsuMHORwZXU2aDlxDoMPvrjCtA5X8YxWUV_OwsrQXGYAP7wSOKjBYSH_jHZYhQEUMRt98UwCXsuSozROerVB6nc0RpSpndNoW6W1LFLHaRLRklBCLp88Z_HAl5jWTkMrdTci0DzsvZFwK4496Bs8rWzmT3L5tmSmqFIAf86fN-CEz1Wm29vfxFO7K2vHgp96rBsrzmhE2ggWoGAkVNu065BYtp5Ew0poMWRtecvcsowlZ8uQSD-royQkO-aUcrVfhYAx42bjBiudzt7Kb8YOsxA.IE4UTdwdet88lXT7alpKuA.O-l99h1Ua8ygaY3-AT95a_8beIIcJAV6ccVYY-a7InhBETZaCPUUeCdFy-0VgBbwbOB3ItOfC7JDeVWlc73riJAKOe3cw4c7i70LAIKjxKzzU_B619ssRB6Jh0BQbvjBtzOk0k0WvznHxKMlcLXSuY2rRf0mkry5bXTIWvDiXjt4oO7vhoQcGmpOx_ZZOLmGPhWsk-4T5tPCR2xcbD9WrBirhLq9g7samsJJMG1wwLGojmhXJqcsEOU5X6Zl6S2ggYjGLLcFAgRhmyETfhFAjhIQW0mL0dHKSceriYiSxzDIu84TBBhcumd8Ay1YjwL8QLsQeyg51iOMqzd1QFMW_E8zEGXjS30cXk-YIdIlCv6RzQWpOc05IqH8sW2r_Q-z3E_KrZxE6VTN9hFgnzEAcdY2KFmjwEwbQXhsRi_XzLyF3NAF1zQllhIbVqLkUozy_8lFuLfEiGPa0cshfZGOyoQP-hz52_6f5pF4qX8gY3phiscBxmEwg75qQVIjJHtVxuWdCw5aW2Wp6oCJW0cq5G0hF-xOfL8E1j8ddcP-bCkbMDcVu0TWOaRZXL2dtidjlR3WiZAZQ7yqnkM7pqdSKqhMtvwA_DBIJVnAtW2bO7_bubz4xJvNxQHPmA1u4TeUMigCks3epbO3zZeGCNUqS4zOKSA8ynvA-jhVqKRqd2WtXMJ8gF5-s0biZXRkJmV-8mRo0OOO7Dr5af1EKyVQpoMHODpyWOy7IDTGMw5_pL6S7eMTn9EXgF-fewF8E3Dio8QjMXnlMLyxVczvLGjGfKa-x4hy8tt6bfD8N-uaebZ0PMH3NlN0yWSSNzwUU8YOUHn3DWILs0bHAooLLWHq55j19equXwYglQT_5Oqej9TAZEinaIQ0jIqi9ZtzWd1lbQeqgvdrpBUUCiB4YCWxaNlnQDQY6MWhZ7BbxRuC6vdtG40zU1XidG5rsDM1CCqN45N5ObCaeaxVrk04_6is9X0WmFOqyFjjtX55dOWEZkLHufU9DBPVRcL7c1XTzm51.-d9xhTQbvumcVabvpptY7g'
  }

// const url = new URL('ms-xal-public-beta-000000004c20a908://auth/?code=M.R3_BAY.02e845c1-a74f-a048-ecf0-af82ee722b68&state=NDE5ZDVhMjYtZGIwZC00MTAxLWJiNWYtODAzOTg1ZjY3ZDc1')
// const code = url.searchParams.get('code')
// const state = url.searchParams.get('state')

// const exchange_code = xalAuthenticator.exchange_code_for_token(code, sisu.code_verifier)
// console.log('exchange_code', exchange_code)


// const exchange_code = 'EwAYA+pvBAAUKods63Ys1fGlwiccIFJ+qE1hANsAAZ+N9tlkyeAka6hJ58R/W/G9uGe22uSaB9cPTwV1SE5vRO18dAvSzZQeMES1XBmOyPI4Ay/+ii+1UPtQt3O1Si1nFfyIk/Uz+aVAjNRfx4e21XwJvGUmluO+XE5EoRyPxLMr1cSVQXAwN4XPMZUQWvhKXlTAYHhlYRs2dPgVYweqCZXVXgawvau9lrh1XeB3iphzrM3xEUi+OyxVK5RfJHPhr7zPAOdOxeEi8ux5Bo3qjj/ksmxcfsAz2StLGKt9WUVlfTSB3QOVQpPb0oWXFlwFhvRIvBuDlR5N8kVMPPIrLCARFf0q/wnLaSsM51497lBRLpxnCWLTJSfUklLckzgDZgAACEz5oavWBCQl6AGQLjDXoFznhCgvuNTbSryxfDXH73k6csfiWTwI+2ZBQ/0b6j+hDGLzbuOJ15Ji4g8m/S16rtWqao2NODqpDdzbFJVzIVqYENdNOVvboAK1FqGVs9fKhLXPeEGR+vsmuO2HeUIFby5c2AwxmEmnCLw5HivzfLXnjeW13ynQ98uAR2GZJRKVuEaAFqb05Lgh/odhhcUlOCGhRS+zUdwdiRahTO2JQ+pGSWTsEWfPhd8AZyz7Af2sfcyepNKhewQTAtIYjGkAsEN4b6mT718W1t8jMT3pNxdwpHwetllN2NMqP67diUFBzyt4GifrsFY3I0CrnAAie7SjNAW+M0coqzt74sv7kOGACQ640YwkUUef/V0OYPAq9VjO+e+8DSXdxAqmnk5P5ri5SXZsHF7WBuz7i3QYifFmqXk4Ut1hdEzZg45jwr7CS3sEJ2PROhbN+udJ2ssPi2Ebvo2YYW0hQyN997JfwpjntqFiuMYUQ4nml68xTN0XfcvZ9OLTQ/I+SH7jWgbJgyKzT21MVTpo427FiAPdlCMWsYlus4RgBtNC8CO3pQXyd6d1PgC8+BhkoQLEFFjFR7i0ixeztMA29IM4eh/zO2D042DG0KOwL9hKFvs6ybIt6vXGMWFvnKkP3WfBkY1rTL9WDSoC'

// const sisu_auth_response = xalAuthenticator.do_sisu_authorization(sisu.sisu_session_id, exchange_code, sisu.device_token)
// console.log('sisu_auth_response', sisu_auth_response)



