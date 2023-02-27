var Entity = require("./entity")

exports.SpawnFood = function(gameServer,pos,mass,color){
		var foodmass = 1;
		var foodcolor = gameServer.getRandomColor();
		if(!isNaN(mass)){
			foodmass = mass;
		}
		if(!isNaN(color)){
			foodcolor = color;
		}
		var food = new Entity.Food(gameServer.getNextNodeId(), null, pos, foodmass);
		food.setColor(foodcolor);
		gameServer.addNode(food);
		gameServer.currentFood++; 
		return food;
}