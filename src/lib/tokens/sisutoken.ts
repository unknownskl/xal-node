import Token from '../token'

export interface ISisuToken {
    DeviceToken: string
    TitleToken: ISisuTitleToken
    UserToken: ISisuUserToken
    AuthorizationToken
    WebPage: string
    Sandbox: string
    UseModernGamertag: boolean
    Flow: string
}

export interface ISisuUserToken {
    IssueInstant: string
    NotAfter: string
    Token: string
    DisplayClaims: {
        xui: {
            uhs: string
        }
    }
}

export interface ISisuTitleToken {
    IssueInstant: string
    NotAfter: string
    Token: string
    DisplayClaims: {
        xti: {
            tid: string
        }
    }
}

export default class SisuToken extends Token {
    data:ISisuToken

    constructor(data:ISisuToken) {
        super(data)
        this.data = data
    }

    getSecondsValid(){
        const secondsLeftTitle = this.calculateSecondsLeft(new Date(this.data.TitleToken?.NotAfter || 0))
        const secondsLeftUser = this.calculateSecondsLeft(new Date(this.data.UserToken?.NotAfter || 0))
        const secondsLeftAuthorization = this.calculateSecondsLeft(new Date(this.data.AuthorizationToken?.NotAfter || 0))
        return Math.min(secondsLeftTitle, secondsLeftUser, secondsLeftAuthorization)
    }

    isValid(){
        const secondsLeftTitle = this.calculateSecondsLeft(new Date(this.data.TitleToken?.NotAfter || 0))
        if(secondsLeftTitle <= 0){
            return false
        }

        const secondsLeftUser = this.calculateSecondsLeft(new Date(this.data.UserToken?.NotAfter || 0))
        if(secondsLeftUser <= 0){
            return false
        }

        const secondsLeftAuthorization = this.calculateSecondsLeft(new Date(this.data.AuthorizationToken?.NotAfter || 0))
        if(secondsLeftAuthorization <= 0){
            return false
        }

        return true
    }

    getUserHash(){
        return this.data.UserToken.DisplayClaims.xui[0].uhs
    }

    getGamertag(){
        return this.data.AuthorizationToken.DisplayClaims.xui[0].gtg
    }
}