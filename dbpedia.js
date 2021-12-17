const ParsingClient = require('sparql-http-client/ParsingClient')
const functions = require("./commonFeauters")
const endpointUrl = 'https://dbpedia.org/sparql'
const Tree = require("./Classes/hierarchyTree")
const qr = (word, lang, limit, sensitive, trad, synonyms, images, hypernyms, relations) => {
	//inserire qui la SPARQLE QUERY

	if (sensitive == true) {
		return ` SELECT   ?word ?label
  WHERE
       {
          ?item rdfs:label  ?word.
          OPTIONAL { ?item dbo:abstract ?label }
          FILTER ( LANG ( ?label ) ="` + lang + `" )
          FILTER ( LANG ( ?word ) ="` + lang + `" )
          FILTER(lcase(str(?word)) = "` + word.toLowerCase() + `")
       }LIMIT `+ limit
	} else if (trad != undefined) {

		let query = `SELECT  distinct  ?label
        WHERE{
             
                ?item rdfs:label "` + word + `"@` + lang + `;
                rdfs:label ?label.
                FILTER(LANG(?label)="` + trad + `")
            }LIMIT `+ limit
		return query

	} else if (synonyms == true) {
		return `select distinct   ?label
        where {
        ?word rdfs:label "` + word + `"@` + lang + `;
        dbp:synonyms ?label.
        }LIMIT `+ limit
	} else if (images == true) {
		return `select distinct    ?image
        where {
            ?item rdfs:label "` + word + `" @` + lang + `;
            foaf:depiction ?image.
        }LIMIT `+ limit
	} else if (hypernyms == true) {

		return `select distinct ?label
		where{

			?item rdfs:label "` + word + `" @` + lang + `.
			OPTIONAL{?item gold:hypernym ?hypernym}
			OPTIONAL{?hypernym rdfs:label ?label}
		}LIMIT `+ limit

	} else if (relations == true) {
		return `select distinct ?hypernym
		where{

			?item rdfs:label "` + word + `" @` + lang + `.
			OPTIONAL{?item gold:hypernym ?hypernym}
			
		}LIMIT `+ limit
	} else {

		return ` 
        SELECT    ?label
        WHERE
             {
                ?item rdfs:label "` + word + `" @` + lang + `.
                OPTIONAL { ?item dbp:genus ?label }
                FILTER ( LANG ( ?label ) = '` + lang + `' )
             }LIMIT `+ limit
	}


}

let hierarchyTree = ""


const description = async (word, lang, sensitive, limit) => {
	const client2 = new ParsingClient({ endpointUrl })
	word = functions.formatWord(word);
	lang = functions.formatLang2low(lang);
	const query = qr(word, lang, limit, sensitive);
	const bindings = await client2.query.select(query)
	return new Promise((resolve) => {
		if (bindings.length == 0) {
			resolve(bindings)
		}
		bindings.forEach(element => {
			resolve((element.label.value))
		});
	})
}

const translations = async (word, lang, langs, limit) => {
	const client = new ParsingClient({ endpointUrl })
	word = functions.formatWord(word);
	lang = functions.formatLang2low(lang);
	langs = langs.split(",")
	for (let i = 0; i < langs.length; i++) {
		langs[i] = functions.formatLang2low(langs[i])
	}

	let out = []
	let current = ""

	for (let i = 0; i < langs.length; i++) {
		let trad = langs[i]
		const query = qr(word, lang, limit, undefined, trad);
		const bindings = await client.query.select(query)
		bindings.forEach(row =>
			Object.entries(row).forEach(([key, value]) => {
				current = (` ${value.value}`)

				out.push({ lang: trad, word: current })


			})
		)
		if (out.length >= limit) {
			return new Promise((resolve) => {

				resolve(out)

			})
		}
	}

	return new Promise((resolve) => {

		resolve(out)

	})

}

const synonyms = async (word, lang, limit) => {
	const client = new ParsingClient({ endpointUrl })
	word = functions.formatWord(word);
	lang = functions.formatLang2low(lang);
	const query = qr(word, lang, limit, undefined, undefined, true)
	let out = []
	const bindings = await client.query.select(query).
		catch((err) => {
			console.log(err)
		})
	bindings.forEach(row => {
		Object.entries(row).forEach(([key, value]) => {
			current = (`${value.value}`)
			if (current.includes("\n") == true) {
				let currents = current.split("\n")
				currents.forEach(element => {
					out.push(element)
				});
			} else if (current.length > 0) {

				out.push(current)
			}



		})
	})

	return new Promise((resolve) => {
		resolve(out)
	})
}

const images = async (word, lang, limit) => {
	const client = new ParsingClient({ endpointUrl })
	word = functions.formatWord(word);
	lang = functions.formatLang2low(lang);

	const query = qr(word, lang, limit, undefined, undefined, undefined, true)
	let out = []
	const bindings = await client.query.select(query)
	return new Promise((resolve) => {
		bindings.forEach(row =>
			Object.entries(row).forEach(([key, value]) => {
				current = (` ${value.value}`)
				out.push(current)
			})
		)
		resolve(out)

	})

}

const hypernyms = async (word, lang, limit) => {
	const client = new ParsingClient({ endpointUrl })
	word = functions.formatWord(word);
	lang = functions.formatLang2low(lang);
	const query = qr(word, lang, limit, undefined, undefined, undefined, undefined, true)
	const bindings = await client.query.select(query)
	let out = []
	return new Promise((resolve) => {
		bindings.forEach(row =>
			Object.entries(row).forEach(([key, value]) => {
				current = (` ${value.value}`)
				console.log("current", current)
				out.push(current)
			})
		)
		resolve(out)

	})
}

const relations = async (word, lang, limit) => {
	const client = new ParsingClient({ endpointUrl })
	word = functions.formatWord(word);
	lang = functions.formatLang2low(lang);
	const query = qr(word, lang, limit, undefined, undefined, undefined, undefined, undefined, true)
	const bindings = await client.query.select(query)
	let out = []
	let set = new Set()
	return new Promise((resolve) => {
		bindings.forEach(row =>
			Object.entries(row).forEach(([key, value]) => {

				current = (` ${key}`)

				set.add(current)
			})
		)
		set.forEach(element => {
			out.push(element)
		});
		resolve(out)

	})
}


module.exports = {
	description: description,
	translations: translations,
	synonyms: synonyms,
	images: images,
	hypernyms: hypernyms,
	relations: relations
}

/**
 * DBPedia si dimostra ottimo per trovare descrizioni dettagliate delle parole ricercate, cosa che gli altri dataset non forniscono,
 * la pecca è che funziona solo per l'inglese e anche in inglese non è detto che abbia una descrizione per ogni parola ricercata
 */