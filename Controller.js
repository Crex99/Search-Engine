const Response = require("./Classes/Response")

const conceptMethods = require("./conceptnetAPI");
const dbNaryMethods = require("./dbNary");
const babelMethods = require("./babelnetAPI");
const wikiMethods = require("./wikidata");
const dbPediaMethods = require("./dbpedia");
const { performance } = require('perf_hooks');

const DEFAULT_LIMIT = 10


const precise = (number) => {

	number = Number(number)
	if (number > 9999) {
		number = number.toPrecision(5)
	} else if (number > 999) {
		number = number.toPrecision(4)
	} else {
		number = number.toPrecision(3)
	}

	return number
}

const all = async (req, res) => {
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

const imgs = async (req, res) => {

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


		if (req.body.WIKIDATA === undefined || req.body.WIKIDATA) {
			const wikiStartTime = performance.now()
			imgs = await wikiMethods.searchImgs(res, req.body.word, req.body.lang, sensitive, limit);
			const wikiEndTime = performance.now()
			const wikiTime = new Number(wikiEndTime - wikiStartTime)
			response.addData({ source: "WIKIDATA", inf: imgs, time: precise(wikiTime) })
		}

		const babelStartTime = performance.now()

		if (req.body.BABELNET === undefined || req.body.BABELNET) {
			imgs = await babelMethods.senses({ ...req.body })
			const babelEndTime = performance.now()
			const babelTime = new Number(babelEndTime - babelStartTime)
			response.addData({ source: "BABELNET", inf: imgs, time: precise(babelTime) })
		}

		if (req.body.DBPEDIA === undefined || req.body.DBPEDIA) {
			const dbpStartTime = performance.now()
			imgs = await dbPediaMethods.images(req.body.word, req.body.lang, req.body.limit);
			const dbpEndTime = performance.now()
			const dbpTime = new Number(dbpEndTime - dbpStartTime)
			response.addData({ source: "DBPEDIA", inf: imgs, time: precise(dbpTime) })
		}

		res.send(response)
	} else {
		res.send(new Response(false, "paramethers not valids"))
	}
}

const trads = async (req, res) => {

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
		if (req.body.WIKIDATA === undefined || req.body.WIKIDATA) {
			const wikiStartTime = performance.now()
			trads = await wikiMethods.translations(res, req.body.word, req.body.lang, req.body.langs, sensitive, limit)
			const wikiEndTime = performance.now()
			const wikiTime = new Number(wikiEndTime - wikiStartTime)
			response.addData({ source: "WIKIDATA", inf: trads, time: precise(wikiTime) })
		}

		if (req.body.DBPEDIA === undefined || req.body.DBPEDIA) {
			const dbpStartTime = performance.now()
			trads = await dbPediaMethods.translations(req.body.word, req.body.lang, req.body.langs, req.body.limit)
			const dbpEndTime = performance.now()
			const dbpTime = new Number(dbpEndTime - dbpStartTime)
			response.addData({ source: "DBPEDIA", inf: trads, time: precise(dbpTime) })
		}

		if (req.body.BABELNET === undefined || req.body.BABELNET) {
			const babelStartTime = performance.now()
			trads = await babelMethods.senses({ ...req.body })
			const babelEndTime = performance.now()
			const babelTime = new Number(babelEndTime - babelStartTime)
			response.addData({ source: "BABELNET", inf: trads, time: precise(babelTime) })
		}

		if (req.body.CONCEPTNET === undefined || req.body.CONCEPTNET) {
			let startTime = performance.now()
			trads = await conceptMethods.edges(req.body.word, req.body.lang, "trads", req.body.limit, req.body.langs)
			let endTime = performance.now()
			let time = new Number(endTime - startTime)
			response.addData({ source: "CONCEPTNET", inf: trads, time: precise(time) })
		}

		res.send(response)
	} else {
		res.send(new Response(false, "paramethers not valids"))
	}

}

const senses = async (req, res) => {


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
	req.body.hierarchy = undefined;

	if (req.body.word == undefined || req.body.lang == undefined) {
		res.send(new Response(false, "paramethers not valids"))
	} else {

		let response = new Response(true, "discovered senses");

		let senses = ""

		let startTime = performance.now()
		let endTime = ""
		let time = ""

		if (req.body.BABELNET === undefined || req.body.BABELNET) {

			senses = await babelMethods.senses({ ...req.body });
			let endTime = performance.now()
			let time = new Number(endTime - startTime)
			response.addData({ source: "BABELNET", inf: senses, time: precise(time) })
		}


		if (req.body.CONCEPTNET === undefined || req.body.CONCEPTNET) {
			startTime = performance.now()
			senses = await conceptMethods.edges(req.body.word, req.body.lang, "IsA", req.body.limit)
			endTime = performance.now()
			time = new Number(endTime - startTime)
			response.addData({ source: "CONCEPTNET", inf: senses, time: precise(time) })
		}
		res.send(response)

	}

}

