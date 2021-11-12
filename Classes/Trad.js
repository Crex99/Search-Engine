const trad = class Trad {
    constructor(lang, content, category) {
        this.lang = lang
        this.content = content
        this.category = category
    }

    getlang() {
        return this.lang
    }

    setLang(lang) {
        this.lang = lang
    }

    getContent() {
        return this.content
    }

    setContent(content) {
        this.content = content
    }


}

module.exports = trad