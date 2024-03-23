export class Memory{
    constructor ()
    {
        this.nickname = "";
        this.room = "";
        this.objects = [];    
        this.particules = [];
        this.oponnents = [];
        this.target = {x:0,y:0};
        this.coolDownZoom = 0;
        this.lastUpdate = new Date();
    }

    
}
