const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const app = express();
const PORT = 8080;
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
    res.status(200).send({ message: "Hello da JS.it" });
});

app.post("/imgs", (req, res) => controller.imgs(req, res))

app.post("/trads", (req, res) => controller.trads(req, res))

app.post("/senses", (req, res) => controller.senses(req, res))

app.post("/relations", (req, res) => controller.relations(req, res))

app.get("/all", (req, res) => controller.all(req, res))

app.post("/emoticons", (req, res) => controller.emoticons(req, res))

app.get("/babelNet", (req, res) => {
    const word = req.query.word;
    const lang = req.query.lang;
    const pos = req.query.pos;
    babelMethods.synsets(res, word, lang);
    //babelMethods.definitions(res,word,lang);
});

app.get("/conceptNet", (req, res) => {
    conceptMethods.edges();
});

app.post("/dbNary", (req, res) => {
    const word = req.body.word;
    const lang = req.body.lang;
    dbNaryMethods.test(word, lang);
});

app.post("/dbPedia", (req, res) => {
    const word = req.body.word;
    const lang = req.body.lang;
    dbPediaMethods.query(res, word, lang);
});

app.get("/wikiData", (req, res) => {
    const word = req.query.word;
    const lang = req.query.lang;
    wikiMethods.searchCategory(res, word, lang);
});

app.listen(PORT, () => {
    console.log("server in ascolto alla porta " + PORT);
});