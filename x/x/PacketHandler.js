var Packet = require('./packet');
 
var commands = require('./modules/CommandList').chat;
var commandsmod = require('./modules/CommandList').mod;
var chattx = [];
var fs = require('fs');
var dataPath = 'datamsg.json';
var lastMsg = '';

function PacketHandler(gameServer, socket) {
	this.gameServer = gameServer;
	this.socket = socket;
	// Detect protocol version - we can do something about it later
	this.protocol = 0;
	this.tickPressA = 0;
	this.tickPressD = 0;
	this.teamcode = "";
	this.tickPressS = 0;
	this.pressA = false;
	this.pressS = false;
	this.int_z = 0;
	this.int_x = 0;
	this.pressX = false;
	this.pressXx = false;
	this.pressE = false;
	this.pressEe = false;
	this.pressZ = false;
	this.pressZz = false;
	this.pressQ = false;
	this.pressW = false;
	this.pressSpace = false;

}

module.exports = PacketHandler;

PacketHandler.prototype.handleMessage = function(message) {
	try {

		function stobuf(buf) {
			var length = buf.length;
			var arrayBuf = new ArrayBuffer(length);
			var view = new Uint8Array(arrayBuf);

			for (var i = 0; i < length; i++) {
				view[i] = buf[i];
			}

			return view.buffer;
		}

		// Discard empty messages
		if (message.length == 0) {
			return;
		}

		var buffer = stobuf(message);
		var view = new DataView(buffer);
		var packetId = view.getUint8(0, true);
		switch (packetId) {
			case 0:
				// Set Nickname

				var nick = "";
				var maxLen = this.gameServer.config.playerMaxNickLength * 2; // 2 bytes per char
				for (var i = 1; i < view.byteLength && i <= maxLen; i += 2) {
					var charCode = view.getUint16(i, true);
					if (charCode == 0) {
						break;
					}
					nick += String.fromCharCode(charCode);
				}
				this.setNickname(nick);
				break;
			case 1:
				// Spectate mode
				if (this.socket.playerTracker.cells.length <= 0) {
					// Make sure client has no cells
					this.gameServer.switchSpectator(this.socket.playerTracker);
					this.socket.playerTracker.spectate = true;
				}
				break;
			case 2:
				var queryWrite = this.socket.playerTracker;

				var skin = "";
				var maxLen = this.gameServer.config.playerMaxNickLength * 2; // 2 bytes per char
				for (var i = 1; i < view.byteLength && i <= maxLen; i += 2) {
					var charCode = view.getUint16(i, true);
					if (charCode == 0) {
						break;
					}
					skin += String.fromCharCode(charCode);

				}

				queryWrite.setSkin(skin + "#"); //1

				break;
			case 3:
				var token = "";
				var queryWrite = this.socket.playerTracker;
				var maxLen = 44 * 2; // 2 bytes per char
				for (var i = 1; i < view.byteLength && i <= maxLen; i += 2) {
					var charCode = view.getUint16(i, true);
					if (charCode == 0) {
						break;
					}
					token += String.fromCharCode(charCode);
				}
				queryWrite.setToken(token);
				break;
				/*case 42:
            var messages = "";
			var queryWrite = this.socket.playerTracker;
            var maxLen = 44 * 2; // 2 bytes per char
            for (var i = 1; i < view.byteLength && i <= maxLen; i += 2) {
                var charCode = view.getUint16(i, true);
                if (charCode == 0) {
                    break;
                }
                messages += String.fromCharCode(charCode);
            }
			console.log(messages);
            this.gameServer.sendMessage(messages);

            break;*/

			case 26:
				/*
					var con = mysql.createConnection({
					  host: "localhost",
					  user: "root",
					  password: "12345678",
					  database: 'test'
					});	*/
				var teamcode = "";
				var queryWrite = this.socket.playerTracker;
				var maxLen = this.gameServer.config.playerMaxNickLength * 2; // 2 bytes per char
				for (var i = 1; i < view.byteLength && i <= maxLen; i += 2) {
					var charCode = view.getUint16(i, true);
					if (charCode == 0) {
						break;
					}
					teamcode += String.fromCharCode(charCode);
				}
				this.teamcode = teamcode;
				queryWrite.setTeamCode(teamcode);
				/*con.query("SELECT user_id, user_gold FROM user WHERE user_token='"+queryWrite.token+"'", function (err, result) {
					if (err) throw err;
					queryWrite.userId = result[0].user_id;
					queryWrite.gold = result[0].user_gold;
					console.log(queryWrite.userId + " "+ queryWrite.gold);
				});	*/
				break;

			case 16:
				// Discard broken packets

				if (view.byteLength == 21) {
					// Mouse Move
					var client = this.socket.playerTracker;
					client.mouse.x = view.getFloat64(1, true);
					client.mouse.y = view.getFloat64(9, true);
				}
				break;
			case 17:
				// Space Press - Split cell
				this.pressSpace = true;
				break;
			case 18:
				// Q Key Pressed
				this.pressQ = true;
				break;
			case 19:
				// Q Key Released
				break;
			case 46:
				// Speed spell
				this.socket.playerTracker.setSpeed(10)
				setTimeout(this.speedReset.bind(this), 10000);
				this.socket.sendPacket(new Packet.AllMsg('Speed up !'));

				break;
			case 21:
				// W Press - Eject mass
				this.pressW = true;
				break;

			case 22:
				// W Press - Eject mass
				this.pressE = true;
				break;
			case 23:
				// W Press - Eject mass
				this.pressEe = true;
				break;

			case 35:
				this.pressZ = true;
				break;
			case 37:
				this.pressZz = true;
				break;
			case 36:
				this.pressX = true;
				break;
			case 38:
				this.pressXx = true;
				break;
			case 65:
				var client = this.socket.playerTracker;
				if (this.tickPressA <= 0) {
					this.tickPressA = 1; // 20 ticks = 1 second
					if (client.userGold >= 10) {
						this.pressA = true;
					}
				} else {
					this.tickPressA--;
				}
				break;
			case 83:
				var client = this.socket.playerTracker;
				if (this.tickPressS <= 0) {
					this.tickPressS = 1; // 20 ticks = 1 second

					if (client.userGold >= 100) {
						this.pressS = true;
					}
				} else {
					this.tickPressS--;
				}
				break;

			case 255:

				// Connection Start 
				this.protocol = view.getUint32(1, true);
				// Send SetBorder packet first
				var c = this.gameServer.config;
				this.socket.sendPacket(new Packet.SetBorder(c.borderLeft, c.borderRight, c.borderTop, c.borderBottom));
				this.socket.sendPacket(new Packet.LastWinner(this.gameServer.lastWinner));
				this.socket.sendPacket(new Packet.recordHolder(this.gameServer.recordHolder));

				this.socket.sendPacket(new Packet.gameName(this.gameServer.gameName));

				this.socket.sendPacket(new Packet.topMessage(this.gameServer.topMessage3));
				// this.socket.sendPacket(new Packet.topMessage1(this.gameServer.topMessage1));
				this.socket.sendPacket(new Packet.topMessage2(this.gameServer.topMessage2));

				this.socket.sendPacket(new Packet.OnlineCount(this.socket.playerTracker.OnlineCount));
				this.socket.sendPacket(new Packet.viruscount(this.socket.playerTracker.viruscount));
				this.socket.sendPacket(new Packet.Spect(this.socket.playerTracker.Spect));

				this.socket.sendPacket(new Packet.Gold(this.socket.playerTracker.userGold));
				this.chattest();
				// this.chattestx();


				setInterval(this.startCountDown.bind(this), 1000);
				break;

			case 99:
				if (!this.socket.playerTracker.chatAllowed) {
					this.gameServer.pm(this.socket.playerTracker.pID, " Chat Aktif Değil");
					return;
				}
				if (this.gameServer.config.specChatAllowed != 1) {
					if (this.socket.playerTracker.cells.length < 1) {
						this.gameServer.pm(this.socket.playerTracker.pID, " Please play to chat!");
						return;
					}

				}

				var message = "";
				var maxLen = 400; // 2 bytes per char
				var offset = 2;
				var flags = view.getUint8(1); // for future use (e.g. broadcast vs local message)
				if (flags & 2) {
					offset += 4;
				}
				if (flags & 4) {
					offset += 8;
				}
				if (flags & 8) {
					offset += 16;
				}
				for (var i = offset; i < view.byteLength && i <= maxLen; i += 2) {
					var charCode = view.getUint16(i, true);
					if (charCode == 0) {
						break;
					}
					message += String.fromCharCode(charCode);
				}
				var zname = wname = this.socket.playerTracker.name;
				if (wname == "") wname = "Spectator";

				// var fs = require('fs');
				// var jsonObjesi = {	name: zname,
				// message: message,
				// };
				// const fileData = JSON.parse(fs.readFileSync('sample.json'))
				// fileData.push(jsonObjesi)


				// fs.writeFile("msg.json", JSON.stringify(jsonObjesi), function(err) {
				// if (err) console.log(err);
				// });

				// if (this.socket.playerTracker.yetki  == "Admin") {
				// var passkey = "/";
				// if (message.substr(0, passkey.length) == passkey) {
				// var cmd = message.substr(passkey.length, message.length);
				// console.log("\u001B[31m[Master]\u001B[0m " + wname + " has issued a remote command " + cmd);
				// var split = cmd.split(" "),
				// first = split[0].toLowerCase(),
				// execute = this.gameServer.commands[first];
				// if (typeof execute != 'undefined') {
				// execute(this.gameServer, split);
				// } else {
				// console.log("Invalid Command!");
				// }
				// break;
				// } else if (message.substr(0, 6) == "/rcon ") {
				// console.log("\u001B[31m[Master]\u001B[0m " + wname + " has issued a remote command but used the wrong password!");
				// break;
				// }
				// }

				if (this.socket.playerTracker.yetki == "Mod") {
					var passkey = "/";
					if (message.substr(0, passkey.length) == passkey) {
						var cmd = message.substr(passkey.length, message.length);
						console.log("\u001B[31m[Master]\u001B[0m " + wname + " has issued a remote command " + cmd);
						var split = cmd.split(" "),
							first = split[0].toLowerCase(),
							execute = commandsmod[split[0]];
						if (typeof execute != 'undefined') {
							execute(this.gameServer, split);
						} else {
							console.log("Invalid Command!");
						}
						break;
					} else if (message.substr(0, 6) == "/rcon ") {
						console.log("\u001B[31m[Master]\u001B[0m " + wname + " has issued a remote command but used the wrong password!");
						break;
					}
				}
				var kullanicilar = [];

				// if (this.socket.playerTracker.yetki  == "Oyuncu") {

				// if (message.charAt(0) == "/") {
				// var str = message.substr(1);
				// var split = str.split(" ");
				// var exec = commands[split[0]];
				// if (exec) {
				// try {
				// exec(this.gameServer, this.socket.playerTracker, split);
				// } catch (e) {
				// this.gameServer.pm(this.socket.playerTracker.pID, " There was an error with the command, " + e);
				// console.log("[Console] Caught error " + e);
				// }
				// break;
				// }
				// this.gameServer.pm(this.socket.playerTracker.pID, "That is not a valid command! Do /help for a list of commands!");
				// break;
				// }
				// }

				// if (message.charAt(0) == "/") {
				// var str = message.substr(1);
				// var split = str.split("team ");
				// var exec = split[1];

				// console.log(exec+"   mesaj");
				// var packet = new Packet.Chat(this.socket.playerTracker, exec);
				// for (var i = 0; i < this.gameServer.clients.length; i++) {
				// this.gameServer.clients[i].sendPacket(packet);
				// }

				// }




				var date = new Date(),
					hour = date.getHours();

				if ((date - this.socket.playerTracker.cTime) < this.gameServer.config.chatIntervalTime) {
					var time = 1 + Math.floor(((this.gameServer.config.chatIntervalTime - (date - this.socket.playerTracker.cTime)) / 1000) % 60);

					break;
				}


				// Removes filtered words.
				var chatFilter = 0;



				// var queryWrite = this.socket.playerTracker;

				// queryWrite.setkullanicilar(zname,message);




				this.socket.playerTracker.cTime = date;
				var LastMsg;
				if (message == LastMsg) {
					++SpamBlock;
					if (SpamBlock > 5) this.socket.close();
					break;
				}
				LastMsg = message;
				SpamBlock = 0;

				hour = (hour < 10 ? "0" : "") + hour;
				var min = date.getMinutes();
				min = (min < 10 ? "0" : "") + min;
				hour += ":" + min;

				var fs = require('fs');
				if (message.charAt(0) == "/") {
					var str = message.substr(1);
					var split = str.split(" ");
					var execc = split[0];
					var exec = split[1];

					var msg1 = split.slice(1, split.length).join(' ');

					if (execc == "all") {
						var data = this.socket.playerTracker;

						var packet = new Packet.Chat(this.socket.playerTracker, msg1, 0);
						// Send to all clients (broadcast)
						for (var i = 0; i < this.gameServer.clients.length; i++) {
							chattx.push(data.playerId, 0, data.userId, data.name, msg1, 0);

							this.gameServer.clients[i].sendPacket(packet);
						}

					} else if (execc == "typeTeam") {
						var tchat = [];
						var data = this.socket.playerTracker;

						for (var i = 0; i < this.gameServer.clients.length; i++) {
							if (this.gameServer.clients[i].playerTracker.teamcode == this.teamcode) {
								var xxx = this.socket.playerTracker;
								tchat.push(xxx, msg1, 1);
								chattx.push(data.playerId, 0, data.userId, data.name, msg1, 1);
								console.log(chattx);

								var packet = new Packet.Chat(tchat[0], tchat[1], tchat[2]);

								this.gameServer.clients[i].sendPacket(packet);
							}
						}
						// console.log(tchat);
					}
					if (execc == "megaphone") {

						var data = this.socket.playerTracker;
						chattx.push(data.playerId, 0, data.userId, data.name, msg1, 3);
						var newUsers = [{
							pID: data.playerId,
							premiuStatus: 0,
							userId: data.userId,
							name: data.name,
							message: msg1,
							chatType: 3
						}];
						const fileName = 'datamsg.json';

						fs.readFile(fileName, (err, data) => {
								if (err) throw err;

								var jsonData = JSON.parse(data);

								if (jsonData.length > 0) {
									jsonData[jsonData.length - 1].message = msg1;
								} else {
						jsonData.push({pID: data.playerId, premiuStatus: 0, userId: data.userId, name: data.name, message: newMessage, chatType: 3});
 
								}

								fs.writeFile(fileName, JSON.stringify(newUsers), (err) => {
									if (err) throw err;
								});
							});
						 

						// fs.access('datamsg.json', (err) => {
							// if (err) {
 								// const users = newUsers;
								// fs.writeFile('datamsg.json', JSON.stringify(users), (err) => {
									// if (err) throw err;
									// console.log('Dosya oluşturuldu ve veriler eklendi!');
								// });
								// return;
							// }
							// fs.readFile('datamsg.json', (err, data) => {
								// if (err) throw err;
								// var users = JSON.parse(data);

 
								// users.push(newUsers);

 								// fs.writeFile('datamsg.json', JSON.stringify(users), (err) => {
									// if (err) throw err;
									// console.log('Kullanıcılar dosyaya başarıyla eklendi!');
								// });
							// });
						// });

 						// var packet = new Packet.Chat(this.socket.playerTracker, msg1, 3);
 						// for (var i = 0; i < this.gameServer.clients.length; i++) {

							// this.gameServer.clients[i].sendPacket(packet);
						// }
					}
				}
				// var packet = new Packet.Chat(this.socket.playerTracker, message);
				// Send to all clients (broadcast)
				// for (var i = 0; i < this.gameServer.clients.length; i++) {
				// this.gameServer.clients[i].sendPacket(packet);
				// }
				break;
			default:
				break;
		}
	} catch (e) {
		console.log("[WARN] Stopped crash at packethandler. Probably because of wrong packet/client . Usually normal.");
	}
};



