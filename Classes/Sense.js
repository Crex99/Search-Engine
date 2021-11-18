const sense = class Sense {
    constructor(name, synonyms) {
        this.name = name
        this.relations = []
        this.descriptions = []
        this.synonyms = synonyms
        this.images = []
        this.trads = []
        this.emotes = []
    }

    getName() {
        return this.name
    }

    addRelation(relation) {
        this.relations.push(relation)
    }

    setRelations(relations) {
        this.relations = relations
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

    setSynonyms(synonyms) {
        this.synonyms = synonyms
    }
}

module.exports = sense