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
    let sensitive = true;
    let limit = DEFAULT_LIMIT

    if (req.body.sensitive != undefined) {
        sensitive = req.body.sensitive
    }
    if (req.body.limit != undefined) {
        limit = req.body.limit
    }

    if (req.nody.word != undefined && req.body.lang != undefined) {
        let imgs = await wikiMethods.searchImgs(res, req.body.word, req.body.lang, sensitive, limit);

        let response = new Response(true, "discovered images", { source: "WIKIDATA", inf: imgs })

        imgs = await babelMethods.senses(res, req.body.word, req.body.lang, sensitive, limit, req.body.pos, req.body.relation, req.body.synonyms, req.body.emote, true)

        response.addData({ source: "BABELNET", inf: imgs })

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
        let trads = await wikiMethods.translations(res, req.body.word, req.body.lang, req.body.langs, sensitive, limit)

        let response = new Response(true, "discovered translations", { source: "WIKIDATA", inf: trads })

        trads = await conceptMethods.trads(req.body.word, req.body.lang, req.body.langs, limit)

        response.addData({ source: "CONCEPTNET", inf: trads })

        trads = await babelMethods.senses({...req.body })

        response.addData({ source: "BABELNET", inf: trads })
        res.send(response)
    } else {
        res.send(new Response(false, "paramethers not valids"))
    }

}

const senses = async(req, res) => {

    if (req.body.sensitive == undefined) {
        req.body.sensitive = true
    }

    if (req.body.limit == undefined) {
        req.body.limit = DEFAULT_LIMIT
    }

    req.body.langs = undefined;
    req.body.emote = undefined;
    req.body.imgs = false;
    req.body.pos = undefined;

    if (req.body.word == undefined || req.body.lang == undefined) {
        res.send(new Response(false, "paramethers not valids"))
    } else {
        const senses = await babelMethods.senses({...req.body });
        res.send(new Response(true, "discovered senses", { source: "BABELNET", inf: senses }))
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
        let relations = await conceptMethods.assertions(res, req.body.word, req.body.lang, sensitive)
        let response = new Response(true, "discovered relations", { source: "CONCEPTNET", inf: relations })

        req.body.relations = true

        if (req.body.limit == undefined) {
            req.body.limit = DEFAULT_LIMIT
        }

        relations = await babelMethods.senses({...req.body })

        response.addData({ source: "BABELNET", inf: relations })
        res.send(response)
    }
}

const emoticons = async(req, res) => {

    if (req.body.word == undefined || req.body.lang == undefined) {
        res.send(new Response(false, "paramethers not valids"))
    } else {
        let emotes = await conceptMethods.emoticons(req.body.word, req.body.lang)

        let response = new Response(true, "discovered emoticons", { source: "CONCEPTNET", inf: emotes })

        req.body.emote = true
        req.body.synonyms = true

        if (req.body.limit == undefined) {
            req.body.limit = DEFAULT_LIMIT
        }

        console.log(req.body)

        emotes = await babelMethods.senses({...req.body })
        console.log(emotes)

        response.addData({ source: "BABELNET", inf: emotes })
        res.send(response)
    }

}

module.exports = {
    all: all,
    senses: senses,
    trads: trads,
    imgs: imgs,
    relations: relations,
    emoticons: emoticons
}