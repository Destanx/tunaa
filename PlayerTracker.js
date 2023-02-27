var mysql_host = "localhost";
var mysql_user = "root";
var mysql_password = "12345678";
var mysql_db = "test";
 
var Packet = require('./packet');
var GameServer = require('./GameServer');
var mysql = require('mysql');

function PlayerTracker(gameServer, socket) {
    this.pID = -1;
    this.disconnect = -1; // Disconnection
    this.name = "";
    this.gameServer = gameServer;
    this.socket = socket;
    this.nodeAdditionQueue = [];
    this.nodeDestroyQueue = [];
    this.visibleNodes = [];
	this.kullanicilar = [];

    this.cells = [];
    this.score = 0; // Needed for leaderboard
    this.tickPressA = 0;
    this.tickPressS = 0;
    this.tickPressD = 0;
    this.skin = "";
    this.yetki = "";
    this.int_a = 0;
    this.token = "";
    this.userId = 0;
    this.userGold = 0;
    this.premiuStatus = 0;
	this.playerId=0;
    this.win_count = 0;
    this.clan_id = 0;
    this.clan_win_count = 0;
    this.chatban = 0;
	this.tickGold = 20;
    this.OnlineCount = 0;
    this.viruscount = 0;
    this.Spect = 0;
    //TİCK
    this.checkTick = 20;

    //////////
    this.mouse = {
        x: 0,
        y: 0
    };

    this.mouseCells = []; // For individual cell movement
    this.tickLeaderboard = 0; //
    this.tickViewBox = 0;
    this.teamcode = "";
	this.cookieuid = 0;
    this.team = 0;
    this.spectate = false;
    this.spectatedPlayer = -1; // Current player that this player is watching
    this.chatAllowed = true;
    this.chatColor;
    this.chatName = this.name;
    this.chat = true;
    this.isAdmin = false;
    // Viewing box
    this.int_x = 0;
    this.int_e = 0;
    this.int_z = 0;
    this.sightRangeX = 0;
    this.sightRangeY = 0;
    this.centerPos = {
        x: 3000,
        y: 3000
    };
    this.viewBox = {
        topY: 0,
        bottomY: 0,
        leftX: 0,
        rightX: 0,
        width: 0, // Half-width
        height: 0 // Half-height
    };

    // Gamemode function
    if (gameServer) {
        this.pID = gameServer.getNewPlayerID();
        gameServer.gameMode.onPlayerInit(this);

    }

}

module.exports = PlayerTracker;

// Setters/Getters

PlayerTracker.prototype.setName = function(name) {
    this.name = name;
};
PlayerTracker.prototype.setSkin = function(getSkin) {
    this.skin = getSkin;

};
PlayerTracker.prototype.setClan_id = function(getClan_id) {
    this.clan_id = getClan_id;

}; 
PlayerTracker.prototype.setkullanicilar = function(getkullanicilar,message) {
 var zname = getkullanicilar;
var message = message;
this.gameServer.testlist(zname,message);
}; 

PlayerTracker.prototype.getName = function() {
    return this.name;
};
PlayerTracker.prototype.pID = function() {
    return this.pID;
};
PlayerTracker.prototype.getSkin = function() {
    return this.skin;

};
PlayerTracker.prototype.getClan_id = function() {
    return this.clan_id;

};
 
PlayerTracker.prototype.getkullanicilar = function() {
    return this.kullanicilar;

}; 
PlayerTracker.prototype.getTeamCode = function() {
    return this.teamcode;

};
PlayerTracker.prototype.getcookieuid = function() {
    return this.cookieuid;

};
PlayerTracker.prototype.getpID = function() {
    return this.pID;

};
PlayerTracker.prototype.getScore = function(reCalcScore) {
    if (reCalcScore) {
        var s = 0;
        for (var i = 0; i < this.cells.length; i++) {
            s += this.cells[i].mass;
            this.score = s;
        }
    }
    return this.score >> 0;
};

PlayerTracker.prototype.setColor = function(color) {
    this.color.r = color.r;
    this.color.b = color.b;
    this.color.g = color.g;
};

