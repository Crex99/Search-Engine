const axios = require('axios');
const functions=require("./commonFeauters")
const SparqlClient = require("sparql-http-client");
const endpointUrl ='https://babelnet.org/sparql/';

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
    /*
    stream.on('data', row => {
      Object.entries(row).forEach(([key, value]) => {
      let current=`${value.value}`;
      console.log(current);
    })
      
    })
      
    stream.on('error', err => {
    console.log(err)
    })*/
  }

  async();
}



//cerca la parola lemma , nella lingua lang e ritorna la lista dei synset ID che combaciano
const request=async  (r,lemma,lang)=>  {
  
   lang=functions.formatLang2High(lang);
  const url="https://babelnet.io/v6/getSynsetIds?lemma="+lemma+"&searchLang="+lang+"&key=69b0ba73-de64-4cee-a700-c2005da7ed66";
  try {
    const response = await axios.get(url);
    let out=response.data;
    console.log(out[0]);
      //request0(out,0,lang)
    //r.status(201).send({message:""+string});
  } catch (error) {
    console.log(error);
  }
};



//cerca il synset con identificativo id e ritorna una frase che lo descrive se ci sono
const request0=async  (a,i,b)=>  {
  if(i<a.length){

  const url="https://babelnet.io/v6/getSynset?id="+a[i].id+"&targetLang="+b+"&key=69b0ba73-de64-4cee-a700-c2005da7ed66";
  try {
    const response = await axios.get(url);
    let out=response.data;
    console.log(out);
    //b.status(201).send({message:""+out});
    /*let current =out.glosses[0];
    if(current!=undefined){
      console.log("BABELNET")
      console.log(current.gloss)
    }*/

  } catch (error) {
    console.log("BABELNET")
    console.log(error);
    
  }
  //request0(a,i+1,b);
  
}else{
  return;
}
}

//ritorna i senses di una data parola in input(word) nella lingua lang
const request1_1=async  (b,word,lang,pos)=>  {
  pos=pos.toUpperCase();
  lang=functions.formatLang2High(lang);
  const url="https://babelnet.io/v6/getSenses?lemma="+word+"&searchLang="+lang+"&pos="+pos+"&key=69b0ba73-de64-4cee-a700-c2005da7ed66";
  try {
    const response = await axios.get(url);
    let out=response.data;
    
    out.forEach(element => {
      
      if((element.properties.fullLemma==word)&&(element.properties.lemma.type="HIGH_QUALITY")){
        console.log(element);
        
      }

    });
    
    //b.status(201).send({message:""+out});
    return out;
  } catch (error) {
    console.log(error);
  }
};

//ritorna i senses di una data parola in input(word) nella lingua lang
const request1=async  (b,word,lang,sensitive)=>  {
  lang=functions.formatLang2High(lang);
  const url="https://babelnet.io/v6/getSenses?lemma="+word+"&searchLang="+lang+"&key=69b0ba73-de64-4cee-a700-c2005da7ed66";
  try {
    const response = await axios.get(url);
    let out=response.data;
    if(functions.control(word,sensitive,out[0].properties.fullLemma)==true){
      console.log(out[0]);
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

const request2=async  (b)=>  {
  const id="bn:00007287n";
  const url="https://babelnet.io/v6/getOutgoingEdges?id="+id+"&key=69b0ba73-de64-4cee-a700-c2005da7ed66";
  try {
    const response = await axios.get(url);
    let out=response.data;
    
    console.log(out);
    
    //b.status(201).send({message:""+out});
    return out;
  } catch (error) {
    console.log(error);
  }
};


//prende HYPERNYM,  HYPONYM, MERONYM, HOLONYM o  OTHER  di un dato synset 

const request3=async  (a,b)=>  {
  //let relation=a;
  const id="bn:00001844n";
  const url="https://babelnet.io/v6/getOutgoingEdges?id="+id+"&key=69b0ba73-de64-4cee-a700-c2005da7ed66";
  try {
    const response = await axios.get(url);
    let out=response.data;
    let string="";
    let i=0;
    console.log(out);
    /*
    out.forEach(element => {
      if(relation==out[i].pointer.relationGroup){
        let current=out[i].pointer.fSymbol;
        string=string+"\n"+current;
        console.log("current:"+current);
      }
      i++;
    });
    */
    //console.log(string);
    //b.status(201).send({message:""+string});
    return out;
  } catch (error) {
    console.log(error);
  }
};


module.exports={
  synsets:request,
  informations:request0,
  senses:request1,
  senses_pos:request1_1,
  edges:request2,
  characteristics:request3,
  definitions:request4
};

//tutti i sinonimi si trovano nei senses

