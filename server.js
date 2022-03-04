const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 8080;
const controller = require("./Controller");
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'EnchancingLexical API',
			description: 'API information for using routes of EnchancingLexical project',
			version: '1.0.0',
		},
		servers: [
			{ url: "http://localhost:8080" },
			{ url: "https://enchancing-lexical.herokuapp.com" }
		]

	},
	apis: ['server.js']
	/* files containing annotations as above*/
};

const openapiSpecification = swaggerJsdoc(options);


app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpecification))


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
/**
 * Il middleware in express non è altro che una funzione 
 * che ritorna il parametro next per usarlo basta fare app.use(funzione)
 */
/*
const middleware=(req,res,next)=>{

	//questo è il middleware più semplice possibile
	//non fa altro che porsi da ponte tra il server e il web
    
	return next();

	//questo termina tutte le chiamate del server
	return res.sendStatus(401);

	//questo simula un errore del server
	return res.sendStatus(500);
}
*/
app.use(helmet());
app.use(cors());

/**
 * Il primo parametro di app.get definisce l'endpoint,cioè la stringa a destra del server nel nostro url che identifica al richiesta del client
 * verso il server
 * status serve a indicare lo status code della risposta
 * send può trasmettere testo ma anche json
 */

app.get("/", (req, res) => {
	res.redirect("/api-docs")

});


/**
	 * @swagger
	 * /imgs:
	 *  post: 
	 *   description: returns a group of images given a word and a langauge in input, if the limit isn't specified it is 10 by default
	 *   requestBody:
	 *    required: true
	 *    content:
	 *     application/x-www-form-urlencoded:
	 *      schema:
	 *       type: object
	 *       properties:
	 *        word:
	 *         type: string
	 *         example: cat
	 *        lang:
	 *         type: string
	 *         example: en
	 *        limit:
	 *         type: number
	 *         required: true
	 *   responses:
	 *    200:
	 *     description: request accepted, verifiyng input 
	 */
app.post("/imgs", (req, res) => controller.imgs(req, res))

/**
	 * @swagger
	 * /trads:
	 *  post: 
	 *   description: returns a group of translations given a word , a lang and a set of languages in input, if the limit isn't specified it is 10 by default
	 *   requestBody:
	 *    required: true
	 *    content:
	 *     application/x-www-form-urlencoded:
	 *      schema:
	 *       type: object
	 *       properties:
	 *        word:
	 *         type: string
	 *         example: cat
	 *        lang:
	 *         type: string
	 *         example: en
	 *        langs:
	 *         type: string
	 *         example: it,fr,es
	 *        limit:
	 *         type: number
	 *         required: true
	 *   responses:
	 *    200:
	 *     description: request accepted, verifiyng input 
	 */
app.post("/trads", (req, res) => controller.trads(req, res))

/**
	 * @swagger
	 * /senses:
	 *  post: 
	 *   description: returns a group of senses given a word and a langauge in input, if the limit isn't specified it is 10 by default
	 *   requestBody:
	 *    required: true
	 *    content:
	 *     application/x-www-form-urlencoded:
	 *      schema:
	 *       type: object
	 *       properties:
	 *        word:
	 *         type: string
	 *         example: cat
	 *        lang:
	 *         type: string
	 *         example: en
	 *        limit:
	 *         type: number
	 *         required: true
	 *   responses:
	 *    200:
	 *     description: request accepted, verifiyng input 
	 */
app.post("/senses", (req, res) => controller.senses(req, res))


/**
	 * @swagger
	 * /descriptions:
	 *  post: 
	 *   description: returns a group of descriptions given a word and a langauge in input, if the limit isn't specified it is 10 by default
	 *   requestBody:
	 *    required: true
	 *    content:
	 *     application/x-www-form-urlencoded:
	 *      schema:
	 *       type: object
	 *       properties:
	 *        word:
	 *         type: string
	 *         example: cat
	 *        lang:
	 *         type: string
	 *         example: en
	 *        limit:
	 *         type: number
	 *   responses:
	 *    200:
	 *     description: request accepted, verifiyng input 
	 */
app.post("/descriptions", (req, res) => controller.descriptions(req, res))


/**
	 * @swagger
	 * /relations:
	 *  post: 
	 *   description: returns all the relations retrieved for the word in input, if the limit isn't specified it is 10 by default
	 *   requestBody:
	 *    content:
	 *     application/x-www-form-urlencoded:
	 *      schema:
	 *       type: object
	 *       properties:
	 *        word:
	 *         type: string
	 *         example: cat
	 *         required: true
	 *        lang:
	 *         type: string
	 *         example: en
	 *         required: true
	 *        limit:
	 *         type: number
	 *   responses:
	 *    200:
	 *     description: request accepted, verifiyng input 
	 */
