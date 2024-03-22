export class Engine{
    constructor (scene)
    {
        this.scene = scene;
    }

    createScenario(){
        this.scene.add.image(0, 0, 'bg').setOrigin(0, 0).setDisplaySize(this.scene.cfg.graph.window.width, this.scene.cfg.graph.window.height);
        this.scene.physics.world.setBounds(0, 0, this.scene.cfg.graph.scene.width, this.scene.cfg.graph.scene.height);
    }
    createInitialObject(x,y,radius,coolDown){
        this.scene.memory.objects = this.scene.physics.add.group({collideWorldBounds:true});
        this.scene.memory.objects.add(this.createObject(200,200,100,this.scene.cfg.cooldown));
        // this.scene.memory.objects.add(this.createObject(300,400,50,this.scene.cfg.cooldown));
        // this.scene.memory.objects.add(this.createObject(400,300,50,this.scene.cfg.cooldown));
        // this.scene.memory.objects.add(this.createObject(500,700,50,this.scene.cfg.cooldown));
        // this.scene.memory.objects.add(this.createObject(600,600,50,this.scene.cfg.cooldown));
        // this.scene.memory.objects.add(this.createObject(700,500,50,this.scene.cfg.cooldown));
        
    }
    createInitialParticules(x,y,radius,coolDown){
        this.scene.memory.particles = this.scene.physics.add.group({collideWorldBounds:true});
        this.createParticles(this.scene.cfg.numberOfParticles);
        // this.scene.memory.objects.add(this.createObject(300,400,50,this.scene.cfg.cooldown));
        // this.scene.memory.objects.add(this.createObject(400,300,50,this.scene.cfg.cooldown));
        // this.scene.memory.objects.add(this.createObject(500,700,50,this.scene.cfg.cooldown));
        // this.scene.memory.objects.add(this.createObject(600,600,50,this.scene.cfg.cooldown));
        // this.scene.memory.objects.add(this.createObject(700,500,50,this.scene.cfg.cooldown));
        
    }
    createObject(x,y,radius,coolDown){
        let obj1 = this.scene.physics.add.sprite(x, y, 'gem');
        obj1.setDisplaySize(radius * 2, radius * 2);
        obj1.body.setSize(radius * 2, radius * 2,false);
        obj1.body.setCircle(radius);
        obj1.body.setOffset(obj1.width / 2 - radius, obj1.height / 2 - radius);
        obj1.body.setVelocity({x:10,y:10});
        obj1.coolDown = coolDown;
        obj1.coolDownSpeed = 0;
        obj1.radius = radius;
        obj1.bitmapText =  this.scene.add.bitmapText(x, y, 'atari', 'EVANDRO', 5).setOrigin(0.5);
        obj1.bitmapScore =  this.scene.add.bitmapText(x, y, 'atari', obj1.radius, 5).setOrigin(0.5,3);
        return obj1;
    }
    moveObjects(){
        
            const MAGNETIC_CONSTANT = 0.55; // Ajuste conforme necessário
            const MOUSE_ATTRACTION_SPEED = 10; // Velocidade base de atração em direção ao mouse
            let target = this.scene.memory.target; // Posição do mouse
        
            let objects = this.scene.memory.objects.getChildren();
        
            objects.forEach((obj1, index) => {
                if(obj1.coolDownSpeed == 0){
                    let dxMouse = target.x - obj1.x;
                    let dyMouse = target.y - obj1.y;
                    let distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
                    let normDxMouse = dxMouse / distMouse;
                    let normDyMouse = dyMouse / distMouse;
                    let speed = MOUSE_ATTRACTION_SPEED * (300 / obj1.radius); // Exemplo de ajuste de velocidade inversamente proporcional ao raio
                    console.log(speed);
                    speed = Phaser.Math.Clamp(speed, this.scene.cfg.speed.min, this.scene.cfg.speed.max);

                    obj1.body.velocity.x = normDxMouse * speed;
                    obj1.body.velocity.y = normDyMouse * speed;
                }else{
                    // const MAGNETIC_CONSTANT =  100;
                    // const decelerationFactor = 1 - (MAGNETIC_CONSTANT / obj1.coolDownSpeed);
                    // obj1.body.velocity.x *= decelerationFactor; 
                    // obj1.body.velocity.y *= decelerationFactor;
                    obj1.coolDownSpeed = Math.max(obj1.coolDownSpeed - 1, 0);
                }
            });
    }
    updateText(){
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
    zoom() {
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
        let fatorDeMargem = 5; 
        largura *= fatorDeMargem;
        altura *= fatorDeMargem;
        this.scene.cameras.main.centerOn(centroX, centroY);
    
        // Ajustar zoom baseado na maior dimensão para garantir que todos objetos caibam na tela
        let zoomX = this.scene.cameras.main.width / largura;
        let zoomY = this.scene.cameras.main.height / altura;
        let zoom = Math.min(zoomX, zoomY);
    
        this.scene.cameras.main.setZoom(zoom);
    }
    split(){
        let i = 0;
        var arrayObj = [];
        if(this.scene.memory.objects.getChildren().length < this.scene.cfg.maxobject){
            for (const object of this.scene.memory.objects.getChildren()){
                if (object.radius > 10) { 

                    var newObject = this.createObject(
                        object.x - (object.radius /2),
                        object.y - (object.radius /2),
                        object.radius / 2,
                        this.scene.cfg.cooldown
                    )
                    //AQUI
                    arrayObj.push(newObject);
                    object.coolDownSpeed = 50;
                    
                    let dxMouse = this.scene.memory.target.x - newObject.x;
                    let dyMouse = this.scene.memory.target.y - newObject.y;
                    let distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
                    let normDxMouse = dxMouse / distMouse;
                    let normDyMouse = dyMouse / distMouse;        
                    let MOUSE_ATTRACTION_SPEED = 1500;
                    let speed = MOUSE_ATTRACTION_SPEED * (300 / newObject.radius); 
                    speed = Phaser.Math.Clamp(speed, this.scene.cfg.speed.min, this.scene.cfg.speed.max);
                    console.log(speed,newObject.body.velocity.x,newObject.body.velocity.y);    
                    object.body.velocity.x = normDxMouse * speed;
                    object.body.velocity.y = normDyMouse * speed;    
                    
                    object.radius = object.radius / 2;     
                    this.updateSpriteSizeEat(object,1000);
                    object.coolDown = this.scene.cfg.cooldown;    
                    i++;        
                }    
            }

        }
        arrayObj.forEach(obj =>{
            this.scene.memory.objects.add(obj);
        })

    }
    checkCollisions() {
        let objects = this.scene.memory.objects.getChildren();
    
        for (let i = 0; i < objects.length; i++) {
            if(objects[i].coolDown > 0){
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
    checkColisionObjects(){
        for (const obj of this.scene.memory.objects.getChildren()){
            for (const objRival of this.scene.memory.objects.getChildren()){
                if(obj != objRival){
                    if (this.circleOverlapsParticle(obj, objRival)) {
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
    updateSpriteSizeEat(obj,duration){
    
        let newValue = obj.radius * 2;
        this.scene.tweens.add({
            targets: obj,
            displayWidth: newValue, 
            displayHeight: newValue, 
            duration: duration, 
            ease: 'Quadratic.Out', 
            onUpdate: () => {
                
            },
            onComplete: () => {
                if(obj.body){
                    obj.body.setSize(obj.radius, obj.radius, false);
                    obj.body.setCircle(obj.radius, obj.width / 2 - obj.radius, obj.height / 2 - obj.radius);
                }
            }
        });
    } 
    createParticles(numberOfParticles) {

        
        for (let i = 0; i < numberOfParticles; i++) {
            var particle =  this.scene.physics.add.sprite(
                Phaser.Math.Between(0, this.scene.physics.world.bounds.width),
                Phaser.Math.Between(0, this.scene.physics.world.bounds.height),'flares');
                particle.radius = 5;
                this.scene.memory.particles.add(particle);
        }            
    }
    circleOverlapsParticle(circle, particle) {
        const dx = circle.x - particle.x;
        const dy = circle.y - particle.y;
        return Math.sqrt(dx * dx + dy * dy) < circle.radius;
    }
    
}
