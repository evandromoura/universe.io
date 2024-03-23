export class Socket{
    constructor (scene){
        this.scene = scene;
        this.socket;
    }

    connect(){
        this.socket = io('http://localhost:3000',{ transports : ['websocket'] });
        
        this.socket.on('message', (message) => {
            
            console.log(message);

        });
        this.socket.on('login_success', (nickname) => {
            
            console.log(nickname);
        });
        this.socket.on('join_success', (room) => {
            
            console.log(room);
        });

        this.socket.on('update', (room) => {
            console.log('ROOM',room.particules);
            this.scene.engine.drawParticles(room.particules);
            console.log('UPDATE: ',room);
        });

        this.socket.on('initialObject',(object) =>{
            console.log('entrou no callback');
            //this.scene.engine.createInitialObject(object);
        })

        this.socket.emit('login',{nickname:this.scene.memory.nickname});
        this.socket.emit('join', this.scene.memory.room);
        return this;
    }
    sendUpdate(objects){
        this.socket.emit('sendupdate',objects);
    }

}    