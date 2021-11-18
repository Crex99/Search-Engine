const SparqlClient = require("sparql-http-client")
const ParsingClient = require('sparql-http-client/ParsingClient')
const functions = require("./commonFeauters")
const endpointUrl = 'https://dbpedia.org/sparql'
const qr = (word, lang, sensitive, langs, synonyms, images) => {
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
       }LIMIT 20`
    } else if (langs != undefined) {

        let query = `SELECT  distinct  ?label
        WHERE{
             {
                ?item rdfs:label "` + word + `" @` + lang + `;
                rdfs:label ?label.
                FILTER ( LANG ( ?label ) = '` + lang + `' )
            } `
        langs.forEach(element => {
            query = query + `
                UNION{
                    ?item rdfs:label "` + word + `" @` + lang + `;
                rdfs:label ?label.
                FILTER ( LANG ( ?label ) = '` + element + `' )
                }
                `
        });
        query = query + `}`
        return query

    } else if (synonyms == true) {
        return `select distinct   ?label
        where {
        ?word rdfs:label "Cat"@en;
        dbp:synonyms ?label.
        }  `
    } else if (images == true) {
        return `select distinct    ?image
        where {
            ?item rdfs:label "` + word + `" @` + lang + `;
            foaf:depiction ?image.
        }`
    } else {

        return ` 
        SELECT    ?label
        WHERE
             {
                ?item rdfs:label "` + word + `" @` + lang + `.
                OPTIONAL { ?item dbo:abstract ?label }
                FILTER ( LANG ( ?label ) = '` + lang + `' )
             }LIMIT 20
             `
    }


}


const description = async(word, lang, sensitive) => {
    const client = new SparqlClient({ endpointUrl })
    word = functions.formatWord(word);
    lang = functions.formatLang2low(lang);
    const query = qr(word, lang, sensitive);
    const stream = await client.query.select(query)
    return new Promise((resolve) => {
        stream.on('data', row => {
            Object.entries(row).forEach(([key, value]) => {
                let current = `${value.value}`;
                resolve(current)
            })
        })

        stream.on('error', err => {
            console.error(err)
        })
    })
}

const translations = async(word, lang, langs) => {
    const client = new ParsingClient({ endpointUrl })
    word = functions.formatWord(word);
    lang = functions.formatLang2low(lang);
    langs = langs.split(",")
    for (let i = 0; i < langs.length; i++) {
        langs[i] = functions.formatLang2low(langs[i])
    }

    let out = []
    let current = ""
    const query = qr(word, lang, undefined, langs);
    const bindings = await client.query.select(query)
    let i = 0;
    return new Promise((resolve) => {
        bindings.forEach(row =>
            Object.entries(row).forEach(([key, value]) => {
                current = (` ${value.value}`)

                out.push({ lang: langs[i], word: current })
                i++
            })
        )

        resolve(out)

    })

}

const synonyms = async(word, lang) => {
    const client = new SparqlClient({ endpointUrl })
    word = functions.formatWord(word);
    lang = functions.formatLang2low(lang);
    const query = qr(word, lang, undefined, undefined, true)

    const stream = await client.query.select(query)
    return new Promise((resolve) => {
        stream.on('data', row => {
            Object.entries(row).forEach(([key, value]) => {
                let current = `${value.value}`;
                resolve(current.split("\n"))
            })
        })

        stream.on('error', err => {
            console.error(err)
        })
    })

}

const images = async(word, lang) => {
    const client = new ParsingClient({ endpointUrl })
    word = functions.formatWord(word);
    lang = functions.formatLang2low(lang);

    const query = qr(word, lang, undefined, undefined, undefined, true)
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
module.exports = {
    description: description,
    translations: translations,
    synonyms: synonyms,
    images: images
}

/**
 * DBPedia si dimostra ottimo per trovare descrizioni dettagliate delle parole ricercate, cosa che gli altri dataset non forniscono,
 * la pecca è che funziona solo per l'inglese e anche in inglese non è detto che abbia una descrizione per ogni parola ricercata
 */