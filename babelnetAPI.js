const axios = require('axios');
const functions = require("./commonFeauters")
const endpointUrl = 'https://babelnet.org/sparql/';
const KEY = "69b0ba73-de64-4cee-a700-c2005da7ed66";
const KEY2 = "f82361e3-a269-453f-a1ea-a294233c2e71";
const KEY3 = "e7849be2-f543-4c17-afef-24d9a5e9abbe";
const Sense = require("./Classes/Sense");
const Trad = require('./Classes/Trad');
const { hierarchy } = require('./Controller');
const sense = require('./Classes/Sense');

const SYNONYM = "POTENTIAL_NEAR_SYNONYM_OR_WORSE"
const HIGHQUALITY = "HIGH_QUALITY"

let synonyms = []
let trads_array = []
let relations_array = []

const getDescriptions = (id, lang, limit) => {
	let set = new Set()
	let arr = []
	const url = "https://babelnet.io/v6/getSynset?id=" + id + "&targetLang=" + lang + "&key=" + KEY
	return new Promise((resolve) => {
		axios.get(url).then((result) => {
			for (let i = 0; i < limit && i < result.data.glosses.length; i++) {
				let gloss = result.data.glosses[i]
				set.add(gloss.gloss)
			}
			set.forEach(element => {
				arr.push(element)
			});
			resolve(arr)
		}).catch((err) => {
			console.log(err)
		})

	})
}

const addRelEl = (el, rel) => {

	relations_array.forEach(element => {

		if (element[0] == rel) {
			element.push(el)
		}
	});

}

const addRelation = (relation) => {
	if (relations_array.length == 0) {
		relations_array.push([relation]);
	} else {

		let verify = false

		relations_array.forEach(element => {
			if (element[0] == relation) {
				verify = true
			}
		});

		if (verify == false) {
			relations_array.push([relation]);
		}

	}
}

const addTrad = (trad) => {
	let verify = false
	trads_array.forEach(element => {
		if (element.lang == trad.lang && element.content.toLowerCase() == trad.content.toLowerCase()) {
			verify = true
		}
	});

	if (verify == false) {
		trads_array.push(trad)
	}
}

const addSynonim = (string) => {
	string = string.toLowerCase()
	string = string.split(" ").join("")
	string = string.split("_").join(" ")
	if (synonyms.length == 0) {
		synonyms.push(string);
	}
	let verify = false
	for (let i = 0; i < synonyms.length; i++) {
		if (synonyms[i] == string) {
			verify = true
		}
	}
	if (verify == false) {
		synonyms.push(string)
	}
}



const emotes = async (id, b) => {

	let array = []

	const url = "https://babelnet.io/v6/getSynset?id=" + id + "&targetLang=" + b + "&key=" + KEY;
	try {
		const response = await axios.get(url);
		return new Promise((resolve) => {
			let out = response.data;
			out.senses.forEach(element => {
				if (element.properties.lemma.type == SYNONYM) {
					if (element.properties.lemma.lemma.length == 2) {
						if (element.properties.lemma.lemma.toUpperCase() == element.properties.lemma.lemma.toLowerCase()) {
							array.push(element.properties.lemma.lemma)
						}
					}
				}
			});
			resolve(array);
		})
	} catch (error) {
		console.log(error);
	}
};



//cerca il synset con identificativo id e ritorna una parola che lo descrive se ci sono
const informations = async (word, id, b, syn, limit) => {

	synonyms = []
	const url = "https://babelnet.io/v6/getSynset?id=" + id + "&targetLang=" + b + "&key=" + KEY;
	try {
		const response = await axios.get(url);
		return new Promise((resolve) => {
			let out = response.data;
			let array = out.senses
			if (syn == true) {
				for (let i = 0; i < limit && i < array.length; i++) {

					let element = array[i]
					if (element.properties.lemma.type == HIGHQUALITY) {
						addSynonim(element.properties.lemma.lemma)
					}
				}
				resolve(synonyms)
			}
		})
	} catch (error) {
		console.log(error);
	}
}


