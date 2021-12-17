const ParsingClient = require('sparql-http-client/ParsingClient')
const axios = require('axios');
const functions = require("./commonFeauters");
const { hypernyms } = require('./dbpedia');
const endpointUrl = 'http://kaiko.getalp.org/sparql'
const qr = (word, lang, limit, synonyms, relations, hypernyms, hyponyms, holonyms, meronyms) => {
	//inserire qui la SPARQLE QUERY
	if (synonyms == true) {
		return `select ?synonym

       where
       {
       ?item rdfs:label"` + word + `"@` + lang + `;
       dbnary:synonym ?synonym
       }LIMIT ` + limit
	} else if (hypernyms == true) {
		return `select distinct  ?hypernym 
        where {
        ?Concept rdfs:label "` + word + `"@` + lang + `;
        dbnary:hypernym ?hypernym
        }LIMIT ` + limit
	} else if (hyponyms == true) {
		return `select distinct  ?hyponym
        where {
        ?Concept rdfs:label "` + word + `"@` + lang + `;
        dbnary:hyponym ?hyponym
        }LIMIT ` + limit
	} else if (holonyms == true) {
		return `select distinct  ?hyponym
        where {
        ?Concept rdfs:label "` + word + `"@` + lang + `;
        dbnary:holonym ?holonym
        }LIMIT ` + limit
	} else if (meronyms == true) {
		return `select distinct  ?meronym
        where {
        ?Concept rdfs:label "` + word + `"@` + lang + `;
        dbnary:meronym ?meronym
        }LIMIT ` + limit
	} else if (relations == true) {
		return `select distinct  ?hypernym ?hyponym ?holonym ?meronym

        where {
        {
        ?Concept rdfs:label "` + word + `"@` + lang + `;
        dbnary:hypernym ?hypernym
        }UNION
        {
        ?Concept rdfs:label "` + word + `"@` + lang + `;
        dbnary:hyponym ?hyponym
        }UNION
        {
        ?Concept rdfs:label "` + word + `"@` + lang + `;
        dbnary:holonym ?holonym
        }UNION
        {
        ?Concept rdfs:label "` + word + `"@` + lang + `;
        dbnary:meronym ?meronym
        }
        }LIMIT ` + limit
	} else {
		return `SELECT ?definition
    WHERE {
       ?sense a ontolex:LexicalSense ;
         skos:definition ?def .
       ?def rdf:value ?definition .
       FILTER(lang(?definition) = "`+ lang + `")
       {
          SELECT * WHERE {
	VALUES ?label {'`+ word + `'@` + lang + `}
	VALUES ?pos {<http://www.lexinfo.net/ontology/2.0/lexinfo#noun>}
             ?lexeme a ontolex:LexicalEntry ;
             rdfs:label ?label ;
             ontolex:canonicalForm ?form ;
             lime:language ?lang ;
             lexinfo:partOfSpeech   ?pos ;
             ontolex:sense  ?sense .
          FILTER(?lang = "en")
          } 
       }
    } LIMIT ` + limit
	}

}


const senses = async (word, lang, limit) => {
	const client = new ParsingClient({ endpointUrl })
	word = word.toLowerCase()
	lang = functions.formatLang2low(lang)
	const query = qr(word, lang, limit);
	const bindings = await client.query.select(query)
	let out = []
	return new Promise((resolve) => {
		bindings.forEach((row) => {

			out.push(row.definition.value)
		})

		resolve(out)

	})

}

const synonyms = async (word, lang, limit) => {
	const client = new ParsingClient({ endpointUrl })
	word = word.toLowerCase()
	lang = functions.formatLang2low(lang)
	const query = qr(word, lang, limit, true);
	const bindings = await client.query.select(query)
	let out = []
	let synonym = ""
	return new Promise((resolve) => {
		bindings.forEach(row =>
			Object.entries(row).forEach(([key, value]) => {
				current = (` ${value.value}`)
				synonym = current.split("/")
				out.push(synonym[synonym.length - 1])
			})
		)
		resolve(out)

	})

}

const relations = async (word, lang, limit) => {
	const client = new ParsingClient({ endpointUrl })
	word = word.toLowerCase()
	lang = functions.formatLang2low(lang)
	const query = qr(word, lang, limit, undefined, true);
	const bindings = await client.query.select(query)
	let out = []
	let set = new Set()
	let relation = ""
	return new Promise((resolve) => {
		bindings.forEach(row =>
			Object.entries(row).forEach(([key, value]) => {
				relation = (`${key}`)
				//current = (`${value.value}`)
				//console.log(current)
				//current = current.split("/")
				//out.push({ relation: relation, word: current[current.length - 1] })
				set.add(relation)
			})
		)
		set.forEach(element => {
			out.push(element)
		});
		resolve(out)

	})
}

const relationvalue = async (word, lang, limit, rel) => {

	let query = ""

	const client = new ParsingClient({ endpointUrl })
	word = word.toLowerCase()
	lang = functions.formatLang2low(lang)

	switch (rel) {
		case "hypernym":
			query = qr(word, lang, limit, undefined, undefined, true);
			break;
		case "hyponym":
			query = qr(word, lang, limit, undefined, undefined, undefined, true);
			break;
		case "holonym":
			query = qr(word, lang, limit, undefined, undefined, undefined, undefined, true);
			break;
		case "meronym":
			query = qr(word, lang, limit, undefined, undefined, undefined, undefined, undefined, true);
			break;
	}
	const bindings = await client.query.select(query)
	let out = []
	let set = new Set()

	return new Promise((resolve) => {
		bindings.forEach(row =>
			Object.entries(row).forEach(([key, value]) => {

				current = (`${value.value}`)
				console.log(current)
				current = current.split("/")
				set.add(current[current.length - 1])
			})
		)
		set.forEach(element => {
			out.push(element)
		});
		resolve(out)

	})
}





module.exports = {
	senses: senses,
	synonyms: synonyms,
	relations: relations,
	reltionValue: relationvalue
}