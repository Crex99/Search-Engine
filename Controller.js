const response = require("./Classes/Response")

const conceptMethods=require("./conceptnetAPI");
const dbNaryMethods=require("./dbNary");
const babelMethods=require("./babelnetAPI");
const wikiMethods=require("./wikidata");
const dbPediaMethods=require("./dbpedia");

const all = async(req,res) =>{
    const out =new response();

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
    //babelMethods.senses_pos(res,word,lang,pos,relation);
    if(relation!=undefined){
        babelMethods.senses_chars(res,word,lang,sensitive,limit,relation);
    }
    //conceptMethods.assertions(res,word,lang,sensitive);
    //dbNaryMethods.example(res,word,lang,sensitive);
    //dbPediaMethods.query(res,word,lang,sensitive);
    //wikiMethods.searchByName(res,word,lang,sensitive,imgs);
    if(langs!=undefined&&langs.length>0){
        const trads= await wikiMethods.translations(res,word,lang,langs,sensitive,limit)
        out.addTrads(trads)
        res.send(out);
    }
    if(imgs!=undefined&&imgs==true){
        const imgs= await wikiMethods.searchImgs(res,word,lang,sensitive,limit);
        console.log(imgs);
        out.addImgs(imgs)
        res.send(out)
    }

}

module.exports={
    all:all
}

