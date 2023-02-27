function topMessage1(topMessage1) {
    this.topMessage1 = topMessage1;
}

module.exports = topMessage1;

topMessage1.prototype.build = function () {
    var buf = new ArrayBuffer(4+2*this.topMessage1.length);
    var view = new DataView(buf);
    
    view.setUint8(0, 101);
    offset = 1;
    for (var j = 0; j < this.topMessage1.length; j++) {
        view.setUint16(offset, this.topMessage1.charCodeAt(j), true);
        offset += 2;
    }
    view.setUint16(offset, 0, true);
    offset += 2;
     return buf;
};


