export class Engine{
    constructor (scene)
    {
        this.scene = scene;
    }

    init(){
        this.scene.memory.objects = [];
        this.scene.memory.players = [];
        this.scene.memory.particles = [];
        let obj = {position:{x:300,y:500,radius:34}};
        const particlesG = this.scene.add.particles('flares', {
            frame: [ 'red', 'yellow', 'green' ],
            lifespan: -1,
            speed: 0
        });
    }
    createScenario(){
        this.scene.add.image(0, 0, 'bg').setOrigin(0, 0).setDisplaySize(this.scene.cfg.graph.window.width, this.scene.cfg.graph.window.height);
        this.scene.physics.world.setBounds(0, 0, this.scene.cfg.graph.scene.width, this.scene.cfg.graph.scene.height);
    }
    createInitialObject(object){
        
        this.scene.memory.objects.push(this.createObject(object.position.x,object.position.y,object.radius,this.scene.cfg.cooldown,this.scene.memory.nickname,object.socketid,object.uid));
        

    }
    createInitialParticules(x,y,radius,coolDown){
        this.scene.memory.particles = [];
        this.createParticles(this.scene.cfg.numberOfParticles);
    }
    createObject(x,y,radius,coolDown,name,socketid,uid){
        const obj1 = this.scene.physics.add.sprite(x, y, 'gem');
        obj1.setCollideWorldBounds(true);
        obj1.setDisplaySize(radius, radius);
        obj1.body.setSize(radius, radius,true);
        let offsetX = (obj1.width - radius) / 2;
        let offsetY = (obj1.height - radius) / 2;
        obj1.body.setCircle(radius / 2,offsetX,offsetY);
        obj1.body.onWorldBounds = true;
        
        obj1.coolDown = coolDown;
        obj1.coolDownSpeed = 0;
        obj1.radius = radius;
        obj1.uid = uid;
        obj1.socketid = socketid;
        obj1.object = {socketid:socketid, uid: uid, radius: radius, position: { x: x, y: y } };
        obj1.bitmapText =  this.scene.add.bitmapText(x, y, 'atari', name, 5).setOrigin(0.5);
        obj1.bitmapScore =  this.scene.add.bitmapText(x, y, 'atari', obj1.radius, 5).setOrigin(0.5,3);
        return obj1;
    }
    createObjectPlayer(x,y,radius,name,socketid,uid){
        const objP = this.scene.physics.add.sprite(x, y, 'gem');
        objP.setCollideWorldBounds(true);
        objP.setDisplaySize(radius, radius);
        objP.body.setSize(radius, radius,true);
        let offsetX = (objP.width - radius) / 2;
        let offsetY = (objP.height - radius) / 2;
        objP.body.setCircle(radius / 2,offsetX,offsetY);
        objP.body.onWorldBounds = true;
        
        
        objP.coolDownSpeed = 0;
        objP.radius = radius;
        objP.uid = uid;
        objP.socketid = socketid;
        objP.object = {socketid:socketid, uid: uid, radius: radius, position: { x: x, y: y } };
        objP.bitmapText =  this.scene.add.bitmapText(x, y, 'atari', name, 5).setOrigin(0.5);
        objP.bitmapScore =  this.scene.add.bitmapText(x, y, 'atari', objP.radius, 5).setOrigin(0.5,3);
        return objP;
    }
    moveObjects(){
            const MAGNETIC_CONSTANT = 0.55; 
            const MOUSE_ATTRACTION_SPEED = 10; 
            let target = this.scene.memory.target; 
            let objects = this.scene.memory.objects;
        
            objects.forEach((obj1, index) => {
                if(obj1.coolDownSpeed == 0){
                    let dxMouse = target.x - obj1.x;
                    let dyMouse = target.y - obj1.y;
                    let distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
                    let normDxMouse = dxMouse / distMouse;
                    let normDyMouse = dyMouse / distMouse;
                    let speed = MOUSE_ATTRACTION_SPEED * (300 / obj1.radius); 
                    speed = Phaser.Math.Clamp(speed, this.scene.cfg.speed.min, this.scene.cfg.speed.max);
                    if(obj1.body && obj1.body.velocity){
                        obj1.body.velocity.x = normDxMouse * speed;
                        obj1.body.velocity.y = normDyMouse * speed;
                    }
                }
            });
    }
    updateText(){
        if(this.scene.memory.objects.length > 0){
            for (const object of this.scene.memory.objects){
                object.object.x = object.x;
                object.object.y = object.y;
                object.object.radius = object.radius;

                object.bitmapText.x = object.x;
                object.bitmapText.y = object.y;
                
                object.bitmapScore.x = object.x;
                object.bitmapScore.y = object.y;
    
                let fontSize = object.radius / 10; 
                let fontSizeScore = object.radius / 10;
                //console.log('font size:', fontSize);
                object.bitmapText.setFontSize(fontSize < 0?1:fontSize);
                object.bitmapScore.setFontSize(fontSizeScore < 0?1:fontSizeScore);
                if(object.radius && object.bitmapScore){
                    object.bitmapScore.setText(object.radius.toFixed(2));
                }
                
            }
        }
    }
    updateTextPlayers(){
        //AQUI
        if(this.scene.memory.players.length > 0){
            this.scene.memory.players.forEach(player =>{
                for (const object of player.objectsPlayer){
                    object.bitmapText.x = object.x;
                    object.bitmapText.y = object.y;
                    
                    object.bitmapScore.x = object.x;
                    object.bitmapScore.y = object.y;
        
                    let fontSize = object.radius / 10; 
                    let fontSizeScore = object.radius / 10;
                    object.bitmapText.setFontSize(fontSize);
                    object.bitmapScore.setFontSize(fontSizeScore);
                    object.bitmapScore.setText(object.radius.toFixed(2));
                }

            })
            
        }
    }
    zoom() {
        const objects = this.scene.memory.objects;
        if (objects.length === 0) {
            this.scene.cameras.main.setZoom(1);
            return;
        }
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        // Encontra os limites englobando todos os objetos
        objects.forEach(object => {
            minX = Math.min(minX, object.x - object.displayWidth / 2);
            maxX = Math.max(maxX, object.x + object.displayWidth / 2);
            minY = Math.min(minY, object.y - object.displayHeight / 2);
            maxY = Math.max(maxY, object.y + object.displayHeight / 2);
        });

        // Calcula o centro e o tamanho da área que engloba todos os objetos
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const width = maxX - minX;
        const height = maxY - minY;

        // Define os limites de zoom e o fator de ajuste fino
        const minZoom = 0.5; // Zoom máximo (mais afastado, mostra mais do mapa)
        const maxZoom = 5.0; // Zoom mínimo (mais próximo, mostra menos do mapa)
        const zoomAdjustmentFactor = 0.5; // Fator de ajuste para adicionar uma margem

        // Determina o nível de zoom necessário para que todos os objetos caibam na tela
        const zoomX = this.scene.cameras.main.width / width;
        const zoomY = this.scene.cameras.main.height / height;
        let zoomLevel = Math.min(zoomX, zoomY) * zoomAdjustmentFactor;

        // Aplica os limites de zoom
        zoomLevel = Phaser.Math.Clamp(zoomLevel, minZoom, maxZoom);

        // Aplica o zoom e centraliza a câmera nos objetos
        if(zoomLevel){
            this.scene.cameras.main.setZoom(zoomLevel);
            this.scene.cameras.main.centerOn(centerX, centerY);
        }else{
            this.scene.cameras.main.setZoom(2);
        }
    }
    
