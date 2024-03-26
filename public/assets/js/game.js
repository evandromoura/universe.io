import { Engine } from './engine.js';
import { Memory } from './memory.js';
import { Util } from './util.js';
import { Socket } from './socket.js';
import { Graphics } from './graphics.js';
import { BlackHole } from './blackhole.js';

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
        this.load.bitmapFont('azo-fire', 'assets/engine/fonts/bitmap/azo-fire.png', 'assets/engine/fonts/bitmap/azo-fire.xml');
        
        this.load.atlas('flares', 'assets/engine/particles/flares.png', 'assets/engine/particles/flares.json');
        this.load.spritesheet('boom', 'assets/engine/sprites/explosion.png', { frameWidth: 64, frameHeight: 64, endFrame: 23 });
        
    }

    create (){
        // VARIABLES
        scene = this;
        this.memory = new Memory();
        this.memory.nickname = Util.getUrlParameter('nickname');
        this.memory.room = Util.getUrlParameter('room');
        this.blackHoles = [new BlackHole(this, 300, 300, 15)]; 

        // CONFIG
        this.cfg = {
            graph:{scene:{ width: 1920,height: 1080}, window:{width: 1680,height: 1050},
            zoom:{min:4,max:7,factor:0.9}},
            cooldown:3000,
            cooldownSpeed:500,
            baseSpeed:3000,
            maxobject:10,
            numberOfParticles:250,
            minRadiusSplit:20,
            speed:{min:10, max:80, factor:1000},
            updateServerInterval:2000,
            sizeShoot:5
        }
        //CREATE INICIAL OBJECT
        this.graphics = new Graphics(this);
        this.engine = new Engine(this);
        this.engine.init();
        this.engine.createScenario();
        
        this.socket = new Socket(this).connect();
         
        this.anims.create({key: 'explode',frames: 'boom',frameRate: 20,showOnStart: true,hideOnComplete: true});
        //this.engine.createInitialParticules();

        //MOUSE
         this.input.on('pointermove', this.pointermove);
         this.input.keyboard.on('keydown-SPACE', () => {this.engine.divide();});
         this.input.on('pointerdown', this.explode);    
         this.input.keyboard.on('keydown-W', () => {
             this.engine.shoot();
         });

        //  this.physics.world.on('worldbounds', (body) => {
            
        //     //if (body.gameObject === meuSprite) {
        //     //    this.criarExplosao(meuSprite.x, meuSprite.y);
        //         this.explode(body.gameObject);
        //     //}
        //     //body.center.x
        //     console.log('colidiu',body);
        // });
    }
    update(){
         this.sendInfoServer();
         scene.engine.updateText();
         this.pilot();
         this.engine.checkCollisions();
         this.engine.checkColisionObjects();
         this.engine.checkColisionParticules();
         this.engine.checkColisionPlayerObject();
         this.engine.updateTextPlayers();
         this.engine.zoom();
         this.coolDownsub();
    }
    coolDownsub(){
        for(const object of this.memory.objects){
            
            object.coolDown = object.coolDown > 0?object.coolDown - 1:0;
            object.coolDownSpeed = object.coolDownSpeed > 0?object.coolDownSpeed - 1:0;
            
        }
    }
    pointermove(pointer){
        busy=0;
        var point = scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
        scene.memory.target.x = point.x;
        scene.memory.target.y = point.y;
        scene.engine.moveObjects();
        scene.engine.updateText();
    }
    pilot(){
        if(busy < 10){
            scene.engine.moveObjects();
        }
        busy++;
    }
    explode(pointer){
        const boom = scene.add.sprite(0, 0, 'boom').setBlendMode('ADD').setScale(4).setVisible(false);
        var point = pointer;
        boom.copyPosition(point).play('explode');
        const distance = new Phaser.Math.Vector2();
        const force = new Phaser.Math.Vector2();
        const acceleration = new Phaser.Math.Vector2();

        for (const block of scene.memory.objects){
            distance.copy(block.body.center).subtract(point);
            force.copy(distance).setLength(50000 / distance.lengthSq()).limit(1000);
            acceleration.copy(force).scale(1 / block.body.mass);
            block.body.velocity.add(acceleration);
            scene.engine.updateText();
        }
    }
    sendInfoServer(){
        if(this.socket){
            if (new Date() - this.memory.lastUpdate > this.cfg.updateServerInterval) {
                //console.log('Aqui ta enviando',this.compositeObjects());
                this.socket.sendUpdate(this.compositeObjects(),this.memory.room);

            }    
        }
    }
    compositeObjects(){
        let list = [];
        for(const objectPhy of this.memory.objects){
            list.push(objectPhy.object);
        }
        return list;
    }
    divideObjectIntoFive(object) {
        // const partSize = object.radius / Math.sqrt(5); // Dividir o tamanho para manter a massa total aproximadamente constante
        // for (let i = 0; i < 5; i++) {
        //     // Calcula a posição para cada parte
        //     const angle = (i / 5) * 2 * Math.PI;
        //     const dx = Math.cos(angle) * object.radius;
        //     const dy = Math.sin(angle) * object.radius;
        //     // Criação do novo objeto
        //     let newObj = this.engine.createObject(object.x + dx, object.y + dy, partSize, object.coolDown, object.nickname, object.socketid, this.engine.generateUID());
        //     this.memory.objects.add(newObj);
        // }
        // // Remove o objeto original
        // object.destroy();
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
        arcade: { debug: true }
    }
};

var game = new Phaser.Game(config);