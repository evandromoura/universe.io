// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);



var players = [];
var rooms = [];
const bots = [];
const lobby = {};

const cfg = {
    numberOfParticles: 250,
    initialSize:100,
    bot:{
        number:10,
        size: 10,
    },
    screen:{
        width:1920,
        height:1080
    },
    speed:{min:10, max:80, factor:1000}
    
    
}

io.on('connection', socket => {
    players[socket.id] = { uid:generateUID(), socketid: socket.id, nickname: '', score: '', objects: [],isBot:false};

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

    socket.on('sendbotupdate', (bots, room) => {
        for(const bot of bots){
            const playerBot = rooms[room].players.find(player=>{player.uid === bot.uid});
            if(playerBot){
                playerBot.objects = bot.objects;
            }
        }
        socket.broadcast.to(room).emit('updateplayers', getRoom(room).players);

    });

    socket.on('eatparticle', (uid, room) => {
        deleteParticleByUID(uid, room)
        socket.broadcast.to(room).emit('removeparticule', uid);
    });

    socket.on('eatobject', (uid, room) => {
        deleteObjectByUID(uid, room);
        io.to(room).emit('removeobject', uid);
    });

    socket.on('shoot', (x,y,direction, room) => {
        io.to(room).emit('globalshoot', x,y,direction);
    });

    
    setInterval(() => {
        if(getPlayersBot('SALA_1').length > 0 ){
            socket.emit('updateplayers', getPlayersBot('SALA_1'));
        }
    }, 300);


});

