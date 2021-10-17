const SparqlClient = require("sparql-http-client")
const functions=require("./commonFeauters")
const endpointUrl = 'https://dbpedia.org/sparql'
const qr =(word,lang,sensitive)=>{
//inserire qui la SPARQLE QUERY

if(sensitive==true){
  return ` SELECT   ?word ?label
  WHERE
       {
          ?item rdfs:label  ?word.
          OPTIONAL { ?item dbo:abstract ?label }
          FILTER ( LANG ( ?label ) ="`+lang+`" )
          FILTER ( LANG ( ?word ) ="`+lang+`" )
          FILTER(lcase(str(?word)) = "`+word.toLowerCase()+`")
       }LIMIT 20` 
}else{
  return` 
  SELECT    ?label
  WHERE
       {
          ?item rdfs:label "`+word+`" @`+lang+`.
          OPTIONAL { ?item dbo:abstract ?label }
          FILTER ( LANG ( ?label ) = '`+lang+`' )
       }LIMIT 20
       `
}

}

const client = new SparqlClient({ endpointUrl })
 async function ex(res,w,lang,sensitive){
  if(sensitive==false){w=functions.formatWord(w);}
    lang=functions.formatLang2low(lang);
    let string="";
    const query=qr(w,lang,sensitive);
    const stream=await client.query.select(query)
  stream.on('data', row => {
    Object.entries(row).forEach(([key, value]) => {
    let current=`${value.value}`;
    console.log("\nDBPEDIA\n")
    console.log(current);
  })
  
})
//res.status(200).send({message:string});
 
stream.on('error', err => {
  console.log("DBPEDIA")
  console.error(err)
})
}
const r=ex;
module.exports={
    query:r,
}

/**
 * DBPedia si dimostra ottimo per trovare descrizioni dettagliate delle parole ricercate, cosa che gli altri dataset non forniscono,
 * la pecca è che funziona solo per l'inglese e anche in inglese non è detto che abbia una descrizione per ogni parola ricercata
 */