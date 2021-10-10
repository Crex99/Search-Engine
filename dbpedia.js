const SparqlClient = require("sparql-http-client")
const endpointUrl = 'https://dbpedia.org/sparql'
const qr =(word,lang)=>{
//inserire qui la SPARQLE QUERY
return` 
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX : <http://dbpedia.org/resource/>
PREFIX dbpedia2: <http://dbpedia.org/property/>
PREFIX dbpedia: <http://dbpedia.org/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT  ?type 
WHERE
     {
        ?item rdfs:label "`+word+`" @`+lang+`.
        ?item rdf:type  ?type.
        
     }`
}

//formatto la stringa in input
const format=(w)=>{
  let first=w.substring(1,w.lenth-1);
  first=first.toUpperCase();
  let other=w.substring(1);
  other=other.toLowerCase();
  return first+other;
}

const client = new SparqlClient({ endpointUrl })
 async function ex(res,w,lang){

    const word=format(w);
    let string="";
    const query=qr(word,lang.slice(0,lang.length-1));
    const stream=await client.query.select(query)
stream.on('data', row => {
    Object.entries(row).forEach(([key, value]) => {
    let current=`${value.value}`;
    current=current.split("/");
    current=current[current.length-1]+"\n";
    console.log("DBPEDIA")
    console.log(current);
  })
  
})
//res.status(200).send({message:string});
 
stream.on('error', err => {
  console.error(err)
})
}
const r=ex;
module.exports={
    query:r,
}

//Il problema principale è filtrare il dato input in maniera da farlo combaciare col dato nel dataset