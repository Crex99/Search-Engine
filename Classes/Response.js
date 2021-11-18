const Trad = require("./Trad")

const response = class Response {
    constructor(succes, message) {
        this.succes = succes
        this.message = message
        this.data = []
    }

    addData(data) {
        this.data.push(data)
    }
}

module.exports = response;