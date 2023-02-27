function viruscount(viruscount) {
    this.viruscount = viruscount;
}

module.exports = viruscount;

viruscount.prototype.build = function() {
    var buf = new ArrayBuffer(5);
    var view = new DataView(buf);

    view.setUint8(0, 111, true);
    view.setUint32(1, this.viruscount, true);
    return buf;
	console.log("Id ");
};


