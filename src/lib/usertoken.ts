import Token from "./token"
import { IUserToken } from "../tokenstore"

export default class UserToken extends Token {
    data:IUserToken

    constructor(data) {
        super(data)
        this.data = data
    }

    calculateSecondsLeft(date:Date){
        const expiresOn = date
        const currentDate = new Date()
        return Math.floor((expiresOn.getTime() - currentDate.getTime()) / 1000)
    }

    getSecondsValid(){
        return this.calculateSecondsLeft(new Date(this.data.expires_on))
    }

    isValid(){
        const secondsLeft = this.calculateSecondsLeft(new Date(this.data.expires_on))
        return secondsLeft > 0
    }
}