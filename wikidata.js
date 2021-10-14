const axios = require('axios');
const controller=require("./commonFeauters")
const WBK = require('wikibase-sdk')
const wdk = WBK({
  instance: 'https://www.wikidata.org',
  sparqlEndpoint: 'https://query.wikidata.org/sparql'
})
const endpointUrl = 'https://query.wikidata.org/sparql'
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


const f=(res,word,lang,sensitive)=>{
  word=formatWord(word);
  lang=formatLang(lang);
  const url = wdk.searchEntities({
    search: word,
    format: 'json',
    language: lang,
    limit: 30
  })

  axios.get(url).then((response)=>{
      const wikidata_response=response.data;
      const search_items=wikidata_response.search.map((item)=>{
        return {
          id:item.id,
          label:item.label,
          description:item.description
        }
      })

      console.log("WIKIDATA");
      let result="";
      search_items.forEach(element => {
        result=controller.control(word,sensitive,element.label)
        if(result==true){
          console.log("result",result);
          console.log(element);
        }
      });
      
  })
}
module.exports={
    searchByName:f,
    searchById:f1
}

