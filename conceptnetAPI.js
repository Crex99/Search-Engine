const axios = require('axios');
const functions = require("./commonFeauters")


//prende tutti gli edge di una data parola word in input nella lingua lang
const edges = (word, lang, rel, limit, langs) => {
	word = functions.formatWordConcept(word);
	console.log(word)
	lang = functions.formatLang2low(lang);
	if (langs != undefined) {
		langs = langs.split(",")
	}
	return new Promise((resolve) => {
		let set = new Set()
		let arrLangs = []
		let arr = []
		let outArr = []
		word = functions.formatWordConcept(word);
		lang = functions.formatLang2low(lang);
		const url_conceptnet = "http://api.conceptnet.io/c/" + lang + "/" + word;

		axios.get(url_conceptnet).then(async (response) => {
			let out = response.data.edges;
			out.forEach(element => {
				if (rel == "trads") {

					if (element.rel.label == "Synonym") {
						if (element.end.label == word) {
							console.log(element.start.language)
							if (langs.includes(element.start.language)) {
								set.add(element.start.label)
								arrLangs.push(element.start.language)
							}
						} else {
							if (langs.includes(element.end.language)) {
								set.add(element.end.label)
								arrLangs.push(element.end.language)
							}
						}
						console.log("Start label", element.start.label)
						console.log("End label", element.end.label)
					}
				} else if (rel == "Synonym") {
					if (element.rel.label == "RelatedTo" || element.rel.label == "DerivedFrom") {
						if (element.end.label == word) {
							if (element.start.language == lang) {
								set.add(element.start.label)
							}
						} else {
							if (element.end.anguage == lang) {
								set.add(element.end.label)
							}

						}
						console.log("Start label", element.start.label)
						console.log("End label", element.end.label)
					}
				} else if (rel != undefined) {
					if (element.rel.label == rel) {

						if (rel == "SymbolOf") {
							set.add(element.start.label)
							console.log("Start label", element.start.label)
							console.log("End label", element.end.label)
						} else {
							if (element.end.label.includes(word)) {
								set.add(element.start.label)
							} else {
								set.add(element.end.label)
							}
							console.log("Start label", element.start.label)
							console.log("End label", element.end.label)
						}
					}
				} else {
					set.add(element.rel.label)
				}
			});
			if (set.size >= limit) {
				set.forEach(element => {
					arr.push(element)
				});
				arr.length = limit
				arrLangs.length = limit
				for (let i = 0; i < arr.length; i++) {
					outArr.push({ "word": arr[i], "lang": arrLangs[i] })
				}
				nextPage = undefined
				resolve(outArr)
			} else {
				let nextPage = ""
				if (response.data.view != undefined) {
					nextPage = response.data.view.nextPage
				} else {
					nextPage = undefined
				}
				while (nextPage != undefined) {
					console.log(nextPage)
					let url = "http://api.conceptnet.io" + nextPage
					out = await axios.get(url).
						catch((err) => {
							resolve(err)
						})
					nextPage = out.data.view.nextPage
					out = out.data.edges
					out.forEach(element => {
						if (rel == "trads") {

							if (element.rel.label == "Synonym") {
								if (element.end.label == word) {
									console.log(element.start.language)
									if (langs.includes(element.start.language)) {
										set.add(element.start.label)
										arrLangs.push(element.start.language)
									}
								} else {
									if (langs.includes(element.end.language)) {
										set.add(element.end.label)
										arrLangs.push(element.end.language)
									}
								}
								console.log("Start label", element.start.label)
								console.log("End label", element.end.label)
							}
						} else if (rel == "Synonym") {
							if (element.rel.label == "RelatedTo" || element.rel.label == "DerivedFrom") {
								if (element.end.label == word) {
									if (element.start.language == lang) {
										set.add(element.start.label)
									}
								} else {
									if (element.end.anguage == lang) {
										set.add(element.end.label)
									}

								}
								console.log("Start label", element.start.label)
								console.log("End label", element.end.label)
							}
						} else if (rel != undefined) {
							if (element.rel.label == rel) {

								if (rel == "SymbolOf") {
									set.add(element.start.label)
									console.log("Start label", element.start.label)
									console.log("End label", element.end.label)
								} else {
									if (element.end.label.includes(word)) {
										set.add(element.start.label)
									} else {
										set.add(element.end.label)
									}
									console.log("Start label", element.start.label)
									console.log("End label", element.end.label)
								}
							}
						} else {
							set.add(element.rel.label)
						}
					});
					if (set.size >= limit) {
						set.forEach(element => {
							arr.push(element)
						});
						arr.length = limit
						arrLangs.length = limit

						for (let i = 0; i < arr.length; i++) {
							outArr.push({ "word": arr[i], "lang": arrLangs[i] })
						}
						nextPage = undefined
						resolve(outArr)
					}
				}
				console.log("finish")
				if (set.size < limit) {
					set.forEach(element => {
						arr.push(element)
					});
					for (let i = 0; i < arr.length; i++) {
						outArr.push({ "word": arr[i], "lang": arrLangs[i] })
					}
					nextPage = undefined
					resolve(outArr)
				}
			}
		}).catch((error) => {
			console.log(error)
			resolve([])
		})
	})
};



module.exports = {
	edges: edges
};