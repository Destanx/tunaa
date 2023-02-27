function topMessage2(topMessage2) {
    this.topMessage2 = topMessage2;
}

module.exports = topMessage2;

topMessage2.prototype.build = function () {
    var buf = new ArrayBuffer(4+2*this.topMessage2.length);
    var view = new DataView(buf);
    
    view.setUint8(0, 104);
    offset = 1;
    for (var j = 0; j < this.topMessage2.length; j++) {
        view.setUint16(offset, this.topMessage2.charCodeAt(j), true);
        offset += 2;
    }
    view.setUint16(offset, 0, true);
    offset += 2;
     return buf;
};


