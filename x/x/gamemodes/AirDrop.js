var FFA = require('./FFA')
var Entity = require('../entity');
var CommandList = require('../modules/CommandList');
var GameMode = require('../gamemodes');

function AirDrop() {
    FFA.apply(this, Array.prototype.slice.call(arguments));
	
    this.ID = 17;
    this.name = "AirDrop";
    this.decayMod = 1.0;
    this.packetLB = 49;
    this.haveTeams = false;

    this.specByLeaderboard = true;
}
//DO NOT TOUCH THIS
var MLP = true;
var RSG = false;

module.exports = AirDrop;
AirDrop.prototype = new FFA();

AirDrop.prototype.onTick = function(gameServer) {
    // Called on every game tick 
	if(RSG == true){
		RSG = false;
		//WHEN NEED TO SPAWN ROTTEN FOOD
		var spn = true;
		for (var i = 0; i < gameServer.clients.length; i++) {
            var client = gameServer.clients[i].playerTracker;
			if(client.getScore(true) > gameServer.config.AirDropWinScore){
				if(client.spectate ? false : (client.cells.length > 0 ? true : false)){
					//SAY SOMEONE WIN
						spn = false;
						var lb = [];
						lb[0] = (client.name == "" ? "An unnamed cell" : client.name);
						lb[1] = " Win!"; 
						gameServer.SetLeaderboard(lb);
						setTimeout(function() {
							gameServer.ResetLeaderboard();
						}, gameServer.config.AirDropDispSec * 1000);
					//KILL ALL
					var executea = gameServer.commands['mass'];
					var args = [];
					args[1] = client.pID;
					args[2] = 10;
					executea(gameServer,args);			
					var executeb = gameServer.commands['killall'];
					executeb(gameServer,"");				
				}
			}			
		}
		if(spn == true){
			var airdropmass;
			var airdropmul;
			var msg2 = "";
			if((Math.random() * 100) < gameServer.config.AirDropSmallMassChance){
				airdropmass = Math.round(Math.random() * (gameServer.config.AirDropSmallMassMax - gameServer.config.AirDropSmallMassMin) + gameServer.config.AirDropSmallMassMin);
				airdropmul = Math.round(Math.random() * (gameServer.config.AirDropSmallMultiplyerMax - gameServer.config.AirDropSmallMultiplyerMin) + gameServer.config.AirDropSmallMultiplyerMin);
			}
			else{
				airdropmass = Math.round(Math.random() * (gameServer.config.AirDropMassMax - gameServer.config.AirDropMassMin) + gameServer.config.AirDropMassMin);
				airdropmul = Math.round(Math.random() * (gameServer.config.AirDropMultiplyerMax - gameServer.config.AirDropMultiplyerMin) + gameServer.config.AirDropMultiplyerMin);
				
			}
			var pos = gameServer.getRandomPosition();
			if((Math.random() * 100) < gameServer.config.AirDropCenterChance){
				msg2 = "at center map"
				pos = {
					x: (gameServer.config.borderRight + gameServer.config.borderLeft) / 2,
					y: (gameServer.config.borderBottom + gameServer.config.borderTop) / 2
				};
			}
			var chance = Math.round(Math.random() * (gameServer.config.AirDropVirusChanceMax - gameServer.config.AirDropVirusChanceMin) - gameServer.config.AirDropVirusChanceMin);
			gameServer.SpawnRottenFood("Airdrop was landed!",msg2,airdropmass,airdropmul,chance,gameServer.getRandomPosition(),gameServer.config.AirDropDispSec * 1000);
		}
	}
};
var SPRFTIME;
AirDrop.prototype.onPlayerSpawn = function(gameServer,player) {
    // Called when a player is spawned
	//TO override onPlayerSpawn , Respawn command needed
    player.color = gameServer.getRandomColor();
    gameServer.spawnPlayer(player);
	
	//Start Timer IF NOT
	if(MLP == true){
		MLP = false;
		SPRFTIME = gameServer.config.AirDropTimeSec;
		SpawnRF(gameServer)
	}
};
var SpawnRF = function(){
	setTimeout(function() {
		RSG = true;
		SpawnRF();
	}, SPRFTIME * 1000);
}