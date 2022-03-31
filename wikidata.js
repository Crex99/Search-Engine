const Node = require("./Classes/hierarchyTree")
const axios = require('axios');
const functions = require("./commonFeauters")
const WBK = require('wikibase-sdk')
const md5 = require("md5")
const wdk = WBK({
	instance: 'https://www.wikidata.org',
	sparqlEndpoint: 'https://query.wikidata.org/sparql'
})
const endpointUrl = 'https://query.wikidata.org/sparql'

const Trad = require("./Classes/Trad");
const TripleToQuadTransform = require("rdf-transform-triple-to-quad");

const SUBCLASS = "P279"
const IMGS = "P18"
const SYMBOL = "P487"

let treeLimit = 0

let hierarchyTree = ""

//subClasses è una matrice dove in ogni riga contiene una sottoclasse con gli elementi che contiene la stessa
//l'elemento 0 di ogni riga è il nome della sottoclasse

const searchById = (word, id, lang) => {

	return new Promise((resolve) => {

		if (id.length == 0) {
			resolve(id)
		}

		const url = wdk.getEntities({
			ids: id,
			languages: [lang], // returns all languages if not specified
			//props: [ 'info', 'claims' ], // returns all data if not specified
			format: 'json', // defaults to json
			redirections: false // defaults to true
		})

		let out = []

		axios.get(url).then((response) => {

			id.forEach(element => {
				let label = response.data.entities[element].labels[lang].value
				console.log("label", label)
				let category = response.data.entities[element].descriptions[lang]
				console.log("category", category)
				if (label.includes(word) == true && category != undefined) {
					out.push({ label: label, category: category.value })
				}
			});
			resolve(out)


		})
	})
}


const searchByName = (word, lang, sensitive, limit) => {
	console.log("word", word)
	return new Promise((resolve) => {
		lang = functions.formatLang2low(lang);
		const url = wdk.searchEntities({
			search: word,
			format: 'json',
			language: lang,
			limit: limit
		})

		axios.get(url).then((response) => {
			const wikidata_response = response.data;

			const search_items = wikidata_response.search.map((item) => {
				return {
					id: item.id,
					label: item.label,
					description: item.description

				}
			})

			let ids = []
			for (let i = 0; i < limit && i < search_items.length; i++) {

				let element = search_items[i]

				if (functions.control(word, sensitive, element.label) == true) {

					let label = " " + element.label + " "
					if (label.includes(" " + word + " ")) {
						ids.push(element.id)
					}

				}

			}

			searchById(word, ids, lang).then((result) => {
				resolve(result)

			})
		}).catch((err) => {
			console.log(err)
		})
	})
}
/**
 * FLUSSO DATI
 * searchByName trova tutti gli id relativi al nome passatogli in input
 * gli id trovati da searchByName vengono dati in pasto a searchById che trova tutte le informazioni per ogni id
 * searchByName divide i risultati trovati in base alle sottoclassi, che vengono cercate da searchPropertyName
 */

/**ritorna le traduzioni di una parola nelle lingue scelte */
const translations = (res, word, lang, langs, sensitive, max) => {
	return new Promise((resolve) => {
		lang = functions.formatLang2low(lang)
		let array_langs = langs.split(",");
		array_langs = array_langs.map((item) => {
			return functions.formatLang2low(item)
		})
		//ricerca degli id in base alla parola data
		const url = wdk.searchEntities({
			search: word,
			format: 'json',
			language: lang,
			limit: max
		})

		let search_items = []
		let search_labels = []

		axios.get(url).then((response) => {
			const wikidata_response = response.data;
			wikidata_response.search.map((item) => {

				if (functions.control(word, sensitive, item.label) == true) {

					let label = " " + item.label + " "
					if (label.includes(" " + word + " ") === true) {
						search_labels.push(item.label)
						search_items.push(item.id)
					}
				}
			})

			//ricerca delle parole in lingue diverse in base agli id trovati
			const url0 = wdk.getEntities({
				ids: search_items,
				format: 'json',
				languages: array_langs,
			})
			let current = ""
			let out = [];
			let i = 0;
			axios.get(url0).then((response) => {
				for (let k = 0; k < search_items.length; k++) {
					let entity = search_items[k]
					let trads = { word: search_labels[i], trads: [], datas: [] }
					array_langs.forEach(l => {

						current = response.data.entities[entity].labels[l]
						let description = response.data.entities[entity].descriptions[l]
						if (current != undefined) {

							if (description != undefined) {
								const trad = new Trad(l, current.value, description.value);
								trads.trads.push(trad);
								trads.datas.push(trad)
							} else {
								const trad = new Trad(l, current.value);
								trads.trads.push(trad);
								trads.datas.push(trad)
							}
						}
					});
					if (trads.trads.length >= max) {
						trads.trads.length = max
						out.push(trads)
						k = search_items.length
						resolve(out)
					} else {
						max = max - trads.trads.length;
						out.push(trads)
					}
					i++;
				}
				resolve(out)
			}).catch((err) => {
				resolve(err)
			})
		}).catch((err) => {
			resolve(err)
		})
	})
}

