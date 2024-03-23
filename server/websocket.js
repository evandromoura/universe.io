// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const players = {}; 
const rooms = {};
const lobby = {};

io.on('connection', socket => {
    console.log(socket.id + '  CONECTOU');
    players[socket.id] = {nickname:'',score:'',socket:socket,objects:[]};

    socket.on('login',(login)=>{
        players[socket.id].nickname = login.nickname;
        socket.emit('login_success',login.nickname);
    })

    socket.on('join', (room) => {
        socket.join(room);
        rooms[room].players[socket.id] = players[socket.id];
        players[socket.id].activeRoom = room;
        rooms[room].players[socket.id].objects = [];
        rooms[room].players[socket.id].objects[0] = {position : { x: 400, y: 400 , radius:0}};
        socket.emit('initialObject',rooms[room].players[socket.id].objects[0]);
        io.to(room).emit('message',players[socket.id].nickname+' is online');
        socket.emit('join_success',room);
        console.log('ENTROU NA SALA COM '+Object.keys(rooms[room].players).length);
        io.to(room).emit('update',rooms[room]);
    });

    socket.on('disconnect', () => {
        if(players[socket.id].activeRoom){
            delete rooms[players[socket.id].activeRoom].players[socket.id];
        }
        delete players[socket.id];
    });

    socket.on('move', () => {
        if(players[socket.id].activeRoom){
            delete rooms[players[socket.id].activeRoom].players[socket.id];
        }
        delete players[socket.id];
    });

    socket.on('sendupdate', (objects) => {
        players[socket.id].objects = objects;
        //broadcastRoom(room);
        //console.log(JSON.stringify(objects));
    });

    
});

function broadcastRoom(room){
    io.to(room).emit('update',rooms[room]);
}
init = ()=>{
    initRooms();
}

initRooms = ()=>{
    rooms['SALA_1'] = {name:'SALA_1',cols: 800,rows:800,particules:[],traps:[],players:[]};
    for (let i = 0; i < 50; i++) {
        generateParticules(rooms['SALA_1']);
    }
    console.log(rooms['SALA_1'].particules);
}

function generateParticules(room) {
    let validPosition, x, y;
    do {
        validPosition = true;
        x = Math.random() * room.cols;
        y = Math.random() * room.rows;
        for (let player of room.players) {
            let distance = Math.sqrt((player.position.x - x) ** 2 + (player.position.y - y) ** 2);
            if (distance < player.position.radius + 10) { // 10 é um buffer para garantir que não está muito perto
                validPosition = false;
                break;
            }
        }
    } while (!validPosition);
    room.particules.push({ x, y, radius: 5 ,color:'red'});
}



init();
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
