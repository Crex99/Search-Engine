const Response = require("./Classes/Response")

const conceptMethods = require("./conceptnetAPI");
const dbNaryMethods = require("./dbNary");
const babelMethods = require("./babelnetAPI");
const wikiMethods = require("./wikidata");
const dbPediaMethods = require("./dbpedia");
const { performance } = require('perf_hooks');

const DEFAULT_LIMIT = 10


const precise=(number)=>{

number=Number(number)
if (number > 9999) {
            number = number.toPrecision(5)
        } else if(number>999){
            number = number.toPrecision(4)
        }else{
number=number.toPrecision(3)}

return number
}

const all = async(req, res) => {
console.log(req)
    /*const out = new response();

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

    /*const senses = await babelMethods.senses(res, word, lang, sensitive, limit, pos, relation, synonyms);
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

    res.send(out);*/

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

		const wikiStartTime=performance.now()	
        imgs = await wikiMethods.searchImgs(res, req.body.word, req.body.lang, sensitive, limit);

		const wikiEndTime=performance.now()
		const wikiTime=new Number(wikiEndTime-wikiStartTime)
        response.addData({ source: "WIKIDATA", inf: imgs ,time:precise(wikiTime)})

		const babelStartTime=performance.now() 
        imgs = await babelMethods.senses({...req.body })
		const babelEndTime=performance.now() 
		const babelTime=new Number(babelEndTime-babelStartTime)
        response.addData({ source: "BABELNET", inf: imgs ,time:precise(babelTime)})

		const dbpStartTime=performance.now()
        imgs = await dbPediaMethods.images(req.body.word, req.body.lang,req.body.limit);
		const dbpEndTime=performance.now()
		const dbpTime=new Number(dbpEndTime-dbpStartTime)
        response.addData({ source: "DBPEDIA", inf: imgs ,time:precise(dbpTime)})

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
		const wikiStartTime=performance.now()
        trads = await wikiMethods.translations(res, req.body.word, req.body.lang, req.body.langs, sensitive, limit)
		const wikiEndTime=performance.now()
		const wikiTime=new Number(wikiEndTime-wikiStartTime)
        response.addData({ source: "WIKIDATA", inf: trads ,time:precise(wikiTime)})

		const dbpStartTime=performance.now()
        trads = await dbPediaMethods.translations(req.body.word, req.body.lang, req.body.langs,req.body.limit)
		const dbpEndTime=performance.now()
		const dbpTime=new Number(dbpEndTime-dbpStartTime)

        response.addData({ source: "DBPEDIA", inf: trads ,time:precise(dbpTime)})

		const babelStartTime=performance.now()
        trads = await babelMethods.senses({...req.body })
		const babelEndTime=performance.now()
		const babelTime=new Number(babelEndTime-babelStartTime)
        response.addData({ source: "BABELNET", inf: trads,time:precise(babelTime) })
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
    req.body.synonyms = undefined;
	req.body.hierarchy=undefined;

    if (req.body.word == undefined || req.body.lang == undefined) {
        res.send(new Response(false, "paramethers not valids"))
    } else {

        let response = new Response(true, "discovered senses");

        let senses = ""

        const babelStartTime=performance.now() 
        senses = await babelMethods.senses({...req.body });
		const babelEndTime=performance.now()
		const babelTime=new Number(babelEndTime-babelStartTime)
        response.addData({ source: "BABELNET", inf: senses,time:precise(babelTime) })


		const wikiStartTime=performance.now()
        senses = await wikiMethods.searchByName(req.body.word, req.body.lang, req.body.sensitive, req.body.limit)
		const wikiEndTime=performance.now()
		const wikiTime=new Number(wikiEndTime-wikiStartTime)
        response.addData({ source: "WIKIDATA", inf: senses,time:precise(wikiTime)})

		const dbpStartTime=performance.now()
        senses = await dbPediaMethods.description(req.body.word, req.body.lang, req.body.sensitive,req.body.limit)
        const dbpEndTime=performance.now()
		const dbpTime=new Number(dbpEndTime-dbpStartTime)
        response.addData({ source: "DBPEDIA", inf: senses,time:precise(dbpTime) })

		const dbnStartTime=performance.now()
        senses = await dbNaryMethods.senses(req.body.word, req.body.lang, req.body.limit)
		const dbnEndTime=performance.now() 
		const dbnTime=new Number(dbnEndTime-dbnStartTime)
        response.addData({ source: "DBNARY", inf: senses ,time:precise(dbnTime)})
        res.send(response)

    }

}

