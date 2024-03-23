export class Util{
    constructor ()
    {
        this.super();
    }

    static getUrlParameter(name){
        let url = window.location.href;
        let urlParams = new URLSearchParams(new URL(url).search);
        return urlParams.get(name);
    }

    
}
