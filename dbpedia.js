const ParsingClient = require('sparql-http-client/ParsingClient')
const functions = require("./commonFeauters")
const endpointUrl = 'https://dbpedia.org/sparql'
const Tree=require("./Classes/hierarchyTree")
const qr = (word, lang,limit, sensitive, trad, synonyms, images,hierarchy) => {
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
       }LIMIT `+limit
    } else if (trad != undefined) {

        let query = `SELECT  distinct  ?label
        WHERE{
             
                ?item rdfs:label "` + word + `"@` + lang + `;
                rdfs:label ?label.
                FILTER(LANG(?label)="` + trad + `")
            }LIMIT `+limit
        return query

    } else if (synonyms == true) {
        return `select distinct   ?label
        where {
        ?word rdfs:label "` + word + `"@` + lang + `;
        dbp:synonyms ?label.
        }LIMIT `+limit
    } else if (images == true) {
        return `select distinct    ?image
        where {
            ?item rdfs:label "` + word + `" @` + lang + `;
            foaf:depiction ?image.
        }LIMIT `+limit
    } else if(hierarchy==true){

		return `select distinct ?child
		where{
			?item rdfs:label "` + word + `" @` + lang + `;
			rdfs:subClassOf ?subclass.
 			OPTIONAL{?subclass rdfs:label ?child}
			FILTER(LANG(?child)="`+lang+`")
		}LIMIT `+limit

	}else{

        return ` 
        SELECT    ?label
        WHERE
             {
                ?item rdfs:label "` + word + `" @` + lang + `.
                OPTIONAL { ?item dbo:abstract ?label }
                FILTER ( LANG ( ?label ) = '` + lang + `' )
             }LIMIT `+limit
    }


}

let hierarchyTree=""


const description = async(word, lang, sensitive,limit) => {
	const client2 =new ParsingClient({endpointUrl})
    word = functions.formatWord(word);
    lang = functions.formatLang2low(lang);
    const query = qr(word, lang,limit,sensitive);
	const bindings=await client2.query.select(query)
	return new Promise((resolve) => {
	if(bindings.length==0){
	resolve(bindings)
	}
	bindings.forEach(element => {
		resolve((element.label.value))
	});
    })
}

const translations = async(word, lang, langs,limit) => {
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
        const query = qr(word, lang,limit, undefined, trad);
        const bindings = await client.query.select(query)
        bindings.forEach(row =>
            Object.entries(row).forEach(([key, value]) => {
                current = (` ${value.value}`)

                out.push({ lang: trad, word: current })


            })
        )
if(out.length>=limit){
	return new Promise((resolve) => {

		resolve(out)

	})
}
    }

    return new Promise((resolve) => {

        resolve(out)

    })

}

const synonyms = async(word, lang,limit) => {
    const client = new ParsingClient({ endpointUrl })
    word = functions.formatWord(word);
    lang = functions.formatLang2low(lang);
    const query = qr(word, lang,limit, undefined, undefined, true)
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

const images = async(word, lang,limit) => {
    const client = new ParsingClient({ endpointUrl })
    word = functions.formatWord(word);
    lang = functions.formatLang2low(lang);

    const query = qr(word, lang,limit, undefined, undefined, undefined, true)
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

const hierarchy=(word,lang,limit,father)=>{
console.log("word",word)
	return new Promise(async(resolve) => {
let node=new Tree(word)
if(father==undefined){
	hierarchyTree =node
}else{
father.descendants.push(node)
}

	const client = new ParsingClient({ endpointUrl })
	word = word.toLowerCase()
	lang = functions.formatLang2low(lang);

	const query = qr(word, lang, limit, undefined, undefined, undefined,undefined, true)

	const bindings = await client.query.select(query)

let k=0	
		console.log("bindings", bindings.length)
		bindings.forEach(row =>{
			k++
			Object.entries(row).forEach(async([key, value]) => {

				console.log("k",k)
				
				current = (`${value.value}`)
if(k==bindings.length){
	resolve(hierarchy(current, lang, limit, node))
}else{
	await hierarchy(current, lang, limit, node)
}
				
			})
		})

if(bindings.length<=0){
resolve(true)
}
		

	})
}

const treeView=(tree,level)=>{
console.log("LEVEL ",level)
console.log("node ",tree.value)
tree.descendants.forEach(element => {
	treeView(element,level+1)
});
}

const getHierarchy=(word,lang,limit)=>{

return new Promise((resolve)=>{
	hierarchy(word, lang, limit, undefined).then((result) => {
		resolve(hierarchyTree)
})
})
}


module.exports = {
    description: description,
    translations: translations,
    synonyms: synonyms,
    images: images,
	hierarchy:getHierarchy
}

/**
 * DBPedia si dimostra ottimo per trovare descrizioni dettagliate delle parole ricercate, cosa che gli altri dataset non forniscono,
 * la pecca è che funziona solo per l'inglese e anche in inglese non è detto che abbia una descrizione per ogni parola ricercata
 */