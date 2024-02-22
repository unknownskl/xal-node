import { SisuAuthorizationResponse, AccessToken } from './xal'
import Token from './lib/token'
import fs from 'fs'

export interface UserToken extends AccessToken {
    expires_on:string
}

export default class TokenStore {

    _filepath:string = ''

    // Main tokens
    _userToken:Token | undefined
    _sisuToken:Token | undefined
    _jwtKeys:any

    // Sub-Tokens
    

    load(filepath:string) {
        this._filepath = filepath

        if(fs.existsSync(filepath)){
            const fileContents = fs.readFileSync(filepath)
            return this.loadJson(fileContents.toString())
        }

        return false
    }

    loadJson(json:string) {
        const jsonData:{ userToken:any, sisuToken:any, jwtKeys:any } = JSON.parse(json)

        if(jsonData.userToken){
            this._userToken = new Token(jsonData.userToken)
        }

        if(jsonData.sisuToken){
            this._sisuToken = new Token(jsonData.sisuToken)
        }

        if(jsonData.jwtKeys){
            this._jwtKeys = jsonData.jwtKeys
        }

        return true
    }

    setUserToken(userToken:AccessToken) {
        const expireDate = new Date()
        expireDate.setSeconds(expireDate.getSeconds() + userToken.expires_in)

        this._userToken = new Token({ ...userToken, expires_on: expireDate.toISOString() })
    }

    setSisuToken(sisuToken:SisuAuthorizationResponse) {
        this._sisuToken = new Token(sisuToken)
    }

    setJwtKeys(jwtKeys:any) {
        this._jwtKeys = jwtKeys
    }

    save() {
        const data = {
            userToken: this._userToken?.data,
            sisuToken: this._sisuToken?.data,
            jwtKeys: this._jwtKeys
        }

        fs.writeFileSync(this._filepath, JSON.stringify(data, null, 2))
    }

    removeAll() {
        fs.writeFileSync(this._filepath, JSON.stringify({}))
    }

    hasValidAuthTokens() {
        if(this._userToken){
            if(! this._userToken.isValid()){
                return false
            }
        } else {
            return false
        }

        if(this._sisuToken){
            if(! this._userToken.isValid()){
                return false
            }
        } else {
            return false
        }

        return true
    }

    

}