export class Graphics{
    constructor (scene)
    {
        this.scene = scene;
    }
    
    explode(x,y){
        const boom = this.scene.add.sprite(0, 0, 'boom').setBlendMode('ADD').setScale(4).setVisible(false);
        var point = {x:x,y:y};
        boom.copyPosition(point).play('explode');
        const distance = new Phaser.Math.Vector2();
        const force = new Phaser.Math.Vector2();
        const acceleration = new Phaser.Math.Vector2();
    }

    
}
