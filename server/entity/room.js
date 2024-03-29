class Room{

    constructor(id,name,maxPlayers,baseSpeed){
        this.id = id;
        this.name = name;
        this.maxPlayers = maxPlayers;
        this.baseSpeed = baseSpeed;
        this.players = [];
    }
}

module.exports = Room;