const sense = class Sense {
	constructor (name) {
		this.name = name
		this.relations = []
		this.descriptions = []
		this.synonyms = []
		this.images = []
		this.trads = []
		this.emotes = []
		this.hierarchy = []
		this.datas = []
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
		description = description.split("_").join(" ")
		this.descriptions.push(description)
	}

	addDescriptions(descriptions) {
		this.descriptions.concat(descriptions);
	}

	setSynonyms(synonyms) {
		this.synonyms = synonyms
	}
	addSynonyms(synonyms) {
		this.synonyms = this.synonyms.concat(synonyms)

	}

	addTrads(trads) {
		this.trads.push(trads)
	}

	addResults(result) {
		this.datas.push(result)
	}

	setResults(result) {
		this.datas = this.datas.concat(result)
	}

}

module.exports = sense