const axios = require('axios');
const functions = require("./commonFeauters")
const { formatWord } = require('./commonFeauters');
const endpointUrl = 'https://babelnet.org/sparql/';
const KEY = "69b0ba73-de64-4cee-a700-c2005da7ed66";
const KEY2 = "f82361e3-a269-453f-a1ea-a294233c2e71";
const Sense = require("./Classes/Sense")

const SYNONYM = "POTENTIAL_NEAR_SYNONYM_OR_WORSE"

let synonyms = []

const addSynonim = (string) => {
    string = string.toLowerCase()
    if (synonyms.length == 0) {
        synonyms.push(string);
    }

    if (synonyms.includes(string) == false) {
        synonyms.push(string)
    }
}


//cerca la parola lemma , nella lingua lang e ritorna la lista dei synset ID che combaciano
const synsets = async(r, lemma, lang) => {

    lang = functions.formatLang2High(lang);
    const url = "https://babelnet.io/v6/getSynsetIds?lemma=" + lemma + "&searchLang=" + lang + "&key=" + KEY;
    try {
        const response = await axios.get(url);
        let out = response.data;
        console.log(out);
        //request0(out,0,lang)
        //r.status(201).send({message:""+string});
    } catch (error) {
        console.log(error);
    }
};



//cerca il synset con identificativo id e ritorna una frase che lo descrive se ci sono
const informations = async(word, id, b, syn) => {
    const url = "https://babelnet.io/v6/getSynset?id=" + id + "&targetLang=" + b + "&key=" + KEY;
    try {
        const response = await axios.get(url);
        return new Promise((resolve) => {
            let out = response.data;
            if (syn == true) {
                out.senses.forEach(element => {
                    if (element.properties.lemma.type == SYNONYM)
                        addSynonim(element.properties.lemma.lemma)
                });
            }
            let glosses = out.glosses;
            let sense = ""
            if (word != undefined) {
                sense = new Sense(word, synonyms);
            }
            glosses.forEach(element => {
                sense.addDescription(element.gloss)
            });

            resolve(sense);
        })
    } catch (error) {
        console.log(error);
    }
}


//ritorna i senses di una data parola in input(word) nella lingua lang e chiama la funzione characteristics
const senses = async(b, word, lang, sensitive, limit, pos, relation, synonyms) => {
    const array = []
    lang = functions.formatLang2High(lang);
    let url = "";
    if (pos == undefined) {
        url = "https://babelnet.io/v6/getSenses?lemma=" + word + "&searchLang=" + lang + "&key=" + KEY;
    } else {
        pos = pos.toUpperCase();
        url = "https://babelnet.io/v6/getSenses?lemma=" + word + "&searchLang=" + lang + "&pos=" + pos + "&key=" + KEY;
    }
    try {
        const response = await axios.get(url);
        let out = response.data;
        for (let i = 0; i < limit; i++) {
            if (functions.control(word, sensitive, out[i].properties.fullLemma) == true) {
                if (relation != undefined) {
                    const final = await characteristics(b, out[i].properties.fullLemma, out[i].properties.synsetID.id, relation, lang, limit, synonyms)

                    array.push(final)

                } else {
                    const final = await informations(out[i].properties.fullLemma, out[i].properties.synsetID.id, lang, synonyms);

                    array.push(final)
                }
            } else {
                i--;
            }
        }
        return array;

    } catch (error) {
        console.log(error);
    }
};

//prende gli edge di un dato synset 

const edges = async(b, id, limit) => {
    const url = "https://babelnet.io/v6/getOutgoingEdges?id=" + id + "&key=" + KEY;
    try {
        const response = await axios.get(url);
        let out = response.data;
        for (let i = 0; i < limit; i++) {
            console.log(out[i]);
        }

        //b.status(201).send({message:""+out});
        return out;
    } catch (error) {
        console.log(error);
    }
};


//prende HYPERNYM,  HYPONYM, MERONYM, HOLONYM o  OTHER  di un dato synset e chiama informations per ogni risultato

const characteristics = async(a, word, id, relation, lang, limit, synonyms) => {
    relation = relation.toUpperCase();
    const url = "https://babelnet.io/v6/getOutgoingEdges?id=" + id + "&key=" + KEY;
    try {
        let array = [];
        let arrayout = [];
        const response = await axios.get(url);
        return new Promise((resolve) => {
            let out = response.data;

            let i = 0;
            out.forEach(element => {

                if (i == limit) {
                    resolve(arrayout);
                }
                if (relation == element.pointer.relationGroup && element.language == lang) {
                    if (array.length == 0 || array.includes(element.target) == false) {

                        array.push(element.target)
                        i++;
                        informations(word, type, element.target, lang, synonyms).then((result) => {
                            result.addRelation(relation + " OF " + word)
                            arrayout.push(result)
                        })
                    }
                }
            });
            resolve(arrayout)
        })
    } catch (error) {
        console.log(error);
    }
};


module.exports = {
    synsets: synsets,
    informations: informations,
    senses: senses,
    edges: edges,
    characteristics: characteristics
};

/*
 *BabelNet potrebbe essere facilmente usato per trovare hypernym, hyponym , sinonimi e altro anche in più lingue.
 *Bisogna stare attenti a non eccedere il limite di richieste giornaliere
 */