const searchImgs = (res, word, lang, sensitive, max) => {
	return new Promise((resolve) => {
		lang = functions.formatLang2low(lang)

		const url = wdk.searchEntities({
			search: word,
			format: 'json',
			language: lang,
			limit: max
		})

		let search_items = []
		axios.get(url).then((response) => {
			const wikidata_response = response.data;
			wikidata_response.search.map((item) => {
				if (item.label.includes(word)) {
					search_items.push(item.id)
				}
			})

			if (search_items.length === 0) {
				resolve([])
			}


			const url0 = wdk.getEntities({
				ids: search_items,
				languages: [lang],
				format: 'json',
				limit: max
			})

			let current = ""
			let array = [];
			axios.get(url0).then((response) => {
				const wiki_response = response.data;
				search_items.forEach(element => {
					current = wiki_response.entities[element].claims[IMGS]
					if (current != undefined) {
						current.forEach(element => {
							const name = replaceAll(element.mainsnak.datavalue.value, " ", "_")
							const hash = md5(name)
							const url = "https://upload.wikimedia.org/wikipedia/commons/" + hash[0] + "/" + hash[0] + hash[1] + "/" + name
							array.push(url);
						});

					}
				});
				resolve(array);
			})
		})
	})
}

const replaceAll = (word, remove, add) => {
	if (word.includes(remove) == true) {
		return replaceAll(word.replace(remove, add), remove, add)
	} else {
		return word;
	}
}

const emotes = (word, lang, limit, sensitive) => {
	return new Promise((resolve) => {

		lang = functions.formatLang2low(lang);
		const url = wdk.searchEntities({
			search: word,
			format: 'json',
			language: lang,
			limit: limit
		})

		axios.get(url).then((response) => {
			const wikidata_response = response.data;
			let search_items = []

			if (wikidata_response.search === undefined) {
				resolve([])
			}

			search_items = wikidata_response.search.map((item) => {
				return {
					id: item.id,
					label: item.label,
					description: item.description

				}
			})




			let ids = []

			for (let i = 0; i < limit && i < search_items.length; i++) {

				let element = search_items[i]

				if (functions.control(word, sensitive, element.label) == true) {
					ids.push(element.id)
				}
			}

			const url0 = wdk.getEntities({
				ids: ids,
				languages: [lang],
				format: 'json',
				limit: limit
			})

			axios.get(url0).then((response) => {
				let out = []
				ids.forEach(element => {
					let label = ""
					if (response.data.entities[element].labels[lang] != undefined) {
						label = response.data.entities[element].labels[lang].value
					}

					let emotes = response.data.entities[element].claims[SYMBOL]

					let symbols = []
					label = label.toLowerCase()

					if (label.includes(word) && emotes != undefined) {

						emotes.forEach(element => {
							symbols.push(element.mainsnak.datavalue.value)

						});
						if (symbols.length >= limit) {
							symbols.length = limit
							out.push({ word: label, datas: symbols })
							resolve(out)
						} else {
							limit = limit - symbols.length
							out.push({ word: label, datas: symbols })
						}

					}

				});
				resolve(out)
			})


		})

	})
}

const searchSynonyms = (word, lang, limit) => {
	let out = []
	return new Promise((resolve) => {
		lang = functions.formatLang2low(lang);
		const url = wdk.searchEntities({
			search: word,
			format: 'json',
			language: lang,
			limit: limit
		})

		axios.get(url).then((result) => {
			let items = result.data.search
			let search_items = []
			let ids = []
			for (let i = 0; i < limit && i < items.length; i++) {
				let label = " " + items[i].label + " "
				if (label.includes(" " + word + " ")) {
					search_items.push({ label: items[i].label, description: items[i].description })
					ids.push(items[i].id)
				}
			}

			if (ids.length == 0) {

				resolve(ids)
			} else {



				const url2 = wdk.getEntities({
					ids: ids,
					languages: [lang],
					format: "json"
				})

				axios.get(url2).then((response) => {

					for (let i = 0; i < ids.length; i++) {
						let id = ids[i]
						let synonyms = response.data.entities[id].aliases[lang]
						if (synonyms != undefined) {
							let syns = []
							synonyms.forEach(element => {
								if (element.value.length > 2) {
									syns.push(element.value)
								}

							});
							if (syns.length >= limit) {
								syns.length = limit
								out.push({ label: search_items[i].label, description: search_items[i].description, synonyms: syns, datas: syns })
								resolve(out)
								i = ids.length
							} else {
								limit = limit - syns.length
								out.push({ label: search_items[i].label, description: search_items[i].description, synonyms: syns, datas: syns })
							}
						}
					}

					resolve(out)
				})
			}
		})
	})

}

