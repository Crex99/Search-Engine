const axios = require('axios');
const functions=require("./commonFeauters")
const WBK = require('wikibase-sdk')
const wdk = WBK({
  instance: 'https://www.wikidata.org',
  sparqlEndpoint: 'https://query.wikidata.org/sparql'
})
const endpointUrl = 'https://query.wikidata.org/sparql'

const SUBCLASS="P279"
const IMGS="P18"
const LIMIT=30;

//subClasses è una matrice dove in ogni riga contiene una sottoclasse con gli elementi che contiene la stessa
//l'elemento 0 di ogni riga è il nome della sottoclasse
let subClasses=[];

const addToSubClasses=(subClass,item)=>{
  if(subClasses.length==0){
    subClasses.push([subClass,item]);
  }else{
  let verify=false;
  subClasses.forEach(element => {
  if(element[0]==subClass){
    verify=true;
    element.push(item);
  }
});
if(verify==false){
  subClasses.push([subClass,item]);
}
  }
}

const searchPropertyName=(id,lang)=>{
  return new Promise((resolve)=>{
  datas=[id]
  langs=[lang]
  const url=wdk.getEntities({
    ids: datas,
    languages: langs, // returns all languages if not specified
    //props: [ 'info', 'claims' ], // returns all data if not specified
    format: 'json', // defaults to json
    redirections: false // defaults to true
  })

  axios.get(url).then((response)=>{
    datas.forEach(d => {
      langs.forEach(l => {
      //prende la label legata all'id cercato
      let label=response.data.entities[id].labels[l].value;
      //console.log("label",label)
      resolve(label);
    });
  });
  })
})
}
const f1=(res,datas,langs,last)=>{
const quest=async(a,c,array,i,last)=>{
  if(array!=undefined){
    if(i==array.length){
    if(last==true){
        //console.log("MATRICE",subClasses)
    }
    }else{
    let subclass= await searchPropertyName(array[i].mainsnak.datavalue.value.id,c);//prende la label relativa alla sottoclasse 
    //aggiunge alla matrice delle sottoclassi , la label trovata (a) e le sue sottoclassi di appartenenza
    addToSubClasses(subclass,a)
    quest(a,c,array,i+1,last);
    console.log("MATRICE",subClasses)
    }
  }else{
    if(last==true){
    //console.log("MATRICE",subClasses)
    }
  }
}

  //datas=["Q146"]
  //langs=["en"]
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
      //prende la label legata all'id cercato
      console.log("IMMAGGINI",response.data.entities[data].claims[IMGS]);
      let name=(response.data.entities[data].labels[lang].value);
      //prende gli id delle sottoclassi dell'id cercato
      let array=response.data.entities[data].claims[SUBCLASS];
        quest(name,lang,array,0,last)
    });
  });
  })
}


const f=(res,word,lang,sensitive)=>{
  lang=functions.formatLang2low(lang);
  const url = wdk.searchEntities({
    search: word,
    format: 'json',
    language: lang,
    limit:LIMIT
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
      
      let i=0;
      search_items.forEach(element => {
        i++
        if(functions.control(word,sensitive,element.label)==true){
            f1(res,[element.id],[lang])
        }
      });
      
  })
}
/**
 * FLUSSO DATI
 * searchByName trova tutti gli id relativi al nome passatogli in input
 * gli id trovati da searchByName vengono dati in pasto a searchById che trova tutte le informazioni per ogni id
 * searchByName divide i risultati trovati in base alle sottoclassi, che vengono cercate da searchPropertyName
 */

/**ritorna le traduzioni di una parola nelle lingue scelte */
const translations=(res,word,lang,langs,sensitive,max)=>{
lang=functions.formatLang2low(lang)
let array_langs=langs.split(",");
console.log(array_langs);
array_langs=array_langs.map((item)=>{
  return functions.formatLang2low(item)
})
//ricerca degli id in base alla parola data
const url = wdk.searchEntities({
  search: word,
  format: 'json',
  language: lang,
  limit:max
})

let search_items="";

axios.get(url).then((response)=>{
  const wikidata_response=response.data;
      search_items=wikidata_response.search.map((item)=>{
        if(functions.control(word,sensitive,item.label)==true){
          return item.id
        }
})

console.log("result",search_items);

//ricerca delle descrizioni in lin gue diverse in base agli id trovati
const url0 = wdk.getEntities({
  ids: search_items,
  format: 'json',
  languages: array_langs,
  limit:max
})
let current=""
axios.get(url0).then((response)=>{
  search_items.forEach(entity => {
    array_langs.forEach(l => {
      console.log(l);
      current=response.data.entities[entity].descriptions[l]
      if(current!=undefined){
        console.log(current.value);
      }
    });
  });
})
})
}

const searchImgs=(res,word,lang,sensitive,max)=>{
  lang=functions.formatLang2low(lang)

  const url = wdk.searchEntities({
    search: word,
    format: 'json',
    language: lang,
    limit:max
  })

  let search_items=""
  axios.get(url).then((response)=>{
    const wikidata_response=response.data;
       search_items=wikidata_response.search.map((item)=>{
          return item.id
      })

      console.log(search_items)
      const url0 = wdk.getEntities({
        ids: search_items,
        languages:[lang],
        format: 'json',
        limit: max
      })

      let current=""

      axios.get(url0).then((response)=>{
        const wiki_response=response.data;
        search_items.forEach(element => {
          current=wiki_response.entities[element].claims[IMGS]
          if(current!=undefined){
            current.forEach(element => {
              console.log(element)
            });
            
          }
        });
        /*research_items=wiki_response.search.map((item)=>{
          return item;
        })*/
        //console.log(response.data)
        //console.log("result",research_items[0])
      })
  })
}


module.exports={
    searchByName:f,
    searchById:f1,
    translations:translations,
    searchImgs:searchImgs
}

