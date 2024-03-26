export class Memory{
    constructor ()
    {
        this.player = {};            
        this.players = [];
        this.activeRoom = "";
        this.nickname = "";
        this.room = "";
        this.objects = [];
        this.particles = [];
        this.target = {x:0,y:0};
        this.coolDownZoom = 0;
        this.lastUpdate = new Date();
        this.lastUpdateBot = new Date();
    }

    
}
