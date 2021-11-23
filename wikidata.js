const axios = require('axios');
const functions = require("./commonFeauters")
const WBK = require('wikibase-sdk')
const md5 = require("md5")
const wdk = WBK({
    instance: 'https://www.wikidata.org',
    sparqlEndpoint: 'https://query.wikidata.org/sparql'
})
const endpointUrl = 'https://query.wikidata.org/sparql'

const Trad = require("./Classes/Trad")

const SUBCLASS = "P279"
const IMGS = "P18"
const SYMBOL = "P487"

//subClasses è una matrice dove in ogni riga contiene una sottoclasse con gli elementi che contiene la stessa
//l'elemento 0 di ogni riga è il nome della sottoclasse
let subClasses = [];

const addToSubClasses = (subClass, item) => {
    if (subClasses.length == 0) {
        subClasses.push([subClass, item]);
    } else {
        let verify = false;
        subClasses.forEach(element => {
            if (element[0] == subClass) {
                verify = true;
                element.push(item);
            }
        });
        if (verify == false) {
            subClasses.push([subClass, item]);
        }
    }
}

const searchPropertyName = (id, lang) => {
    return new Promise((resolve) => {
        datas = [id]
        langs = [lang]
        const url = wdk.getEntities({
            ids: datas,
            languages: langs, // returns all languages if not specified
            //props: [ 'info', 'claims' ], // returns all data if not specified
            format: 'json', // defaults to json
            redirections: false // defaults to true
        })

        axios.get(url).then((response) => {
            datas.forEach(d => {
                langs.forEach(l => {
                    //prende la label legata all'id cercato
                    let label = response.data.entities[id].labels[l].value;
                    //console.log("label",label)
                    resolve(label);
                });
            });
        })
    })
}
const searchSubClasses = (res, datas, langs, last) => {
    const quest = async(a, c, array, i, last) => {
        if (array != undefined) {
            if (i == array.length) {
                if (last == true) {
                    //console.log("MATRICE",subClasses)
                }
            } else {
                let subclass = await searchPropertyName(array[i].mainsnak.datavalue.value.id, c); //prende la label relativa alla sottoclasse 
                //aggiunge alla matrice delle sottoclassi , la label trovata (a) e le sue sottoclassi di appartenenza
                addToSubClasses(subclass, a)
                quest(a, c, array, i + 1, last);
                console.log("MATRICE", subClasses)
            }
        } else {
            if (last == true) {
                //console.log("MATRICE",subClasses)
            }
        }
    }

    //datas=["Q146"]
    //langs=["en"]
    const url = wdk.getEntities({
        ids: datas,
        languages: langs, // returns all languages if not specified
        //props: [ 'info', 'claims' ], // returns all data if not specified
        format: 'json', // defaults to json
        redirections: false // defaults to true
    })
    axios.get(url).then((response) => {
        datas.forEach(data => {
            langs.forEach(lang => {
                //prende la label legata all'id cercato
                console.log("IMMAGGINI", response.data.entities[data].claims[IMGS]);
                let name = (response.data.entities[data].labels[lang].value);
                //prende gli id delle sottoclassi dell'id cercato
                let array = response.data.entities[data].claims[SUBCLASS];
                quest(name, lang, array, 0, last)
            });
        });
    })
}

const searchById = (word, id, lang) => {

    return new Promise((resolve) => {

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
                let category = response.data.entities[element].descriptions[lang].value
                if (label.includes(word) == true) {
                    out.push({ label: label, category: category })
                }
            });
            resolve(out)


        })
    })
}


const searchByName = (word, lang, sensitive, limit) => {
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
                limit: max
            })
            let current = ""
            let out = [];
            let i = 0;
            axios.get(url0).then((response) => {
                search_items.forEach(entity => {
                    let trads = { word: search_labels[i], trads: [] }
                    array_langs.forEach(l => {

                        current = response.data.entities[entity].labels[l]
                        let description = response.data.entities[entity].descriptions[l]
                        if (current != undefined) {

                            if (description != undefined) {
                                const trad = new Trad(l, current.value, description.value);
                                trads.trads.push(trad);
                            } else {
                                const trad = new Trad(l, current.value);
                                trads.trads.push(trad);
                            }
                        }
                    });
                    out.push(trads)
                    i++;
                });
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

                    let label = response.data.entities[element].labels[lang].value
                    let emotes = response.data.entities[element].claims[SYMBOL]

                    let symbols = []
                    label = label.toLowerCase()

                    if (label.includes(word) && emotes != undefined) {

                        emotes.forEach(element => {
                            symbols.push(element.mainsnak.datavalue.value)

                        });
                        out.push({ word: label, emotes: symbols })
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
                            syns.push(element.value)
                        });
                        out.push({ label: search_items[i].label, description: search_items[i].description, synonyms: syns })
                    }
                }
                resolve(out)
            })
        })
    })

}

module.exports = {
    searchByName: searchByName,
    searchById: searchById,
    translations: translations,
    searchImgs: searchImgs,
    emotes: emotes,
    searchSynonyms: searchSynonyms
}