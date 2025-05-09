export default class Token {
    data:any

    constructor(data) {
        this.data = data
    }

    calculateSecondsLeft(date:Date){
        const expiresOn = date
        const currentDate = new Date()
        return Math.floor(((expiresOn.getTime() || 0) - currentDate.getTime()) / 1000)
    }

    getSecondsValid(){
        console.log('Warning: getSecondsValid not implemented')

        return 0
    }

    isValid(){ 
        console.log('Warning: isValid not implemented')

        return false
    }

    getUserHash(){
        if('UserToken' in this.data){
            return this.data.UserToken.DisplayClaims.xui[0].uhs
        }

        return false
    }

    getGamertag(){
        if('AuthorizationToken' in this.data){
            return this.data.AuthorizationToken.DisplayClaims.xui[0].gtg
        }

        return false
    }
}