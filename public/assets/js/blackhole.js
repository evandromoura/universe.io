export class BlackHole {
    constructor(scene, x, y, radius) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.sprite = this.scene.add.circle(x, y, radius, 0x000000); // Representação visual simples
        this.scene.physics.world.enable(this.sprite);
        this.sprite.body.setCircle(radius);
    }

    // Checa colisão com objeto do jogador
    checkCollisionWithPlayer(playerObject) {
        const dx = this.x - playerObject.x;
        const dy = this.y - playerObject.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.radius + playerObject.radius) {
            // Colisão detectada
            return true;
        }
        return false;
    }
}