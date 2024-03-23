export class Engine{
    constructor (scene)
    {
        this.scene = scene;
    }

    init(){
        this.scene.memory.objects = this.scene.physics.add.group({collideWorldBounds:true});
        this.scene.memory.players = [];
        this.scene.memory.particles = [];
        let obj = {position:{x:300,y:500,radius:34}};
        const particlesG = this.scene.add.particles('flares', {
            frame: [ 'red', 'yellow', 'green' ],
            lifespan: -1,
            speed: 0
        });
        // this.emitter = particlesG.createEmitter({
        //     speed: 0,
        //     lifespan: Infinity,
        //     frequency: -1, 
        //     maxParticles: 10
        // });
        
    }
    createScenario(){
        this.scene.add.image(0, 0, 'bg').setOrigin(0, 0).setDisplaySize(this.scene.cfg.graph.window.width, this.scene.cfg.graph.window.height);
        this.scene.physics.world.setBounds(0, 0, this.scene.cfg.graph.scene.width, this.scene.cfg.graph.scene.height);
    }
    createInitialObject(object){
        this.scene.memory.objects.add(this.createObject(object.position.x,object.position.y,object.radius,this.scene.cfg.cooldown,this.scene.memory.nickname));
        // this.scene.memory.objects.add(this.createObject(300,400,50,this.scene.cfg.cooldown));
        // this.scene.memory.objects.add(this.createObject(400,300,50,this.scene.cfg.cooldown));
        // this.scene.memory.objects.add(this.createObject(500,700,50,this.scene.cfg.cooldown));
        // this.scene.memory.objects.add(this.createObject(600,600,50,this.scene.cfg.cooldown));
        // this.scene.memory.objects.add(this.createObject(700,500,50,this.scene.cfg.cooldown));
    }
    createInitialParticules(x,y,radius,coolDown){
        this.scene.memory.particles = this.scene.physics.add.group({collideWorldBounds:true});
        this.createParticles(this.scene.cfg.numberOfParticles);
    }
    createObject(x,y,radius,coolDown,name){
        let obj1 = this.scene.physics.add.sprite(x, y, 'gem');
        obj1.setDisplaySize(radius * 2, radius * 2);
        obj1.body.setSize(radius * 2, radius * 2,false);
        obj1.body.setCircle(radius);
        obj1.body.setOffset(obj1.width / 2 - radius, obj1.height / 2 - radius);
        obj1.body.setVelocity({x:10,y:10});
        obj1.coolDown = coolDown;
        obj1.coolDownSpeed = 0;
        obj1.radius = radius;
        obj1.bitmapText =  this.scene.add.bitmapText(x, y, 'atari', name, 5).setOrigin(0.5);
        obj1.bitmapScore =  this.scene.add.bitmapText(x, y, 'atari', obj1.radius, 5).setOrigin(0.5,3);
        return obj1;
    }

    createObjectPlayer(x,y,radius,name,socketid,uid){
        let obj1 = this.scene.physics.add.sprite(x, y, 'gem');
        obj1.setDisplaySize(radius * 2, radius * 2);
        obj1.body.setSize(radius * 2, radius * 2,false);
        obj1.body.setCircle(radius);
        obj1.body.setOffset(obj1.width / 2 - radius, obj1.height / 2 - radius);
        obj1.body.setVelocity({x:10,y:10});
        obj1.radius = radius;
        obj1.socketid = socketid;
        obj1.uid = uid;
        obj1.bitmapText =  this.scene.add.bitmapText(x, y, 'atari', name, 5).setOrigin(0.5);
        obj1.bitmapScore =  this.scene.add.bitmapText(x, y, 'atari', obj1.radius, 5).setOrigin(0.5,3);
        return obj1;
    }

    moveObjects(){
        
            const MAGNETIC_CONSTANT = 0.55; 
            const MOUSE_ATTRACTION_SPEED = 10; 
            let target = this.scene.memory.target; 
            let objects = this.scene.memory.objects.getChildren();
        
            objects.forEach((obj1, index) => {
                if(obj1.coolDownSpeed == 0){
                    let dxMouse = target.x - obj1.x;
                    let dyMouse = target.y - obj1.y;
                    let distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
                    let normDxMouse = dxMouse / distMouse;
                    let normDyMouse = dyMouse / distMouse;
                    let speed = MOUSE_ATTRACTION_SPEED * (300 / obj1.radius); 
                    speed = Phaser.Math.Clamp(speed, this.scene.cfg.speed.min, this.scene.cfg.speed.max);
                    if(obj1.coolDownSpeed > 0){
                        speed *= 10;
                        obj1.coolDownSpeed -= 1;
                    }
                    obj1.body.velocity.x = normDxMouse * speed;
                    obj1.body.velocity.y = normDyMouse * speed;
                }else{
                    obj1.coolDownSpeed = Math.max(obj1.coolDownSpeed - 1,0);
                }

            });
    }
    updateText(){
        if(this.scene.memory.objects.getChildren().length > 0 && this.scene.memory.objects.getChildren()){
            for (const object of this.scene.memory.objects.getChildren()){
                object.bitmapText.x = object.x;
                object.bitmapText.y = object.y;
                
                object.bitmapScore.x = object.x;
                object.bitmapScore.y = object.y;
    
                let fontSize = object.radius / 10; 
                let fontSizeScore = object.radius / 10;
                object.bitmapText.setFontSize(fontSize);
                object.bitmapScore.setFontSize(fontSizeScore);
                object.bitmapScore.setText(object.radius);
            }
        }
    }
    zoom() {
        
        if(this.scene.memory.objects.getChildren().length > 0){
            let minX = Infinity;
            let maxX = -Infinity;
            let minY = Infinity;
            let maxY = -Infinity;
        
            this.scene.memory.objects.getChildren().forEach(function(obj) {
                minX = Math.min(minX, obj.x - obj.displayWidth / 2);
                maxX = Math.max(maxX, obj.x + obj.displayWidth / 2);
                minY = Math.min(minY, obj.y - obj.displayHeight / 2);
                maxY = Math.max(maxY, obj.y + obj.displayHeight / 2);
            });
        
            let centroX = (minX + maxX) / 2;
            let centroY = (minY + maxY) / 2;
            let largura = maxX - minX;
            let altura = maxY - minY;

            let fatorDeMargem = Phaser.Math.Clamp(this.scene.memory.objects.getChildren().length, this.scene.cfg.graph.zoom.min, this.scene.cfg.graph.zoom.max);
            largura *= fatorDeMargem;
            altura *= fatorDeMargem;
            this.scene.cameras.main.centerOn(centroX, centroY);
        
            // Ajustar zoom baseado na maior dimensão para garantir que todos objetos caibam na tela
            let zoomX = this.scene.cameras.main.width / largura;
            let zoomY = this.scene.cameras.main.height / altura;
            let zoom = Math.min(zoomX, zoomY);
        
            //this.scene.cameras.main.setZoom(zoom);
            this.scene.cameras.main.setZoom(1);
        } else{
            this.scene.cameras.main.setZoom(5);
        }   
    }
    split() {
        var arrayObj = [];
        // Supondo que você tenha acesso à posição do mouse através de this.scene.memory.target
        const mouseTarget = this.scene.memory.target;
        for (const object of this.scene.memory.objects.getChildren()) {
            if (object.radius > this.scene.cfg.minRadiusSplit) { 
                const direction = new Phaser.Math.Vector2(mouseTarget.x - object.x, mouseTarget.y - object.y).normalize();
                const initialSpeed = 300; // Velocidade inicial alta
                const newObject = this.createObject(
                    object.x + direction.x * object.radius, // Ajuste a posição inicial se necessário
                    object.y + direction.y * object.radius,
                    object.radius / 2,
                    this.scene.cfg.cooldown,
                    this.scene.memory.nickname
                );
                arrayObj.push(newObject);
    
                // Definir velocidade inicial
                newObject.body.velocity.x = direction.x * initialSpeed;
                newObject.body.velocity.y = direction.y * initialSpeed;
                newObject.coolDownSpeed = 50;    
    
                object.radius /= 2;
                this.updateSpriteSizeEat(object, 1000);
                object.coolDown = this.scene.cfg.cooldown;
                object.coolDownSpeed = 0; 
                
                //
            }
        }
        arrayObj.forEach(obj =>{
            this.scene.memory.objects.add(obj);
        })
    }
    checkCollisions() {
        if(this.scene.memory.objects.getChildren().length > 0){
            let objects = this.scene.memory.objects.getChildren();
            for (let i = 0; i < objects.length; i++) {
                if(objects[i].coolDown > 0 && objects[i].coolDownSpeed == 0){
                    for (let j = i + 1; j < objects.length; j++) {
                        if(objects[j].coolDown > 0){
                            let obj1 = objects[i];
                            let obj2 = objects[j];
                
                            
                            let dx = obj2.x - obj1.x;
                            let dy = obj2.y - obj1.y;
                            let distance = Math.sqrt(dx * dx + dy * dy);
                            
                            let minDistance = obj1.radius * 1.6;
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
                        objects[j].coolDown -= 1;               
                        }    
                    }
                objects[i].coolDown -= 1;
                objects[i].coolDown = Math.max(objects[i].coolDown,0) ;   

                }
                
            }
        }
        
    }
    checkColisionObjects(){
        if(this.scene.memory.objects.getChildren().length > 0){
            for (const obj of this.scene.memory.objects.getChildren()){
                if(obj.coolDown == 0){
                    for (const objRival of this.scene.memory.objects.getChildren()){
                        if(objRival.coolDown == 0){
                            if(obj != objRival){
                                if (this.objectOverlapsParticle(obj, objRival)) {
                                    obj.radius += objRival.radius;
                                    this.updateSpriteSizeEat(obj,500);
                                    objRival.bitmapText.destroy();
                                    objRival.bitmapScore.destroy();
                                    objRival.destroy();
                                }
                            }
                        }
                    }
                }
            }
        }            
    }

    checkColisionParticules(){
        if(this.scene.memory.particles){
            this.scene.memory.particles.forEach((particle,index)=>{
                for (const obj of this.scene.memory.objects.getChildren()){
                    if (this.objectOverlapsParticle(obj, particle)) {
                        obj.radius += particle.radius / (obj.radius / 2); 
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
    
        obj.setDisplaySize(obj.radius * 2, obj.radius * 2);
        obj.body.setSize(obj.radius * 2, obj.radius * 2,false);
        obj.body.setCircle(obj.radius);
        obj.body.setOffset(obj.width / 2 - obj.radius, obj.height / 2 - obj.radius);

    } 
    createParticles(numberOfParticles) {
        for (let i = 0; i < numberOfParticles; i++) {
            var particle =  this.scene.physics.add.sprite(
                Phaser.Math.Between(0, this.scene.physics.world.bounds.width),
                Phaser.Math.Between(0, this.scene.physics.world.bounds.height),'flares');
                particle.radius = 50;
                this.scene.memory.particles.add(particle);
        }            
    }
    drawPlayers() {
        if(this.scene.memory.players){
            console.log('Entrou no draw players',this.scene.memory.player.uid);
            if(this.scene.memory.players.find(obj => obj.uid !== this.scene.memory.player.uid)){
                this.scene.memory.players.find(obj => obj.uid !== this.scene.memory.player.uid).forEach(player=>{
                    if(!player.objectsPlayer){
                        player.objectsPlayer = this.scene.physics.add.group({collideWorldBounds:true});
                    }
                    player.objects.forEach(obj=>{
                        const objPhy = player.objectsPlayer.getChildren().find(objPlayer=>{objPlayer.uid === obj.uid});
                        if(!objPhy){
                            player.objectsPlayer.add(this.createObjectPlayer(obj.x,obj.y,obj.radius,player.nickname,obj.uid,player.socketid));
                        }else{
                            objPhy.radius = obj.radius;
                            this.updateSpriteSizeEat(obj,duration);
                        }
                    });    
                });
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
        this.scene.memory.particles = [];
        particles.forEach(particleIt=>{
            var particle =  this.scene.add.image(particleIt.x, particleIt.y,'flares');
            particle.radius = particleIt.radius;
            particle.uid = particleIt.uid;
            this.scene.memory.particles.push(particle);
        });
        
        
    }
    objectOverlapsParticle(circle, particle) {
        const dx = circle.x - particle.x;
        const dy = circle.y - particle.y;
        return Math.sqrt(dx * dx + dy * dy) < circle.radius;
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
            this.scene.memory.particles.splice(index, 1);
        }
    }
    
}