const relations = async(req, res) => {
    
    if (req.body.sensitive != undefined) {
        sensitive = req.body.sensitive
    }
    if (req.body.word == undefined || req.body.lang == undefined) {
        res.send(new Response(false, "paramethers not valids"))
    } else {

        let response = new Response(true, "discovered relations")
        let relations = ""
        //relations = await conceptMethods.assertions(res, req.body.word, req.body.lang, sensitive)
        //response.addData({ source: "CONCEPTNET", inf: relations })

        req.body.relations = true

        if (req.body.limit == undefined) {
            req.body.limit = DEFAULT_LIMIT
        }


		const babelStartTime=performance.now()
		relations = await babelMethods.senses({...req.body })
		const babelEndTime=performance.now()
		const babelTime=new Number(babelEndTime-babelStartTime)

        response.addData({ source: "BABELNET", inf: relations,time:precise(babelTime) })

		const dbnStartTime=performance.now()
        relations = await dbNaryMethods.relations(req.body.word, req.body.lang, req.body.limit)
		const dbnEndTime=performance.now()
		const dbnTime=new Number(dbnEndTime-dbnStartTime)
        response.addData({ source: "DBNARY", inf: relations,time:precise(dbnTime) })
		
		const wikiStartTime=performance.now()
		relations=await wikiMethods.searchRelations(req.body.word,req.body.lang,req.body.limit)
		const wikiEndTime=performance.now()
		const wikiTime=new Number(wikiEndTime-wikiStartTime)
	    response.addData(({source:"WIKIDATA",inf:relations,time:precise(wikiTime)}))
        res.send(response)
    }
}

const emoticons = async(req, res) => {

    if (req.body.word == undefined || req.body.lang == undefined) {
        res.send(new Response(false, "paramethers not valids"))
    } else {

        let emotes = ""
        //emotes = await conceptMethods.emoticons(req.body.word, req.body.lang)

        let response = new Response(true, "discovered emoticons");

        //response.addData({ source: "CONCEPTNET", inf: emotes })

        req.body.emote = true
        req.body.langs = undefined

        if (req.body.limit == undefined) {
            req.body.limit = DEFAULT_LIMIT
        }


		const babelStartTime=performance.now()
        emotes = await babelMethods.senses({...req.body })
		const babelEndTime=performance.now()
		const babelTime=new Number(babelEndTime-babelStartTime)
        response.addData({ source: "BABELNET", inf: emotes,time:precise(babelTime) })

		const wikiStartTime=performance.now()
        emotes = await wikiMethods.emotes(req.body.word, req.body.lang, req.body.limit, req.body.sensitive)
		const wikiEndTime=performance.now()
		const wikiTime=new Number(wikiEndTime-wikiStartTime)
        response.addData({ source: "WIKIDATA", inf: emotes,time:precise(wikiTime) })
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
        const babelStartTime=performance.now()
        syns = await babelMethods.senses({...req.body })
        const babelEndTime=performance.now()
        const babelTime=new Number(babelEndTime-babelStartTime) 
        response.addData({ source: "BABELNET", inf: syns ,time:precise(babelTime)})
		const wikiStartTime=performance.now()
        syns = await wikiMethods.searchSynonyms(req.body.word, req.body.lang, req.body.limit)
		const wikiEndTime=performance.now()
		const wikiTime=new Number(wikiEndTime-wikiStartTime)
        response.addData({ source: "WIKIDATA", inf: syns ,time:precise(wikiTime)})
		const dbpStartTime=performance.now()
        syns = await dbPediaMethods.synonyms(req.body.word, req.body.lang,req.body.limit)
		const dbpEndTime=performance.now()
		const dbpTime=new Number(dbpEndTime-dbpStartTime)
        response.addData({ source: "DBPEDIA", inf: syns ,time:precise(dbpTime)})
		const dbnStartTime=performance.now()
        syns = await dbNaryMethods.synonyms(req.body.word, req.body.lang, req.body.limit)
		const dbnEndTime=performance.now()
		const dbnTime=new Number(dbnEndTime-dbnStartTime)
        response.addData({ source: "DBNARY", inf: syns ,time:precise(dbnTime)})
        res.send(response)
    }
}

const hierarchy=async(req,res)=>{

	if (req.body.word == undefined || req.body.lang == undefined) {
		res.send(new Response(false, "paramethers not valids"))
	}

	if(req.body.limit==undefined){

	req.body.limit=DEFAULT_LIMIT
	}

	let response = new Response(true, "retrieved hierarchy")

	req.body.langs = undefined
	req.body.hierarchy=true

	let result=""

	let startTime=performance.now()
	result=await wikiMethods.searchSubClasses(req.body.word,req.body.lang,req.body.limit)
	let endTime=performance.now()
	let time=new Number(endTime-startTime)
	response.addData({ source: "WIKIDATA", inf: result ,time:precise(time)})

	startTime=performance.now()
	//result=await babelMethods.senses({...req.body})
	endTime=performance.now()
	time=new Number(endTime-startTime)
	//response.addData({ source: "BABELNET", inf: result, time: precise(time)})

	startTime = performance.now()
	result = await dbPediaMethods.hierarchy(req.body.word, req.body.lang, req.body.limit)
	endTime = performance.now()
	time = new Number(endTime - startTime)
	response.addData({ source: "DBPEDIA", inf: result, time: precise(time) })
	res.send(response)

}
module.exports = {
    all: all,
    senses: senses,
    trads: trads,
    imgs: imgs,
    relations: relations,
    emoticons: emoticons,
    synonyms: synonyms,
	hierarchy:hierarchy
}