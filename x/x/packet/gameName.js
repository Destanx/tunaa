function gameName(gameName) {
    this.gameName = gameName;
}

module.exports = gameName;

gameName.prototype.build = function () {
    var buf = new ArrayBuffer(4+2*this.gameName.length);
    var view = new DataView(buf);
    
    view.setUint8(0, 92);
    offset = 1;
    for (var j = 0; j < this.gameName.length; j++) {
        view.setUint16(offset, this.gameName.charCodeAt(j), true);
        offset += 2;
    }
    view.setUint16(offset, 0, true);
    offset += 2;
    return buf;

};

