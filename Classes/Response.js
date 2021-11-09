const Trad = require("./Trad")

const response = class Response {
    constructor() {
        this.trads = []
        this.imgs = []
        this.senses = []
        this.relations = []
    }

    getTrads() {
        return this.trads;
    }

    getImgs() {
        return this.imgs;
    }

    addImg(img) {
        this.imgs.push(img)
    }

    addTrad(trad) {
        this.trads.push(trad);
    }

    addSense(sense) {
        if (this.senses.includes(sense) == false) {
            this.senses.push(sense)
        }
    }

    addImgs(imgs) {
        this.imgs = this.imgs.concat(imgs);
    }

    addTrads(trads) {
        if (this.trads.length == 1) {

            this.trads = trads
        } else {
            this.trads = this.trads.concat(trads);
        }
    }

    addSenses(senses) {
        this.senses = this.senses.concat(senses)
    }

    addRelations(relations) {
        this.relations = relations
    }
}

module.exports = response;