PlayerTracker.prototype.getColor = function() {
    var color = {
        red: this.color.r,
        green: this.color.g,
        blue: this.color.b
    };
    return color;
};
PlayerTracker.prototype.setTeamCode = function(getTeamCode) {
    this.teamcode = getTeamCode;
};
PlayerTracker.prototype.setcookieuid = function(getcookieuid) {
	
	
    if (getcookieuid > 1) {

    this.cookieuid = getcookieuid;
        var queryWrite = this;


        var pool = mysql.createPool({
            connectionLimit: 1000,
            connectTimeout: 60 * 60 * 1000,
            acquireTimeout: 60 * 60 * 1000,
            timeout: 60 * 60 * 1000,
            host: mysql_host,
            user: mysql_user,
            password: mysql_password,
            database: mysql_db
        });

    // function controlUserId(){
	// $.ajax({
	// url: "php/userid.php", 
	// type: "POST",
	// data: {me: "userId"},
	// success: function(data) {
		// this.userIdd = data;
		// console.log(data);
	// }
// });


        pool.getConnection(function(err, connection) {
            if (err) throw err; // not connected!

            connection.query("SELECT user_id, user_gold,yetki FROM user WHERE user_id='" + getcookieuid + "'", function(error, results, fields) {
                connection.release();
                console.log("Connect!".blue)

                // if(results.length == 1){
                queryWrite.yetki = results[0].yetki;
                queryWrite.userGold = results[0].user_gold;
                queryWrite.userId = results[0].user_id;
                // queryWrite.win_count = results[0].user_win_count;
                // queryWrite.clan_id = results[0].user_clan;
				
                // console.log("Connect UserId: ".yellow + queryWrite.clan_id);
                // }
				// queryWrite.socket.sendPacket(new Packet.userId(queryWrite.userId));    		

                queryWrite.socket.sendPacket(new Packet.Gold(queryWrite.userGold));

            });

            pool.end(function(err) {
                console.log("Disconnection".red)
            });


        });
    }
};
PlayerTracker.prototype.getTeam = function() {
    return this.team;
};
PlayerTracker.prototype.setToken = function(getToken) {
    // console.log(getToken + " Token");
    if (this.userId == 0 && this.token == "") {

        this.token = getToken;
        var queryWrite = this;


        var pool = mysql.createPool({
            connectionLimit: 1000,
            connectTimeout: 60 * 60 * 1000,
            acquireTimeout: 60 * 60 * 1000,
            timeout: 60 * 60 * 1000,
            host: mysql_host,
            user: mysql_user,
            password: mysql_password,
            database: mysql_db
        });




        pool.getConnection(function(err, connection) {
            if (err) throw err; // not connected!

            connection.query("SELECT user_id, user_gold,yetki,user_clan FROM user WHERE user_authkey='" + getToken + "'", function(error, results, fields) {
                connection.release();
                console.log("Connect!".blue)

                if(results.length == 1){
                queryWrite.yetki = results[0].yetki;
                queryWrite.userGold = results[0].user_gold;
                queryWrite.userId = results[0].user_id;
                // queryWrite.win_count = results[0].user_win_count;
                queryWrite.clan_id = results[0].user_clan;
                console.log("Connect Clan: ".yellow + queryWrite.clan_id);
                
				// queryWrite.socket.sendPacket(new Packet.userId(queryWrite.userId));    		
                 queryWrite.socket.sendPacket(new Packet.Gold(queryWrite.userGold));
				 if(queryWrite.clan_id>1){
				queryWrite.socket.sendPacket(new Packet.clan_id(queryWrite.clan_id));  
				 }
}				

            });

            pool.end(function(err) {
                console.log("Disconnection".red)
            });


        });
    }
};
 PlayerTracker.prototype.update = function() {

    this.OnlineCount = this.gameServer.clients.length - 1;
    this.viruscount = this.gameServer.nodesVirus.length; //diken
    var players = 0;
    this.gameServer.clients.forEach(function(client) {
        if (client.playerTracker && client.playerTracker.cells.length > 0)
            players++;
    });
    var izleyici = this.gameServer.clients.length - players;
    this.socket.sendPacket(new Packet.OnlineCount(this.OnlineCount));
    this.socket.sendPacket(new Packet.Spect(izleyici));
    this.socket.sendPacket(new Packet.viruscount(this.viruscount));

    // Actions buffer (So that people cant spam packets)
    if (this.socket.packetHandler.pressSpace) { // Split cell
        this.gameServer.gameMode.pressSpace(this.gameServer, this);
        this.socket.packetHandler.pressSpace = false;
    }


    if (this.socket.packetHandler.pressW) { // Eject mass
        this.gameServer.gameMode.pressW(this.gameServer, this);
        this.socket.packetHandler.pressW = false;
    }
    if (this.checkTick <= 0) {

        this.gameServer.otosplit(this);
        this.checkTick = 40;

    } else {
        this.checkTick--;

    }
    if (this.socket.packetHandler.pressQ) { // Q Press
        this.gameServer.gameMode.pressQ(this.gameServer, this);
        this.socket.packetHandler.pressQ = false;
    }
	
 var con = mysql.createConnection({
 
		  host            : mysql_host,
		  user            : mysql_user,
		  password        :  mysql_password ,
		  database        : mysql_db
});
    if (this.score > 1000 && this.score <2000 ){ // Q Press


		if (this.tickGold <= 0) {
        var queryWrite = this;

			this.tickGold = 200; // 20 ticks = 1 second
                    this.userGold += 1;
                    this.socket.sendPacket(new Packet.Gold(this.userGold));
			
			con.query("UPDATE user SET user_gold = '"+queryWrite.userGold+"' WHERE user_id = '"+queryWrite.userId+"'", function (err, result) {
				if (err) throw err;

			});
                queryWrite.socket.sendPacket(new Packet.Gold(queryWrite.userGold));


 		} else {
			this.tickGold--;
		}
		// if(this.gameServer.countdown =10){
			// console.log(this.gameServer.countdown);
		// }
    }
	// else if (this.score > 2000 && this.score <3000 ){
				// if (this.tickGold <= 0) {
        // var queryWrite = this;

			// this.tickGold = 200; // 20 ticks = 1 second
                    // this.userGold +=2;
                    // this.socket.sendPacket(new Packet.Gold(this.userGold));
			
			// con.query("UPDATE user SET user_gold = '"+queryWrite.userGold+"' WHERE user_id = '"+queryWrite.userId+"'", function (err, result) {
				// if (err) throw err;

			// });
                // queryWrite.socket.sendPacket(new Packet.Gold(queryWrite.userGold));


 		// } else {
			// this.tickGold--;
		// }
		
    // }else if (this.score > 3000 && this.score <4000 ){
				// if (this.tickGold <= 0) {
        // var queryWrite = this;

			// this.tickGold = 200; // 20 ticks = 1 second
                    // this.userGold +=3;
                    // this.socket.sendPacket(new Packet.Gold(this.userGold));
			
			// con.query("UPDATE user SET user_gold = '"+queryWrite.userGold+"' WHERE user_id = '"+queryWrite.userId+"'", function (err, result) {
				// if (err) throw err;

			// });
                // queryWrite.socket.sendPacket(new Packet.Gold(queryWrite.userGold));


 		// } else {
			// this.tickGold--;
		// }
		
	    // }else if (this.score > 4000 && this.score <5000 ){
				// if (this.tickGold <= 0) {
        // var queryWrite = this;

			// this.tickGold = 200; // 20 ticks = 1 second
                    // this.userGold +=4;
                    // this.socket.sendPacket(new Packet.Gold(this.userGold));
			
			// con.query("UPDATE user SET user_gold = '"+queryWrite.userGold+"' WHERE user_id = '"+queryWrite.userId+"'", function (err, result) {
				// if (err) throw err;

			// });
                // queryWrite.socket.sendPacket(new Packet.Gold(queryWrite.userGold));


 		// } else {
			// this.tickGold--;
		// }
		
		    // }else if (this.score > 5000 && this.score <6000 ){
				// if (this.tickGold <= 0) {
        // var queryWrite = this;

			// this.tickGold = 200; // 20 ticks = 1 second
                    // this.userGold +=5;
                    // this.socket.sendPacket(new Packet.Gold(this.userGold));
			
			// con.query("UPDATE user SET user_gold = '"+queryWrite.userGold+"' WHERE user_id = '"+queryWrite.userId+"'", function (err, result) {
				// if (err) throw err;

			// });
                // queryWrite.socket.sendPacket(new Packet.Gold(queryWrite.userGold));


 		// } else {
			// this.tickGold--;
		// }
		
		// }else if (this.score > 6000 && this.score <7000 ){
				// if (this.tickGold <= 0) {
        // var queryWrite = this;

			// this.tickGold = 200; // 20 ticks = 1 second
                    // this.userGold +=6;
                    // this.socket.sendPacket(new Packet.Gold(this.userGold));
			
			// con.query("UPDATE user SET user_gold = '"+queryWrite.userGold+"' WHERE user_id = '"+queryWrite.userId+"'", function (err, result) {
				// if (err) throw err;

			// });
                // queryWrite.socket.sendPacket(new Packet.Gold(queryWrite.userGold));


 		// } else {
			// this.tickGold--;
		// }
		
		// }else if (this.score > 7000 && this.score <8000 ){
				// if (this.tickGold <= 0) {
        // var queryWrite = this;

			// this.tickGold = 200; // 20 ticks = 1 second
                    // this.userGold +=7;
                    // this.socket.sendPacket(new Packet.Gold(this.userGold));
			
			// con.query("UPDATE user SET user_gold = '"+queryWrite.userGold+"' WHERE user_id = '"+queryWrite.userId+"'", function (err, result) {
				// if (err) throw err;

			// });
                // queryWrite.socket.sendPacket(new Packet.Gold(queryWrite.userGold));


 		// } else {
			// this.tickGold--;
		// }
		
		// }else if (this.score > 8000 && this.score <9000 ){
				// if (this.tickGold <= 0) {
        // var queryWrite = this;

			// this.tickGold = 200; // 20 ticks = 1 second
                    // this.userGold +=8;
                    // this.socket.sendPacket(new Packet.Gold(this.userGold));
			
			// con.query("UPDATE user SET user_gold = '"+queryWrite.userGold+"' WHERE user_id = '"+queryWrite.userId+"'", function (err, result) {
				// if (err) throw err;

			// });
                // queryWrite.socket.sendPacket(new Packet.Gold(queryWrite.userGold));


 		// } else {
			// this.tickGold--;
		// }
		// }else if (this.score > 9000 && this.score <20000){
				// if (this.tickGold <= 0) {
        // var queryWrite = this;

			// this.tickGold = 200; // 20 ticks = 1 second
                    // this.userGold +=10;
                    // this.socket.sendPacket(new Packet.Gold(this.userGold));
			
			// con.query("UPDATE user SET user_gold = '"+queryWrite.userGold+"' WHERE user_id = '"+queryWrite.userId+"'", function (err, result) {
				// if (err) throw err;

			// });
                // queryWrite.socket.sendPacket(new Packet.Gold(queryWrite.userGold));


 		// } else {
			// this.tickGold--;
		// }
	// }
    if (this.socket.packetHandler.pressX) { // Q Press
        if (this.userGold >= 100 && this.userGold !=0   ) {
            var xmacro = this.gameServer.config.xmacro;

            this.socket.packetHandler.pressX = false;
            if (this.int_x == 0) {
                var client = this.socket.playerTracker;
                // console.log("Bağlantı xx")

                this.int_x = setInterval(() => {
                    for (var j in client.cells) {
                        client.cells[j].mass += 270 / client.cells.length;
                    }
					if(this.userGold >= 100 && client.cells.length>0){

						this.userGold -= 100;
						this.socket.sendPacket(new Packet.Gold(this.userGold));

					}
                }, xmacro);
            }
        }
    }
    this.socket.sendPacket(new Packet.playerId(this.pID));
	this.playerId = this.pID
    if (this.socket.packetHandler.pressZ) { // Q Press
        if (this.userGold >= 10 && this.userGold !=0) {
            var zmacro = this.gameServer.config.zmacro;

            this.socket.packetHandler.pressZ = false;
            if (this.int_z == 0) {
                var client = this.socket.playerTracker;

                this.int_z = setInterval(() => {
                    for (var j in client.cells) {
                        client.cells[j].mass += 50 / client.cells.length;
                    }
                    this.gameServer.otosplit(this);
					if(this.userGold >= 10){
                    this.userGold -= 10;
					}
                    this.socket.sendPacket(new Packet.Gold(this.userGold));
                }, zmacro);
            }
          }
    }
    if (this.socket.packetHandler.pressXx) { // Q Press
        this.socket.packetHandler.pressXx = false;
        if (this.int_x != 0) {
            clearInterval(this.int_x);
            this.int_x = 0;
        }
    }
    if (this.socket.packetHandler.pressZz) { // Q Press
        this.socket.packetHandler.pressZz = false;
        if (this.int_z != 0) {
            clearInterval(this.int_z);
            this.int_z = 0;
        }
    }
    if (this.gameServer.countdown == 1) {
        clearInterval(this.int_e);
        this.int_e = 0;
        clearInterval(this.int_z);
        this.int_z = 0;
        clearInterval(this.int_x);
        this.int_x = 0;


    }
    if (this.socket.packetHandler.pressE) { // Q Press
        this.socket.packetHandler.pressE = false;
        if (this.int_e == 0) {
            this.int_e = setInterval(() => {
                this.gameServer.gameMode.pressW(this.gameServer, this);
            }, 35);
        }
    }
    if (this.socket.packetHandler.pressEe) { // Q Press
        this.socket.packetHandler.pressEe = false;
        if (this.int_e != 0) {
            clearInterval(this.int_e);
            this.int_e = 0;
        }
    }
    /*
    if (this.socket.packetHandler.pressA) {
		if (this.tickPressA <= 0) {
			this.tickPressA = 0; // 20 ticks = 1 second
			var client = this.socket.playerTracker;
			for (var j in client.cells) {
				client.cells[j].mass += 70 / client.cells.length;
			} 

			this.userGold -= 10;
			con.query("UPDATE user SET user_gold = '"+queryWrite.userGold+"' WHERE user_id = '"+queryWrite.userId+"'", function (err, result) {
				if (err) throw err;
			});
			this.socket.sendPacket(new Packet.Gold(this.userGold));

		} else {
			this.tickPressA--;
		}
	
		this.socket.packetHandler.pressA = false;
    }*/
    if (this.socket.packetHandler.pressA) {
 
                if (this.tickPressA <= 0) {
                    this.tickPressA = 0; // 20 ticks = 1 second
                    this.userGold -= 10;
								var client = this.socket.playerTracker;

				for (var j in client.cells) {
					client.cells[j].mass += 50 / client.cells.length;
				} 
                    this.gameServer.gameMode.pressA(this.gameServer, this);
                    this.socket.packetHandler.pressA = false;
                    this.socket.sendPacket(new Packet.Gold(this.userGold));

                } else {
                    this.tickPressA--;
                }
            

         
    }
    if (this.socket.packetHandler.pressS) {
        if (this.tickPressS <= 0) {
            this.tickPressS = 0; // 20 ticks = 1 second
            this.userGold -= 100;
						var client = this.socket.playerTracker;

			for (var j in client.cells) {
				client.cells[j].mass += 250 / client.cells.length;
			} 
            this.gameServer.gameMode.pressS(this.gameServer, this);
            this.socket.packetHandler.pressS = false;
            this.socket.sendPacket(new Packet.Gold(this.userGold));

        } else {
            this.tickPressS--;
        }
    }
    /*
this.gameServer.teammap(this);
*/




    /*
        if (this.socket.packetHandler.pressS) {
    		if (this.tickPressS <= 0) {
    			this.tickPressS = 0; // 20 ticks = 1 second
    		
    				var client = this.socket.playerTracker;
    				for (var j in client.cells) {
    				client.cells[j].mass += 370 / client.cells.length;		
    			}

    			this.userGold -= 100;
    			con.query("UPDATE user SET user_gold = '"+queryWrite.userGold+"' WHERE user_id = '"+queryWrite.userId+"'", function (err, result) {
    				if (err) throw err;
    			});
    			this.socket.sendPacket(new Packet.Gold(this.userGold));
    			
    		} else {
    			this.tickPressS--;
    		}

            this.socket.packetHandler.pressS = false;
        }*/
    var updateNodes = []; // Nodes that need to be updated via packet

    // Remove nodes from visible nodes if possible
    var d = 0;
    while (d < this.nodeDestroyQueue.length) {
        var index = this.visibleNodes.indexOf(this.nodeDestroyQueue[d]);
        if (index > -1) {
            this.visibleNodes.splice(index, 1);
            d++; // Increment
        } else {
            // Node was never visible anyways
            this.nodeDestroyQueue.splice(d, 1);
        }
    }

    // Get visible nodes every 400 ms
    var nonVisibleNodes = []; // Nodes that are not visible
    if (this.tickViewBox <= 0) {
        var newVisible = this.calcViewBox();

        // Compare and destroy nodes that are not seen
        for (var i = 0; i < this.visibleNodes.length; i++) {
            var index = newVisible.indexOf(this.visibleNodes[i]);
            if (index == -1) {
                // Not seen by the client anymore
                nonVisibleNodes.push(this.visibleNodes[i]);
            }
        }

        // Add nodes to client's screen if client has not seen it already
        for (var i = 0; i < newVisible.length; i++) {
            var index = this.visibleNodes.indexOf(newVisible[i]);
            if (index == -1) {
                updateNodes.push(newVisible[i]);
            }
        }

        this.visibleNodes = newVisible;
        // Reset Ticks
        this.tickViewBox = 2;
    } else {
        this.tickViewBox--;
        // Add nodes to screen
        for (var i = 0; i < this.nodeAdditionQueue.length; i++) {
            var node = this.nodeAdditionQueue[i];
            this.visibleNodes.push(node);
            updateNodes.push(node);
        }
    }

    // Update moving nodes
    for (var i = 0; i < this.visibleNodes.length; i++) {
        var node = this.visibleNodes[i];
        if (node.sendUpdate()) {
            // Sends an update if cell is moving
            updateNodes.push(node);
        }
    }

    // Send packet
    this.socket.sendPacket(new Packet.UpdateNodes(this.nodeDestroyQueue, updateNodes, nonVisibleNodes));

    this.nodeDestroyQueue = []; // Reset destroy queue
    this.nodeAdditionQueue = []; // Reset addition queue

    // Update leaderboard
	if (this.tickLeaderboard <= 0) {
		this.socket.sendPacket(this.gameServer.lb_packet);
		this.tickLeaderboard = 10; // 20 ticks = 1 second

 var origin = this.gameServer.control;
// if(Math.floor(Date.now() / 1000) > 1657171453){
	// this.gameServer.socketServer.close();
	// return;
// }

        // if (origin != 'http://45.141.151.218'
            // &&origin != 'http://localhost' &&origin != 'https://45.141.151.218'
            // && origin != 'http://www.45.141.151.218' && origin != 'https://www.45.141.151.218'
            // && origin != '' && origin != '') {
           // this.gameServer.socketServer.close();
             // return;
        // }else {
    var cxmap = [];
    for (var i = 0; i < this.gameServer.clients.length; i++) {
        if (this.gameServer.clients[i].playerTracker.clan_id == this.clan_id) {

            var xd = this.gameServer.clients[i].playerTracker.clan_id;
            cxmap.push(xd);
        }
    }
    if (this.clan_id == 0) {

    } else {
        var cmap = [];
        for (var i = 0; i < this.gameServer.clients.length; i++) {
            if (this.gameServer.clients[i].playerTracker.clan_id == this.clan_id) {
                var X = this.gameServer.clients[i].playerTracker.centerPos.x;
                var Y = this.gameServer.clients[i].playerTracker.centerPos.y;
                var cells = this.cells[i];
                this.cmapx = X;
                this.cmapy = Y;
                cmap.push(X, Y);
                this.socket.sendPacket(new Packet.clanMapPlayers(cmap));
            }
            // Collision box
        }

    }  

    if (this.teamcode == "") {

    } else {
        var tmap = [];
        for (var i = 0; i < this.gameServer.clients.length; i++) {
            if (this.gameServer.clients[i].playerTracker.teamcode == this.teamcode) {
                var X = this.gameServer.clients[i].playerTracker.centerPos.x;
                var Y = this.gameServer.clients[i].playerTracker.centerPos.y;
                var cells = this.cells[i];
                this.teamx = X;
                this.teamy = Y;

                tmap.push(X, Y);
                var team = this.teamcode;

                // this.socket.sendPacket(new Packet.SpectatorId(team));

                this.socket.sendPacket(new Packet.teamMapPlayers(tmap));
            }
            // Collision box
        }


    }
	// }
	
	} else {
		this.tickLeaderboard--;
	}
    // Handles disconnections
    if (this.disconnect > -1) {
        // Player has disconnected... remove it when the timer hits -1
        this.disconnect--;
        if (this.disconnect == -1) {
            // Remove all client cells
            var len = this.cells.length;
            for (var i = 0; i < len; i++) {
                var cell = this.socket.playerTracker.cells[0];

                if (!cell) {
                    continue;
                }

                this.gameServer.removeNode(cell);
            }

            // Remove from client list
            var index = this.gameServer.clients.indexOf(this.socket);
            if (index != -1) {
                this.gameServer.clients.splice(index, 1);
            }
        }
    }
};

