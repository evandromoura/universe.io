import { Engine } from './engine.js';
import { Memory } from './memory.js';

var scene;
class Game extends Phaser.Scene{
    constructor (){
        super();
    }

    preload (){
        this.load.image('gem','assets/img/obj/gem.png');
        this.load.image('bg', 'assets/img/bg/bg.jpg');
        this.load.bitmapFont('atari', 'assets/engine/fonts/bitmap/atari-smooth.png', 'assets/engine/fonts/bitmap/atari-smooth.xml');
        this.load.atlas('flares', 'assets/engine/particles/flares.png', 'assets/engine/particles/flares.json');
        this.load.spritesheet('boom', 'assets/engine/sprites/explosion.png', { frameWidth: 64, frameHeight: 64, endFrame: 23 });
    }

    create (){
        scene = this;
        this.engine = new Engine(this);
        this.memory = new Memory();

        this.anims.create({
            key: 'explode',
            frames: 'boom',
            frameRate: 20,
            showOnStart: true,
            hideOnComplete: true
        });

        this.cfg = {
            graph:{ scene:{ width: 2560,height: 1600 }, window:{width: 1680,height: 1050}},
            cooldown:1000,
            cooldownSpeed:500,
            baseSpeed:3000,
            maxobject:10,
            numberOfParticles:200,
            speed:{
                min:10,
                max:50,
                factor:1000
            }
        }
        this.engine.createScenario();
        
        //CREATE INICIAL OBJECT
        this.engine.createInitialParticules();
        this.engine.createInitialObject();
        this.input.on('pointermove', this.pointermove);

        this.input.keyboard.on('keydown-SPACE', () => {
            this.engine.split();
        });
        const boom = this.add.sprite(0, 0, 'boom').setBlendMode('ADD').setScale(4).setVisible(false);
        this.input.on('pointerdown', (pointer) =>
        {
            var point = this.cameras.main.getWorldPoint(this.input.x, this.input.y);
            boom.copyPosition(point).play('explode');
            const distance = new Phaser.Math.Vector2();
            const force = new Phaser.Math.Vector2();
            const acceleration = new Phaser.Math.Vector2();

            for (const block of scene.memory.objects.getChildren())
            {
                distance.copy(block.body.center).subtract(point);
                force.copy(distance).setLength(50000 / distance.lengthSq()).limit(1000);
                acceleration.copy(force).scale(1 / block.body.mass);
                block.body.velocity.add(acceleration);
            }
        });    
    }
    update(){
        //scene.engine.moveObjects();
        this.engine.updateText();
        this.engine.zoom();
        this.engine.checkCollisions();
        this.engine.checkColisionObjects();
      
    }
    pointermove(pointer){
        var point = scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
        scene.memory.target.x = point.x;
        scene.memory.target.y = point.y;
        scene.engine.moveObjects();
    }
     
}


//***********************EXECUTE APP */
const config = {
    type: Phaser.AUTO,
    width: 1680,
    height: 1050,
    scene: Game,
    parent: 'univers.io-game',
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    }
};

var game = new Phaser.Game(config);