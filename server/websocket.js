// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

var players = {};
var rooms = {};
const lobby = {};

const cfg = {
    numberOfParticles: 250,
}

io.on('connection', socket => {
    players[socket.id] = { socketid: socket.id, nickname: '', score: '', objects: [] };

    socket.on('login', (login) => {
        players[socket.id].nickname = login.nickname;
        socket.emit('login_success', players[socket.id]);
    })

    socket.on('join', (room) => {
        socket.join(room);
        if(rooms[room] && rooms[room].players){
            rooms[room].players.push(players[socket.id]);
            const player = getPlayer(socket.id, room);
            player.objects = [];
            player.activeRoom = room;
            player.objects.push({ socketid: socket.id, uid: generateUID(), radius: 100, position: { x: 400, y: 400 } });
            io.to(room).emit('message', player.nickname + ' is online');
            socket.emit('join_success', room);
            socket.emit('update', rooms[room]);
            socket.emit('initialObject', player.objects[0]);
        }
    });

    socket.on('disconnect', () => {
        let socketid = socket.id;
        let room = players[socket.id].activeRoom;
        if (room) {
            let index = rooms[room].players.findIndex(obj => obj.socketid === socket.id);
            rooms[room].players.splice(index,1);
            io.to(room).emit('playerleft',socketid);
        }
        delete players[socket.id];
    });

    socket.on('sendupdate', (objects, room) => {
        if (socket && rooms[room] && rooms[room].players) {
            for(const player of rooms[room].players){
                if(player.socketid === socket.id){
                    player.objects = objects;    
                    break;
                }
            }
            socket.broadcast.to(room).emit('updateplayers', rooms[room].players);
        }
    });

    socket.on('eatparticle', (uid, room) => {
        deleteParticleByUID(uid, room)
        socket.broadcast.to(room).emit('removeparticule', uid);
    });

    socket.on('eatobject', (uid, room) => {
        deleteObjectByUID(uid, room);
        socket.broadcast.to(room).emit('removeobject', uid);
    });

    socket.on('shoot', (x,y,direction, room) => {
        io.to(room).emit('globalshoot', x,y,direction);
    });


});

function getPlayer(socketid, room) {
    if (rooms[room] && rooms[room].players) {
        const player = rooms[room].players.find(obj => obj.socketid === socketid);
        return player;
    }
    return null;
}

function findByUID(uid, room) {
    return rooms[room].particles.find(obj => obj.uid === uid);
}

function deleteParticleByUID(uid, room) {
    let index = rooms[room].particles.findIndex(obj => obj.uid === uid);
    if (index !== -1) {
        rooms[room].particles.splice(index, 1);
    }
}

function deleteObjectByUID(uid, room) {
    for(const player of rooms[room].players){
        let index = player.objects.findIndex(obj => obj.uid === uid);
        if (index !== -1) {
            player.objects.splice(index, 1);
            break;
        }
    }
    
}

init = () => {
    initRooms();
}

initRooms = () => {
    rooms['SALA_1'] = { name: 'SALA_1', cols: 1920, rows: 1080, particles: [],fragments: [], traps: [], players: [] };
    for (let i = 0; i < cfg.numberOfParticles; i++) {
        generateParticles(rooms['SALA_1']);
    }
}

function generateParticles(room) {
    let validPosition, x, y;
    do {
        validPosition = true;
        x = Math.random() * room.cols;
        y = Math.random() * room.rows;
        for (let player of room.players) {
            let distance = Math.sqrt((player.position.x - x) ** 2 + (player.position.y - y) ** 2);
            if (distance < player.radius + 10) {
                validPosition = false;
                break;
            }
        }
    } while (!validPosition);
    room.particles.push({ x, y, radius: 1, color: 'red', uid: generateUID() });
}

function generateUID(length = 6) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}



init();
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
