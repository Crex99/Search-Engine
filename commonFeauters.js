

const f=(searchedWord,sensitive,scoveredWord)=>{
    if(sensitive==true){
        if(scoveredWord.includes(searchedWord)){
            return true;
        }else{
            return false;
        }
    }else{
        return true;
    }
}

const f1=(w)=>{
    let array=w.split(" ");
    return array.map((element)=>{
        return element[0].toUpperCase()+element.slice(1,element.length);
    }).join(" ");
    }

    const f2=(l)=>{
        let out=l.toLowerCase();
        out=l[0]+l[1];
        return out;
      }

      const f3=(w)=>{
          return w.toLowerCase();
      }

      const f4=(l)=>{
        out=l[0]+l[1];
        return out.toUpperCase();
      }


module.exports={
    control:f,
    formatWord:f1,
    formatLang2low:f2,
    formatLang2High:f4,
    formatWordConcept:f3
}