//ritorna i senses di una data parola in input(word) 
const senses = async ({ word, lang, sensitive, limit, pos, relations, synonyms, emote, imgs, langs, hyponyms, hypernyms, meronyms, holonyms, descriptions, partOf, hasPart, isA }) => {
	word = word.toLowerCase()
	let outs = []
	let array = []
	lang = functions.formatLang2High(lang);
	let url = "";

	if (langs != undefined) {
		langs = langs.split(",")
	}

	if (pos == undefined) {
		url = "https://babelnet.io/v6/getSenses?lemma=" + word + "&searchLang=" + lang + "&key=" + KEY;
	} else {
		pos = pos.toUpperCase();
		url = "https://babelnet.io/v6/getSenses?lemma=" + word + "&searchLang=" + lang + "&pos=" + pos + "&key=" + KEY;
	}
	try {
		const response = await axios.get(url);
		let out = response.data;
		console.log("out", out.length)
		if (out.length == undefined) {
			return ([])
		}
		for (let i = 0; i < out.length; i++) {
			if (i == out.length - 1) {
				return array;
			}
			if (out[i] != undefined) {
				if (functions.control(word, sensitive, out[i].properties.fullLemma) == true) {
					if (out[i].properties.fullLemma.includes(word)) {
						if (synonyms == true) {
							let sense = ""
							let verify = false
							if (array.length === 0) {
								sense = new Sense(out[i].properties.fullLemma)
								array.push(sense)
							} else {

								for (let k = 0; k < array.length; k++) {
									if (array[k].name === out[i].properties.fullLemma) {
										verify = true
										sense = array[k]
									}
								}
								if (verify === false) {
									sense = new Sense(out[i].properties.fullLemma)
									array.push(sense)
								}
							}
							const final = await informations(out[i].properties.fullLemma, out[i].properties.synsetID.id, lang, synonyms, limit);



							if (final.length >= limit) {
								final.length = limit
								sense.addSynonyms(final)
								for (let k = 0; k < array.length; k++) {
									if (array[k].name === sense.name) {
										array[k] = sense
									}
								}
								return array
							} else {
								limit = limit - final.length
								sense.addSynonyms(final)
								for (let k = 0; k < array.length; k++) {
									if (array[k].name === sense.name) {
										array[k] = sense
									}
								}
							}
						}
						if (outs.includes(out[i].properties.synsetID.id) == false) {

							outs.push(out[i].properties.synsetID.id)

							if (relations == true) {

								const final = await characteristics(out[i].properties.fullLemma, out[i].properties.synsetID.id, lang, limit)

								const sense = new Sense(out[i].properties.fullLemma);

								if (final.length >= limit) {
									final.length = limit
									sense.setRelations(final)
									array.push(sense)

									return array
								} else {
									limit = limit - final.length
									sense.setRelations(final)
									array.push(sense)
								}


							} else if (imgs == true) {

								const sense = new Sense(out[i].properties.fullLemma);

								const final = await searchImgs(out[i].properties.fullLemma, out[i].properties.synsetID.id, lang, limit)

								if (final.length >= limit) {
									final.length = limit
									sense.images = final
									array.push(sense)

									return array
								} else if (final.length > 0) {
									limit = limit - final.length
									sense.images = final
									array.push(sense)
								}


							} else if (langs != undefined) {
								let sense = new Sense(out[i].properties.fullLemma);
								let myLangs = []
								let final = ""
								let arr = []
								for (let j = 0; j < langs.length; j += 3) {
									final = ""
									myLangs = []
									myLangs.push(langs[j])
									if (j + 1 < langs.length) {
										myLangs.push(langs[j + 1])
									}
									if (j + 2 < langs.length) {
										myLangs.push(langs[j + 2])
									}

									final = await trads(out[i].properties.fullLemma, out[i].properties.synsetID.id, myLangs, limit)

									if (final != null) {
										arr = arr.concat(final)
									}
								}

								console.log("arr", arr)

								if (arr.length >= limit) {
									arr.length = limit
									sense.trads = arr
									array.push(sense)

									return array
								} else if (arr.length > 0) {
									sense.trads = arr
									array.push(sense)
									limit = limit - arr.length
								}


							} else if (emote == true) {

								const sense = new Sense(out[i].properties.fullLemma)

								const final = await emotes(out[i].properties.synsetID.id, lang)
								if (final.length >= limit) {
									final.length = limit
									sense.emotes = final
									array.push(sense)

									return array
								} else if (final.length > 0) {
									limit = limit - final.length
									sense.emotes = final
									array.push(sense)
								}

							} else if (hyponyms == true) {
								const sense = new Sense(out[i].properties.fullLemma)

								const final = await hierarchies(out[i].properties.synsetID.id, lang, "HYPONYM")

								if (final.length >= limit) {
									final.length = limit
									sense.hierarchy = final
									array.push(sense)

									return array
								} else if (final.length > 0) {
									limit = limit - final.length
									sense.hierarchy = final
									array.push(sense)
								}
							} else if (hypernyms == true) {
								const sense = new Sense(out[i].properties.fullLemma)

								const final = await hierarchies(out[i].properties.synsetID.id, lang, "HYPERNYM")

								if (final.length >= limit) {
									final.length = limit
									sense.hierarchy = final
									array.push(sense)

									return array
								} else if (final.length > 0) {
									limit = limit - final.length
									sense.hierarchy = final
									array.push(sense)
								}
							} else if (holonyms == true) {
								const sense = new Sense(out[i].properties.fullLemma)

								const final = await hierarchies(out[i].properties.synsetID.id, lang, "HOLONYM")

								if (final.length >= limit) {
									final.length = limit
									sense.hierarchy = final
									array.push(sense)

									return array
								} else if (final.length > 0) {
									limit = limit - final.length
									sense.hierarchy = final
									array.push(sense)
								}
							} else if (meronyms == true) {
								const sense = new Sense(out[i].properties.fullLemma)

								const final = await hierarchies(out[i].properties.synsetID.id, lang, "MERONYM")

								if (final.length >= limit) {
									final.length = limit
									sense.hierarchy = final
									array.push(sense)
									return array
								} else if (final.length > 0) {
									limit = limit - final.length
									sense.hierarchy = final
									array.push(sense)
								}
							} else if (descriptions == true) {
								const sense = new Sense(out[i].properties.fullLemma)

								const final = await getDescriptions(out[i].properties.synsetID.id, lang, limit);

								final.forEach(element => {
									sense.addDescription(element)
								});
								if (final.length > 0) {
									array.push(sense)
								}

								if (sense.descriptions.length >= limit) {


									sense.descriptions.length = limit
									return array
								} else {
									limit = limit - sense.descriptions.length
								}
							} else if (hasPart == true) {
								const sense = new Sense(out[i].properties.fullLemma)
								const final = await getRel(out[i].properties.synsetID.id, lang, limit, "has-part");
								if (sense.hierarchy == "") {
									sense.hierarchy = []
								}
								final.forEach(element => {
									sense.hierarchy.push(element)
								});
								if (final.length > 0) {
									array.push(sense)
								}

								if (sense.hierarchy.length >= limit) {


									sense.hierarchy.length = limit
									return array
								} else {
									limit = limit - sense.hierarchy.length
								}

							} else if (partOf == true) {
								const sense = new Sense(out[i].properties.fullLemma)
								const final = await getRel(out[i].properties.synsetID.id, lang, limit, "part_of");
								if (sense.hierarchy == "") {
									sense.hierarchy = []
								}
								final.forEach(element => {
									sense.hierarchy.push(element)
								});
								if (final.length > 0) {
									array.push(sense)
								}

								if (sense.hierarchy.length >= limit) {


									sense.hierarchy.length = limit
									return array
								} else {
									limit = limit - sense.hierarchy.length
								}
							} else if (isA == true) {
								const sense = new Sense(out[i].properties.fullLemma)
								const final = await getRel(out[i].properties.synsetID.id, lang, limit, "is-a");
								if (sense.hierarchy == "") {
									sense.hierarchy = []
								}
								final.forEach(element => {
									sense.hierarchy.push(element)
								});
								if (final.length > 0) {
									array.push(sense)
								}

								if (sense.hierarchy.length >= limit) {


									sense.hierarchy.length = limit
									return array
								} else {
									limit = limit - sense.hierarchy.length
								}
							} else if (synonyms != true) {

								const sense = new Sense(out[i].properties.fullLemma)

								const final = await types(out[i].properties.synsetID.id, lang, limit);

								final.forEach(element => {
									sense.addDescription(element)
								});
								if (final.length > 0) {
									array.push(sense)
								}

								if (sense.descriptions.length >= limit) {


									sense.descriptions.length = limit

									return array
								} else {
									limit = limit - sense.descriptions.length
								}

							}
						}
					}
				}
			}
		}
		return array;

	} catch (error) {
		console.log(error);
	}
	return array;
};

