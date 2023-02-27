module.exports = function(gameServer,player,split) {
var msg = function (m) {
    gameServer.pm(player.pID,m);
  }
  if (!split[1]) {
    msg("Please specify a chatname");
    return;
  }
  var message = split.slice(2, split.length).join(' ');
  for (var i in gameServer.clients) {
    var client = gameServer.clients[i].playerTracker;
    if (client && client.name && client.name == split[1]) {
      gameServer.countDownTimer(client.pID,message,"[" + player.name + " >> " + client.name + "]");
      gameServer.pm(player.pID,message,"[" + player.name + " >> " + client.name + "]");
      return;
    }
  }
msg("Invalid Chatname")

}
