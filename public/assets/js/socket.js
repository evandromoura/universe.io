export class Socket{
    constructor (scene){
        this.scene = scene;
        this.socket;
    }

    connect(){
        this.socket = io('http://localhost:3000',{ transports : ['websocket'] });
        
        this.socket.on('message', (message) => {
            // document.getElementById('messages').innerHTML = '<div class="alert alert-primary" role="alert">'+message+'</div>';
            console.log(message);

        });
        this.socket.on('login_success', (nickname) => {
            // document.getElementById('profile_name').innerHTML = nickname;
            // document.getElementById('button_login').style.display = 'none';
            console.log(nickname);
        });
        this.socket.on('join_success', (room) => {
            // document.getElementById('active_room').innerHTML = room;
            // document.getElementById('button_join').style.display = 'none';
            // document.getElementById('form_login').style.display = 'none';
            // start();
            console.log(room);
        });

        this.socket.on('update', (room) => {
            
            console.log('UPDATE: ',room);
        });

        this.socket.on('initialObject',(object) =>{
            console.log('entrou no callback');
            this.scene.engine.createInitialObject(object);
        })

        this.socket.emit('login',{nickname:this.scene.memory.nickname});
        this.socket.emit('join', this.scene.memory.room);
        return this;
    }
    sendUpdate(objects){
        this.socket.emit('sendupdate',objects);
    }

}    