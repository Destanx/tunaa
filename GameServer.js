var mysql_host = "localhost";
var mysql_user = "root";
var mysql_password = "12345678";
var mysql_db = "test";
var config_countdown = 20;
// Library imports
var WebSocket = require('./node_modules/ws/index.js');
var http = require('http');
var fs = require("fs");
var ini = require('./modules/ini.js');
var net = require('net');
var colors = require('colors');
var winnerName ="";
// Project imports
var Packet = require('./packet');
var PlayerTracker = require('./PlayerTracker');
var PacketHandler = require('./PacketHandler');
var Entity = require('./entity');
var Gamemode = require('./gamemodes');
var BotLoader = require('./ai/BotLoader');
var Logger = require('./modules/log');
var RemoteReceiver = require('./Remote.js');
var mysql = require('mysql');

// GameServer implementation
function GameServer(version, port, multiverse,consoleService) {
    // Startup 
    this.run = true;
    this.lastNodeId = 1;
    this.lastPlayerId = 1;
    this.clients = [];
    this.nodes = [];
    this.nodesVirus = []; // Virus nodes
    this.nodesEjected = []; // Ejected mass nodes
    this.nodesPlayer = []; // Nodes controlled by players
	this.countdown = config_countdown;
    this.currentFood = 0;
    this.movingNodes = []; // For move engine
    this.leaderboard = [];
    this.lb_packet = new ArrayBuffer(0); // Leaderboard packet
	this.lastWinner = "?";
	this.serverPort = 1002;
    this.multiverse = multiverse;
    this.port = port;
	this.consoleService = consoleService;

this.teamx = 0;
this.teamy = 0;

if(this.port == 1001){
	this.gameName = "FFA-1";
}else if(this.serverPort == 1002){
	this.gameName = "FFA-2";

}else if(this.serverPort == 1003){
		this.gameName = "FFA-3";

}else if(this.serverPort == 1004){
		this.gameName = "FFA-4";

}else if(this.serverPort == 1005){
		this.gameName = "FFA-5";

}else if(this.serverPort == 1006){
		this.gameName = "FFA-6";

}else if(this.serverPort == 1007){
		this.gameName = "FFA-7";

}else if(this.serverPort == 1008){
		this.gameName = "FFA-8";

}else if(this.serverPort == 1009){
		this.gameName = "FFA-9";

}else if(this.serverPort == 1010){
		this.gameName = "FFA-10";

}else if(this.serverPort == 1011){
		this.gameName = "FFA-11";

}




	this.recordHolder = "";
	this.topMessage2 = "";
	this.topMessage1 = "";
	this.topMessage10= "";

	this.topMessage3 = "";
    this.bots = new BotLoader(this);
    this.log = new Logger();
    this.commands; // Command handler
    this.ipcounts = [];
    this.whlist = [];

    // Main loop tick
    this.time = +new Date;
    this.startTime = this.time;
    this.tick = 0; // 1 second ticks of mainLoop
    this.tickMain = 0; // 50 ms ticks, 20 of these = 1 leaderboard update
    this.tickSpawn = 0; // Used with spawning food

    // Config
    this.config = { // Border - Right: X increases, Down: Y increases (as of 2015-05-20)
        serverMaxConnections: 64, // Maximum amount of connections to the server.
        serverPort: 443, // Server port
        serverGamemode: 0, // Gamemode, 0 = FFA, 1 = Teams
        serverBots: 0, // Amount of player bots to spawn
        serverViewBaseX: 1024, // Base view distance of players. Warning: high values may cause lag
        serverViewBaseY: 592,
        serverStatsPort: 88, // Port for stats server. Having a negative number will disable the stats server.
        serverStatsUpdate: 60, // Amount of seconds per update for the server stats
        serverLogLevel: 1, // Logging level of the server. 0 = No logs, 1 = Logs the console, 2 = Logs console and ip connections
        borderLeft: 0, // Left border of map (Vanilla value: 0)
        borderRight: 6000, // Right border of map (Vanilla value: 11180.3398875)
        borderTop: 0, // Top border of map (Vanilla value: 0)
        borderBottom: 6000, // Bottom border of map (Vanilla value: 11180.3398875)
        spawnInterval: 20, // The interval between each food cell spawn in ticks (1 tick = 50 ms)
        foodSpawnAmount: 10, // The amount of food to spawn per interval
        foodStartAmount: 100, // The starting amount of food in the map
        foodMaxAmount: 500, // Maximum food cells on the map
        foodMass: 1, // Starting food size (In mass)
        virusMinAmount: 10, // Minimum amount of viruses on the map.
        virusMaxAmount: 50, // Maximum amount of viruses on the map. If this amount is reached, then ejected cells will pass through viruses.
        virusStartMass: 100, // Starting virus size (In mass)
        virusFeedAmount: 7, // Amount of times you need to feed a virus to shoot it
        ejectMass: 12, // Mass of ejected cells
        ejectMassLoss: 16, // Mass lost when ejecting cells
        ejectSpeed: 160, // Base speed of ejected cells
        ejectSpawnPlayer: 50, // Chance for a player to spawn from ejected mass
        playerStartMass: 10, // Starting mass of the player cell.
        playerMaxMass: 22500, // Maximum mass a player can have
        playerMinMassEject: 60, // Mass required to eject a cell
        playerMinMassSplit: 60, // Mass required to split
        playerMaxCells: 16, // Max cells the player is allowed to have
        playerRecombineTime: 30, // Base amount of seconds before a cell is allowed to recombine
        playerMassDecayRate: .002, // Amount of mass lost per second
        playerMinMassDecay: 9, // Minimum mass for decay to occur
        playerMaxNickLength: 15, // Maximum nick length
        playerDisconnectTime: 60, // The amount of seconds it takes for a player cell to be removed after disconnection (If set to -1, cells are never removed)
        tourneyMaxPlayers: 12, // Maximum amount of participants for tournament style game modes
        tourneyPrepTime: 10, // Amount of ticks to wait after all players are ready (1 tick = 1000 ms)
        tourneyEndTime: 30, // Amount of ticks to wait after a player wins (1 tick = 1000 ms)
        tourneyTimeLimit: 20, // Time limit of the game, in minutes.
        tourneyAutoFill: 0, // If set to a value higher than 0, the tournament match will automatically fill up with bots after this amount of seconds
        tourneyAutoFillPlayers: 1, // The timer for filling the server with bots will not count down unless there is this amount of real players
		MAPPlayerTick: 5, //airdrop maximum multiplyer
		AirDropDispSec: 10, //Time to show message
		AirDropTimeSec: 60, //Time to spawn airdrop in seconds
		AirDropWinScore: 5000, //Score to win
		AirDropVirusChanceMin: 0, //Virused Min
		AirDropVirusChanceMax: 100, //Virused Max
		AirDropCenterChance: 30, //Chance airdrop to spawn on center of the map
		AirDropSmallMassChance: 20, //Chance in percentage for small airdrop
		AirDropSmallMassMin: 50, //Small airdrop minimum size
		AirDropSmallMassMax: 200, //Small airdrop maximum size
		AirDropSmallMultiplyerMin: 1, //Small airdrop minimum multiplyer
		AirDropSmallMultiplyerMax: 4, //Small airdrop maximum multiplyer
		AirDropMassMin: 100, //airdrop minimum size
		AirDropMassMax: 300, //airdrop maximum size
		AirDropMultiplyerMin: 2, //airdrop minimum multiplyer
		AirDropMultiplyerMax: 3, //airdrop maximum multiplyer
		MurderMinPlayer: 3,
		MurderCooldown: 30,
		MurdererBigFoodMax: 20,
		MurdererBigFoodMass: 5,
    };
    // Parse config
    this.loadConfig();

    // Gamemodes
    this.gameMode = Gamemode.get(this.config.serverGamemode);

    // Colors
    this.colors = [
        {'r':235, 'g': 75, 'b':  0},
        {'r':225, 'g':125, 'b':255},
        {'r':180, 'g':  7, 'b': 20},
        {'r': 80, 'g':170, 'b':240},
        {'r':180, 'g': 90, 'b':135},
        {'r':195, 'g':240, 'b':  0},
        {'r':150, 'g': 18, 'b':255},
        {'r': 80, 'g':245, 'b':  0},
        {'r':165, 'g': 25, 'b':  0},
        {'r': 80, 'g':145, 'b':  0},
        {'r': 80, 'g':170, 'b':240},
        {'r': 55, 'g': 92, 'b':255},
    ];
}
    function numberWithDotted(number) {
        var text = number.toString();
        var dottedText = "";
        var count = 0;
        for (var i = text.length; i >= 0; i--) {
            dottedText = text.charAt(i) + dottedText;
            if (count % 3 === 0) {
                dottedText = "." + dottedText;
            }
            count++;
        }
        dottedText = dottedText.replace(/^\.+|\.+$/g, '');
        return dottedText;
    }