    checkCollisions() {
        if(this.scene.memory.objects.length > 0){
            let objects = this.scene.memory.objects;
            for (let i = 0; i < objects.length; i++) {
                if(objects[i].coolDown > 0 && objects[i].coolDownSpeed == 0){
                    for (let j = i + 1; j < objects.length; j++) {
                        if(objects[j].coolDown > 0){
                            let obj1 = objects[i];
                            let obj2 = objects[j];
                            let dx = obj2.x - obj1.x;
                            let dy = obj2.y - obj1.y;
                            let distance = Math.sqrt(dx * dx + dy * dy);
                            
                            let minDistance = obj1.radius /4;
                            if (distance < minDistance) {
                            
                                let overlap = minDistance - distance;
                
                                // Calcula a direção do ajuste
                                let adjustX = (dx / distance) * overlap / 2; // Divide por 2 para ajustar ambos objetos igualmente
                                let adjustY = (dy / distance) * overlap / 2;
                
                                // Aplica o ajuste nos objetos para resolver a sobreposição
                                obj1.x -= adjustX;
                                obj1.y -= adjustY;
                                obj2.x += adjustX;
                                obj2.y += adjustY;
                            }
                        }    
                    }
                }
                
            }
        }
        
    }
    checkColisionObjects(){
        if(this.scene.memory.objects.length > 0){
            


           
            this.scene.memory.objects.forEach((obj, index) =>{
                if(obj.coolDown == 0){
                    this.scene.memory.objects.forEach((objRival, indexR) =>{
                        if(objRival.coolDown == 0){
                            if(obj != objRival){
                                if (this.objectOverlapsParticle(obj, objRival)) {
                                    console.log('Entrou no cooldown Colisions');
                                    obj.radius += objRival.radius;
                                    this.updateSpriteSizeEat(obj,500);
                                    objRival.bitmapText.destroy();
                                    objRival.bitmapScore.destroy();
                                    objRival.destroy();
                                    this.scene.memory.objects.splice(indexR,1);
                                }
                            }
                        }
                    });
                }
            });
        }            
    }
    checkColisionParticules(){
        if(this.scene.memory.particles){
            this.scene.memory.particles.forEach((particle,index)=>{
                for (const obj of this.scene.memory.objects){
                    if (this.objectOverlapsParticle(obj, particle)) {
                        obj.radius += particle.radius / (obj.radius); 
                        //obj.radius += particle.radius; 
                        this.updateSpriteSizeEat(obj,10);
                        this.scene.socket.eatparticle(particle.uid,this.scene.memory.activeRoom);
                        particle.destroy();
                        this.scene.memory.particles.splice(index,1);
                    }
                }
            });
        }    
    }
    updateSpriteSizeEat(obj,duration){
        obj.setDisplaySize(obj.radius, obj.radius);
        if(obj.body){
            obj.body.setSize(obj.radius, obj.radius,true);
            let offsetX = (obj.width - obj.radius) / 2;
            let offsetY = (obj.height - obj.radius) / 2;
            obj.body.setCircle(obj.radius / 2,offsetX,offsetY);
        }
    }  
    createParticles(numberOfParticles) {
        for (let i = 0; i < numberOfParticles; i++) {
            var particle =  this.scene.physics.add.sprite(
                Phaser.Math.Between(0, this.scene.physics.world.bounds.width),
                Phaser.Math.Between(0, this.scene.physics.world.bounds.height),'flares');
                particle.radius = 50;
                this.scene.memory.particles.push(particle);
        }            
    }
    loadPlayers(players){
        if(players){
            let findPlayer = false; 
            let findObject = false;
            let findObjectMemory = false;
            for (const player of players){
                if(player.socketid !== this.scene.memory.player.socketid){
                    for(const playerMemory of this.scene.memory.players){
                        if(player.socketid === playerMemory.socketid){
                            findPlayer = true;
                            for(const object of player.objects){
                                if(playerMemory.objectsPlayer){
                                    for( const objectMemory of playerMemory.objectsPlayer){
                                        if(object.uid === objectMemory.uid){
                                            console.log('ENTROIUY NO ULTIMO IF',object);
                                            findObject = true;
                                            objectMemory.x = object.x;
                                            objectMemory.y = object.y;
                                            objectMemory.radius = object.radius;
                                            this.updateSpriteSizeEat(objectMemory,10);
                                        }
                                    }
                                    
                                }
                                if(!findObject){
                                    playerMemory.objectsPlayer.push(this.createObjectPlayer(
                                        object.x,object.y,object.radius,player.nickname,object.socketid,object.uid
                                    ));
                                }else{
                                    findObject = false;
                                }
                            }
                            for(const objectMemory of playerMemory.objectsPlayer){
                                findObjectMemory = false;
                                for(const object of player.objects){
                                    if(object.uid === objectMemory.uid){
                                        findObjectMemory = true;
                                    }
                                }
                                if(!findObjectMemory){
                                    objectMemory.bitmapText.destroy();
                                    objectMemory.bitmapScore.destroy();
                                    objectMemory.destroy();
                                }
                            }

                        }
                    }
                    if(!findPlayer){
                        player.objectsPlayer = [];
                        for(const object of player.objects){
                            player.objectsPlayer.push(this.createObjectPlayer(
                                object.x,object.y,object.radius,player.nickname,object.socketid,object.uid
                            ));
                        }
                        this.scene.memory.players.push(player);
                    }else{
                        findPlayer = false;
                    }
                    
                }
            }   

        }    
   
    }
    playerleft(socketid){
        for(let i = 0; i < this.scene.memory.players.length;i++){
            if(this.scene.memory.players[i].socketid === socketid){
                console.log('Morreu com esses objetos');
                console.log(this.scene.memory.players[i].objectsPlayer);
                const objectsToDestroy = this.scene.memory.players[i].objectsPlayer.slice();
                objectsToDestroy.forEach(object => {
                    this.scene.graphics.explode(object.x,object.y);
                    object.bitmapText.destroy();
                    object.bitmapScore.destroy();
                    object.destroy();
                });
                
                console.log('terminou com esses');
                console.log(this.scene.memory.players[i].objectsPlayer);
                //this.scene.memory.players[i].objectsPlayer.destroy(true);
                this.scene.memory.players.splice(i,1);
                //break;
            }
        }
    }
    getObjectPlayer(uid){
        if(this.scene.memory.players){
            return this.scene.memory.players.find(player => player.uid === uid);
        }else{
            return null;
        }
    }
    drawParticles(particles) {
        //this.scene.memory.particles = [];
        particles.forEach(particleIt=>{
            if(!this.scene.memory.particles.find(particle=>{particle.uid === particleIt.uid})){
                var particle =  this.scene.add.image(particleIt.x, particleIt.y,'flares');
                particle.radius = particleIt.radius;
                particle.uid = particleIt.uid;
                this.scene.memory.particles.push(particle);
            }  
        });
    }
    objectOverlapsParticle(circle, particle) {
        const dx = circle.x - particle.x;
        const dy = circle.y - particle.y;
        return Math.sqrt(dx * dx + dy * dy) < circle.radius / 2;
    }
    generateUID(length = 6) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
    deleteByUID(uid) {
        let index = this.scene.memory.particles.findIndex(obj => obj.uid === uid);
        if (index !== -1) { 
            this.scene.memory.particles[index].destroy();
            this.scene.memory.particles.splice(index, 1);
        }
    }

