function clan_id(clan_id) {
    this.clan_id = clan_id;
}

module.exports = clan_id;

clan_id.prototype.build = function() {
    var buf = new ArrayBuffer(5);
    var view = new DataView(buf);

    view.setUint8(0, 106, true);
    view.setUint32(1, this.clan_id, true);
    console.log(this.clan_id+" qeqweeqw");
	return buf;
 };


