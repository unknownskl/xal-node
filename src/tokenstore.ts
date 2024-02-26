import { ISisuAuthorizationResponse, IAccessToken } from './xal'
import fs from 'fs'
import SisuToken from './lib/sisutoken'
import UserToken from './lib/usertoken'

export interface IUserToken extends IAccessToken {
    expires_on:string
}

export default class TokenStore {

    _filepath:string = ''

    // Main tokens
    _userToken:UserToken | undefined
    _sisuToken:SisuToken | undefined
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
            this._userToken = new UserToken(jsonData.userToken)
        }

        if(jsonData.sisuToken){
            this._sisuToken = new SisuToken(jsonData.sisuToken)
        }

        if(jsonData.jwtKeys){
            this._jwtKeys = jsonData.jwtKeys
        }

        return true
    }

    setUserToken(userToken:IAccessToken) {
        const expireDate = new Date()
        expireDate.setSeconds(expireDate.getSeconds() + userToken.expires_in)

        this._userToken = new UserToken({ ...userToken, expires_on: expireDate.toISOString() })
    }

    setSisuToken(sisuToken:ISisuAuthorizationResponse) {
        this._sisuToken = new SisuToken(sisuToken)
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