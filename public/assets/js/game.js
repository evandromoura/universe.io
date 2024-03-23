import { Engine } from './engine.js';
import { Memory } from './memory.js';
import { Util } from './util.js';
import { Socket } from './socket.js';

var scene;
var busy = 0;
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
        // VARIABLES
        scene = this;

        // CONFIG
        this.cfg = {
            graph:{ scene:{ width: 2560,height: 1600 }, window:{width: 1680,height: 1050},
            zoom:{min:4,max:7}},
            cooldown:1000,
            cooldownSpeed:500,
            baseSpeed:3000,
            maxobject:10,
            numberOfParticles:250,
            minRadiusSplit:20,
            speed:{min:10, max:50, factor:1000},
            updateServerInterval:2000
        }
        
        //CREATE INICIAL OBJECT
        this.engine = new Engine(this);
        this.engine.createScenario();
        
         this.memory = new Memory();
         this.engine.init();
        this.memory.nickname = Util.getUrlParameter('nickname');
        this.memory.room = Util.getUrlParameter('room');
        this.anims.create({key: 'explode',frames: 'boom',frameRate: 20,showOnStart: true,hideOnComplete: true});
        //this.engine.createInitialParticules();

        //MOUSE
        this.input.on('pointermove', this.pointermove);
        this.input.keyboard.on('keydown-SPACE', () => {this.engine.split();});
        
        this.input.on('pointerdown', this.explode);    

        //CONECTANDO AO SOCKET
        
       // this.socket = new Socket(this).connect();
    }
    update(){
        console.log('Atualizou o q ?',this.memory.objects.getChildren().length);
        this.engine.updateText();
        this.engine.checkCollisions();
        this.engine.checkColisionObjects();
        this.engine.checkColisionParticules();
        this.engine.zoom();
        this.pilot();
        this.sendInfoServer();
    }
    pointermove(pointer){
        busy=0;
        var point = scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
        scene.memory.target.x = point.x;
        scene.memory.target.y = point.y;
        scene.engine.moveObjects();
    }

    pilot(){
        if(busy < 10){
            scene.engine.moveObjects();
        }
        busy++;
    }
    explode(pointer){
        const boom = scene.add.sprite(0, 0, 'boom').setBlendMode('ADD').setScale(4).setVisible(false);
        var point = scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
        boom.copyPosition(point).play('explode');
        const distance = new Phaser.Math.Vector2();
        const force = new Phaser.Math.Vector2();
        const acceleration = new Phaser.Math.Vector2();

        for (const block of scene.memory.objects.getChildren()){
            distance.copy(block.body.center).subtract(point);
            force.copy(distance).setLength(50000 / distance.lengthSq()).limit(1000);
            acceleration.copy(force).scale(1 / block.body.mass);
            block.body.velocity.add(acceleration);
        }
    }
    sendInfoServer(){
        if(this.socket){
            if (new Date() - this.memory.lastUpdate > this.cfg.updateServerInterval) {
                this.socket.sendUpdate(this.memory.objects.getChildren());

            }    
        }
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