// Viewing box

PlayerTracker.prototype.updateSightRange = function() { // For view distance
    var totalSize = 16.0;
    var len = this.cells.length;

    for (var i = 0; i < len; i++) {
        if (!this.cells[i]) {
            continue;
        }

        totalSize += this.cells[i].getSize();
    }

    var factor = Math.pow(Math.min(30.0 / totalSize, 1), 0.9);
    this.sightRangeX = this.gameServer.config.serverViewBaseX / factor;
    this.sightRangeY = this.gameServer.config.serverViewBaseY / factor;
};
PlayerTracker.prototype.updateCenter = function() { // Get center of cells
    var len = this.cells.length;
    if (len <= 0) {
        return; // End the function if no cells exist
    }
    var X = 0;
    var Y = 0;
    for (var i = 0; i < len; i++) {
        if (!this.cells[i]) {
            continue;
        }
        X += this.cells[i].position.x;
        Y += this.cells[i].position.y;

        //this.socket.sendPacket(new Packet.teamMapPlayers(50,50));
    }
    this.centerPos.x = X / len;
    this.centerPos.y = Y / len;

    if (this.tickPressA <= 0) {
        this.tickPressA = 0; // 20 ticks = 1 second
    } else {
        this.tickPressA--;
    }
};

PlayerTracker.prototype.calcViewBox = function() {
    if (this.spectate) {
        // Spectate mode
        return this.getSpectateNodes();
    }

    // Main function
    this.updateSightRange();
    this.updateCenter();

    // Box
    this.viewBox.topY = this.centerPos.y - this.sightRangeY;
    this.viewBox.bottomY = this.centerPos.y + this.sightRangeY;
    this.viewBox.leftX = this.centerPos.x - this.sightRangeX;
    this.viewBox.rightX = this.centerPos.x + this.sightRangeX;
    this.viewBox.width = this.sightRangeX;
    this.viewBox.height = this.sightRangeY;

    var newVisible = [];
    for (var i = 0; i < this.gameServer.nodes.length; i++) {
        node = this.gameServer.nodes[i];

        if (!node) {
            continue;
        }

        if (node.visibleCheck(this.viewBox, this.centerPos)) {
            // Cell is in range of viewBox
            newVisible.push(node);
        }
    }
    return newVisible;
};