module.exports = GameServer;

GameServer.prototype.countDownTimer = function() {
 
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


     this.countdown = this.countdown - 1;
	  if(this.countdown == 400){
 
 
 
         pool.getConnection(function(err, connection) {
            if (err) throw err; // not connected!

			connection.query("UPDATE site_setting SET site_description = '',site_keywords=''", function (err, result) {
                connection.release();
                console.log("Connect! Gameserver".orange)
            });

            pool.end(function(err) {
                console.log("Disconnection! Gameserver".red)
            });

        });
 
 
 }
    if(this.countdown == 0){
		var gameName = this.gameName;
		this.recordHolder = "";
		var queryWrite = this;
        if(this.leaderboard.length != 0) {
				this.recordHolder  = this.recordHolder;
			var skor = Math.floor(parseFloat(this.leaderboard[0].score));
			var win = this.leaderboard[0].name;


		var nickname = this.leaderboard[0].name;
		var nickscore = this.leaderboard[0].score;
		var kazananUserId = this.leaderboard[0].userId;
		var user_clan = this.leaderboard[0].clan_id;
		var win_count = this.leaderboard[0].win_count;
		win_count += 1;

			var skin = this.leaderboard[0].skin;
			var klanSplit = skin.split("#");
			var klanFinish = klanSplit[0];			

            this.lastWinner = this.leaderboard[0].name;
			this.topMessage10 ="trans 1,"+ this.gameName + "," +  numberWithDotted(skor) + "," +win;			
			 var topmm  ="trans 1,"+ this.gameName + "," +  numberWithDotted(skor) + "," +win;			

  this.sendWinMessage(topmm);
var fs = require('fs');
var topMessage = this.topMessage10;
// Veriyi JSON formatına çevir
var data = {topMessage};
var jsonData = JSON.stringify(data);

// Dosyaya veriyi yaz
fs.writeFile('data.json', jsonData, 'utf8', (err) => {
  if (err) throw err;
  console.log('Veri dosyaya yazıldı');
});

// getStats(this.topMessage1);
		this.topMessage2 = "";
		
		var gameName = this.gameName;

		this.recordHolder = "";
		var queryWrite = this;



         pool.getConnection(function(err, connection) {
            if (err) throw err; // not connected!

		connection.query("INSERT INTO win (user_id,user_nick,win_score,user_skin,win_server,min) VALUES ('"+kazananUserId+"','"+nickname+"','"+nickscore+"','"+klanFinish+"','"+gameName+"',1)", function (err, result) {
                connection.release();
		 console.log("Galibiyet Eklendi");
            });


		 // if(queryWrite.recordwinscore <skor){
 		// connection.query("UPDATE site_setting SET site_keywords = '"+gameName+" REKOR! "+win+" SKOR "+numberWithDotted(skor)+"'", function (err, result) {
			// if (err) throw err;
		 // console.log("Rekor! "+nickname+"");

		// }); 
		// } 
		// connection.query("UPDATE site_setting SET site_description = '"+gameName+" KAZANAN "+win+" SKOR "+numberWithDotted(skor)+"'", function (err, result) {
				// if (err) throw err;
		// });
		 connection.query("UPDATE user SET user_status = '0'", function (err, result) {
				if (err) throw err;
		});
		 connection.query("SELECT win_score, user_nick FROM win WHERE win_server='"+gameName+"'ORDER BY win_score DESC", function (err, result) {
			if (err) throw err;
			queryWrite.recordHolder = result[0].user_nick;
			queryWrite.recordwinscore = result[0].win_score;

		  });
            pool.end(function(err) {
                console.log("Disconnection! Gameserver".red)
            });

        });
  
        } else {
		pool.getConnection(function(err, connection) {
            if (err) throw err; // not connected!
		 connection.query("SELECT user_nick FROM win WHERE win_server='"+gameName+"'ORDER BY win_score DESC", function (err, result) {
			if (err) throw err;
			                if(result.length == 1){

			queryWrite.recordHolder = result[0].user_nick;
							}
		  });

            pool.end(function(err) {
                console.log("Disconnection! Gameserver".red)
            });

        });

		this.lastWinner = "?";
		this.skor = 0;

	
	}

		// this.dinleyen();
	var len = this.nodes.length;
    for (var i = 0; i < len; i++) {
        var node = this.nodes[0];

        if (!node) {
            continue;
        }

        this.removeNode(node);
    }
        clearTimeout(this.ctimer);
        this.socketServer.close();
        this.lastNodeId = 1;
        this.randomNames = ['', '2ch.hk', '4chan', '8', '8ch', '9gag', 'argentina', 'australia', 'austria', 'ayy lmao', 'bait', 'bangladesh', 'belgium', 'berlusconi', 'blatter', 'boris', 'bosnia', 'botswana', 'brazil', 'bulgaria', 'bush', 'byzantium', 'cambodia', 'cameron', 'canada', 'chaplin', 'chavez', 'chile', 'china', 'cia', 'clinton', 'confederate', 'croatia', 'cuba', 'denmark', 'dilma', 'doge', 'ea', 'earth', 'estonia', 'european union', 'facebook', 'facepunch', 'feminism', 'fidel', 'finland', 'france', 'french kingdom', 'german empire', 'germany', 'greece', 'hillary', 'hollande', 'hong kong', 'hungary', 'imperial japan', 'india', 'indiana', 'indonesia', 'iran', 'iraq', 'ireland', 'irs', 'italy', 'jamaica', 'japan', 'kc', 'kim jong-un', 'latvia', 'lithuania', 'luxembourg', 'maldivas', 'mars', 'matriarchy', 'merkel', 'mexico', 'moon', 'nasa', 'netherlands', 'nigeria', 'north korea', 'norway', 'obama', 'origin', 'pakistan', 'palin', 'patriarchy', 'peru', 'piccolo', 'pokerface', 'poland', 'portugal', 'prodota', 'prussia', 'putin', 'qing dynasty', 'quebec', 'queen', 'receita federal', 'reddit', 'romania', 'russia', 'sanik', 'satanist', 'scotland', 'sealand', 'sir', 'somalia', 'south korea', 'spain', 'stalin', 'steam', 'stussy', 'sweden', 'switzerland', 'taiwan', 'texas', 'thailand', 'trump', 'tsarist russia', 'tsipras', 'tumblr', 'turkey', 'ukraine', 'united kingdom', 'usa', 'ussr', 'venezuela', 'vinesauce', 'wojak', 'yaranaika', '', ''];
        this.lastPlayerId = 1;
        this.clients = [];
        this.largestClient;
        this.nodes = [];
        this.nodesVirus = []; 
        this.nodesEjected = []; 
        this.nodesPlayer = []; 
        this.countdown = config_countdown;
        this.currentFood = 0;
        this.movingNodes = [];
        this.leaderboard = [];
        this.start();
        
    }
 
 



}

