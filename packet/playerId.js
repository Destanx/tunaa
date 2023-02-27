function playerId(playerId) {
    this.playerId = playerId;
}

module.exports = playerId;

playerId.prototype.build = function() {
    var buf = new ArrayBuffer(5);
    var view = new DataView(buf);

    view.setUint8(0, 105, true);
    view.setUint32(1, this.playerId, true);
    return buf;
	console.log("Id ");
};


