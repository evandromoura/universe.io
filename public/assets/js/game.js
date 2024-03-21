import { Engine } from './engine.js';
import { Memory } from './memory.js';


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

        this.engine = new Engine(this);
        this.memory = new Memory();

        this.cfg = {
            graph:{
                scene:{
                    width: 1680,height: 1050
                },
                window:{
                    width: 1680,height: 1050
                }
            },
            cooldown:3000
        }
        this.engine.createScenario();
        
        //CREATE INICIAL OBJECT
        this.engine.createInitialObject();

    }
    update(){
        
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

const game = new Phaser.Game(config);