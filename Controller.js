const Response = require("./Classes/Response")

const conceptMethods = require("./conceptnetAPI");
const dbNaryMethods = require("./dbNary");
const babelMethods = require("./babelnetAPI");
const wikiMethods = require("./wikidata");
const dbPediaMethods = require("./dbpedia");

const DEFAULT_LIMIT = 10

const all = async(req, res) => {
    const out = new response();

    let sensitive = false;
    let imgs = false;
    const relation = req.query.relation;
    const limit = Number(req.query.limit);
    const pos = req.query.pos;
    const word = req.query.word;
    const lang = req.query.lang;
    const langs = req.query.trad;
    const synonyms = Boolean(req.query.synonyms);
    sensitive = Boolean(req.query.sensitive);
    imgs = Boolean(req.query.imgs);
    /**
     * sensitive is a parameter that specify if we want a case sensitive research or not
     * imgs is a parameter that specify if we want also images 
     * pos and relation are parameters only for babelnet, pos indicates if we want a verb, a noun , a pronoun
     * relation indicates if we want a HYPERNYM, HYPONYM , SYNOYM ot other
     * langs indicates the langs that user wants to obtain a translation
     */

    const senses = await babelMethods.senses(res, word, lang, sensitive, limit, pos, relation, synonyms);
    out.addSenses(senses)

    out.addRelations(await conceptMethods.assertions(res, word, lang, sensitive))
        //dbNaryMethods.example(res,word,lang,sensitive);
        //dbPediaMethods.query(res,word,lang,sensitive);
        //wikiMethods.searchByName(res,word,lang,sensitive,imgs);
    if (langs != undefined && langs.length > 0) {
        const trads = await wikiMethods.translations(res, word, lang, langs, sensitive, limit)
        out.addTrads(trads)

    }
    if (imgs != undefined && imgs == true) {
        const imgs = await wikiMethods.searchImgs(res, word, lang, sensitive, limit);
        out.addImgs(imgs)

    }

    res.send(out);

}

const imgs = async(req, res) => {

    req.body.imgs = true;
    let sensitive = true;
    let limit = DEFAULT_LIMIT

    if (req.body.sensitive != undefined) {
        sensitive = req.body.sensitive
    }
    if (req.body.limit != undefined) {
        limit = req.body.limit
    } else {
        req.body.limit = limit
    }

    if (req.body.word != undefined && req.body.lang != undefined) {

        let response = new Response(true, "discovered images")
        let imgs = ""
        imgs = await wikiMethods.searchImgs(res, req.body.word, req.body.lang, sensitive, limit);

        response.addData({ source: "WIKIDATA", inf: imgs })

        imgs = await babelMethods.senses({...req.body })

        response.addData({ source: "BABELNET", inf: imgs })

        imgs = await dbPediaMethods.images(req.body.word, req.body.lang);

        response.addData({ source: "DBPEDIA", inf: imgs })

        res.send(response)
    } else {
        res.send(new Response(false, "paramethers not valids"))
    }
}

const trads = async(req, res) => {

    let sensitive = true;
    let limit = DEFAULT_LIMIT

    if (req.body.sensitive != undefined) {
        sensitive = req.body.sensitive
    } else {
        req.body.sensitive = sensitive
    }
    if (req.body.limit != undefined) {

        limit = req.body.limit
    } else {
        req.body.limit = limit
    }

    if (req.body.langs != undefined && req.body.lang != undefined && req.body.word != undefined) {

        let response = new Response(true, "discovered translations")

        let trads = ""
            //trads = await wikiMethods.translations(res, req.body.word, req.body.lang, req.body.langs, sensitive, limit)

        //response.addData({ source: "WIKIDATA", inf: trads })

        //trads = await dbPediaMethods.translations(req.body.word, req.body.lang, req.body.langs)

        //response.addData({ source: "DBPEDIA", inf: trads })

        trads = await babelMethods.senses({...req.body })
        response.addData({ source: "BABELNET", inf: trads })
        res.send(response)
    } else {
        res.send(new Response(false, "paramethers not valids"))
    }

}

