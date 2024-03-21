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
        this.scene.memory.objects.add(this.createObject(200,200,30,this.scene.cfg.cooldown));
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
        obj1.bitmapScore =  this.scene.add.bitmapText(x, y, 'atari', obj1.radius, 5).setOrigin(1.5);
        return obj1;
    }
}