const searchSubClasses = (word, lang, limit) => {

	return new Promise((resolve) => {

		lang = functions.formatLang2low(lang);
		const url = wdk.searchEntities({
			search: word,
			format: 'json',
			language: lang,
			limit: limit
		})

		axios.get(url).then((result) => {
			let items = result.data.search
			let search_items = []
			let ids = []
			for (let i = 0; i < limit && i < items.length; i++) {
				let label = " " + items[i].label + " "
				if (label.includes(" " + word + " ")) {

					search_items.push({ label: items[i].label, description: items[i].description })
					ids.push(items[i].id)
				}
			}
			if (ids.length > 0) {
				const url2 = wdk.getEntities({
					ids: ids,
					format: 'json',
					language: lang,
					limit: limit
				})
				axios.get(url2).then((result) => {
					let subclassesIds = []
					ids.forEach(id => {
						const subclasses = result.data.entities[id].claims[SUBCLASS]
						if (subclasses != undefined) {
							subclasses.forEach(element => {
								subclassesIds.push(element.mainsnak.datavalue.value.id)
							});
						}
					});
					if (subclassesIds.length > 0) {
						const url3 = wdk.getEntities({
							ids: subclassesIds,
							format: 'json',
							language: lang,
							limit: limit
						})
						axios.get(url3).then((result) => {
							let response = []
							subclassesIds.forEach(id => {
								if (result.data.entities[id].labels[lang] != undefined) {
									response.push(result.data.entities[id].labels[lang].value)
								}

							});
							resolve(response)
						})
					} else {
						resolve(subclassesIds)
					}


				})
			} else {
				resolve(ids)
			}
		})
	})
}


const relations = (word, lang, limit) => {



	return new Promise((resolve) => {
		lang = functions.formatLang2low(lang);
		const url = wdk.searchEntities({
			search: word,
			format: 'json',
			language: lang,
			limit: limit
		})

		axios.get(url).then((result) => {
			let items = result.data.search
			let search_items = []
			let ids = []
			for (let i = 0; i < limit && i < items.length; i++) {
				let label = " " + items[i].label + " "
				if (label.includes(" " + word + " ")) {

					search_items.push({ label: items[i].label, description: items[i].description })
					ids.push(items[i].id)
				}
			}

			if (ids.length == 0) {
				resolve(ids)
			} else {

				const url2 = wdk.getEntities({
					ids: ids,
					languages: [lang],
					props: ["claims"],
					format: "json",
					limit: limit
				})
				axios.get(url2).then((result) => {

					let properties = []
					ids.forEach(id => {

						let claims = result.data.entities[id].claims

						let i = 0;

						while (claims[Object.keys(claims)[i]] != undefined) {
							claims[Object.keys(claims)[i]].forEach(element => {
								properties.push(element.mainsnak.property)
							})
							i++;
						}
					});
					let set = new Set()
					let relations = []

					let url3 = ""

					let i = 0
					properties.forEach(async (element) => {
						i++

						url3 = wdk.getEntities({
							ids: [element],
							languages: [lang],
							format: "json",
						})
						const result = await axios.get(url3)

						if (i == properties.length) {

							resolve(relations)
						}

						if (limit == 0) {

							set.forEach(element => {
								relations.push(element)
							});
							limit--
							resolve(relations)
						} else if (limit > 0) {

							if (result.data.entities[element].labels[lang] != undefined) {
								set.add(result.data.entities[element].labels[lang].value)
								limit--
								if (set.size == properties.length) {
									set.forEach(element => {
										relations.push(element)
									});

									resolve(relations)
								}
							}
						}

					});
				})
			}
		}).catch((err) => {
			console.log("err", err)
			resolve([])
		})

	})
}


module.exports = {
	searchByName: searchByName,
	searchById: searchById,
	translations: translations,
	searchImgs: searchImgs,
	emotes: emotes,
	searchSynonyms: searchSynonyms,
	searchSubClasses: searchSubClasses,
	searchRelations: relations
}