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
        obj1.body.setVelocity({x:0,y:0});
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
                // Movimentação em direção ao mouse
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

                

        
                // Atração magnética
                // for (let j = 0; j < objects.length; j++) {
                //     if (index === j) continue; // Ignora o próprio objeto
        
                //     let obj2 = objects[j];
                //     let dx = obj2.x - obj1.x;
                //     let dy = obj2.y - obj1.y;
                //     let dist = Math.sqrt(dx * dx + dy * dy);
        
                //     if (dist > 0) {
                //         let force = MAGNETIC_CONSTANT * (obj1.radius * obj2.radius) / (dist * dist);
                //         let vx = (dx / dist) * force;
                //         let vy = (dy / dist) * force;
        
                //         obj1.body.velocity.x -= vx;
                //         obj1.body.velocity.y -= vy;
                //     }
                // }
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
        let fatorDeMargem = this.scene.memory.objects.getChildren().length > 1?3:5; 
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
                        object.x + Math.cos(object.angle + Math.PI * i) * object.radius,
                        object.y + Math.sin(object.angle + Math.PI * i) * object.radius,
                        object.radius / 2,
                        this.scene.cfg.cooldown
                    )
                    arrayObj.push(newObject);
                    
                    object.radius = object.radius / 2;     
                    this.updateSpriteSizeEat(object);
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

                        
                        // this.scene.tweens.add({
                        //     targets: objRival,
                        //     x: obj.x, // Move o objeto absorvido para a posição x do objeto que cresce
                        //     y: obj.y, // Move o objeto absorvido para a posição y do objeto que cresce
                        //     scale: 0, // Reduz a escala do objeto absorvido até que desapareça
                        //     duration: 500,
                        //     ease: 'Cubic.InOut',
                        //     onComplete: () => {
                        //         console.log('ENTROU NO ONCOMPLETE')
                        //         obj.radius += objRival.radius;
                        //         this.updateSpriteSizeEat(obj);
                        //         objRival.bitmapText.destroy();
                        //         objRival.bitmapScore.destroy();
                        //         objRival.destroy(); // Destrói o objeto absorvido após a animação
                        //     }
                        // });
                        obj.radius += objRival.radius;
                        this.updateSpriteSizeEat(obj);
                        objRival.bitmapText.destroy();
                        objRival.bitmapScore.destroy();
                        objRival.destroy();
                        
                    }
                }
            }
        }        
    }
    updateSpriteSizeEat(obj){
        let newRadius = obj.radius;
        let newSize = newRadius * 2;

        // Animação do tamanho do sprite
        this.scene.tweens.add({
            targets: obj,
            displayWidth: newSize, // Novo tamanho de exibição (largura)
            displayHeight: newSize, // Novo tamanho de exibição (altura)
            duration: 1000, // Duração da animação em milissegundos
            ease: 'Quadratic.Out', // Tipo de suavização da animação
            onUpdate: () => {
                // Atualiza o corpo físico do sprite para corresponder à nova escala durante a animação
                console.log('RETORNO AQUI: ',obj);
                if(obj.body){
                    obj.body.setSize(newSize, newSize, false);
                    obj.body.setCircle(newRadius, obj.width / 2 - newRadius, obj.height / 2 - newRadius);
                }
            },
            onComplete: () => {
                // Ação após a conclusão da animação, se necessário
            }
        });
    } 
    createParticles(numberOfParticles) {

        
        for (let i = 0; i < numberOfParticles; i++) {
            var particle =  this.scene.physics.add.sprite(
                Phaser.Math.Between(0, this.scene.physics.world.bounds.width),
                Phaser.Math.Between(0, this.scene.physics.world.bounds.height),'flares'
                // , {
                //     frame: [ 'red', 'yellow', 'green' ],
                //     lifespan: 4000,
                //     speed: { min: 150, max: 250 },
                //     scale: { start: 0.4, end: 0 },
                //     gravityY: 150,
                //     bounce: 0.8,
                //     blendMode: 'ADD'
                // }
                );
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
