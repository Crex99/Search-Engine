const trad=class Trad{
    constructor(lang,content){
        this.lang=lang,
        this.content=content
    }

    getlang(){
        return this.lang
    }

    setLang(lang){
        this.lang=lang
    }

    getContent(){
        return this.content
    }

    setContent(content){
        this.content=content
    }


}

module.exports=trad