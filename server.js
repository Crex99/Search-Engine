const express= require("express");
const helmet =require("helmet");
const cors =require("cors");
const app=express();
const PORT=8080;
const conceptMethods=require("./conceptnetAPI");
const dbNaryMethods=require("./dbNary");
const babelMethods=require("./babelnetAPI");
const wikiMethods=require("./wikidata");
const dbPediaMethods=require("./dbpedia");

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

app.get("/",(req,res)=>{
    res.status(200).send({message:"Hello da JS.it"});
});

app.get("/all",(req,res)=>{

    let sensitive=false;
    let imgs=false;
    const relation=req.query.relation;
    const limit=Number(req.query.limit);
    const pos=req.query.pos;
    const word=req.query.word;
    const lang=req.query.lang;
    const langs=req.query.trad;
    sensitive=Boolean(req.query.sensitive);
    imgs=Boolean(req.query.imgs);
    /**
     * sensitive is a parameter that specify if we want a case sensitive research or not
     * imgs is a parameter that specify if we want also images 
     * pos and relation are parameters only for babelnet, pos indicates if we want a verb, a noun , a pronoun
     * relation indicates if we want a HYPERNYM, HYPONYM , SYNOYM ot other
     * langs indicates the langs that user wants to obtain a translation
     */
    babelMethods.senses_chars(res,word,lang,sensitive,limit,relation);
    //babelMethods.senses_pos(res,word,lang,pos,relation);
    //babelMethods.characteristics(res,word,lang,relation);
    //conceptMethods.assertions(res,word,lang,sensitive);
    //dbNaryMethods.example(res,word,lang,sensitive);
    //dbPediaMethods.query(res,word,lang,sensitive);
    //wikiMethods.searchByName(res,word,lang,sensitive,imgs);
    if(langs!=undefined&&langs.length>0){
        wikiMethods.translations(res,word,lang,langs,sensitive,limit);
    }
    if(imgs!=undefined&&imgs==true){
        wikiMethods.searchImgs(res,word,lang,sensitive,limit);
    }
});

app.get("/babelNet",(req,res)=>{
    const word=req.query.word;
    const lang=req.query.lang;
    const pos=req.query.pos;
    babelMethods.synsets(res,word,lang);
    //babelMethods.definitions(res,word,lang);
});

app.get("/conceptNet",(req,res)=>{
    const word=req.query.word;
    const lang=req.query.lang;
    conceptMethods.assertions(res,word,lang);
});

app.get("/dbNary",(req,res)=>{
    const word=req.query.word;
    const lang=req.query.lang;
    dbNaryMethods.example(res,word,lang);
});

app.get("/dbPedia",(req,res)=>{
    const word=req.query.word;
    const lang=req.query.lang;
    dbPediaMethods.query(res,word,lang);
});

app.get("/wikiData",(req,res)=>{
    const word=req.query.word;
    const lang=req.query.lang;
    wikiMethods.searchCategory(res,word,lang);
});

app.listen(PORT,()=>{
    console.log("server in ascolto alla porta "+PORT);
});