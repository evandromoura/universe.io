const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const Room = require('./entity/room.js');



var players = [];
var rooms = [];


io.on('connection', socket => {
    players[socket.id] = { uid:generateUID(), socketid: socket.id, nickname: '', score: '', objects: [],isBot:false};

    socket.on('login', (login) => {
        players[socket.id].nickname = login.nickname;
        socket.emit('login_success', players[socket.id]);
    })
});

function initRooms(){
    rooms.push(new Room(('ROOM_1','ROOM 1',30,6000)));
    rooms.push(new Room(('ROOM_2','ROOM 2',30,6000)));
    rooms.push(new Room(('ROOM_3','ROOM 3',30,6000)));
    rooms.push(new Room(('ROOM_4','ROOM 4',30,6000)));
}
initRooms();


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