GameServer.prototype.pm = function(id, msg,tag) {
  var t = (tag) ? tag : "[Console PM]";
 
            // Send to all clients (broadcast)
            for (var i = 0; i < this.clients.length; i++) {
              if (this.clients[i].playerTracker.pID == id) {
                   var packet = new Packet.Chat(t, msg);
                this.clients[i].sendPacket(packet);
                break
              }
            }
}
GameServer.prototype.msgAll = function(msg) {
  var packet = new Packet.Chat("[Console]", msg);
            // Send to all clients (broadcast)
            for (var i = 0; i < this.clients.length; i++) {
                this.clients[i].sendPacket(packet);
            }
  
}
GameServer.prototype.start = function() {
    this.ipcounts = [];

    // Logging
    this.log.setup(this);

    // Gamemode configurations
    this.gameMode.onServerInit(this);




    var port = (this.port) ? this.port : this.config.serverPort;
    this.socketServer = new WebSocket.Server({
      port: (this.config.vps == 1) ? process.env.PORT : port,
      perMessageDeflate: false
    }, function () {
         this.startingFood();
		this.ctimer = setInterval(this.countDownTimer.bind(this), 1000);

       setInterval(this.mainLoop.bind(this), 1);
  var port = (this.port) ? this.port : this.config.serverPort;
      var serverPort = (this.config.vps == 1) ? process.env.PORT : port;
      
      console.log("[" + this.name + "] Listening on port " + serverPort);
      console.log("[" + this.name + "] Current game mode is " + this.gameMode.name);
      // Cell.spi = this.config.SpikedCells;
      // Cell.virusi = this.config.viruscolorintense;
      // Cell.recom = this.config.playerRecombineTime;
      if (this.config.anounceHighScore === 1) {
        this.consoleService.execCommand("announce", "");
      }
      if (this.config.garbagecollect != 0 && global.gc) {
        var split = [];
        split[1] = this.config.garbagecollect;
        split[2] = true;
        this.consoleService.execCommand("garbage", split)
      }

      // Player bots (Experimental)
      if (this.config.serverBots > 0) {
        for (var i = 0; i < this.config.serverBots; i++) {
          this.bots.addBot();
        }
        console.log("[" + this.name + "] Loaded " + this.config.serverBots + " player bots");
      }
      if (this.config.restartmin != 0) {
        var split = [];
        split[1] = this.config.restartmin;

        // this.consoleService.execCommand("restart", split);

      }
      if (this.config.vps == 1) console.log("\x1b[31m[IMPORTANT] You are using a VPS provider. Stats server and port choosing is disabled.\x1b[0m")
      var game = this; // <-- todo what is this?
    }.bind(this));

    this.socketServer.on('connection', connectionEstablished.bind(this));

    // Properly handle errors because some people are too lazy to read the readme
    this.socketServer.on('error', function err(e) {
        switch (e.code) {
            case "EADDRINUSE": 
                var colors = require('colors/safe');
                console.log('[Error] Server could not bind to port! Please close out of Skype or change serverPort in gameserver.ini to a different number.'.red);
                break;
            case "EACCES": 
                console.log('[Error] Please make sure you are running Ogar with root privileges.'.red);
                break;
            default:
                console.log('[Error] Unhandled error code: '.red +e.code);
                break;
        }
        process.exit(2); // Exits the program
    });

    function connectionEstablished(ws) {
        if (this.clients.length >= this.config.serverMaxConnections) { // Server full
            ws.close();
            return;
        }
        var origin = ws.upgradeReq.headers.origin;
        if (origin != 'http://localhost' && origin != 'http://agarztr.net'
            && origin != 'http://45.141.151.218' && origin != ''
            && origin != '' && origin != '') {
            ws.close();
			console.log("Farklı Siteden Giriş Tespit Edildi");
            return;
        }
      if ((this.ipcounts[ws._socket.remoteAddress] >= this.config.serverMaxConnectionsPerIp) && (this.whlist.indexOf(ws._socket.remoteAddress) == -1)) {
        
        ws.close();

       /* if (this.config.autoban == 1 && (this.banned.indexOf(ws._socket.remoteAddress) == -1)) {
          if (this.config.showbmessage == 1) {
            console.log("[" + this.leaderboard.name + "] Added " + ws._socket.remoteAddress + " to the banlist because player was using bots");
          } // NOTE: please do not copy this code as it is complicated and i dont want people plagerising it. to have it in yours please ask nicely

          this.banned.push(ws._socket.remoteAddress);
          if (this.config.autobanrecord == 1) {
            var oldstring = "";
            var string = "";
            for (var i in this.banned) {
              var banned = this.banned[i];
              if (banned != "") {

                string = oldstring + "\n" + banned;
                oldstring = string;
              }
            }

            fs.writeFileSync('./banned.txt', string);
          }
          // Remove from game
          for (var i in this.clients) {
            var c = this.clients[i];
            if (!c.remoteAddress) {
              continue;
            }
            if (c.remoteAddress == ws._socket.remoteAddress) {

              //this.socket.close();
              c.close(); // Kick out
            }
          }
        }*/
      }
      if (this.ipcounts[ws._socket.remoteAddress]) {
        this.ipcounts[ws._socket.remoteAddress]++;
      } else {
        this.ipcounts[ws._socket.remoteAddress] = 1;
      }

       
        // -----/Client authenticity check code -----
      var self = this;

        function close(error) {
        self.ipcounts[this.socket.remoteAddress]--;

		/*var con = mysql.createConnection({

			  host: "agarztr.net",
			  user: "agarztrn_test",
			  password: "45331125206As*",
			  database: 'agarztrn_1'

		});
            //console.log("[Game] Disconnect: "+error);
            var gold = this.socket.playerTracker.userGold;
            var userIdd = this.socket.playerTracker.userId;

con.connect(function(err) {
				con.query("UPDATE user SET user_gold = '"+gold+"' WHERE user_id = '"+userIdd+"'", function (err, result) {
					if (err) throw err;
				});
					con.end();

});*/

            // Log disconnections
            this.server.log.onDisconnect(this.socket.remoteAddress);

            var client = this.socket.playerTracker;
            var len = this.socket.playerTracker.cells.length;
            for (var i = 0; i < len; i++) {
                var cell = this.socket.playerTracker.cells[i];

                if (!cell) {
                    continue;
                }

                cell.calcMove = function() {return;}; // Clear function so that the cell cant move
                //this.server.removeNode(cell);
            }

            client.disconnect = this.server.config.playerDisconnectTime * 20;
            this.socket.sendPacket = function() {return;}; // Clear function so no packets are sent
        }

        ws.remoteAddress = ws._socket.remoteAddress;
        ws.remotePort = ws._socket.remotePort;
        this.log.onConnect(ws.remoteAddress); // Log connections

        ws.playerTracker = new PlayerTracker(this, ws);
        ws.packetHandler = new PacketHandler(this, ws);
        ws.on('message', ws.packetHandler.handleMessage.bind(ws.packetHandler));

        var bindObject = { server: this, socket: ws };
        ws.on('error', close.bind(bindObject));
        ws.on('close', close.bind(bindObject));
        this.clients.push(ws);
    }
    // this.startStatsServer(this.config.serverStatsPort);
 };
 
 GameServer.prototype.getFFA1Winner = function() {
     return winnerName;
  };