//prende le immagini dato un id 

const searchImgs = (sense, id, lang, limit) => {

	return new Promise((resolve) => {

		const url = "https://babelnet.io/v6/getSynset?id=" + id + "&key=" + KEY


		const response = axios.get(url).then((result) => {

			let imgs = result.data.images
			let i = 0;
			let array = []
			console.log(sense)
			for (let i = 0; i < limit && i < imgs.length; i++) {
				let element = imgs[i]
				const name = element.name
				const url = element.url
				array.push({ name, url })
			}

			resolve(array);


		})

	})

};

const trads = async (word, id, langs, limit) => {
	trads_array = []

	let midString = ""

	for (let i = 0; i < langs.length && i < 3; i++) {
		midString += "&targetLang=" + functions.formatLang2High(langs[i])
	}
	const url = "https://babelnet.io/v6/getSynset?id=" + id + midString + "&key=" + KEY



	const response = await axios.get(url);


	let translations = response.data.translations

	for (let i = 0; i < limit && i < translations.length; i++) {
		let sup = translations[i]


		sup.forEach(element => {
			if (element.properties != undefined) {
				const trad = new Trad(element.properties.language, element.properties.fullLemma)
				addTrad(trad)

			} else {
				element.forEach(el => {
					const trad = new Trad(el.properties.language, el.properties.fullLemma)
					addTrad(trad)

				});

			}
		});
	}
	if (trads_array.length > 0) {
		return trads_array
	}
}





