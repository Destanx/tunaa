function topMessage3(topMessage3) {
    this.topMessage3 = topMessage3;
}

module.exports = topMessage3;

topMessage3.prototype.build = function () {
    var buf = new ArrayBuffer(4+2*this.topMessage3.length);
    var view = new DataView(buf);
    
    view.setUint8(0, 103);
    offset = 1;
    for (var j = 0; j < this.topMessage3.length; j++) {
        view.setUint16(offset, this.topMessage3.charCodeAt(j), true);
        offset += 2;
    }
    view.setUint16(offset, 0, true);
    offset += 2;
	console.log(this.topMessage3)
    return buf;
};


