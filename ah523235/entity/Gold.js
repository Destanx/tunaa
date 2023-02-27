var Cell = require('./Cell');

function Gold() {
    Cell.apply(this, Array.prototype.slice.call(arguments));

    this.cellType = 1;
    this.size = Math.ceil(Math.sqrt(100 * this.mass));
    this.squareSize = (100 * this.mass) >> 0; // not being decayed -> calculate one time
}

module.exports = Gold;
Gold.prototype = new Cell();

Gold.prototype.getSize = function() {
    return this.size;
};

Gold.prototype.getSquareSize = function () {
    return this.squareSize;
};

Gold.prototype.calcMove = null; // Gold has no need to move

// Main Functions

Gold.prototype.sendUpdate = function() {
    // Whether or not to include this cell in the update packet
    if (this.moveEngineTicks == 0) {
        return false;
    }
    return true;
};

Gold.prototype.onRemove = function(gameServer) {
    gameServer.currentGold--;
};

Gold.prototype.onConsume = function(consumer,gameServer) {
    consumer.addMass(this.mass);
};