    createShootParticle(x, y, direction, speed = 300, lifespan = 500) {
        const particle = this.scene.physics.add.sprite(x, y, 'flares');
        particle.setDisplaySize(this.scene.cfg.sizeShoot, this.scene.cfg.sizeShoot); 
        particle.body.setVelocity(direction.x * speed, direction.y * speed);
            this.scene.time.delayedCall(lifespan, () => {
            particle.body.setVelocity(0);
            //particle.destroy();
        }, [], this);
        return particle;
    }

    shoot() {
        //const pointer = this.scene.memory.target;
        const pointer = this.scene.input.activePointer;
        const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
        for(const obj of this.scene.memory.objects){
            if(obj.radius > this.scene.cfg.sizeShoot){
                let direction = new Phaser.Math.Vector2(worldPoint.x - obj.x, worldPoint.y - obj.y).normalize();
                this.scene.socket.shoot(obj.x, obj.y, direction,this.scene.memory.room);
                //this.createShootParticle(obj.x, obj.y, direction);
                obj.radius -= this.scene.cfg.sizeShoot / 4;
                this.updateSpriteSizeEat(obj,10);
            }
        }
    }

    divide() {
        var arrayObj = [];
        const pointer = this.scene.input.activePointer;
        const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
        for(const obj of this.scene.memory.objects){
            if(obj.radius > 10){
                let direction = new Phaser.Math.Vector2(worldPoint.x - obj.x, worldPoint.y - obj.y).normalize();

                const deslocamento = 1;
                const startX = obj.x + direction.x * deslocamento;
                const startY = obj.y + direction.y * deslocamento;

                const newObject = this.createObject(
                    startX, 
                    startY,
                    obj.radius / 2,
                    this.scene.cfg.cooldown,
                    this.scene.memory.nickname,
                    obj.socketid,
                    this.generateUID()
                );
                newObject.coolDownSpeed = 5;    
                this.createShootDivide(newObject,obj.x,obj.y,direction);
                arrayObj.push(newObject);
                obj.radius /= 2;
                this.updateSpriteSizeEat(obj,10);
            }
        }
         arrayObj.forEach(obj =>{
             this.scene.memory.objects.push(obj);
         })
    }

    createShootDivide(object,x, y, direction, speed = 150, lifespan = 800) {
        object.body.setVelocity(direction.x * speed, direction.y * speed);
        this.scene.time.delayedCall(lifespan, () => {
                object.body.setVelocity(0);
        }, [], this);
        return object;
    }
    
}
