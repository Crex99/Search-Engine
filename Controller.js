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

const inspiration = async (req, res) => {

	/*this route has the goal to inspire an user about a word, the route should send synonyms, senses 
		or everithyng that can be connected with the word in input
		In order this route will request knowledge graph about
		senses, synonyms
		*/

	if (req.body.limit == undefined || isNaN(req.body.limit)) {
		req.body.limit = DEFAULT_LIMIT
	}

	req.body.langs = undefined;
	req.body.emote = undefined;
	req.body.imgs = false;
	req.body.pos = undefined;
	req.body.synonyms = undefined;
	req.body.hierarchy = undefined;
	/**SENSES */
	let response = new Response(true, "discovered inspirations")
	let inspirations = ""
	inspirations = await babelMethods.senses({ ...req.body })
	response.addData({ source: "BABELNET", inf: inspirations })
	/**SYNONYMS */
	req.body.synonyms = true
	inspirations = await babelMethods.senses({ ...req.body })
	response.addData({ source: "BABELNET", inf: inspirations })
	/**RESPONSE */
	res.send(response)
}

const imgs = async (req, res) => {

	req.body.FILTER = Boolean(req.body.FILTER)

	if (req.body.FILTER) {
		req.body.BABELNET = false
		req.body.WIKIDATA = false
	}



	req.body.imgs = true;
	let sensitive = true;
	let limit = DEFAULT_LIMIT

	if (req.body.sensitive != undefined) {
		sensitive = req.body.sensitive
	}
	if (req.body.limit == undefined || req.body.limit == "" || isNaN(req.body.limit)) {
		req.body.limit = DEFAULT_LIMIT
	}

	if (req.body.word != undefined && req.body.lang != undefined) {

		let response = new Response(true, "discovered images")
		let imgs = ""


		if (req.body.WIKIDATA === undefined || req.body.WIKIDATA) {
			const wikiStartTime = performance.now()
			imgs = await wikiMethods.searchImgs(res, req.body.word, req.body.lang, sensitive, req.body.limit);
			const wikiEndTime = performance.now()
			const wikiTime = new Number(wikiEndTime - wikiStartTime)
			response.addData({ source: "WIKIDATA", inf: imgs, time: precise(wikiTime) })
		}

		const babelStartTime = performance.now()

		if (req.body.DBPEDIA === undefined || req.body.DBPEDIA) {
			const dbpStartTime = performance.now()
			imgs = await dbPediaMethods.images(req.body.word, req.body.lang, req.body.limit);
			const dbpEndTime = performance.now()
			const dbpTime = new Number(dbpEndTime - dbpStartTime)
			response.addData({ source: "DBPEDIA", inf: imgs, time: precise(dbpTime) })
		}

		if (imgs.length === 0) {
			req.body.BABELNET = true
		}

		if (req.body.BABELNET === undefined || req.body.BABELNET) {
			imgs = await babelMethods.senses({ ...req.body })
			const babelEndTime = performance.now()
			const babelTime = new Number(babelEndTime - babelStartTime)
			response.addData({ source: "BABELNET", inf: imgs, time: precise(babelTime) })
		}

		if (req.body.FILTER) {

			let set = new Set()
			let arr = []

			response.data.forEach(element => {
				if (element.source === "DBPEDIA") {
					element.inf.forEach(element => {
						set.add(element)
					});
				}

				if (element.source === "BABELNET") {
					element.inf.forEach(element => {
						element.datas.forEach(element => {
							set.add(element.url)
						});
					});
				}
			});
			set.forEach(element => {
				arr.push(element)
			});
			if (arr.length > req.body.limit) {
				arr.length = req.body.limit
			}
			response.data = arr

		}

		res.send(response)
	} else {
		res.send(new Response(false, "paramethers not valids"))
	}
}

