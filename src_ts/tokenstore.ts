const { tokenstore_load, tokenstore_save } = require("../dist/index.node");

export default class TokenStore {

    load(filepath:string) {
        return tokenstore_load(filepath)
    }

}