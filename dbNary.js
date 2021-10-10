const SparqlClient = require("sparql-http-client")
const endpointUrl = 'http://kaiko.getalp.org/sparql'
const qr =(word,lang)=>{
//inserire qui la SPARQLE QUERY
return` 
PREFIX lexvo: <http://lexvo.org/id/iso639-3/>
PREFIX dbnary: <http://kaiko.getalp.org/dbnary#>
PREFIX lemon: <http://lemon-model.net/lemon#>
PREFIX lime: <http://www.w3.org/ns/lemon/lime#>
PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT     ?label
WHERE
     {
        ?item rdfs:label "`+word+`" @`+lang+`.
        ?item dbnary:synonym ?where.
        ?where dbnary:describes ?this.
        ?this rdfs:label ?label
     }`
}

const client = new SparqlClient({ endpointUrl })

  const r=async  (r,word,lang) => {
  const query=qr(word.toLowerCase(),lang.slice(0,lang.length-1));
  const stream=await client.query.select(query);
  //let string="";
  
stream.on('data', row => {
  Object.entries(row).forEach(([key, value]) => {
  let current=`${value.value}`;
  //string=string+current;
  console.log("DBNARY");
  console.log(current);
})

})

stream.on('error', err => {
console.error(err)
})
    
  }

  const request=r;
module.exports={
    example:request,
}


//trovare i PREFIX 

