const SparqlClient = require("sparql-http-client")
const axios = require('axios');
const endpointUrl = 'http://kaiko.getalp.org/sparql'
const qr = (word, lang, sensitive) => {
    //inserire qui la SPARQLE QUERY
    if (sensitive == true) {
        return ` 
  SELECT     ?label
  WHERE
       {
          ?item rdfs:label ?word.
          ?item dbnary:synonym ?where.
          ?where dbnary:describes ?this.
          ?this rdfs:label ?label
          FILTER(lcase(str(?word)) = "` + word.toLowerCase() + `")
       }`
    } else {
        return ` 
  SELECT     ?label
  WHERE
       {
          ?item rdfs:label "` + word + `" @` + lang + `.
          ?item dbnary:synonym ?where.
          ?where dbnary:describes ?this.
          ?this rdfs:label ?label
       }`
    }
}

const client = new SparqlClient({ endpointUrl })

const r = async(r, word, lang, sensitive) => {
    if (sensitive == false) { word = word.toLowerCase() }
    const query = qr(word, lang.slice(0, lang.length - 1));
    const stream = await client.query.select(query);
    //let string="";

    stream.on('data', row => {
        Object.entries(row).forEach(([key, value]) => {
            let current = `${value.value}`;
            //string=string+current;
            console.log("DBNARY");
            console.log(current);
        })

    })

    stream.on('error', err => {
        console.log("DBNARY");
        console.error(err)
    })

}

const request = r;



module.exports = {
    example: request,
}


//trovare i PREFIX