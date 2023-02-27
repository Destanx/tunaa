function recordHolder(recordHolder) {
    this.recordHolder = recordHolder;
}

module.exports = recordHolder;

recordHolder.prototype.build = function () {
    var buf = new ArrayBuffer(4+2*this.recordHolder.length);
    var view = new DataView(buf);
    
    view.setUint8(0, 87);
    offset = 1;
    for (var j = 0; j < this.recordHolder.length; j++) {
        view.setUint16(offset, this.recordHolder.charCodeAt(j), true);
        offset += 2;
    }
    view.setUint16(offset, 0, true);
    offset += 2;
     return buf;
};