//prende le relazioni

const characteristics = async (word, id, lang, limit) => {
	let set = new Set()
	relations_array = [];
	const url = "https://babelnet.io/v6/getOutgoingEdges?id=" + id + "&key=" + KEY;
	try {
		let array = [];
		let arrayPointers = []
		let arrayout = []
		const response = await axios.get(url);
		return new Promise((resolve) => {
			let out = response.data;

			for (let i = 0; i < limit && i < out.length; i++) {

				let element = out[i]
				if (element.language == lang) {


					if (array.length == 0 || array.includes(element.target) == false) {

						array.push(element.target)
						set.add(element.pointer.relationGroup)
						/*supChar(element.target, element.pointer.relationGroup).then((result) => {
							console.log(i)
						    
							console.log("rel", result.rel)
							console.log("lemma", result.lemma)

							addRelEl(result.lemma, result.rel)
							if (i == limit - 1 || i == out.length - 1) {
								console.log(i)
							}
							//console.log("array", relations_array)
						})*/


					}
				}
			}
			set.forEach(element => {
				arrayPointers.push(element)
			});
			resolve(arrayPointers)

			/*supChar(array, arrayPointers, 0).then((result) => {

				resolve(result)
			})*/
		})
	} catch (error) {
		console.log(error);
	}
};

const supChar = async (ids, relatives, i) => {

	const url = "https://babelnet.io/v6/getSynset?id=" + ids[i] + "&key=" + KEY

	const result = await axios.get(url);

	if (result.data.senses != undefined) {
		addRelation(relatives[i])
		addRelEl(result.data.senses[0].properties.fullLemma, relatives[i])
	}

	return new Promise((resolve) => {
		if (i == ids.length - 1) {
			resolve(relations_array)
		} else {
			resolve(supChar(ids, relatives, i + 1))
		}
	})

}