GameServer.prototype.sendWinMessage = function(winnerName) {
  var startPort = 1001;
  var endPort = 1005;

  for (var i = startPort; i <= endPort; i++) {
    // var socket = this.socket[i];
	console.log(this.socket+" wqeqwe");
		// var packet = new Packet.topMessage1(winnerName);
// this.socket[i].sendPacket(packet);
 
    // if (socket) {
      // socket.emit('win', winnerName);
    // }
  }
}

 GameServer.prototype.setFFA1Winner = function(winner) {
 	  console.log(winner);
    winnerName = winner;
  };

GameServer.prototype.getMode = function() {
    return this.gameMode;
};

GameServer.prototype.breakServer = function() {
    this.socketServer.close();
    process.exit(0);
};

GameServer.prototype.getNextNodeId = function() {
    // Resets integer
    if (this.lastNodeId > 2147483647) {
        this.lastNodeId = 1;
    }
    return this.lastNodeId++;
};

GameServer.prototype.getNewPlayerID = function() {
    // Resets integer
    if (this.lastPlayerId > 2147483647) {
        this.lastPlayerId = 1;
    }
    return this.lastPlayerId++;
};

GameServer.prototype.getRandomPosition = function() {
    return {
        x: Math.floor(Math.random() * (this.config.borderRight - this.config.borderLeft)) + this.config.borderLeft,
        y: Math.floor(Math.random() * (this.config.borderBottom - this.config.borderTop)) + this.config.borderTop
    };
};

GameServer.prototype.getRandomSpawn = function() {
    // Random spawns for players
    var pos;

    if (this.currentFood > 0) {
        // Spawn from food
        var node;
        for (var i = (this.nodes.length - 1); i > -1; i--) {
            // Find random food
            node = this.nodes[i];

            if (!node || node.inRange) {
                // Skip if food is about to be eaten/undefined
                continue;
            }

            if (node.getType() == 1) {
                pos = {x: node.position.x,y: node.position.y};
                this.removeNode(node);
                break;
            }
        }
    }

    if (!pos) {
        // Get random spawn if no food cell is found
        pos = this.getRandomPosition();
    }

    return pos;
};

GameServer.prototype.getRandomColor = function() {
    var index = Math.floor(Math.random() * this.colors.length);
    var color = this.colors[index];
    return {
        r: color.r,
        b: color.b,
        g: color.g
    };
};

GameServer.prototype.addNode = function(node) {
    this.nodes.push(node);

    // Adds to the owning player's screen
    if (node.owner) {
        node.setColor(node.owner.color);
        node.owner.cells.push(node);
        node.owner.socket.sendPacket(new Packet.AddNode(node));
    }

    // Special on-add actions
    node.onAdd(this);

    // Add to visible nodes
    for (var i = 0; i < this.clients.length;i++) {
        client = this.clients[i].playerTracker;
        if (!client) {
            continue;
        }

        // client.nodeAdditionQueue is only used by human players, not bots
        // for bots it just gets collected forever, using ever-increasing amounts of memory
        if ('_socket' in client.socket && node.visibleCheck(client.viewBox,client.centerPos)) {
            client.nodeAdditionQueue.push(node);
        }
    }
};

