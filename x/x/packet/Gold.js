function Gold(Gold) {
    this.Gold = Gold;
}

module.exports = Gold;

Gold.prototype.build = function() {
    var buf = new ArrayBuffer(5);
    var view = new DataView(buf);

    view.setUint8(0, 94, true);
    view.setUint32(1, this.Gold, true);

    return buf;
};

