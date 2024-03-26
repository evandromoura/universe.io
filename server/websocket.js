// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const Bot = require('./bot.js');

var players = {};
var rooms = [];
const bots = [];
const lobby = {};

const cfg = {
    numberOfParticles: 250,
    initialSize:100,
    bot:{
        number:10,
        size: 10,
    }
    
    
}

io.on('connection', socket => {
    players[socket.id] = { socketid: socket.id, nickname: '', score: '', objects: [] };

    socket.on('login', (login) => {
        players[socket.id].nickname = login.nickname;
        socket.emit('login_success', players[socket.id]);
    })

    socket.on('join', (room) => {
        socket.join(room);
        if(getRoom(room) && getRoom(room).players){
            getRoom(room).players.push(players[socket.id]);
            const player = getPlayer(socket.id, room);
            player.objects = [];
            player.activeRoom = room;
            let position = findFreePosition(room, cfg.initialSize);
            if(position){
                player.objects.push({ socketid: socket.id, uid: generateUID(), radius: cfg.initialSize, position: { x: position.x, y: position.y } });
                io.to(room).emit('message', player.nickname + ' is online');
                socket.emit('join_success', room);
                socket.emit('update', getRoom(room));
                socket.emit('initialObject', player.objects[0]);
            }
        }
    });

    socket.on('disconnect', () => {
        let socketid = socket.id;
        let room = players[socket.id].activeRoom;
        if (room) {
            let index = getRoom(room).players.findIndex(obj => obj.socketid === socket.id);
            getRoom(room).players.splice(index,1);
            io.to(room).emit('playerleft',socketid);
        }
        delete players[socket.id];
    });

    socket.on('sendupdate', (objects, room) => {
        if (socket && getRoom(room) && getRoom(room).players) {
            for(const player of getRoom(room).players){
                if(player.socketid === socket.id){
                    player.objects = objects;    
                    break;
                }
            }
            socket.broadcast.to(room).emit('updateplayers', getRoom(room).players);
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

    setInterval(() => {
        socket.emit('updatebots', getRoom('SALA_1').bots);
    }, 1000);


});

function getPlayer(socketid, room) {
    if (getRoom(room) && getRoom(room).players) {
        const player = getRoom(room).players.find(obj => obj.socketid === socketid);
        return player;
    }
    return null;
}

function findByUID(uid, room) {
    return getRoom(room).particles.find(obj => obj.uid === uid);
}

function deleteParticleByUID(uid, room) {
    let index = getRoom(room).particles.findIndex(obj => obj.uid === uid);
    if (index !== -1) {
        getRoom(room).particles.splice(index, 1);
    }
}

function deleteObjectByUID(uid, room) {
    for(const player of getRoom(room).players){
        let index = player.objects.findIndex(obj => obj.uid === uid);
        if (index !== -1) {
            player.objects.splice(index, 1);
            break;
        }
    }
    
}

function init(){
    initRooms();
}

function initRooms(){
    rooms.push({ name: 'SALA_1', cols: 1920, rows: 1080,limit:50, particles: [],fragments: [], traps: [], players: [],bots: [] });
    for (let i = 0; i < cfg.numberOfParticles; i++) {
        generateParticles(getRoom('SALA_1'));
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
function createBots(){
    if(rooms){
        console.log(rooms);
        for (const room of rooms){

            if(room.bots.length < cfg.bot.number && 
                    room.players.length + room.bots.length < room.limit){
    
                let numBot = cfg.bot.number - room.bots.length;
                for(let i=0;i<numBot;i++){
                    let uid = generateUID();
                    let position = findFreePosition(room.name, cfg.bot.size);
                    if(position){
                        const bot = new Bot(uid,uid);
                        bot.objects = [];
                        bot.objects.push({ uid: generateUID(), radius: cfg.initialSize, position: { x: position.x, y: position.y } });
                        room.bots.push(bot);
                    }
                }
                
            }
        }
    }
    
}

function moveBot(room) {
    getRoom(room).bots.forEach(bot => {
        for(const objBot of bot.objects){
            // Se não há direção definida ou se é hora de mudar a direção aleatoriamente
            if (!objBot.direction || Math.random() < 0.7) { // 10% chance de mudar de direção
                objBot.direction = {
                    x: Math.random() * 2 - 1, // Gera um número entre -1 e 1
                    y: Math.random() * 2 - 1
                };
            }

            let ameaca = null;
            let alvo = null;
            let distanciaMinimaAlvo = Infinity;
            let distanciaMinimaAmeaca = Infinity;
            let algumLimiteDeSegurança = 20;

            for(const player of getRoom(room).players){
                for(const objPlayer of player.objects){
                    let dx = objBot.position.x - objPlayer.position.x;
                    let dy = objBot.position.y - objPlayer.position.y;
                    let distancia = Math.sqrt(dx * dx + dy * dy);
                    if (objPlayer.radius > objBot.radius && distancia < distanciaMinimaAmeaca) {
                        ameaca = objPlayer;
                        distanciaMinimaAmeaca = distancia;
                    } else if (objPlayer.radius < objBot.radius && distancia < distanciaMinimaAlvo) {
                        alvo = objPlayer;
                        distanciaMinimaAlvo = distancia;
                    }
                }
            }

            let direcao = objBot.direction;

            if (ameaca && distanciaMinimaAmeaca < algumLimiteDeSegurança) {
                // Fuga da ameaça
                direcao.x = objBot.position.x - ameaca.position.x;
                direcao.y = objBot.position.y - ameaca.position.y;
            } else if (alvo) {
                // Perseguir alvo
                direcao.x = alvo.position.x - objBot.position.x;
                direcao.y = alvo.position.y - objBot.position.y;
            }

            const norma = Math.sqrt(direcao.x * direcao.x + direcao.y * direcao.y);
            direcao.x /= norma;
            direcao.y /= norma;

            let speed = 10; // Ajuste a velocidade conforme necessário
            objBot.position.x += direcao.x * speed;
            objBot.position.y += direcao.y * speed;

            // Certifique-se de que o bot não saia dos limites do mapa
            objBot.position.x = Math.max(0, Math.min(objBot.position.x, getRoom(room).cols));
            objBot.position.y = Math.max(0, Math.min(objBot.position.y, getRoom(room).rows));
        }    
    });
}
function findFreePosition(room, radius) {
    const maxAttempts = 100; // Limite de tentativas para encontrar uma posição livre
    let attempts = 0;

    while (attempts < maxAttempts) {
        // Gera uma posição aleatória dentro dos limites do mapa
        const x = Math.random() * getRoom(room).cols;
        const y = Math.random() * getRoom(room).rows;

        
        if (isPositionFree(x, y, radius, room)) {
            return { x, y }; 
        }

        attempts++;
    }
    return null;
}
function isPositionFree(x, y, radius, room) {
    for (const player of getRoom(room).players) {
        for (const obj of player.objects) {
            const distance = Math.sqrt(Math.pow(obj.position.x - x, 2) + Math.pow(obj.position.y - y, 2));
            
            if (distance < (obj.radius + radius)) {
                return false; 
            }
        }
    }
    return true;
}

function getRoom(room){
    if(rooms){
        for(let roomIt of rooms){
            if(roomIt.name === room){
                return roomIt;
            }
        }
    }
    return null;    
}   

init();
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

setInterval(() => {
    createBots();
    moveBot('SALA_1');
}, 5000);