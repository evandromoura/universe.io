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
    }

    create (){
        scene = this;
        this.engine = new Engine(this);
        this.memory = new Memory();

        this.cfg = {
            graph:{ scene:{ width: 2560,height: 1600 }, window:{width: 1680,height: 1050}},
            cooldown:3000,
            baseSpeed:3000
        }
        this.engine.createScenario();
        
        //CREATE INICIAL OBJECT
        this.engine.createInitialObject();
        this.input.on('pointermove', this.pointermove);
    }
    update(){
        this.engine.updateText();
        this.engine.zoom();
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

function callBackPointermove(pointer){
    console.log(game);
    game.pointermove(pointer);
}