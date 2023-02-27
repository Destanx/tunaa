function clanMapPlayers(leaderboard) {
    this.leaderboard = leaderboard;


}

module.exports = clanMapPlayers;

clanMapPlayers.prototype.build = function() {
     var lb = this.leaderboard;
     var bufferSize = 5;
    var validElements = 0;

            validElements = lb.length;
            bufferSize += (validElements * 4);

            var buf = new ArrayBuffer(bufferSize);
            var view = new DataView(buf);

            view.setUint8(0, 88, true); // Packet ID
            view.setUint32(1, validElements, true); // Number of elements

            var offset = 1;
            for (var i = 0; i < validElements;i++) {
                view.setFloat32(offset, lb[i], true); // Number of elements
                offset += 4;
 
            }
             return buf;

};

