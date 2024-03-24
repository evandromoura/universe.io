export class Socket{
    constructor (scene){
        this.scene = scene;
        this.socket;
    }

    connect(){
        this.socket = io('http://localhost:3000',{ transports : ['websocket'] });
        
        this.socket.on('message', (message) => {});

        this.socket.on('login_success', (player) => {
            this.scene.memory.player = player;
        });

        this.socket.on('join_success', (room) => {
            this.scene.memory.activeRoom = room;
        });

        this.socket.on('update', (room) => {
            this.scene.engine.drawParticles(room.particles);
        });

        this.socket.on('initialObject',(object) =>{
            this.scene.engine.createInitialObject(object);
        });

        this.socket.on('removeparticule',(uid) =>{
            this.scene.engine.deleteByUID(uid);
        });

        this.socket.on('updateplayers',(players) =>{
            //console.log('Recebeu no updateplayers',players);
             this.scene.engine.loadPlayers(players);
        });

        this.socket.on('playerleft',(socketid) =>{
             this.scene.engine.playerleft(socketid);
        });

        this.socket.emit('login',{nickname:this.scene.memory.nickname});
        this.socket.emit('join', this.scene.memory.room);
        return this;
    }

    sendUpdate(objects,room){
        this.socket.emit('sendupdate',objects,room);
    }

    eatparticle(uid,room){
        this.socket.emit('eatparticle',uid,room);
    }

}    