const relations = async (req, res) => {

	if (req.body.sensitive != undefined) {
		sensitive = req.body.sensitive
	}
	if (req.body.word == undefined || req.body.lang == undefined) {
		res.send(new Response(false, "paramethers not valids"))
	} else {

		let response = new Response(true, "discovered relations")
		let relations = ""
		req.body.relations = true

		if (req.body.limit == undefined) {
			req.body.limit = DEFAULT_LIMIT
		}

		let startTime = performance.now()

		if (req.body.CONCEPTNET === undefined || req.body.CONCEPTNET) {
			relations = await conceptMethods.edges(req.body.word, req.body.lang, undefined, req.body.limit)
			let endTime = performance.now()
			let time = new Number(endTime - startTime)
			response.addData({ source: "CONCEPTNET", inf: relations, time: precise(time) })
		}




		if (req.body.BABELNET === undefined || req.body.BABELNET) {
			const babelStartTime = performance.now()
			relations = await babelMethods.senses({ ...req.body })
			const babelEndTime = performance.now()
			const babelTime = new Number(babelEndTime - babelStartTime)
			response.addData({ source: "BABELNET", inf: relations, time: precise(babelTime) })
		}

		if (req.body.DBNARY === undefined || req.body.DBNARY) {
			const dbnStartTime = performance.now()
			relations = await dbNaryMethods.relations(req.body.word, req.body.lang, req.body.limit)
			const dbnEndTime = performance.now()
			const dbnTime = new Number(dbnEndTime - dbnStartTime)
			response.addData({ source: "DBNARY", inf: relations, time: precise(dbnTime) })
		}

		if (req.body.WIKIDATA === undefined || req.body.WIKIDATA) {
			const wikiStartTime = performance.now()
			relations = await wikiMethods.searchRelations(req.body.word, req.body.lang, req.body.limit)
			const wikiEndTime = performance.now()
			const wikiTime = new Number(wikiEndTime - wikiStartTime)
			response.addData(({ source: "WIKIDATA", inf: relations, time: precise(wikiTime) }))
		}

		if (req.body.DBPEDIA === undefined || req.body.DBPEDIA) {
			const dbStartTime = performance.now()
			relations = await dbPediaMethods.relations(req.body.word, req.body.lang, req.body.limit)
			const dbEndTime = performance.now()
			const dbTime = new Number(dbEndTime - dbStartTime)
			response.addData({ source: "DBPEDIA", inf: relations, time: precise(dbTime) })
		}

		res.send(response)
	}
}

const emoticons = async (req, res) => {

	if (req.body.word == undefined || req.body.lang == undefined) {
		res.send(new Response(false, "paramethers not valids"))
	} else {

		req.body.emote = true
		req.body.langs = undefined

		if (req.body.limit == undefined) {
			req.body.limit = DEFAULT_LIMIT
		}

		let emotes = ""
		let response = new Response(true, "discovered emoticons");
		let startTime = performance.now()

		if (req.body.CONCEPTNET === undefined || req.body.CONCEPTNET) {
			emotes = await conceptMethods.edges(req.body.word, req.body.lang, "SymbolOf", req.body.limit)
			let endTime = performance.now()
			let time = new Number(endTime - startTime)
			response.addData({ source: "CONCEPTNET", inf: emotes, time: precise(time) })
		}



		if (req.body.BABELNET === undefined || req.body.BABELNET) {
			const babelStartTime = performance.now()
			emotes = await babelMethods.senses({ ...req.body })
			const babelEndTime = performance.now()
			const babelTime = new Number(babelEndTime - babelStartTime)
			response.addData({ source: "BABELNET", inf: emotes, time: precise(babelTime) })
		}

		if (req.body.WIKIDATA === undefined || req.body.WIKIDATA) {
			const wikiStartTime = performance.now()
			emotes = await wikiMethods.emotes(req.body.word, req.body.lang, req.body.limit, req.body.sensitive)
			const wikiEndTime = performance.now()
			const wikiTime = new Number(wikiEndTime - wikiStartTime)
			response.addData({ source: "WIKIDATA", inf: emotes, time: precise(wikiTime) })
		}

		res.send(response)
	}

}

