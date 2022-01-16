const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 8080;
const controller = require("./Controller");
const conceptMethods = require("./conceptnetAPI");
const dbNaryMethods = require("./dbNary");
const babelMethods = require("./babelnetAPI");
const wikiMethods = require("./wikidata");
const dbPediaMethods = require("./dbpedia");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
	res.status(200).send("Hello da JS.it");
});

app.post("/imgs", (req, res) => controller.imgs(req, res))

app.post("/trads", (req, res) => controller.trads(req, res))

app.post("/senses", (req, res) => controller.senses(req, res))

app.post("/descriptions", (req, res) => controller.descriptions(req, res))

app.post("/relations", (req, res) => controller.relations(req, res))

app.post("/all", (req, res) => controller.all(req, res))

app.post("/emoticons", (req, res) => controller.emoticons(req, res))

app.post("/synonyms", (req, res) => controller.synonyms(req, res))

app.post("/hyponyms", (req, res) => controller.hyponyms(req, res))

app.post("/hypernyms", (req, res) => controller.hypernyms(req, res))

app.post("/holonyms", (req, res) => controller.holonyms(req, res))

app.post("/meronyms", (req, res) => controller.meronyms(req, res))

//ONLY BABELNET

app.post("/hasPart", (req, res) => controller.hasPart(req, res))

app.post("/partOf", (req, res) => controller.partOf(req, res))

app.post("/isA", (req, res) => controller.isA(req, res))


app.listen(PORT, () => {
	console.log("server in ascolto alla porta " + PORT);
});