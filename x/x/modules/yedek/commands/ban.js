var GameMode = require('../../gamemodes');

module.exports = function (gameServer, split) {
        var ip = split[1]; // Get ip
        if (gameServer.banned.indexOf(ip) == -1) {
            gameServer.banned.push(ip);
            console.log("[Console] Added "+ip+" to the banlist");

            // Remove from game
            for (var i in gameServer.clients) {
                var c = gameServer.clients[i];

                if (!c.remoteAddress) {
                    continue; 
                }

                if (c.remoteAddress == ip) {
                    c.close(); // Kick out
                }
            }
        } else {
            console.log("[Console] That IP is already banned");
        }
    };