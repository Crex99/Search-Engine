const SparqlClient = require('sparql-http-client')
const axios = require('axios');
const WBK = require('wikibase-sdk')
const wdk = WBK({
  instance: 'https://www.wikidata.org',
  sparqlEndpoint: 'https://query.wikidata.org/sparql'
})
const endpointUrl = 'https://query.wikidata.org/sparql'
const qr=(id,lang)=>{
  return`
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX schema: <http://schema.org/>
PREFIX cc: <http://creativecommons.org/ns#>
PREFIX geo: <http://www.opengis.net/ont/geosparql#>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX wdata: <http://www.wikidata.org/wiki/Special:EntityData/>
PREFIX bd: <http://www.bigdata.com/rdf#>

PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX wdtn: <http://www.wikidata.org/prop/direct-normalized/>

PREFIX wds: <http://www.wikidata.org/entity/statement/>
PREFIX p: <http://www.wikidata.org/prop/>
PREFIX wdref: <http://www.wikidata.org/reference/>
PREFIX wdv: <http://www.wikidata.org/value/>
PREFIX ps: <http://www.wikidata.org/prop/statement/>
PREFIX psv: <http://www.wikidata.org/prop/statement/value/>
PREFIX psn: <http://www.wikidata.org/prop/statement/value-normalized/>
PREFIX pq: <http://www.wikidata.org/prop/qualifier/>
PREFIX pqv: <http://www.wikidata.org/prop/qualifier/value/>
PREFIX pqn: <http://www.wikidata.org/prop/qualifier/value-normalized/>
PREFIX pr: <http://www.wikidata.org/prop/reference/>
PREFIX prv: <http://www.wikidata.org/prop/reference/value/>
PREFIX prn: <http://www.wikidata.org/prop/reference/value-normalized/>
PREFIX wdno: <http://www.wikidata.org/prop/novalue/>
PREFIX hint: <http://www.bigdata.com/queryHints#>

SELECT   ?itemDescription
{
    ?item wdt:P31 wd:`+id+
    ` SERVICE wikibase:label { bd:serviceParam wikibase:language "`+lang.toLowerCase()+`,en". } # l'etichetta verrà preferibilmente nella tua lingua, e altrimenti in inglese
  }
`
}

const ex=async(res,word,lang)=>{
const client = new SparqlClient({ endpointUrl })
const query=qr(await request(word.toLowerCase(),lang.slice(0,lang.length-1)),lang);
const stream = await client.query.select(query)
 stream.on('data', row => {
  
  Object.entries(row).forEach(([key, value]) => {
    console.log("WIKIDATA")
    console.log(`${value.value}`);
    }
  )
  //console.log(string);
  //console.log(i);
  //res.send(string);
})
stream.on('error', err => {
  console.log("WIKIDATA")
  console.error(err)
})
}



const request=async  (word,lang)=>  {

  const url="https://www.wikidata.org/w/api.php?action=wbsearchentities&search="+word+"&language="+lang+"&limit=20&format=json";
  try {
    const response = await axios.get(url);
    let out=response.data;
    //prendo la prima pagina che combacia con la parola ricercata
    let sol=out.search.filter(element=>element.match.text==word);
    return sol[0].id;
  } catch (error) {
    console.log(error);
  }
};

const r=ex;

const formatWord=(w)=>{
let first="";
let other="";
let array=w.split(" ");
let out="";
array.forEach(element => {
  first=element[0].toUpperCase();
  other=element.slice(1,element.length);
  out=out+first+other+" ";
});
return out;
}

const formatLang=(l)=>{
  let out=l.toLowerCase();
  out=l[0]+l[1];
  return out;
}

const f1=(datas,langs)=>{
  datas=['Q317521'];
  langs=['en'];
  const url = wdk.getEntities({
    ids: datas,
    languages: langs, // returns all languages if not specified
    //props: [ 'info', 'claims' ], // returns all data if not specified
    format: 'json', // defaults to json
    redirections: false // defaults to true
  })
  axios.get(url).then((response)=>{
    datas.forEach(data => {
      langs.forEach(lang => {
        //console.log(lang)
      console.log(response.data.entities[data].descriptions[lang].value)
    });
  });
  })
}


const f=(res,word,lang)=>{
  word=formatWord(word);
  lang=formatLang(lang);
  const url = wdk.searchEntities({
    search: word,
    format: 'json',
    language: lang,
    limit: 30
  })

  axios.get(url).then((response)=>{
      const wikidata_resposne=response.data;
      const search_items=wikidata_resposne.search.map((item)=>{
        return {
          id:item.id,
          label:item.label,
          description:item.description
        }
      })
      console.log("WIKIDATA");
      console.log(search_items);
  })
}
module.exports={
    searchCategory:r,
    searchByName:f,
    searchById:f1
}

