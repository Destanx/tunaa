var Teams = require('./Teams'); // Base Gamemode
var Entity = require('../entity')

function TVO() {
    Teams.apply(this, Array.prototype.slice.call(arguments));

    this.ID = 4;
    this.name = "Team Virus Off";
    this.decayMod = 2.0; // Modifier for decay rate (Multiplier)
    this.packetLB = 50; // Packet id for leaderboard packet (48 = Text List, 49 = List, 50 = Pie chart)
    this.haveTeams = true; // true = gamemode uses teams, false = gamemode doesnt use teams (case sensetive)
    this.colorFuzziness = 32;

    // Special
    this.teamAmount = 3; // Amount of teams. Having more than 3 teams will cause the leaderboard to work incorrectly (client issue).
    this.colors = [
        {'r': 223, 'g': 0, 'b': 0},
        {'r': 0, 'g': 223, 'b': 0},
        {'r': 0, 'g': 0, 'b': 223},
    ]; // Make sure you add extra colors here if you wish to increase the team amount [Default colors are: Red, Green, Blue]
    this.nodes = []; // Teams
}

module.exports = TVO;
TVO.prototype = new Teams();

//Gamemode Specific Functions

TVO.prototype.pressW = function(gameServer,player) {
    // Called when the W key is pressed
    var client = player;
for (var i = 0; i < client.cells.length; i++) {
    var cell = client.cells[i];

        if (!cell) {
            continue;
        }

        if (cell.mass < 32) {
            continue;
        }

        var deltaY = client.mouse.y - cell.position.y;
        var deltaX = client.mouse.x - cell.position.x;
        var angle = Math.atan2(deltaX,deltaY);

        // Get starting position
        var size = cell.getSize() + 5;
        var startPos = {
            x: cell.position.x + ( (size + 15) * Math.sin(angle) ),
            y: cell.position.y + ( (size + 15) * Math.cos(angle) )
        };

        // Remove mass from parent cell
        cell.mass -= 30
        // Randomize angle
        angle += (Math.random() * .4) - .2;

        // Create cell
        var ejected = new Entity.Virus(gameServer.getNextNodeId(), null, startPos, 15);
        ejected.setAngle(angle);
        ejected.setMoveEngineData(160, 20);

        //Shoot Virus
        gameServer.ejectVirus(ejected)
    }
};
