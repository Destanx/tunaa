var FFA = require('./FFA') //Base Gamemode
var Entity = require('../entity'); //You can delete if your gamemode doesn't modify entities

function NewMode() {
    FFA.apply(this, Array.prototype.slice.call(arguments)); // Delete if you're not using a base gamemode (recommended to use one)
	
    this.ID = -1; // Change the -1 to what number must be inserted into the config. Example: this.ID = 7;
    this.name = ""; // Put the gamemode name inside of the ""
    this.decayMod = 1.0; // Modifier for decay rate (Multiplier)
    this.packetLB = 49; // Packet id for leaderboard packet (48 = Text List, 49 = List, 50 = Pie chart)
    this.haveTeams = false; // True = gamemode uses teams, false = gamemode doesnt use teams

    this.specByLeaderboard = false; // false = spectate from player list instead of leaderboard
}

module.exports = <file name>; // Remove the <> and make sure to not put the .js at the end
NewMode.prototype = new FFA(); // Change if you want to use a different Base gamemode, or delete this line if you don't want a base gamemode (advanced users)

// Override these

NewMode.prototype.onServerInit = function(gameServer) { // If you want, replace the NewMode with your gamemode name, but make sure to change the function name at the top too
    // Called when the server starts
};

NewMode.prototype.onPlayerSpawn = function(gameServer,player) {
    // Called when a player is spawned
};

NewMode.prototype.pressQ = function(gameServer,player) {
    // Called when the Q key is pressed
};

NewMode.prototype.pressW = function(gameServer,player) {
    // Called when the W key is pressed
};

NewMode.prototype.pressSpace = function(gameServer,player) {
    // Called when the Space bar is pressed
};
