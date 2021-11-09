const sense = class Sense {
    constructor(name, synonyms, relation) {
        this.name = name
        this.relation = relation
        this.descriptions = []
        this.synonyms = synonyms
    }

    getName() {
        return this.name
    }

    addRelation(relation) {
        this.relation = relation
    }

    getDescriptions() {
        return this.descriptions
    }

    setName(name) {
        this.name = name
    }

    addDescription(description) {
        if (this.descriptions.length == 0 || this.descriptions.includes(description) == false) {

            this.descriptions.push(description)
        }

    }

    addDescriptions(descriptions) {
        this.descriptions.concat(descriptions);
    }
}

module.exports = sense