function OnlineCount(OnlineCount) {
    this.OnlineCount = OnlineCount;
}

module.exports = OnlineCount;

OnlineCount.prototype.build = function() {
    var buf = new ArrayBuffer(5);
    var view = new DataView(buf);

    view.setUint8(0, 110, true);
    view.setUint32(1, this.OnlineCount, true);
    return buf;
	console.log("Id ");
};