const synonyms = async (req, res) => {
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

		if (req.body.CONCEPTNET === undefined || req.body.CONCEPTNET) {
			let startTime = performance.now()
			syns = await conceptMethods.edges(req.body.word, req.body.lang, "Synonym", req.body.limit)
			let endTime = performance.now()
			let time = new Number(endTime - startTime)
			response.addData({ source: "CONCEPTNET", inf: syns, time: precise(time) })
		}

		const babelStartTime = performance.now()

		if (req.body.BABELNET === undefined || req.body.BABELNET) {
			syns = await babelMethods.senses({ ...req.body })
			const babelEndTime = performance.now()
			const babelTime = new Number(babelEndTime - babelStartTime)
			response.addData({ source: "BABELNET", inf: syns, time: precise(babelTime) })
		}

		if (req.body.WIKIDATA === undefined || req.body.WIKIDATA) {
			const wikiStartTime = performance.now()
			syns = await wikiMethods.searchSynonyms(req.body.word, req.body.lang, req.body.limit)
			const wikiEndTime = performance.now()
			const wikiTime = new Number(wikiEndTime - wikiStartTime)
			response.addData({ source: "WIKIDATA", inf: syns, time: precise(wikiTime) })
		}

		if (req.body.DBPEDIA === undefined || req.body.DBPEDIA) {
			const dbpStartTime = performance.now()
			syns = await dbPediaMethods.synonyms(req.body.word, req.body.lang, req.body.limit)
			const dbpEndTime = performance.now()
			const dbpTime = new Number(dbpEndTime - dbpStartTime)
			response.addData({ source: "DBPEDIA", inf: syns, time: precise(dbpTime) })
		}

		if (req.body.DBNARY === undefined || req.body.DBNARY) {
			const dbnStartTime = performance.now()
			syns = await dbNaryMethods.synonyms(req.body.word, req.body.lang, req.body.limit)
			const dbnEndTime = performance.now()
			const dbnTime = new Number(dbnEndTime - dbnStartTime)
			response.addData({ source: "DBNARY", inf: syns, time: precise(dbnTime) })
		}

		res.send(response)
	}
}

const hyponyms = async (req, res) => {
	if (req.body.word == undefined || req.body.lang == undefined) {
		res.send(new Response(false, "paramethers not valids"))
	}

	if (req.body.limit == undefined) {

		req.body.limit = DEFAULT_LIMIT
	}

	let response = new Response(true, "retrieved hyponyms")
	let result = ""
	req.body.langs = undefined
	req.body.hyponyms = true
	let startTime = performance.now()
	let endTime = ""
	let time = ""

	if (req.body.BABELNET === undefined || req.body.BABELNET) {
		result = await babelMethods.senses({ ...req.body })
		endTime = performance.now()
		time = new Number(endTime - startTime)
		response.addData({ source: "BABELNET", inf: result, time: precise(time) })
	}


	if (req.body.DBNARY === undefined || req.body.DBNARY) {
		startTime = performance.now()
		result = await dbNaryMethods.relationValue(req.body.word, req.body.lang, req.body.limit, "hyponym")
		endTime = performance.now()
		time = new Number(endTime - startTime)
		response.addData({ source: "DBNARY", inf: result, time: precise(time) })
	}

	res.send(response)
}
const hypernyms = async (req, res) => {
	if (req.body.word == undefined || req.body.lang == undefined) {
		res.send(new Response(false, "paramethers not valids"))
	}

	if (req.body.limit == undefined) {

		req.body.limit = DEFAULT_LIMIT
	}

	req.body.hypernyms = true

	let response = new Response(true, "retrieved hypernyms")

	req.body.langs = undefined
	let result = ""
	let startTime = ""
	let endTime = ""
	let time = ""

	if (req.body.DBPEDIA === undefined || req.body.DBPEDIA) {
		startTime = performance.now()
		result = await dbPediaMethods.hypernyms(req.body.word, req.body.lang, req.body.limit)
		endTime = performance.now()
		time = new Number(endTime - startTime)
		response.addData({ source: "DBPEDIA", inf: result, time: precise(time) })
	}

	if (req.body.WIKIDATA === undefined || req.body.WIKIDATA) {
		startTime = performance.now()
		result = await wikiMethods.searchSubClasses(req.body.word, req.body.lang, req.body.limit)
		endTime = performance.now()
		time = new Number(endTime - startTime)
		response.addData({ source: "WIKIDATA", inf: result, time: precise(time) })
	}


	if (req.body.BABELNET === undefined || req.body.BABELNET) {
		startTime = performance.now()
		result = await babelMethods.senses({ ...req.body })
		endTime = performance.now()
		time = new Number(endTime - startTime)
		response.addData({ source: "BABELNET", inf: result, time: precise(time) })
		startTime = performance.now()
	}

	if (req.body.DBNARY === undefined || req.body.DBNARY) {
		result = await dbNaryMethods.relationValue(req.body.word, req.body.lang, req.body.limit, "hypernym")
		endTime = performance.now()
		time = new Number(endTime - startTime)
		response.addData({ source: "DBNARY", inf: result, time: precise(time) })
	}

	res.send(response)
}

