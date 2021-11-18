const SparqlClient = require("sparql-http-client")
const ParsingClient = require('sparql-http-client/ParsingClient')
const axios = require('axios');
const functions = require("./commonFeauters")
const endpointUrl = 'http://kaiko.getalp.org/sparql'
const qr = (word, lang, limit, synonyms, relations, trads) => {
    //inserire qui la SPARQLE QUERY
    if (synonyms == true) {
        return `select ?synonym

       where
       {
       ?item rdfs:label"` + word + `"@` + lang + `;
       dbnary:synonym ?synonym
       }LIMIT ` + limit
    } else if (relations == true) {
        return `select distinct  ?hypernym ?hyponym

        where {
        {
        ?Concept rdfs:label "` + word + `"@` + lang + `;
        dbnary:hypernym ?hypernym
        }UNION
        {
        ?Concept rdfs:label "` + word + `"@` + lang + `;
        dbnary:hyponym ?hyponym
        }
        }LIMIT ` + limit
    } else if (trads == true) {

    } else {
        return `SELECT   ?definition
    WHERE {
       ?sense a ontolex:LexicalSense ;
         skos:definition ?def .
       ?def rdf:value ?definition .
       FILTER(lang(?definition) = "` + lang + `")
       {
          SELECT * WHERE {
	VALUES ?label {'` + word + `'@` + lang + `}
	VALUES ?pos {<http://www.lexinfo.net/ontology/2.0/lexinfo#noun>}
             ?lexeme a ontolex:LexicalEntry ;
             rdfs:label ?label ;
             ontolex:canonicalForm ?form ;
             lime:language ?lang ;
             lexinfo:partOfSpeech   ?pos ;
             ontolex:sense  ?sense .
          FILTER(?lang = "` + lang + `")
          } 
       }
    }
LIMIT ` + limit
    }

}


const senses = async(word, lang, limit) => {
    const client = new ParsingClient({ endpointUrl })
    word = word.toLowerCase()
    lang = functions.formatLang2low(lang)
    const query = qr(word, lang, limit);
    const bindings = await client.query.select(query)
    let out = []
    return new Promise((resolve) => {
        bindings.forEach(row =>
            Object.entries(row).forEach(([key, value]) => {
                current = (` ${value} `)
                out.push(current)
            })
        )

        resolve(out)

    })

}

const synonyms = async(word, lang, limit) => {
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

const relations = async(word, lang, limit) => {
    const client = new ParsingClient({ endpointUrl })
    word = word.toLowerCase()
    lang = functions.formatLang2low(lang)
    const query = qr(word, lang, limit, undefined, true);
    const bindings = await client.query.select(query)
    let out = []
    let relation = ""
    return new Promise((resolve) => {
        bindings.forEach(row =>
            Object.entries(row).forEach(([key, value]) => {
                relation = (`${key}`)
                current = (`${value.value}`)
                current = current.split("/")
                out.push({ relation: relation, word: current[current.length - 1] })
            })
        )
        resolve(out)

    })
}





module.exports = {
    senses: senses,
    synonyms: synonyms,
    relations: relations
}