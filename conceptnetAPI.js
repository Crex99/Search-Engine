const axios = require('axios');
const { formatLang2low } = require('./commonFeauters');
const functions = require("./commonFeauters")

const SYMBOL = "SymbolOf"


let matrix = [];



const addRow = (row) => {
    if (matrix.length == 0) {
        matrix.push([row]);
    }

    let verify = false

    matrix.forEach(element => {
        if (element[0] == row) {
            verify = true
        }

    });
    if (verify == false) {
        matrix.push([row]);
    }

}

addElement = (row, el) => {
    matrix.forEach(element => {

        if (element[0] == row) {
            element.push(el)
        }

    });
}


//prende tutti gli edge di una data parola word in input nella lingua lang
const edges = async(r) => {

    const word = "gatto";
    const lang = "it";
    const url_conceptnet = "http://api.conceptnet.io/c/" + lang + "/" + word;
    try {
        const response = await axios.get(url_conceptnet);
        let out = response.data.edges;
        out.forEach(element => {
            console.log("relation", element.rel.label)
            console.log("label", element.start.label)
            console.log("start lang", element.start.language)
            console.log("end lang", element.end.language)
                //console.log(element.surfaceText)
        });
    } catch (error) {
        console.log(error);
    }
};

//prende tutte le asserzioni della parola word nella lingua lang
const assertions = async(r, word, lang, sensitive) => {
    let w = functions.formatWordConcept(word);
    lang = functions.formatLang2low(lang);
    const url_conceptnet = "https://api.conceptnet.io/query?node=/c/" + lang + "/" + w + "&other=/c/" + lang;
    try {
        const response = await axios.get(url_conceptnet);
        let out = response.data.edges;
        let string = "";
        out.forEach(element => {
            if (functions.control(word, sensitive, element.start.label) == true) {
                addRow(element.rel.label)
                addElement(element.rel.label, element.end.label)

                //arrayout[arrayout.indexOf(element.rel.label)].push(element.end.label)
            }

        });
        return matrix

    } catch (error) {

        console.log(error);
    }
};

//prende tutte le relazioni che collegano word1 con word2 nella lingua lang

const request1 = async(r) => {

    const word1 = "frog";
    const word2 = "animal";
    const lang = "en";
    const url_conceptnet = "https://api.conceptnet.io//query?node=/c/" + lang + "/" + word1 + "&other=/c/" + lang + "/" + word2;
    try {
        const response = await axios.get(url_conceptnet);
        let out = response.data.edges;
        out.forEach(element => {
            console.log(element)
            console.log("\nCONCEPTNET\n")
            console.log(element.rel.label)
            console.log(element.start.label)
        });
        //r.status(201).send({message:""+out});
    } catch (error) {
        console.log(error);
    }
};

const emoticons = async(word, lang) => {
    word = word.toLowerCase()
    lang = formatLang2low(lang)
    const url_conceptnet = "http://api.conceptnet.io/c/" + lang + "/" + word;
    try {
        const response = await axios.get(url_conceptnet);
        let out = response.data.edges;
        let array = []
        out.forEach(element => {

            if (element.rel.label == SYMBOL) {
                array.push(element.start.label)
            }

        });

        return array
    } catch (error) {
        console.log(error);
    }
}

const trads = async(word, lang, langs, limit) => {
    word = word.toLowerCase()
    lang = formatLang2low(lang)
    const url_conceptnet = "http://api.conceptnet.io/c/" + lang + "/" + word;

    try {
        const response = await axios.get(url_conceptnet)
        let out = response.data;
        const edges = out.edges
        let array = []
        let i = 0;
        edges.forEach(element => {
            if (i == limit) {
                return array
            }
            if (langs.includes(element.end.language) == true) {
                i++;
                const lang = (element.end.language)
                const label = (element.end.label)
                const sense = (element.end.sense_label)
                array.push({ lang, label, sense })
            }

        });

        return array
    } catch (error) {
        console.log(error);
    }

}

module.exports = {
    edges: edges,
    assertions: assertions,
    relations: request1,
    emoticons: emoticons,
    trads: trads
};