const meronyms = async (req, res) => {
	if (req.body.word == undefined || req.body.lang == undefined) {
		res.send(new Response(false, "paramethers not valids"))
	}

	if (req.body.limit == undefined) {

		req.body.limit = DEFAULT_LIMIT
	}

	let response = new Response(true, "retrieved hierarchy")

	req.body.langs = undefined
	req.body.meronyms = true
	let result = ""
	let startTime = performance.now()
	let endTime = ""
	let time = ""

	if (req.body.BABELNET === undefined || req.body.BABELNET) {
		result = await babelMethods.senses({ ...req.body })
		endTime = performance.now()
		time = new Number(endTime - startTime)
		response.addData({ source: "BABELNET", inf: result, time: precise(time) })
	}


	if (req.body.DBNARY === undefined || req.body.DBNARY) {
		startTime = performance.now()
		result = await dbNaryMethods.relationValue(req.body.word, req.body.lang, req.body.limit, "meronym")
		endTime = performance.now()
		time = new Number(endTime - startTime)
		response.addData({ source: "DBNARY", inf: result, time: precise(time) })
	}


	if (req.body.CONCEPTNET === undefined || req.body.CONCEPTNET) {
		startTime = performance.now()
		result = await conceptMethods.edges(req.body.word, req.body.lang, "PartOf", req.body.limit)
		endTime = performance.now()
		time = new Number(endTime - startTime)
		response.addData({ source: "CONCEPTNET", inf: result, time: precise(time) })
	}

	res.send(response)
}
const holonyms = async (req, res) => {
	if (req.body.word == undefined || req.body.lang == undefined) {
		res.send(new Response(false, "paramethers not valids"))
	}

	if (req.body.limit == undefined) {

		req.body.limit = DEFAULT_LIMIT
	}

	let response = new Response(true, "retrieved hierarchy")

	req.body.langs = undefined
	req.body.holonyms = true
	let result = ""
	let startTime = performance.now()
	let endTime = ""
	let time = ""

	if (req.body.BABELNET === undefined || req.body.BABELNET) {
		result = await babelMethods.senses({ ...req.body })
		endTime = performance.now()
		time = new Number(endTime - startTime)
		response.addData({ source: "BABELNET", inf: result, time: precise(time) })
	}


	if (req.body.DBNARY === undefined || req.body.DBNARY) {
		startTime = performance.now()
		result = await dbNaryMethods.relationValue(req.body.word, req.body.lang, req.body.limit, "holonym")
		endTime = performance.now()
		time = new Number(endTime - startTime)
		response.addData({ source: "DBNARY", inf: result, time: precise(time) })
	}

	if (req.body.CONCEPTNET === undefined || req.body.CONCEPTNET) {
		startTime = performance.now()
		result = await conceptMethods.edges(req.body.word, req.body.lang, "HasA", req.body.limit)
		endTime = performance.now()
		time = new Number(endTime - startTime)
		response.addData({ source: "CONCEPTNET", inf: result, time: precise(time) })
	}

	res.send(response)
}