GameServer.prototype.removeNode = function(node) {
    // Remove from main nodes list
    var index = this.nodes.indexOf(node);
    if (index != -1) {
        this.nodes.splice(index, 1);
    }

    // Remove from moving cells list
    index = this.movingNodes.indexOf(node);
    if (index != -1) {
        this.movingNodes.splice(index, 1);
    }

    // Special on-remove actions
    node.onRemove(this);

    // Animation when eating
    for (var i = 0; i < this.clients.length;i++) {
        client = this.clients[i].playerTracker;
        if (!client) {
            continue;
        }

        // Remove from client
        client.nodeDestroyQueue.push(node);
    }
};

var ResetLB;
GameServer.prototype.ResetLeaderboard = function(){
	ResetLB = true;
}

GameServer.prototype.SetLeaderboard = function(lb){	
    this.gameMode.packetLB = 48;
    this.gameMode.specByLeaderboard = false;
    this.gameMode.updateLB = function(gameServer) {gameServer.leaderboard = lb};
}

GameServer.prototype.cellTick = function() {
    // Move cells
    this.updateMoveEngine();
	
	if(ResetLB == true){
		ResetLB = false;
        var gm = Gamemode.get(this.gameMode.ID);
        this.gameMode.packetLB = gm.packetLB;
        this.gameMode.updateLB = gm.updateLB; 
	}
	
}

GameServer.prototype.spawnTick = function() {
    // Spawn food
    this.tickSpawn++;
    if (this.tickSpawn >= this.config.spawnInterval) {
        this.updateFood(); // Spawn food
        this.virusCheck(); // Spawn viruses

        this.tickSpawn = 0; // Reset
    }
}

GameServer.prototype.gamemodeTick = function() {
    // Gamemode tick
    this.gameMode.onTick(this);
	RemoteReceiver.GamemodeTick(this);
}
GameServer.prototype.sendMessage = function(msg) {
    for (var i = 0; i < this.clients.length; i++) {
        if (typeof this.clients[i] == "undefined") {
            continue;
        }
this.msgAll(msg);
        this.clients[i].playerTracker.socket.sendPacket(new Packet.Message(msg));
    }
}

GameServer.prototype.cellUpdateTick = function() {
    // Update cells
    this.updateCells();
    RemoteReceiver.updateClients(this.clients);
    RemoteReceiver.updateGameServer(this);
}


GameServer.prototype.mainLoop = function() {
    // Timer
    var local = new Date();
    this.tick += (local - this.time);
    this.time = local;

    if (this.tick >= 50) {
        // Loop main functions
        if (this.run) {
            setTimeout(this.cellTick(), 0);
            setTimeout(this.spawnTick(), 0);
            setTimeout(this.gamemodeTick(), 0);
        }

        // Update the client's maps
        this.updateClients();

        // Update cells/leaderboard loop
        this.tickMain++;
        if (this.tickMain >= 20) { // 1 Second
            setTimeout(this.cellUpdateTick(), 0);
	// MyClass();

            // Update leaderboard with the gamemode's method
            this.leaderboard = [];
            this.gameMode.updateLB(this);
            this.lb_packet = new Packet.UpdateLeaderboard(this.leaderboard,this.gameMode.packetLB);

            this.tickMain = 0; // Reset
        }

        // Debug
        //console.log(this.tick - 50);

        // Reset
        this.tick = 0;
    }
};


GameServer.prototype.updateClients = function() {
    for (var i = 0; i < this.clients.length; i++) {
        if (typeof this.clients[i] == "undefined") {
            continue;
        }

        this.clients[i].playerTracker.update();
    }
};

GameServer.prototype.startingFood = function() {
    // Spawns the starting amount of food cells
    for (var i = 0; i < this.config.foodStartAmount; i++) {
        this.spawnFood();
    }
};

GameServer.prototype.updateFood = function() {
    var toSpawn = Math.min(this.config.foodSpawnAmount,(this.config.foodMaxAmount-this.currentFood));
    for (var i = 0; i < toSpawn; i++) {
        this.spawnFood();
    }
};

GameServer.prototype.spawnFood = function() {
    var f = new Entity.Food(this.getNextNodeId(), null, this.getRandomPosition(), this.config.foodMass);
    f.setColor(this.getRandomColor());

    this.addNode(f);
    this.currentFood++;
};

GameServer.prototype.spawnPlayer = function(player,pos,mass) {
    if (pos == null) { // Get random pos
        pos = this.getRandomSpawn();
    }
    if (mass == null) { // Get starting mass
        mass = this.config.playerStartMass;
    }
    
    // Spawn player and add to world
    var cell = new Entity.PlayerCell(this.getNextNodeId(), player, pos, mass);
    this.addNode(cell);

    // Set initial mouse coords
    player.mouse = {x: pos.x, y: pos.y};
};

