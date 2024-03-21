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
        this.scene.memory.objects.add(this.createObject(200,200,50,this.scene.cfg.cooldown));
        this.scene.memory.objects.add(this.createObject(300,400,50,this.scene.cfg.cooldown));
        this.scene.memory.objects.add(this.createObject(400,300,50,this.scene.cfg.cooldown));
    }
    createObject(x,y,radius,coolDown){
        console.log('Critou o objeto');
        let obj1 = this.scene.physics.add.sprite(x, y, 'gem');
        obj1.setDisplaySize(radius * 2, radius * 2);
        obj1.body.setSize(radius * 2, radius * 2,false);
        obj1.body.setCircle(radius);
        obj1.body.setOffset(obj1.width / 2 - radius, obj1.height / 2 - radius);
        obj1.coolDown = coolDown;
        obj1.radius = radius;
        obj1.bitmapText =  this.scene.add.bitmapText(x, y, 'atari', 'EVANDRO', 5).setOrigin(0.5);
        obj1.bitmapScore =  this.scene.add.bitmapText(x, y, 'atari', obj1.radius, 5).setOrigin(0.5,3);
        return obj1;
    }
    moveObjects(){
        for (const block of this.scene.memory.objects.getChildren()){
            let speed = block.radius > 0 ? this.scene.cfg.baseSpeed / block.radius : this.scene.cfg.baseSpeed;
            block.speed = speed;
            console.log('Speed: ',speed);
            this.scene.physics.moveToObject(block, this.scene.memory.target, speed);
        }
    }

    updateText(){
        for (const object of this.scene.memory.objects.getChildren()){
            object.bitmapText.x = object.x;
            object.bitmapText.y = object.y;
            
            object.bitmapScore.x = object.x;
            object.bitmapScore.y = object.y;

            let fontSize = object.radius / 3; 
            let fontSizeScore = object.radius / 6;
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
}