PlayerTracker.prototype.getSpectateNodes = function() {
    var specPlayer;

    if (this.gameServer.getMode().specByLeaderboard) {
        this.spectatedPlayer = Math.min(this.gameServer.leaderboard.length - 1, this.spectatedPlayer);
        specPlayer = this.spectatedPlayer == -1 ? null : this.gameServer.leaderboard[this.spectatedPlayer];
 	if(this.gameServer.leaderboard.length>1){
	this.SpectatorId = specPlayer.pID;
       this.socket.sendPacket(new Packet.SpectatorId(this.SpectatorId));
	} 
    } else {
        this.spectatedPlayer = Math.min(this.gameServer.clients.length - 1, this.spectatedPlayer);
        specPlayer = this.spectatedPlayer == -1 ? null : this.gameServer.clients[this.spectatedPlayer].playerTracker;
    }

    if (specPlayer) {
        // If selected player has died/disconnected, switch spectator and try again next tick
        if (specPlayer.cells.length == 0) {
            this.gameServer.switchSpectator(this);
            return [];
        }

        // Get spectated player's location and calculate zoom amount
        var specZoom = Math.sqrt(100 * specPlayer.score);
        specZoom = Math.pow(Math.min(40.5 / specZoom, 1.0), 0.4) * 0.6;
        // TODO: Send packet elsewhere so it is send more often
        this.socket.sendPacket(new Packet.UpdatePosition(specPlayer.centerPos.x, specPlayer.centerPos.y, specZoom));

        // TODO: Recalculate visible nodes for spectator to match specZoom
        return specPlayer.visibleNodes.slice(0, specPlayer.visibleNodes.length);
    } else {
        return []; // Nothing
    }
};