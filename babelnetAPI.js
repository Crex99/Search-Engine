const axios = require('axios');
const functions=require("./commonFeauters")
const SparqlClient = require("sparql-http-client");
const { formatWord } = require('./commonFeauters');
const endpointUrl ='https://babelnet.org/sparql/';
const KEY="69b0ba73-de64-4cee-a700-c2005da7ed66";
const KEY2="f82361e3-a269-453f-a1ea-a294233c2e71";

/*
//restituisce le definizioni di una parola in una lingua scelta
const request4=(res,word,lang)=>{
  const qr =(word,lang)=>{
    //inserire qui la SPARQLE QUERY
    return` 
    SELECT DISTINCT  ?synset ?label WHERE {
      ?entries a lemon:LexicalEntry .
      ?entries lemon:sense ?sense .
      ?sense lemon:reference ?synset .
      ?synset bn-lemon:definition ?definition .
      ?definition lemon:language "`+lang.toUpperCase()+`".
      ?definition bn-lemon:gloss ?label.
      ?entries rdfs:label "`+word.toLowerCase()+`"@`+lang.toLowerCase()+`.
  } LIMIT 10`
    }
  const client = new SparqlClient({endpointUrl})

  const async=async()=>{
    const query=qr(word,lang);
    console.log(query)
    const stream=await client.query.select(query)
    console.log(stream)
    
    stream.on('data', row => {
      Object.entries(row).forEach(([key, value]) => {
      let current=`${value.value}`;
      console.log(current);
    })
      
    })
      
    stream.on('error', err => {
    console.log(err)
    })
  }

  async();
}
*/


//cerca la parola lemma , nella lingua lang e ritorna la lista dei synset ID che combaciano
const synsets=async  (r,lemma,lang)=>  {
  
   lang=functions.formatLang2High(lang);
  const url="https://babelnet.io/v6/getSynsetIds?lemma="+lemma+"&searchLang="+lang+"&key="+KEY;
  try {
    const response = await axios.get(url);
    let out=response.data;
    console.log(out);
      //request0(out,0,lang)
    //r.status(201).send({message:""+string});
  } catch (error) {
    console.log(error);
  }
};



//cerca il synset con identificativo id e ritorna una frase che lo descrive se ci sono
const informations=async  (word,id,b,limit)=>  {
  const url="https://babelnet.io/v6/getSynset?id="+id+"&targetLang="+b+"&key="+KEY;
  try {
    const response = await axios.get(url);
    let out=response.data;
    for(let i=0;i<limit;i++){
      //console.log(out[i]);
    }
    //b.status(201).send({message:""+out});
    let glosses=out.glosses;
    if(word!=undefined){
      console.log("word",word);
    }
    glosses.forEach(element => {

      console.log("element",element.gloss);
    });

  } catch (error) {
    console.log("BABELNET")
    console.log(error);
  }
}

//ritorna i senses di una data parola in input(word) nella lingua lang con posizione nella frase scelta
const senses_pos=async  (b,word,lang,pos,relation)=>  {
  pos=pos.toUpperCase();
  lang=functions.formatLang2High(lang);
  const url="https://babelnet.io/v6/getSenses?lemma="+word+"&searchLang="+lang+"&pos="+pos+"&key="+KEY;
  try {
    const response = await axios.get(url);
    let out=response.data;
    console.log(out)
    out.forEach(element => {
      
      if((element.properties.fullLemma==word)&&(element.properties.lemma.type="HIGH_QUALITY")){
        let id=element.properties.synsetID.id
        characteristics(b,id,relation.toUpperCase(),lang)
        //console.log(id);
        
      }

    });
    
    //b.status(201).send({message:""+out});
    return out;
  } catch (error) {
    console.log(error);
  }
};

//ritorna i senses di una data parola in input(word) nella lingua lang e chiama la funzione informations
const senses_inf=async  (b,word,lang,sensitive,limit)=>  {
  lang=functions.formatLang2High(lang);
  const url="https://babelnet.io/v6/getSenses?lemma="+word+"&searchLang="+lang+"&key="+KEY;
  try {
    const response = await axios.get(url);
    let out=response.data;
    if(functions.control(word,sensitive,out[0].properties.fullLemma)==true){
      for(let i=0;i<limit;i++){
        console.log("name",out[i].properties.fullLemma);
        informations(out[i].properties.synsetID.id,lang,limit);
      }
    }
    /*out.forEach(element => {
      
      if((element.properties.fullLemma==word)&&(element.properties.lemma.type="HIGH_QUALITY")){
        console.log(element);
        
      }

    });*/
    
    //b.status(201).send({message:""+out});
    return out;
  } catch (error) {
    console.log(error);
  }
};
//ritorna i senses di una data parola in input(word) nella lingua lang e chiama la funzione characteristics
const senses_chars=async  (b,word,lang,sensitive,limit,relation)=>  {
  lang=functions.formatLang2High(lang);
  const url="https://babelnet.io/v6/getSenses?lemma="+word+"&searchLang="+lang+"&key="+KEY;
  try {
    const response = await axios.get(url);
    let out=response.data;
    if(functions.control(word,sensitive,out[0].properties.fullLemma)==true){
      for(let i=0;i<limit;i++){
        console.log("name",out[i]);
        //characteristics(b,out[i].properties.synsetID.id,relation,lang,limit);
        informations(out[i].properties.fullLemma,out[i].properties.synsetID.id,lang,limit);
      }
    }
    /*out.forEach(element => {
      
      if((element.properties.fullLemma==word)&&(element.properties.lemma.type="HIGH_QUALITY")){
        console.log(element);
        
      }

    });*/
    
    //b.status(201).send({message:""+out});
    return out;
  } catch (error) {
    console.log(error);
  }
};

//prende gli edge di un dato synset 

const edges=async  (b,id,limit)=>  {
  const url="https://babelnet.io/v6/getOutgoingEdges?id="+id+"&key="+KEY;
  try {
    const response = await axios.get(url);
    let out=response.data;
    for(let i=0;i<limit;i++){
      console.log(out[i]);
    }
    
    //b.status(201).send({message:""+out});
    return out;
  } catch (error) {
    console.log(error);
  }
};


//prende HYPERNYM,  HYPONYM, MERONYM, HOLONYM o  OTHER  di un dato synset e chiama informations per ogni risultato

const characteristics=async  (a,id,relation,lang,limit)=>  {
  relation=relation.toUpperCase();
  console.log("relation",relation);
  console.log("lang",lang);
  const url="https://babelnet.io/v6/getOutgoingEdges?id="+id+"&key="+KEY;
  try {
    const response = await axios.get(url);
    let out=response.data;
    let element="";
    let i=0;
    out.forEach(element => {
      if(i==limit){
        return;
      }
      console.log(relation);
      console.log(element.pointer.relationGroup)
      console.log(element.language)
      console.log(lang)
      if(relation==element.pointer.relationGroup&&element.language==lang){
        i++;
        console.log("current:",element);
        informations(element.target,lang,limit)
      }
    });   
  } catch (error) {
    console.log(error);
  }
};


module.exports={
  synsets:synsets,
  informations:informations,
  senses_inf:senses_inf,
  senses_chars:senses_chars,
  senses_pos:senses_pos,
  edges:edges,
  characteristics:characteristics
};

/*
*BabelNet potrebbe essere facilmente usato per trovare hypernym, hyponym , sinonimi e altro anche in più lingue.
*Bisogna stare attenti a non eccedere il limite di richieste giornaliere
*/