app.post("/relations", (req, res) => controller.relations(req, res))

app.post("/all", (req, res) => controller.all(req, res))


/**
	 * @swagger
	 * /emoticons:
	 *  post: 
	 *   description: returns all the emoticons retrieved for the word in input, if the limit isn't specified it is 10 by default
	 *   requestBody:
	 *    content:
	 *     application/x-www-form-urlencoded:
	 *      schema:
	 *       type: object
	 *       properties:
	 *        word:
	 *         type: string
	 *         example: cat
	 *         required: true
	 *        lang:
	 *         type: string
	 *         example: en
	 *         required: true
	 *        limit:
	 *         type: number
	 *   responses:
	 *    200:
	 *     description: request accepted, verifiyng input 
	 */
app.post("/emoticons", (req, res) => controller.emoticons(req, res))

/**
	 * @swagger
	 * /synonyms:
	 *  post: 
	 *   description: returns all the synonyms retrieved for the word in input, if the limit isn't specified it is 10 by default
	 *   requestBody:
	 *    content:
	 *     application/x-www-form-urlencoded:
	 *      schema:
	 *       type: object
	 *       properties:
	 *        word:
	 *         type: string
	 *         example: cat
	 *         required: true
	 *        lang:
	 *         type: string
	 *         example: en
	 *         required: true
	 *        limit:
	 *         type: number
	 *   responses:
	 *    200:
	 *     description: request accepted, verifiyng input 
	 */
app.post("/synonyms", (req, res) => controller.synonyms(req, res))

/**
	 * @swagger
	 * /hyponyms:
	 *  post: 
	 *   description: returns all the hyponyms retrieved for the word in input, if the limit isn't specified it is 10 by default
	 *   requestBody:
	 *    content:
	 *     application/x-www-form-urlencoded:
	 *      schema:
	 *       type: object
	 *       properties:
	 *        word:
	 *         type: string
	 *         example: cat
	 *         required: true
	 *        lang:
	 *         type: string
	 *         example: en
	 *         required: true
	 *        limit:
	 *         type: number
	 *   responses:
	 *    200:
	 *     description: request accepted, verifiyng input 
	 */
app.post("/hyponyms", (req, res) => controller.hyponyms(req, res))

/**
	 * @swagger
	 * /hypernyms:
	 *  post: 
	 *   description: returns all the hypernyms retrieved for the word in input, if the limit isn't specified it is 10 by default
	 *   requestBody:
	 *    content:
	 *     application/x-www-form-urlencoded:
	 *      schema:
	 *       type: object
	 *       properties:
	 *        word:
	 *         type: string
	 *         example: cat
	 *         required: true
	 *        lang:
	 *         type: string
	 *         example: en
	 *         required: true
	 *        limit:
	 *         type: number
	 *   responses:
	 *    200:
	 *     description: request accepted, verifiyng input 
	 */
app.post("/hypernyms", (req, res) => controller.hypernyms(req, res))

/**
	 * @swagger
	 * /holonyms:
	 *  post: 
	 *   description: returns all the holonyms retrieved for the word in input, if the limit isn't specified it is 10 by default
	 *   requestBody:
	 *    content:
	 *     application/x-www-form-urlencoded:
	 *      schema:
	 *       type: object
	 *       properties:
	 *        word:
	 *         type: string
	 *         example: cat
	 *         required: true
	 *        lang:
	 *         type: string
	 *         example: en
	 *         required: true
	 *        limit:
	 *         type: number
	 *   responses:
	 *    200:
	 *     description: request accepted, verifiyng input 
	 */
app.post("/holonyms", (req, res) => controller.holonyms(req, res))

/**
	 * @swagger
	 * /meronyms:
	 *  post: 
	 *   description: returns all the meronyms retrieved for the word in input, if the limit isn't specified it is 10 by default
	 *   requestBody:
	 *    content:
	 *     application/x-www-form-urlencoded:
	 *      schema:
	 *       type: object
	 *       properties:
	 *        word:
	 *         type: string
	 *         example: cat
	 *         required: true
	 *        lang:
	 *         type: string
	 *         example: en
	 *         required: true
	 *        limit:
	 *         type: number
	 *         required: true
	 *   responses:
	 *    200:
	 *     description: request accepted, verifiyng input 
	 */
app.post("/meronyms", (req, res) => controller.meronyms(req, res))


app.post("/inspiration", (req, res) => controller.inspiration(req, res))

//ONLY BABELNET

app.post("/hasPart", (req, res) => controller.hasPart(req, res))

app.post("/partOf", (req, res) => controller.partOf(req, res))

app.post("/isA", (req, res) => controller.isA(req, res))


app.listen(PORT, () => {
	console.log("server in ascolto alla porta " + PORT);
});