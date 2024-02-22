export default class Token {
    data:any

    constructor(data) {
        this.data = data
    }

    calculateSecondsLeft(date:Date){
        const expiresOn = date
        const currentDate = new Date()
        return Math.floor((expiresOn.getTime() - currentDate.getTime()) / 1000)
    }

    getSecondsValid(){
        if(this.data.expires_on){
            return this.calculateSecondsLeft(new Date(this.data.expires_on))
        }

        if(this.data.TitleToken && this.data.UserToken && this.data.AuthorizationToken){
            const secondsLeftTitle = this.calculateSecondsLeft(new Date(this.data.TitleToken.NotAfter))
            const secondsLeftUser = this.calculateSecondsLeft(new Date(this.data.UserToken.NotAfter))
            const secondsLeftAuthorization = this.calculateSecondsLeft(new Date(this.data.AuthorizationToken.NotAfter))
            return Math.min(secondsLeftTitle, secondsLeftUser, secondsLeftAuthorization)
        }

        return 0
    }

    isValid(){
        if(this.data.expires_on){
            const secondsLeft = this.calculateSecondsLeft(new Date(this.data.expires_on))
            return secondsLeft > 0
        }

        if(this.data.TitleToken && this.data.UserToken && this.data.AuthorizationToken){
            const secondsLeftTitle = this.calculateSecondsLeft(new Date(this.data.TitleToken.NotAfter))
            if(secondsLeftTitle <= 0){
                return false
            }

            const secondsLeftUser = this.calculateSecondsLeft(new Date(this.data.UserToken.NotAfter))
            if(secondsLeftUser <= 0){
                return false
            }

            const secondsLeftAuthorization = this.calculateSecondsLeft(new Date(this.data.AuthorizationToken.NotAfter))
            if(secondsLeftAuthorization <= 0){
                return false
            }

            return true
        }

        return false
    }

    getUserHash(){
        if(this.data.UserToken){
            return this.data.UserToken.DisplayClaims.xui[0].uhs
        }

        return false
    }

    getGamertag(){
        if(this.data.AuthorizationToken){
            return this.data.AuthorizationToken.DisplayClaims.xui[0].gtg
        }

        return false
    }
}