const descriptions = async (req, res) => {

	if (req.body.word == undefined || req.body.lang == undefined) {
		res.send(new Response(false, "paramethers not valids"))
	}

	if (req.body.limit == undefined) {

		req.body.limit = DEFAULT_LIMIT
	}

	req.body.langs = undefined
	req.body.descriptions = true
	let response = new Response(true, "retrieved descriptions")
	let result = ""
	let startTime = performance.now()
	let endTime = ""
	let time = ""

	if (req.body.BABELNET === undefined || req.body.BABELNET) {
		result = await babelMethods.senses({ ...req.body })
		endTime = performance.now()
		time = new Number(endTime - startTime)
		response.addData({ source: "BABELNET", inf: result, time: precise(time) })
	}


	if (req.body.CONCEPTNET === undefined || req.body.CONCEPTNET) {
		startTime = performance.now()
		result = await conceptMethods.edges(req.body.word, req.body.lang, "IsA", req.body.limit)
		endTime = performance.now()
		time = new Number(endTime - startTime)
		response.addData({ source: "CONCEPTNET", inf: result, time: precise(time) })
	}

	if (req.body.WIKIDATA === undefined || req.body.WIKIDATA) {
		startTime = performance.now()
		result = await wikiMethods.searchByName(req.body.word, req.body.lang, req.body.sensitive, req.body.limit)
		endTime = performance.now()
		time = new Number(endTime - startTime)
		response.addData({ source: "WIKIDATA", inf: result, time: precise(time) })
	}

	if (req.body.DBPEDIA === undefined || req.body.DBPEDIA) {
		startTime = performance.now()
		result = await dbPediaMethods.description(req.body.word, req.body.lang, req.body.sensitive, req.body.limit)
		endTime = performance.now()
		time = new Number(endTime - startTime)
		response.addData({ source: "DBPEDIA", inf: result, time: precise(time) })
	}

	if (req.body.DBNARY === undefined || req.body.DBNARY) {
		startTime = performance.now()
		result = await dbNaryMethods.senses(req.body.word, req.body.lang, req.body.limit)
		endTime = performance.now()
		time = new Number(endTime - startTime)
		response.addData({ source: "DBNARY", inf: result, time: precise(time) })
	}

	res.send(response)
}
const hasPart = async (req, res) => {
	if (req.body.word == undefined || req.body.lang == undefined) {
		res.send(new Response(false, "paramethers not valids"))
	}

	if (req.body.limit == undefined) {

		req.body.limit = DEFAULT_LIMIT
	}

	req.body.langs = undefined
	req.body.hasPart = true
	let result = ""
	let response = new Response(true, "retrieved parts")
	let startTime = performance.now()
	let endTime = ""
	let time = ""

	if (req.body.BABELNET === undefined || req.body.BABELNET) {
		result = await babelMethods.senses({ ...req.body })
		endTime = performance.now()
		time = new Number(endTime - startTime)
		response.addData({ source: "BABELNET", inf: result, time: precise(time) })
	}


	if (req.body.CONCEPTNET === undefined || req.body.CONCEPTNET) {
		startTime = performance.now()
		result = await conceptMethods.edges(req.body.word, req.body.lang, "HasA", req.body.limit)
		endTime = performance.now()
		time = new Number(endTime - startTime)
		response.addData({ source: "CONCEPTNET", inf: result, time: precise(time) })
	}
	res.send(response)
}
const partOf = async (req, res) => {
	if (req.body.word == undefined || req.body.lang == undefined) {
		res.send(new Response(false, "paramethers not valids"))
	}

	if (req.body.limit == undefined) {

		req.body.limit = DEFAULT_LIMIT
	}

	req.body.langs = undefined
	req.body.partOf = true
	let result = ""
	let response = new Response(true, "retrieved parts Of")
	let startTime = performance.now()
	let endTime = ""
	let time = ""

	if (req.body.BABELNET === undefined || req.body.BABELNET) {
		result = await babelMethods.senses({ ...req.body })
		endTime = performance.now()
		time = new Number(endTime - startTime)
		response.addData({ source: "BABELNET", inf: result, time: precise(time) })
	}


	if (req.body.CONCEPTNET === undefined || req.body.CONCEPTNET) {
		startTime = performance.now()
		result = await conceptMethods.edges(req.body.word, req.body.lang, "PartOf", req.body.limit)
		endTime = performance.now()
		time = new Number(endTime - startTime)
		response.addData({ source: "CONCEPTNET", inf: result, time: precise(time) })
	}

	res.send(response)
}
const isA = async (req, res) => {
	if (req.body.word == undefined || req.body.lang == undefined) {
		res.send(new Response(false, "paramethers not valids"))
	}

	if (req.body.limit == undefined) {

		req.body.limit = DEFAULT_LIMIT
	}

	req.body.langs = undefined
	req.body.isA = true
	let result = ""
	let response = new Response(true, "retrieved results")
	let startTime = performance.now()
	result = await babelMethods.senses({ ...req.body })
	let endTime = performance.now()
	let time = new Number(endTime - startTime)
	response.addData({ source: "BABELNET", inf: result, time: precise(time) })
	res.send(response)
}
module.exports = {
	all: all,
	senses: senses,
	descriptions: descriptions,
	trads: trads,
	imgs: imgs,
	relations: relations,
	emoticons: emoticons,
	synonyms: synonyms,
	hyponyms: hyponyms,
	hypernyms: hypernyms,
	meronyms: meronyms,
	holonyms: holonyms,
	hasPart: hasPart,
	partOf: partOf,
	isA: isA
}