function getPlayer(socketid, room) {
    if (getRoom(room) && getRoom(room).players) {
        const player = getRoom(room).players.find(obj => obj.socketid === socketid);
        return player;
    }
    return null;
}
function getPlayersBot(room) {
    if (getRoom(room) && getRoom(room).players) {
        const players = getRoom(room).players.filter(obj => obj.isBot === true);
        return players;
    }
    return null;
}
function getPlayers(room) {
    if (getRoom(room) && getRoom(room).players) {
        const players = getRoom(room).players.filter(obj => obj.isBot === false);
        return players;
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
    for(const player of getPlayers(room)){
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
        for (const room of rooms){
            let lenBot = getPlayersBot(room.name).length;
            let lenPlayer = getPlayers(room.name).length;

            if(lenBot < cfg.bot.number){
                let numBot = cfg.bot.number - lenBot;
                for(let i=0;i<numBot;i++){
                    let uid = generateUID();
                    let position = findFreePosition(room.name, cfg.bot.size);
                    if(position){

                        const bot = { socketid: uid, nickname: uid, score: '', objects: [],isBot:true}
                        bot.objects = [];
                        bot.objects.push({ uid: generateUID(), radius: cfg.initialSize, position: { x: position.x, y: position.y } });
                        room.players.push(bot);
                    }
                }
                
            }
        }
    }
    
}

function moveBot2(room) {
    
        getPlayersBot(room).forEach(bot => {
            for(const objBot of bot.objects){
                // Se não há direção definida ou se é hora de mudar a direção aleatoriamente
                if (!objBot.direction || Math.random() < 0.7) { // 10% chance de mudar de direção
                    objBot.direction = {
                        x: Math.random() * (cfg.screen.width - objBot.radius) + 1,
                        y: Math.random() * (cfg.screen.height - objBot.radius) + 1
                    };
                }
    
                let ameaca = null;
                let alvo = null;
                let distanciaMinimaAlvo = Infinity;
                let distanciaMinimaAmeaca = Infinity;
                let algumLimiteDeSegurança = 400;
    
                HUNTER:for(const player of getPlayers(room)){
                    for(const objPlayer of player.objects){
                        let dx = objBot.position.x - objPlayer.position.x;
                        let dy = objBot.position.y - objPlayer.position.y;
                        let distancia = Math.sqrt(dx * dx + dy * dy);
                        if (objPlayer.radius > objBot.radius && distancia < distanciaMinimaAmeaca) {
                            ameaca = objPlayer;
                            distanciaMinimaAmeaca = distancia;
                            break HUNTER;
                        } else if (objPlayer.radius < objBot.radius && distancia < distanciaMinimaAlvo) {
                            alvo = objPlayer;
                            distanciaMinimaAlvo = distancia;
                            break HUNTER;
                        }
                    }
                }
                
                let direcao = objBot.direction;
    
                if (ameaca && distanciaMinimaAmeaca < algumLimiteDeSegurança) {
                    // Fuga da ameaça
                    direcao.x = objBot.position.x - ameaca.position.x;
                    direcao.y = objBot.position.y - ameaca.position.y;
                    const norma = Math.sqrt(direcao.x * direcao.x + direcao.y * direcao.y);
                    direcao.x /= norma;
                    direcao.y /= norma;
        
                    let speed = 10; // Ajuste a velocidade conforme necessário
                    objBot.position.x += direcao.x * speed;
                    objBot.position.y += direcao.y * speed;
        
                    // Certifique-se de que o bot não saia dos limites do mapa
                    objBot.position.x = Math.max(0, Math.min(objBot.position.x, getRoom(room).cols));
                    objBot.position.y = Math.max(0, Math.min(objBot.position.y, getRoom(room).rows));
                    objBot.direction = {
                        x: direcao.x,
                        y: direcao.y
                    };
                } else if (alvo) {
                    // Perseguir alvo

                    let dxMouse = alvo.position.x - objBot.position.x;
                    let dyMouse = alvo.y - objBot.position.y;
                    let distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
                    let normDxMouse = dxMouse / distMouse;
                    let normDyMouse = dyMouse / distMouse;
                    let speed = 10 * (10 / objBot.radius); 
                    speed = Math.max(cfg.speed.min,speed, cfg.speed.max);
                    
                    direcao.x = normDxMouse * speed;
                    direcao.y = normDyMouse * speed;
                    objBot.direction = {
                        x: direcao.x,
                        y: direcao.y
                    };
                    
                }
                
            }    
        });

}
function moveBot(room) {
    getPlayersBot(room).forEach(bot => {
        bot.objects.forEach(objBot => {
            // Se não há direção definida ou se é hora de mudar a direção aleatoriamente
            if (!objBot.direction || Math.random() < 0.05) { // Reduz a chance de mudança abrupta de direção
                let angle = Math.random() * Math.PI * 2; // Ângulo aleatório em radianos
                objBot.direction = {
                    x: Math.cos(angle), // Direção X baseada no ângulo
                    y: Math.sin(angle)  // Direção Y baseada no ângulo
                };
            }

            

            let speed = 10 * (10 / objBot.radius); // Velocidade inversamente proporcional ao tamanho do bot
            speed = Math.max(cfg.speed.min, Math.min(speed, cfg.speed.max)); // Limita a velocidade entre os valores min e max definidos

            // Calcula a nova posição com base na direção e velocidade
            objBot.position.x += objBot.direction.x * speed;
            objBot.position.y += objBot.direction.y * speed;

            // Certifique-se de que o bot não saia dos limites do mapa
            objBot.position.x = Math.max(0, Math.min(objBot.position.x, getRoom(room).cols - objBot.radius));
            objBot.position.y = Math.max(0, Math.min(objBot.position.y, getRoom(room).rows - objBot.radius));

            if (objBot.position.x <= 0 || objBot.position.x >= getRoom(room).cols) {
                objBot.direction.x *= -1; // Inverte a direção X
            }
            if (objBot.position.y <= 0 || objBot.position.y >= getRoom(room).rows) {
                objBot.direction.y *= -1; // Inverte a direção Y
            }
            // Agora, ajuste a direção com base em alvos e ameaças
            let direcaoAlvoOuAmeaca = ajustarDirecaoBaseadaEmAlvosEAmeacas(objBot, room);
            if (direcaoAlvoOuAmeaca) {
                objBot.direction = direcaoAlvoOuAmeaca;
            }
        });
    });
}

function ajustarDirecaoBaseadaEmAlvosEAmeacas(objBot, room) {
    let ameacaMaisProxima = null;
    let alvoMaisProximo = null;
    let distanciaMinimaAmeaca = Infinity;
    let distanciaMinimaAlvo = Infinity;
    const algumLimiteDeSegurança = 400; // Define um limite de segurança para começar a fugir

    // Itera por todos os jogadores para encontrar alvos e ameaças
    getPlayers(room).forEach(player => {
        player.objects.forEach(objPlayer => {
            let dx = objBot.position.x - objPlayer.position.x;
            let dy = objBot.position.y - objPlayer.position.y;
            let distancia = Math.sqrt(dx * dx + dy * dy);

            if (objPlayer.radius > objBot.radius && distancia < distanciaMinimaAmeaca) {
                // Encontrou uma ameaça mais próxima
                ameacaMaisProxima = objPlayer;
                distanciaMinimaAmeaca = distancia;
            } else if (objPlayer.radius < objBot.radius && distancia < distanciaMinimaAlvo) {
                // Encontrou um alvo mais próximo
                alvoMaisProximo = objPlayer;
                distanciaMinimaAlvo = distancia;
            }
        });
    });

    if (ameacaMaisProxima && distanciaMinimaAmeaca < algumLimiteDeSegurança) {
        // Fuga da ameaça
        let direcaoX = objBot.position.x - ameacaMaisProxima.position.x;
        let direcaoY = objBot.position.y - ameacaMaisProxima.position.y;
        return normalizarDirecao(direcaoX, direcaoY);
    } else if (alvoMaisProximo) {
        // Perseguir alvo
        let direcaoX = alvoMaisProximo.position.x - objBot.position.x;
        let direcaoY = alvoMaisProximo.position.y - objBot.position.y;
        return normalizarDirecao(direcaoX, direcaoY);
    }

    // Não há necessidade de ajustar a direção
    return null;
}

function normalizarDirecao(direcaoX, direcaoY) {
    const norma = Math.sqrt(direcaoX * direcaoX + direcaoY * direcaoY);
    return {
        x: direcaoX / norma,
        y: direcaoY / norma
    };
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