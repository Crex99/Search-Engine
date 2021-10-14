

const f=(searchedWord,sensitive,scoveredWord)=>{
    if(sensitive==true){
        console.log(searchedWord);
        console.log(scoveredWord);
        let result=searchedWord===scoveredWord;
        console.log("result",result)
        if(searchedWord===scoveredWord){
            console.log("true");
            return true;
        }else{
            console.log("false");
            return false;
        }
    }else{
        console.log("true")
        return true;
    }
}


module.exports={
    control:f,
}