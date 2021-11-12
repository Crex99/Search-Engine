const Trad = require("./Trad")

const response = class Response {
    constructor(succes, message, object) {
        this.succes = succes
        this.message = message
        this.data = [object]
    }

    addData(data) {
        this.data.push(data)
    }
}

module.exports = response;