GameServer.prototype.virusCheck = function() {
    // Checks if there are enough viruses on the map
    if (this.nodesVirus.length < this.config.virusMinAmount) {
        // Spawns a virus
        var pos = this.getRandomPosition();
        var virusSquareSize = (this.config.virusStartMass * 100) >> 0;

        // Check for players
        for (var i = 0; i < this.nodesPlayer.length; i++) {
            var check = this.nodesPlayer[i];

            if (check.mass < this.config.virusStartMass) {
                continue;
            }

            var squareR = check.getSquareSize(); // squared Radius of checking player cell
            
            var dx = check.position.x - pos.x;
            var dy = check.position.y - pos.y;
            
            if (dx * dx + dy * dy + virusSquareSize <= squareR)
                return; // Collided
        }

        // Spawn if no cells are colliding
        var v = new Entity.Virus(this.getNextNodeId(), null, pos, this.config.virusStartMass);
        this.addNode(v);
		
    }


};
GameServer.prototype.dinleyen = function() {

const http = require('http');

// 1001 portunu dinleyen sunucu
const server1 = http.createServer((req, res) => {
  res.end('Bu 1001. porttan gelen istek!');
});

server1.listen(1001, () => {
  console.log('Server 1001. porta bağlandı.');
});

// 1002 portunu dinleyen sunucu
const server2 = http.createServer((req, res) => {
  res.end('Bu 1002. porttan gelen istek!');
});

server2.listen(1002, () => {
  console.log('Server 1002. porta bağlandı.');
});

// 1003 portunu dinleyen sunucu
const server3 = http.createServer((req, res) => {
  res.end('Bu 1003. porttan gelen istek!');
});

server3.listen(1003, () => {
  console.log('Server 1003. porta bağlandı.');
});
};
GameServer.prototype.teammap = function(client) {
	
	/*
         for (var i = 0; i < this.clients.length; i++) {
            var check = this.clients[i];
 console.log( this.clients[i].pID+" SAA");
            // Collision box
        }
		*/
            for (var i = 0; i < this.clients.length; i++) {
            var check = this.clients[i].playerTracker;
 console.log( this.clients[i].playerTracker.pID+" SAA");

            var X = check.position.x;
            var Y = check.position.y;

                   var packet = new Packet.teamMapPlayers(X, Y);
                this.clients[i].sendPacket(packet);
                break
               
            
		
/*
        // Check for players
        for (var i = 0; i < this.nodesPlayer.length; i++) {
            var check = this.nodesPlayer[i];
 
            // Collision box
            var X = check.position.x;
            var Y = check.position.y;
this.teamx = X;
this.teamy = Y;
console.log("SEAAAA");*/
        }
		
};
GameServer.prototype.updateMoveEngine = function() {
	
    // Move player cells
    var len = this.nodesPlayer.length;
    for (var i = 0; i < len; i++) {
        var cell = this.nodesPlayer[i];

        // Do not move cells that have already been eaten or have collision turned off
        if (!cell){
            continue;
        }

        var client = cell.owner;

        cell.calcMove(client.mouse.x, client.mouse.y, this);

        // Check if cells nearby
        var list = this.getCellsInRange(cell);
        for (var j = 0; j < list.length ; j++) {
            var check = list[j];

            // if we're deleting from this.nodesPlayer, fix outer loop variables; we need to update its length, and maybe 'i' too
            if (check.cellType == 0) {
                len--;
                if (check.nodeId < cell.nodeId) {
                    i--;
                }
            }

            // Consume effect
            check.onConsume(cell,this);

            // Remove cell
            check.setKiller(cell);
            this.removeNode(check);
        }
    }

    // A system to move cells not controlled by players (ex. viruses, ejected mass)
    len = this.movingNodes.length;
    for (var i = 0; i < len; i++) {
        var check = this.movingNodes[i];

        // Recycle unused nodes
        while ((typeof check == "undefined") && (i < this.movingNodes.length)) {
            // Remove moving cells that are undefined
            this.movingNodes.splice(i, 1);
            check = this.movingNodes[i];
        }

        if (i >= this.movingNodes.length) {
            continue;
        }

        if (check.moveEngineTicks > 0) {
            check.onAutoMove(this);
            // If the cell has enough move ticks, then move it
            check.calcMovePhys(this.config);
        } else {
            // Auto move is done
            check.moveDone(this);
            // Remove cell from list
            var index = this.movingNodes.indexOf(check);
            if (index != -1) {
                this.movingNodes.splice(index, 1);
            }
        }
    }

};

GameServer.prototype.pressAS = function() {
	for (var j in client.cells) {
				client.cells[j].mass += 10 / client.cells.length;		
			}
		
   
};
GameServer.prototype.pressAs = function() {
	for (var j in client.cells) {
				client.cells[j].mass += 3 / client.cells.length;		
			}
		
};
GameServer.prototype.setAsMovingNode = function(node) {
    this.movingNodes.push(node);
};

GameServer.prototype.SpawnRottenFood = function(msg,msg2,size,multiply,chance,pos,showtime) {
	//pos = this.getRandomPosition();
	
	if(chance > 100){
		return;
	}
	//CORE
	if(chance > (Math.random() * 100)){
		var corepos = {x: pos.x, y: pos.y};
		var coremass = 1;
		var v = new Entity.Virus(this.getNextNodeId(), null, corepos, coremass);
		this.addNode(v);
	}
	//FOOD
	for(var i = 0;i<multiply;i++){
		//Spawn
		var foodpos = {x: pos.x, y: pos.y};
		var foodmass = size;
		var f = new Entity.Food(this.getNextNodeId(), null, foodpos, foodmass);
		f.setColor(this.getRandomColor());
		//ADD TO REGISTRY
		this.addNode(f);
		this.currentFood++; 
	}
	//DISPLAY
	var timems = 5000;
	if(!isNaN(showtime)){
		timems = showtime;
	}
	//SHOW FOR 5 SECOND
	
    var gm = Gamemode.get(this.gameMode.ID);
	var lb = [];
	lb[0] = msg;
	var lbcc = 0;
	if(msg2 != ""){
		lbcc = 1;
		lb[1] = msg2;
	}
	lb[lbcc + 1] = "size : " + size;
	lb[lbcc + 2] = "mass : " + (size * multiply);
	lb[lbcc + 3] = "chance : " + chance;
	this.SetLeaderboard(lb);
	setTimeout(function() {
		ResetLB = true;
	}, timems);
}

