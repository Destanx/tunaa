function Chat(sender, message, chatType) {
    this.sender = sender;
    this.message = message;
	this.chatType = chatType;
}

module.exports = Chat;

Chat.prototype.build = function () {

  if (typeof this.sender == "object") {
	     var nick = this.sender.playerId+"~"+this.sender.premiuStatus+"~"+this.sender.userId+"~"+this.sender.name+"~"+this.chatType;

    if (!nick) {
        if (this.sender.cells.length > 0) {
            nick = 'An unnamed cell'
        } else {
            nick = 'Spectator'
        }
    }
  } else if (typeof this.sender == "string") {
    nick = this.sender;
    
  }
    var buf = new ArrayBuffer(9 + 2 * nick.length + 2 * this.message.length);
    var view = new DataView(buf);
    var color = {'r': 155, 'g': 155, 'b': 155};
    if (this.sender.cells && this.sender.cells.length > 0 && this.sender.color) {
        color = this.sender.color;
    }
    if (this.sender.chatColor) {
      color = this.sender.chatColor
    }
    view.setUint8(0, 99);
    view.setUint8(1, 0); // flags for client; for future use
    // Send color
    view.setUint8(2, color.r);
    view.setUint8(3, color.g);
    view.setUint8(4, color.b);
    var offset = 5;
    // Send name
    for (var j = 0, llen = nick.length; j < llen; j++) {
        view.setUint16(offset, nick.charCodeAt(j), true);
        offset += 2;
    }
    view.setUint16(offset, 0, true);
    offset += 2;
    // send message
    for (var j = 0, llen = this.message.length; j < llen; j++) {
        view.setUint16(offset, this.message.charCodeAt(j), true);
        offset += 2;
    }
    view.setUint16(offset, 0, true);
    offset += 2;
    return buf;
};

