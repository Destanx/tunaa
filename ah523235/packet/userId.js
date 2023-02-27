function userId(userId) {
    this.userId = userId;
}

module.exports = userId;

userId.prototype.build = function() {
    var buf = new ArrayBuffer(5);
    var view = new DataView(buf);

    view.setUint8(0, 55, true);
    view.setUint32(1, this.userId, true);
console.log(" saass")
    return buf;
};