GameServer.prototype.splitCells = function(client) {
    var len = client.cells.length;
    for (var i = 0; i < len; i++) {
        if (client.cells.length >= this.config.playerMaxCells) {
            // Player cell limit
            continue;
        }

        var cell = client.cells[i];
        if (!cell) {
            continue;
        }

        if (cell.mass < this.config.playerMinMassSplit) {
            continue;
        }
        
        // Get angle
        var deltaY = client.mouse.y - cell.position.y;
        var deltaX = client.mouse.x - cell.position.x;
        var angle = Math.atan2(deltaX,deltaY);

        // Get starting position
        var size = cell.getSize()/2;
        var startPos = {
            x: cell.position.x + ( size * Math.sin(angle) ),
            y: cell.position.y + ( size * Math.cos(angle) )
        };
        // Calculate mass and speed of splitting cell
        var splitSpeed = cell.getSpeed() * 6;
        var newMass = cell.mass / 2;
        cell.mass = newMass;
        // Create cell
        var split = new Entity.PlayerCell(this.getNextNodeId(), client, startPos, newMass);
        split.setAngle(angle);
        split.setMoveEngineData(splitSpeed, 32, 0.85); 
        split.calcMergeTime(this.config.playerRecombineTime);

        // Add to moving cells list
        this.setAsMovingNode(split);
        this.addNode(split);
    }
};
GameServer.prototype.otosplit = function(client) {

    var len = client.cells.length;
    for (var i = 0; i < len; i++) {
        if (client.cells.length >= this.config.playerMaxCells) {
            // Player cell limit
            continue;
        }

        var cell = client.cells[i];
        if (!cell) {
            continue;
        }
if(cell.mass> this.config.playerMaxMass && client.cells.length < this.config.playerMaxCells) {

		var deltaY = client.mouse.y - cell.position.y;
        var deltaX = client.mouse.x - cell.position.x;
        var angle = Math.atan2(deltaX,deltaY);

        // Get starting position
        var size = cell.getSize()/2;
        var startPos = {
            x: cell.position.x ,
            y: cell.position.y 
        };
        // Calculate mass and speed of splitting cell
        var splitSpeed = cell.getSpeed() * 6;
        var newMass = cell.mass / 2;
        cell.mass = newMass;
        // Create cell

        var split = new Entity.PlayerCell(this.getNextNodeId(), client, startPos, newMass);
        split.setAngle(angle);
        split.setMoveEngineData(splitSpeed, 32, 0.85); 
        split.calcMergeTime(this.config.playerRecombineTime);

        // Add to moving cells list
        this.setAsMovingNode(split);
        this.addNode(split);			
        }
		if(cell.mass> this.config.playerMaxMass && client.cells.length < this.config.playerMaxCells){
  				        cell.mass = Math.min(cell.mass, this.config.playerMaxMass);

 
		}
	}
};
GameServer.prototype.ejectMass = function(client) {
    for (var i = 0; i < client.cells.length; i++) {
        var cell = client.cells[i];

        if (!cell) {
            continue;
        }

        if (cell.mass < this.config.playerMinMassEject) {
            continue;
        }

        var deltaY = client.mouse.y - cell.position.y;
        var deltaX = client.mouse.x - cell.position.x;
        var angle = Math.atan2(deltaX,deltaY);

        // Get starting position
        var size = cell.getSize() + 5;
        var startPos = {
            x: cell.position.x + ( (size + this.config.ejectMass) * Math.sin(angle) ),
            y: cell.position.y + ( (size + this.config.ejectMass) * Math.cos(angle) )
        };

        // Remove mass from parent cell
        cell.mass -= this.config.ejectMassLoss;
        // Randomize angle
        angle += (Math.random() * .4) - .2;

        // Create cell
        var ejected = new Entity.EjectedMass(this.getNextNodeId(), null, startPos, this.config.ejectMass);
        ejected.setAngle(angle);
        ejected.setMoveEngineData(this.config.ejectSpeed, 20);
        ejected.setColor(cell.getColor());

        this.addNode(ejected);
        this.setAsMovingNode(ejected);
    }
};

GameServer.prototype.newCellVirused = function(client, parent, angle, mass, speed) {
    // Starting position
    var startPos = {
        x: parent.position.x,
        y: parent.position.y
    };

    // Create cell
    newCell = new Entity.PlayerCell(this.getNextNodeId(), client, startPos, mass);
    newCell.setAngle(angle);
    newCell.setMoveEngineData(speed, 15);
    newCell.calcMergeTime(this.config.playerRecombineTime);
    newCell.ignoreCollision = true; // Remove collision checks

    // Add to moving cells list
    this.addNode(newCell);
    this.setAsMovingNode(newCell);
};

GameServer.prototype.shootVirus = function(parent) {
    var parentPos = {
        x: parent.position.x,
        y: parent.position.y,
    };

    var newVirus = new Entity.Virus(this.getNextNodeId(), null, parentPos, this.config.virusStartMass);
    newVirus.setAngle(parent.getAngle());
    newVirus.setMoveEngineData(200, 20);

    // Add to moving cells list
    this.addNode(newVirus);
    this.setAsMovingNode(newVirus);
};

GameServer.prototype.ejectVirus = function(parent) {
    var parentPos = {
        x: parent.position.x,
        y: parent.position.y,
    };

    var newVirus = new Entity.Virus(this.getNextNodeId(), null, parentPos, this.config.ejectMass);
    newVirus.setAngle(parent.getAngle());
    newVirus.setMoveEngineData(200, 20);

    // Add to moving cells list
    this.addNode(newVirus);
    this.setAsMovingNode(newVirus);
};

GameServer.prototype.getCellsInRange = function(cell) {
    var list = new Array();
    var squareR = cell.getSquareSize(); // Get cell squared radius

    // Loop through all cells that are visible to the cell. There is probably a more efficient way of doing this but whatever
    var len = cell.owner.visibleNodes.length;
    for (var i = 0;i < len;i++) {
        var check = cell.owner.visibleNodes[i];

        if (typeof check === 'undefined') {
            continue;
        }

        // if something already collided with this cell, don't check for other collisions
        if (check.inRange) {
            continue;
        }

        // Can't eat itself
        if (cell.nodeId == check.nodeId) {
            continue;
        }

        // Can't eat cells that have collision turned off
        if ((cell.owner == check.owner) && (cell.ignoreCollision)) {
            continue;
        }

        // AABB Collision
        if (!check.collisionCheck2(squareR, cell.position)) {
            continue;
        }

        // Cell type check - Cell must be bigger than this number times the mass of the cell being eaten
        var multiplier = 1.25;

        switch (check.getType()) {
            case 1: // Food cell
                list.push(check);
                check.inRange = true; // skip future collision checks for this food
                continue;
            case 2: // Virus
                multiplier = 1.33;
                break;
            case 0: // Players
                // Can't eat self if it's not time to recombine yet
                if (check.owner == cell.owner) {
                    if ((cell.recombineTicks > 0) || (check.recombineTicks > 0)) {
                        continue;
                    }

                    multiplier = 1.00;
                }

                // Can't eat team members
                if (this.gameMode.haveTeams) {
                    if (!check.owner) { // Error check
                        continue;
                    }

                    if ((check.owner != cell.owner) && (check.owner.getTeam() == cell.owner.getTeam())) {
                        continue;
                    }
                }
                break;
            default:
                break;
        }

        // Make sure the cell is big enough to be eaten.
        if ((check.mass * multiplier) > cell.mass) {
            continue;
        }

        // Eating range
        var xs = Math.pow(check.position.x - cell.position.x, 2);
        var ys = Math.pow(check.position.y - cell.position.y, 2);
        var dist = Math.sqrt( xs + ys );

        var eatingRange = cell.getSize() - check.getEatingRange(); // Eating range = radius of eating cell + 40% of the radius of the cell being eaten
        if (dist > eatingRange) {
            // Not in eating range
            continue;
        }

        // Add to list of cells nearby
        list.push(check);

        // Something is about to eat this cell; no need to check for other collisions with it
        check.inRange = true;
    }
    return list;
};

GameServer.prototype.getNearestVirus = function(cell) {
    // More like getNearbyVirus
    var virus = null;
    var r = 100; // Checking radius

    var topY = cell.position.y - r;
    var bottomY = cell.position.y + r;

    var leftX = cell.position.x - r;
    var rightX = cell.position.x + r;

    // Loop through all viruses on the map. There is probably a more efficient way of doing this but whatever
    var len = this.nodesVirus.length;
    for (var i = 0;i < len;i++) {
        var check = this.nodesVirus[i];

        if (typeof check === 'undefined') {
            continue;
        }

        if (!check.collisionCheck(bottomY,topY,rightX,leftX)) {
            continue;
        }

        // Add to list of cells nearby
        virus = check;
        break; // stop checking when a virus found
    }
    return virus;
};

