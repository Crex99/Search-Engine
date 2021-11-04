const Trad=require("./Trad")

const response=class Response{
    constructor(){
        this.trads=[]
        this.imgs=[]
    }

    getTrads(){
        return this.trads;
    }

    getImgs(){
        return this.imgs;
    }

    addImg(img){
        this.imgs.push(img)
    }

    addTrad(trad){
        this.trads.push(trad);
    }

    addImgs(imgs){
        this.imgs=this.imgs.concat(imgs);
    }

    addTrads(trads){
        if(this.trads.length==1){
            
            this.trads=trads
        }else{
            this.trads=this.trads.concat(trads);
        }
    }
}

module.exports=response;