PacketHandler.prototype.sendPacketFromData = function(data) {
console.log(data);
	chattx.push(data.pID, data.premiuStatus, data.userId, data.name, data.message, data.chatType);

		const packet = new Packet.chatgec(data.pID, data.premiuStatus, data.userId, data.name, data.message, data.chatType);
		for (var i = 0; i < this.gameServer.clients.length; i++) {
			this.gameServer.clients[i].sendPacket(packet);
		}


}
PacketHandler.prototype.sendPacketFromDCheck = function() {

setInterval(() => {
    fs.readFile('datamsg.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
        } else {
            const msgs = JSON.parse(data);
            msgs.forEach((msg) => {
                if (msg.message !== lastMsg) {
                    lastMsg = msg.message;
                    this.sendPacketFromData(msg);
                }
            });
        }
    });
}, 1500);

}
 PacketHandler.prototype.chattest = function() {

	for (var i = 0; i < chattx.length; i += 6) {

		var packet = new Packet.chatgec(chattx[i], chattx[i + 1], chattx[i + 2], chattx[i + 3], chattx[i + 4], chattx[i + 5]);

		this.socket.sendPacket(packet);
	}
}
PacketHandler.prototype.topMessage1 = function() {
 	
	
	this.socket.sendPacket(new Packet.topMessage1(this.gameServer.getFFA1Winner()));

 }

PacketHandler.prototype.startCountDown = function() {
	this.sendPacketFromDCheck();
	this.topMessage1();

 	this.socket.sendPacket(new Packet.CountDown(this.gameServer.countdown));
}
PacketHandler.prototype.speedReset = function() {

	this.socket.playerTracker.setSpeed(0)
}
PacketHandler.prototype.setNickname = function(newNick) {

	var client = this.socket.playerTracker;

	if (client.cells.length < 1) {
		// Set name first
		client.setName(newNick);

		// If client has no cells... then spawn a player
		this.gameServer.gameMode.onPlayerSpawn(this.gameServer, client);

		// Turn off spectate mode
		client.spectate = false;
	}
	client.setName(newNick);

};