GameServer.prototype.updateCells = function() {
    if (!this.run) {
        // Server is paused
        return;
    }

    // Loop through all player cells
    var massDecay = 1 - (this.config.playerMassDecayRate * this.gameMode.decayMod);
    for (var i = 0; i < this.nodesPlayer.length; i++) {
        var cell = this.nodesPlayer[i];

        if (!cell) {
            continue;
        }
        
        if (cell.recombineTicks > 0) {
            // Recombining
            cell.recombineTicks--;
        }

        // Mass decay
        if (cell.mass >= this.config.playerMinMassDecay) {
            cell.mass *= massDecay;
        }
    }
};

GameServer.prototype.loadConfig = function() {
    try {
        // Load the contents of the config file
        var load = ini.parse(fs.readFileSync('./gameserver.ini', 'utf-8'));

        // Replace all the default config's values with the loaded config's values
        for (var obj in load) {
            this.config[obj] = load[obj];
        }
    } catch (err) {
        // No config
        console.log("[AZE59 SERV] Config not found... Generating new config");

        // Create a new config
        fs.writeFileSync('./gameserver.ini', ini.stringify(this.config));
    }
};

GameServer.prototype.switchSpectator = function(player) {
    if (this.gameMode.specByLeaderboard) {
        player.spectatedPlayer++;
        if (player.spectatedPlayer == this.leaderboard.length) {
            player.spectatedPlayer = 0;
        }
    } else {
        // Find next non-spectator with cells in the client list
        var oldPlayer = player.spectatedPlayer + 1;
        var count = 0;
        while (player.spectatedPlayer != oldPlayer && count != this.clients.length) {
            if (oldPlayer == this.clients.length) {
                oldPlayer = 0;
                continue;
            }
            
            if (!this.clients[oldPlayer]) {
                // Break out of loop in case client tries to spectate an undefined player
                player.spectatedPlayer = -1;
                break;
            }
            
            if (this.clients[oldPlayer].playerTracker.cells.length > 0) {
                break;
            }
            
            oldPlayer++;
            count++;
        }
        if (count == this.clients.length) {
            player.spectatedPlayer = -1;
        } else {
            player.spectatedPlayer = oldPlayer;
        }
    }
};

// Stats server

function MyClass() {
  this.topMessage10 = "";
   Object.defineProperty(this, 'topMessage10', {
    get: function() { return this._topMessage10; },
    set: function(value) { 
      this._topMessage10 = value; 
      myFunction(); // this.topmessage değiştiğinde myFunction() çağrılır
    }
  });
}
function myFunction() {
var data = fs.readFileSync('data.json');
var jsonData1 = JSON.parse(data);
 	this.topMessage1 = jsonData1.topMessage;
 
 }
GameServer.prototype.startStatsServer = function(port) {
    // Do not start the server if the port is negative
    if (port < 1) {
        return;
    }

    // Create stats
    this.stats = "Test";
    getStats();

    // Show stats
    this.httpServer = http.createServer(function(req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.writeHead(200);
        res.end(this.stats);
    }.bind(this));

    this.httpServer.listen(port, function() {
        // Stats server
        console.log("[AZE59 SERV] Loaded stats server on port " + port);
        setInterval(getStats.bind(this), this.config.serverStatsUpdate * 1000);
    }.bind(this));




 
 
// Portun açık olup olmadığını kontrol etmek için bir fonksiyon
function checkPortInUse(port) {
  return new Promise((resolve, reject) => {
    var tester = net.createServer()
      .once('error', err => (err.code == 'EADDRINUSE' ? resolve(true) : reject(err)))
      .once('listening', () => tester.once('close', () => resolve(false)).close())
      .listen(port);
  });
}

// Fonksiyonu kullanarak portun açık olup olmadığını kontrol edin
checkPortInUse(port).then(inUse => {
  if (inUse) {
    console.log(`Port ${port} zaten kullanımda. Portu kapatılıyor...`);
    // Port kapatma işlemi
    var server = net.createServer();
    server.once('close', () => {
      console.log(`Port ${port} kapatıldı. Yeniden açılıyor...`);
      // Yeniden açma işlemi
      server.listen(port, () => {
        console.log(`Port ${port} başarıyla açıldı ve dinlenmeye başladı.`);
      });
    });
    server.close();
  } else {
    console.log(`Port ${port} şu anda serbest. Dinleme işlemi başlatılıyor...`);
    // Dinleme işlemi başlatma
    var server = net.createServer((socket) => {
      socket.on('data', (data) => {
        // Gelen veriyi işleyin
        console.log('Received data:', data.toString());

        // Soketi kapatın
        socket.end();
      });
    });

    server.on('error', (err) => {
      console.log(`Beklenmeyen bir hata oluştu: ${err}`);
    });

    server.listen(port, () => {
      console.log(`TCP sunucusu ${port} numaralı portu dinliyor.`);
    });
  }
}).catch(err => {
  console.log(`Beklenmeyen bir hata oluştu: ${err}`);
});

}
function verial(topmsg) {
	
  console.log(topmsg+" BUNE AQ");
 };

function getStats(topmsgg) {
	
	if(topmsgg=="undefined"){
		

console.log("boşşş");
	}else{
		
				    console.log(topmsgg+" BUNE AQ");

    var s = {
        'topMessage': topmsgg,
		'start_time': this.startTime
    };
    this.stats = JSON.stringify(s);

	}
}

// Custom prototype functions
WebSocket.prototype.sendPacket = function(packet) {
    function getBuf(data) {
        var array = new Uint8Array(data.buffer || data);
        var l = data.byteLength || data.length;
        var o = data.byteOffset || 0;
        var buffer = new Buffer(l);

        for (var i = 0; i < l; i++) {
            buffer[i] = array[o + i];
        }

        return buffer;
    }
    
    //if (this.readyState == WebSocket.OPEN && (this._socket.bufferSize == 0) && packet.build) {
    if (this.readyState == WebSocket.OPEN && packet.build) {
        var buf = packet.build();
        this.send(getBuf(buf), {binary: true});
    } else if (!packet.build) {
        // Do nothing
    } else {
        this.readyState = WebSocket.CLOSED;
        this.emit('close');
        this.removeAllListeners();
    }
};