const hierarchies = (id, lang, rel) => {
	return new Promise((resolve) => {

		const url = "https://babelnet.io/v6/getOutgoingEdges?id=" + id + "&key=" + KEY;
		axios.get(url).then(async (result) => {

			let ids = []

			result.data.forEach(element => {

				if (element.pointer.relationGroup == rel && element.language == lang) {
					ids.push(element.target)
				}
			});

			let results_ids = []
			let results = []
			if (ids.length > 0) {
				resolve(hierSup(ids, 0, results_ids, results))
			} else {
				resolve([])
			}


		}).catch((err) => {

			console.log("error", err)
		})

	})
}

const hierSup = (arr, i, ids, results) => {

	return new Promise((resolve) => {
		const url = "https://babelnet.io/v6/getSynset?id=" + arr[i] + "&key=" + KEY;

		axios.get(url).then((result) => {
			if (result.data.senses != undefined) {
				result.data.senses.forEach(element => {
					verify = false
					ids.forEach(elementIn => {
						if (elementIn == element.properties.synsetID.id) {
							verify = true
						}
					});

					if (verify == false) {
						ids.push(element.properties.synsetID.id)
						if (results.includes(element.properties.fullLemma.split("_").join(" ")) == false) {

							results.push(element.properties.fullLemma.split("_").join(" "))
						}
					}
				})
			}
			if (i < arr.length - 1) {
				resolve(hierSup(arr, i + 1, ids, results))
			} else {
				resolve(results)
			}
		})
	})
}

const types = (id, lang, limit) => {
	return new Promise((resolve) => {

		let arr = []
		let set = new Set([])
		let out = []

		const url = "https://babelnet.io/v6/getOutgoingEdges?id=" + id + "&key=" + KEY
		let curr_url = ""
		let response = ""
		axios.get(url).then((result) => {
			result.data.forEach(element => {
				if (element.language == lang && element.pointer.shortName == "is-a") {
					arr.push(element.target)
				}
			});

			let i = 0;

			arr.forEach(async (element) => {
				curr_url = " https://babelnet.io/v6/getSynset?id=" + element + "&key=" + KEY

				response = await axios.get(curr_url)
				set.add(response.data.senses[0].properties.fullLemma)
				i++;
				if (i == arr.length) {
					set.forEach(element => {
						out.push(element)
					});
					resolve(out)
				}
			});
		})
	})
}

const getRel = (id, lang, limit, string) => {

	return new Promise((resolve) => {

		const url = "https://babelnet.io/v6/getOutgoingEdges?id=" + id + "&key=" + KEY
		axios.get(url).then((result) => {
			let set = new Set()
			let arr = []
			result.data.forEach(element => {
				if (element.pointer.shortName == string || element.pointer.name == string) {
					arr.push(element.target)
				}
			});
			if (arr.length == 0) {
				resolve([])
			}
			let i = 0
			arr.forEach(async (element) => {
				const url2 = "https://babelnet.io/v6/getSynset?id=" + element + "&targetLang=" + lang + "&key=" + KEY
				const result = await axios.get(url2)
				if (result.data.senses[0] != undefined) {
					set.add(result.data.senses[0].properties.fullLemma.split("_").join(" "))
				}
				i++;
				if (i == arr.length) {
					arr = []
					set.forEach(element => {
						arr.push(element)
					});
					resolve(arr)
				}
			});
		})
	})
}

module.exports = {
	informations: informations,
	senses: senses,
	searchImgs: searchImgs,
	characteristics: characteristics,
	trads: trads

};

/*
 *BabelNet potrebbe essere facilmente usato per trovare hypernym, hyponym , sinonimi e altro anche in più lingue.
 *Bisogna stare attenti a non eccedere il limite di richieste giornaliere
*/