const trads = async (req, res) => {

	req.body.FILTER = Boolean(req.body.FILTER)

	if (req.body.FILTER) {
		req.body.CONCEPTNET = false
		req.body.WIKIDATA = false
		req.body.DBPEDIA = false
	}

	let sensitive = true;


	if (req.body.sensitive != undefined) {
		sensitive = req.body.sensitive
	} else {
		req.body.sensitive = sensitive
	}
	if (req.body.limit == undefined || req.body.limit == "" || isNaN(req.body.limit)) {
		req.body.limit = DEFAULT_LIMIT
	}

	if (req.body.langs != undefined && req.body.lang != undefined && req.body.word != undefined) {

		let response = new Response(true, "discovered translations")

		let trads = ""

		if (req.body.BABELNET === undefined || req.body.BABELNET) {
			const babelStartTime = performance.now()
			trads = await babelMethods.senses({ ...req.body })
			const babelEndTime = performance.now()
			const babelTime = new Number(babelEndTime - babelStartTime)
			response.addData({ source: "BABELNET", inf: trads, time: precise(babelTime) })
		}

		if (trads === undefined || trads.length === 0) {
			req.body.WIKIDATA = true
		}

		if (req.body.WIKIDATA === undefined || req.body.WIKIDATA) {
			const wikiStartTime = performance.now()
			trads = await wikiMethods.translations(res, req.body.word, req.body.lang, req.body.langs, sensitive, req.body.limit)
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

		if (req.body.CONCEPTNET === undefined || req.body.CONCEPTNET) {
			let startTime = performance.now()
			trads = await conceptMethods.edges(req.body.word, req.body.lang, "trads", req.body.limit, req.body.langs)
			let endTime = performance.now()
			let time = new Number(endTime - startTime)
			response.addData({ source: "CONCEPTNET", inf: trads, time: precise(time) })
		}

		if (req.body.FILTER) {

			let arr = []

			response.data.forEach(element => {
				if (element.source === "BABELNET") {
					element.inf.forEach(element => {
						element.datas.forEach(element => {
							arr.push(element)
						});
					});
				}
				if (element.source === "WIKIDATA") {
					element.inf.forEach(element => {
						element.datas.forEach(element => {
							arr.push(element)
						});
					});
				}
				if (arr.length > req.body.limit) {
					arr.length = req.body.limit
				}

			});
			response.data = arr
		}

		res.send(response)
	} else {
		res.send(new Response(false, "paramethers not valids"))
	}

}

const senses = async (req, res) => {

	req.body.FILTER = Boolean(req.body.FILTER)

	/**eliminating useless sources */
	if (req.body.FILTER) {
		req.body.BABELNET = false
	}

	if (req.body.sensitive == undefined) {
		req.body.sensitive = true
	}

	if (req.body.limit == undefined || req.body.limit == "" || isNaN(req.body.limit)) {
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

		/**MASKING RESPONSE */
		if (req.body.FILTER) {
			let set = new Set()
			let arr = []
			response.data.forEach(element => {
				if (element.source === "CONCEPTNET") {
					element.inf.forEach(element => {
						set.add(element.word)
					});
				}
			});

			set.forEach(element => {
				arr.push(element)
			});
			if (arr.length > req.body.limit) {
				arr.length = req.body.limit
			}
			response.data = arr

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

		if (req.body.limit == undefined || req.body.limit == "" || isNaN(req.body.limit)) {
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
			console.log("relations", relations)
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

	req.body.FILTER = Boolean(req.body.FILTER)

	if (req.body.FILTER) {
		req.body.CONCEPTNET = false
		req.body.WIKIDATA = false
	}

	if (req.body.word == undefined || req.body.lang == undefined) {
		res.send(new Response(false, "paramethers not valids"))
	} else {

		req.body.emote = true
		req.body.langs = undefined

		if (req.body.limit == undefined || req.body.limit == "" || isNaN(req.body.limit)) {
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

		if (emotes.length === 0) {
			req.body.WIKIDATA = true
		}

		if (req.body.WIKIDATA === undefined || req.body.WIKIDATA) {
			const wikiStartTime = performance.now()
			emotes = await wikiMethods.emotes(req.body.word, req.body.lang, req.body.limit, req.body.sensitive)
			const wikiEndTime = performance.now()
			const wikiTime = new Number(wikiEndTime - wikiStartTime)
			response.addData({ source: "WIKIDATA", inf: emotes, time: precise(wikiTime) })
		}

		if (req.body.FILTER) {

			let set = new Set()
			let arr = []

			response.data.forEach(element => {
				if (element.source === "BABELNET") {
					element.inf.forEach(element => {
						element.datas.forEach(element => {
							set.add(element)
						});
					});
				}
				if (element.source === "WIKIDATA") {
					element.inf.forEach(element => {
						element.datas.forEach(element => {
							set.add(element)
						});
					});
				}
			});

			set.forEach(element => {
				arr.push(element)
			});
			if (arr.length > req.body.limit) {
				arr.length = req.body.limit
			}
			response.data = arr
		}

		res.send(response)
	}

}

const synonyms = async (req, res) => {

	req.body.FILTER = Boolean(req.body.FILTER)
	if (req.body.FILTER) {
		req.body.CONCEPTNET = false
		req.body.BABELNET = false
		req.body.DBPEDIA = false
		req.body.DBNARY = false
	}
	if (req.body.word == undefined || req.body.lang == undefined) {
		res.send(new Response(false, "paramethers not valids"))
	} else {
		req.body.synonyms = true
		if (req.body.limit == undefined || req.body.limit == "" || isNaN(req.body.limit)) {
			req.body.limit = DEFAULT_LIMIT
		}

		req.body.langs = undefined

		let syns = "";
		let response = new Response(true, "retrieved synonyms")

		if (req.body.CONCEPTNET === undefined || req.body.CONCEPTNET) {
			let startTime = performance.now()
			syns = await conceptMethods.edges(req.body.word, req.body.lang, "Isa", req.body.limit)
			let endTime = performance.now()
			let time = new Number(endTime - startTime)
			response.addData({ source: "CONCEPTNET", inf: syns, time: precise(time) })
		}


		if (req.body.WIKIDATA === undefined || req.body.WIKIDATA) {
			const wikiStartTime = performance.now()
			syns = await wikiMethods.searchSynonyms(req.body.word, req.body.lang, req.body.limit)
			const wikiEndTime = performance.now()
			const wikiTime = new Number(wikiEndTime - wikiStartTime)
			response.addData({ source: "WIKIDATA", inf: syns, time: precise(wikiTime) })
		}

		if (syns === undefined || syns.length === 0) {
			req.body.BABELNET = true
		}

		const babelStartTime = performance.now()

		if (req.body.BABELNET === undefined || req.body.BABELNET) {
			syns = await babelMethods.senses({ ...req.body })
			const babelEndTime = performance.now()
			const babelTime = new Number(babelEndTime - babelStartTime)
			response.addData({ source: "BABELNET", inf: syns, time: precise(babelTime) })
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

		if (req.body.FILTER) {

			let set = new Set()
			let arr = []

			response.data.forEach(element => {
				if (element.source === "BABELNET") {
					element.inf.forEach(element => {
						element.datas.forEach(element => {
							set.add(element)
						});
					});
				}

				if (element.source === "WIKIDATA") {
					element.inf.forEach(element => {
						element.datas.forEach(element => {
							set.add(element)
						});
					});
				}
			});
			set.forEach(element => {
				arr.push(element)
			});
			if (arr.length > req.body.limit) {
				arr.length = req.body.limit
			}

			response.data = arr
		}

		res.send(response)
	}
}

const hyponyms = async (req, res) => {

	req.body.FILTER = Boolean(req.body.FILTER)

	if (req.body.word == undefined || req.body.lang == undefined) {
		res.send(new Response(false, "paramethers not valids"))
	}

	if (req.body.limit == undefined || req.body.limit == "" || isNaN(req.body.limit)) {
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

	if (req.body.FILTER) {

		let set = new Set()
		let arr = []

		response.data.forEach(element => {
			if (element.source === "BABELNET") {
				element.inf.forEach(element => {
					element.datas.forEach(element => {
						set.add(element)
					});
				});
			}

			if (element.source === "DBNARY") {
				element.inf.forEach(element => {

					set.add(element)

				});
			}
		});
		set.forEach(element => {
			arr.push(element)
		});
		if (arr.length > req.body.limit) {
			arr.length = req.body.limit
		}
		response.data = arr
	}

	res.send(response)
}
const hypernyms = async (req, res) => {

	req.body.FILTER = Boolean(req.body.FILTER)

	if (req.body.word == undefined || req.body.lang == undefined) {
		res.send(new Response(false, "paramethers not valids"))
	}

	if (req.body.limit == undefined || req.body.limit == "" || isNaN(req.body.limit)) {
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

	if (req.body.FILTER) {

		let set = new Set()
		let arr = []

		response.data.forEach(element => {
			if (element.source === "BABELNET") {
				element.inf.forEach(element => {
					element.datas.forEach(element => {
						set.add(element)
					});
				});
			}

			if (element.source === "WIKIDATA") {
				element.inf.forEach(element => {

					set.add(element)

				});
			}

			if (element.source === "DBPEDIA") {
				element.inf.forEach(element => {

					set.add(element)

				});
			}

			if (element.source === "DBNARY") {
				element.inf.forEach(element => {

					set.add(element)

				});
			}
		});

		set.forEach(element => {
			arr.push(element)
		});
		if (arr.length > req.body.limit) {
			arr.length = req.body.limit
		}
		response.data = arr
	}

	res.send(response)
}

const meronyms = async (req, res) => {

	req.body.FILTER = Boolean(req.body.FILTER)

	if (req.body.FILTER) {
		req.body.DBNARY = false
		req.body.CONCEPTNET = false
	}


	if (req.body.word == undefined || req.body.lang == undefined) {
		res.send(new Response(false, "paramethers not valids"))
	}

	if (req.body.limit == undefined || req.body.limit == "" || isNaN(req.body.limit)) {
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

	if (result === undefined || result.length === 0) {
		req.body.CONCEPTNET = true
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

	if (req.body.FILTER) {

		let set = new Set()
		let arr = []

		response.data.forEach(element => {
			if (element.source === "BABELNET") {
				element.inf.forEach(element => {
					element.datas.forEach(element => {
						set.add(element)
					});
				});
			}

			if (element.source === "CONCEPTNET") {
				element.inf.forEach(element => {

					set.add(element.word)

				});
			}
		});
		set.forEach(element => {
			arr.push(element)
		});
		if (arr.length > req.body.limit) {
			arr.length = req.body.limit
		}
		response.data = arr
	}

	res.send(response)
}
const holonyms = async (req, res) => {

	req.body.FILTER = Boolean(req.body.FILTER)

	if (req.body.FILTER) {
		req.body.DBNARY = false
		req.body.CONCEPTNET = false
	}
	if (req.body.word == undefined || req.body.lang == undefined) {
		res.send(new Response(false, "paramethers not valids"))
	}

	if (req.body.limit == undefined || req.body.limit == "" || isNaN(req.body.limit)) {
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

	if (req.body.FILTER) {

		let set = new Set()
		let arr = []

		response.data.forEach(element => {
			if (element.source === "BABELNET") {
				element.inf.forEach(element => {
					element.datas.forEach(element => {
						set.add(element)
					});
				});
			}
		});

		set.forEach(element => {
			arr.push(element)
		});
		if (arr.length > req.body.limit) {
			arr.length = req.body.limit
		}
		response.data = arr
	}

	res.send(response)
}

const descriptions = async (req, res) => {

	req.body.FILTER = Boolean(req.body.FILTER)


	if (req.body.FILTER) {
		req.body.CONCEPTNET = false
		req.body.WIKIDATA = false
		req.body.DBPEDIA = false
		req.body.DBNARY = false
	}

	if (req.body.word == undefined || req.body.lang == undefined) {
		res.send(new Response(false, "paramethers not valids"))
	}

	if (req.body.limit == undefined || req.body.limit == "" || isNaN(req.body.limit)) {
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

	if (result.length === 0) {
		req.body.CONCEPTNET = true
		req.body.WIKIDATA = true
		req.body.DBPEDIA = true
		req.body.DBNARY = true
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

	if (req.body.FILTER) {

		let set = new Set()
		let arr = []

		response.data.forEach(element => {

			if (element.source === "BABELNET") {
				element.inf.forEach(element => {
					element.datas.forEach(element => {
						set.add(element)
					});
				});
			}

			if (element.source === "CONCEPTNET") {
				element.inf.forEach(element => {
					set.add(element.word)
				});
			}

			if (element.source === "DBPEDIA") {
				set.add(element.inf)
			}

			if (element.source === "DBPEDIA") {
				element.inf.forEach(element => {
					set.add(element)
				});
			}

		});
		set.forEach(element => {
			arr.push(element)
		});
		if (arr.length > req.body.limit) {
			arr.length = req.body.limit
		}
		response.data = arr

	}

	res.send(response)
}


const hasPart = async (req, res) => {
	if (req.body.word == undefined || req.body.lang == undefined) {
		res.send(new Response(false, "paramethers not valids"))
	}

	if (req.body.limit == undefined || isNaN(req.body.limit)) {

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

	if (req.body.limit == undefined || isNaN(req.body.limit)) {

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

	if (req.body.limit == undefined || isNaN(req.body.limit)) {

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

const similarities = async (req, res) => {

	req.body.FILTER = Boolean(req.body.FILTER)

	if (req.body.word == undefined || req.body.lang == undefined) {
		res.send(new Response(false, "paramethers not valids"))
	} else {
		req.body.synonyms = true
		if (req.body.limit == undefined || req.body.limit == "" || isNaN(req.body.limit)) {
			req.body.limit = DEFAULT_LIMIT
		}

		req.body.langs = undefined

		let syns = "";
		let response = new Response(true, "retrieved similarities")

		if (req.body.CONCEPTNET === undefined || req.body.CONCEPTNET) {
			let startTime = performance.now()
			syns = await conceptMethods.edges(req.body.word, req.body.lang, "Synonym", req.body.limit)
			let endTime = performance.now()
			let time = new Number(endTime - startTime)
			response.addData({ source: "CONCEPTNET", inf: syns, time: precise(time) })
		}


		if (req.body.FILTER) {

			let set = new Set()
			let arr = []

			response.data.forEach(element => {
				if (element.source === "CONCEPTNET") {
					element.inf.forEach(element => {
						set.add(element.word)
					});
				}
			});
			set.forEach(element => {
				arr.push(element)
			});
			if (arr.length > req.body.limit) {
				arr.length = req.body.limit
			}

			response.data = arr
		}

		res.send(response)
	}

}
module.exports = {
	inspiration: inspiration,
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
	similarities: similarities,
	isA: isA
}