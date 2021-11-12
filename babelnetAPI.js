const axios = require('axios');
const functions = require("./commonFeauters")
const { formatWord } = require('./commonFeauters');
const endpointUrl = 'https://babelnet.org/sparql/';
const KEY1 = "69b0ba73-de64-4cee-a700-c2005da7ed66";
const KEY2 = "f82361e3-a269-453f-a1ea-a294233c2e71";
const KEY = "e7849be2-f543-4c17-afef-24d9a5e9abbe"
const Sense = require("./Classes/Sense");
const Trad = require('./Classes/Trad');

const SYNONYM = "POTENTIAL_NEAR_SYNONYM_OR_WORSE"

let synonyms = []
let trads_array = []
let relations_array = []

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
    if (trads_array.length == 0) {
        trads_array.push(trad)
    } else if (trads_array.includes(trad) == false) {
        trads_array.push(trad)
    }
}

const addSynonim = (string) => {
    string = string.toLowerCase()
    if (synonyms.length == 0) {
        synonyms.push(string);
    }

    if (synonyms.includes(string) == false) {
        synonyms.push(string)
    }
}



const emotes = async(id, b) => {

    let array = []

    const url = "https://babelnet.io/v6/getSynset?id=" + id + "&targetLang=" + b + "&key=" + KEY;
    try {
        const response = await axios.get(url);
        return new Promise((resolve) => {
            let out = response.data;
            out.senses.forEach(element => {
                if (element.properties.lemma.type == SYNONYM) {
                    if (element.properties.lemma.lemma.length == 2) {
                        array.push(element.properties.lemma.lemma)
                    }
                }

            });
            resolve(array);
        })
    } catch (error) {
        console.log(error);
    }
};



//cerca il synset con identificativo id e ritorna una frase che lo descrive se ci sono
const informations = async(word, id, b, syn) => {
    console.log("ok")
    const url = "https://babelnet.io/v6/getSynset?id=" + id + "&targetLang=" + b + "&key=" + KEY;
    try {
        const response = await axios.get(url);
        return new Promise((resolve) => {
            let out = response.data;
            if (syn == true) {
                out.senses.forEach(element => {
                    if (element.properties.lemma.type == SYNONYM) {
                        addSynonim(element.properties.lemma.lemma)
                    }

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


//ritorna i senses di una data parola in input(word) 
const senses = async({ word, lang, sensitive, limit, pos, relations, synonyms, emote, imgs, langs }) => {
    const array = []
    lang = functions.formatLang2High(lang);
    let url = "";

    if (langs != undefined) {
        langs = langs.split(",")
        langs = langs.slice(0, 3);
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

        for (let i = 0; i < limit; i++) {

            if (functions.control(word, sensitive, out[i].properties.fullLemma) == true) {

                if (relations == true) {
                    const sense = new Sense(out[i].properties.fullLemma);

                    const final = await characteristics(out[i].properties.fullLemma, out[i].properties.synsetID.id, lang, limit)

                    sense.relations = final

                    array.push(sense)

                } else if (imgs == true) {

                    const sense = new Sense(out[i].properties.fullLemma);

                    const final = await searchImgs(out[i].properties.fullLemma, out[i].properties.synsetID.id, lang, limit)
                    console.log("final", final)
                    sense.images = final

                    array.push(sense)

                } else if (langs != undefined) {
                    let sense = new Sense(out[i].properties.fullLemma);
                    let final = await trads(out[i].properties.fullLemma, out[i].properties.synsetID.id, langs, limit)
                    sense.trads = final
                    console.log("sense", sense)
                    array.push(sense)
                    console.log("array", array)
                } else if (emote == true) {

                    const sense = new Sense(out[i].properties.fullLemma)

                    const final = await emotes(out[i].properties.synsetID.id, lang)
                    if (final.length > 0) {
                        sense.emotes = final
                        array.push(sense)
                    }

                } else {
                    console.log("ok")
                    const final = await informations(out[i].properties.fullLemma, out[i].properties.synsetID.id, lang, synonyms, emote);

                    array.push(final)
                }
            } else {
                i--;
            }
        }
        //console.log("arrayfinal", array)
        return array;

    } catch (error) {
        console.log(error);
    }
};

//prende le immagini dato un id 

const searchImgs = (sense, id, lang, limit) => {

    return new Promise((resolve) => {

        const url = "https://babelnet.io/v6/getSynset?id=" + id + "&key=" + KEY


        const response = axios.get(url).then((result) => {

            imgs = result.data.images
            let i = 0;
            let array = []
            console.log(sense)
            imgs.forEach(element => {
                if (i == limit) {
                    resolve(array);
                }
                const name = element.name
                const url = element.url
                array.push({ name, url })
                i++;
            });

            resolve(array);


        })

    })

};

const trads = async(word, id, langs, limit) => {
    trads_array.length = 0

    const url = "https://babelnet.io/v6/getSynset?id=" + id + "&targetLang=" + functions.formatLang2High(langs[0]) + "&targetLang=" + functions.formatLang2High(langs[1]) + "&targetLang=" + functions.formatLang2High(langs[2]) + "&key=" + KEY

    const response = await axios.get(url);
    const glosses = response.data.glosses
    console.log("limit", limit)
    for (let i = 0; i < glosses.length && i < limit; i++) {

        const element = glosses[i];
        let categories = response.data.tags
        let category = ""
        for (let y = 0; y < categories.length; y++) {
            if (categories[y].DATA != undefined) {
                if (categories[y].DATA.language == element.language) {
                    category = categories[y].DATA.category;
                    y = categories.length
                }
            }
        }



        const trad = new Trad(element.language, element.gloss, category)
        addTrad(trad)
    }

    console.log("length", trads_array.length)
    return trads_array
}





//prende le relazioni

const characteristics = async(word, id, lang, limit) => {
    relations_array.length = 0;
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
                        arrayPointers.push(element.pointer.relationGroup)
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

            supChar(array, arrayPointers, 0).then((result) => {
                console.log("result", result)
                resolve(result)
            })
        })
    } catch (error) {
        console.log(error);
    }
};

const supChar = async(ids, relatives, i) => {

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