const senses = async(req, res) => {

    /*if (req.body.sensitive == undefined) {
        req.body.sensitive = true
    }*/

    if (req.body.limit == undefined) {
        req.body.limit = DEFAULT_LIMIT
    }

    req.body.langs = undefined;
    req.body.emote = undefined;
    req.body.imgs = false;
    req.body.pos = undefined;
    req.body.synonyms = undefined

    if (req.body.word == undefined || req.body.lang == undefined) {
        res.send(new Response(false, "paramethers not valids"))
    } else {

        let response = new Response(true, "discovered senses");

        let senses = ""
        senses = await babelMethods.senses({...req.body });
        response.addData({ source: "BABELNET", inf: senses })

        senses = await wikiMethods.searchByName(req.body.word, req.body.lang, req.body.sensitive, req.body.limit)

        response.addData({ source: "WIKIDATA", inf: senses })

        senses = await dbPediaMethods.description(req.body.word, req.body.lang, req.body.sensitive)
        response.addData({ source: "DBPEDIA", inf: senses })

        senses = await dbNaryMethods.senses(req.body.word, req.body.lang, req.body.limit)
        response.addData({ source: "DBNARY", inf: senses })
        res.send(response)

    }

}

const relations = async(req, res) => {
    let sensitive = true;
    if (req.body.sensitive != undefined) {
        sensitive = req.body.sensitive
    }
    if (req.body.word == undefined || req.body.lang == undefined) {
        res.send(new Response(false, "paramethers not valids"))
    } else {

        let response = new Response(true, "discovered relations")
        let relations = ""
        relations = await conceptMethods.assertions(res, req.body.word, req.body.lang, sensitive)
        response.addData({ source: "CONCEPTNET", inf: relations })

        req.body.relations = true

        if (req.body.limit == undefined) {
            req.body.limit = DEFAULT_LIMIT
        }

        relations = await babelMethods.senses({...req.body })

        response.addData({ source: "BABELNET", inf: relations })

        relations = await dbNaryMethods.relations(req.body.word, req.body.lang, req.body.limit)
        response.addData({ source: "DBNARY", inf: relations })
        res.send(response)
    }
}

const emoticons = async(req, res) => {

    if (req.body.word == undefined || req.body.lang == undefined) {
        res.send(new Response(false, "paramethers not valids"))
    } else {

        let emotes = ""
        emotes = await conceptMethods.emoticons(req.body.word, req.body.lang)

        let response = new Response(true, "discovered emoticons");

        response.addData({ source: "CONCEPTNET", inf: emotes })

        req.body.emote = true
        req.body.langs = undefined

        if (req.body.limit == undefined) {
            req.body.limit = DEFAULT_LIMIT
        }

        emotes = await babelMethods.senses({...req.body })

        response.addData({ source: "BABELNET", inf: emotes })

        emotes = await wikiMethods.emotes(req.body.word, req.body.lang, req.body.limit, req.body.sensitive)

        response.addData({ source: "WIKIDATA", inf: emotes })
        res.send(response)
    }

}

const synonyms = async(req, res) => {
    if (req.body.word == undefined || req.body.lang == undefined) {
        res.send(new Response(false, "paramethers not valids"))
    } else {
        req.body.synonyms = true
        if (req.body.limit == undefined) {
            req.body.limit = DEFAULT_LIMIT
        }

        req.body.langs = undefined

        let syns = "";
        let response = new Response(true, "retrieved synonyms")

        syns = await babelMethods.senses({...req.body })

        response.addData({ source: "BABELNET", inf: syns })

        syns = await wikiMethods.searchSynonyms(req.body.word, req.body.lang, req.body.limit)

        response.addData({ source: "WIKIDATA", inf: syns })

        syns = await dbPediaMethods.synonyms(req.body.word, req.body.lang)

        response.addData({ source: "DBPEDIA", inf: syns })

        syns = await dbNaryMethods.synonyms(req.body.word, req.body.lang, req.body.limit)

        response.addData({ source: "DBNARY", inf: syns })
        res.send(response)
    }
}

module.exports = {
    all: all,
    senses: senses,
    trads: trads,
    imgs: imgs,
    relations: relations,
    emoticons: emoticons,
    synonyms: synonyms
}