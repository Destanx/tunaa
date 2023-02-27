function SpectatorId(SpectatorId) {
    this.SpectatorId = SpectatorId;
}

module.exports = SpectatorId;

SpectatorId.prototype.build = function() {
    var buf = new ArrayBuffer(5);
    var view = new DataView(buf);

    view.setUint8(0, 112, true);
    view.setUint32(1, this.SpectatorId, true);

    return buf;
};

