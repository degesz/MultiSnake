// const Victor = require("victor");


	var myColor = "#FF9900"
	var opponentColor = "#0066FF"
	var foodColor = "#FF6666"
	var width = 800;
	var height = 800;
	var scale = 20;
	document.getElementById("ctx").width = width;
	document.getElementById("ctx").height = height;


		var c = document.getElementById("ctx");
		var ctx = c.getContext("2d");
		ctx.fillStyle = "#262626";
		ctx.fillRect(0, 0, width, height);


	var mySnake = [];
	var opponentSnake = [];
	var foodLocation = new Victor();
	var opponentEaten = false;
	

	function startGame(){
		document.getElementById("gameDiv").style = "";	//make gameDiv visible
		console.log("Game started")

		if(myPlayerNumber == 0){
			mySnake = [];
			mySnake.push(new Victor(0, 0)); // create my snake
	
			opponentSnake = [];
			opponentSnake.push(new Victor(width-scale, height-scale)); //create opponent snake
		}
		else{
			mySnake = [];
			mySnake.push(new Victor(width-scale, height-scale)); // create my snake
	
			opponentSnake = [];
			opponentSnake.push(new Victor(0, 0)); //create opponent snake
		}



	}

	window.addEventListener("keydown", (event) => {	
		if(joined == false){
			return;
		}
		dir = new Victor();
		if (event.key == "ArrowUp" || event.key == "ArrowDown" || event.key == "ArrowLeft" || event.key == "ArrowRight" || event.key == "w" || event.key == "s" || event.key == "a" || event.key == "d") {
			switch (event.key) {
				case "w":
					dir.x = 0;
					dir.y = -1;
					break;
				case "s":
					dir.x = 0;
					dir.y = 1;
					break;
				case "a":
					dir.x = -1;
					dir.y = 0;
					break;
				case "d":
					dir.x = 1;
					dir.y = 0;
					break;
	
					case "ArrowUp":
						dir.x = 0;
						dir.y = -1;
						break;
					case "ArrowDown":
						dir.x = 0;
						dir.y = 1;
						break;
					case "ArrowLeft":
						dir.x = -1;
						dir.y = 0;
						break;
					case "ArrowRight":
						dir.x = 1;
						dir.y = 0;
						break;
			}
		}	// only send arrows and wasd
			socket.emit("changeDir", {"dir":dir, "id":joinedGameId, "playerNumber": myPlayerNumber });		//send keypresses to server
			
	})

	socket.on("directions", function(data){

		var myPreviousBlock = mySnake[mySnake.length-1];
		var myShift = new Victor(data.myDir.x * scale, data.myDir.y * scale) ;
		var opponentShift = new Victor(data.opponentDir.x * scale, data.opponentDir.y * scale) ;
	
		if(checkFood() == false){
			mySnake.shift(); //remove first element from snake array only if food wasn't eaten
			console.log("food not eaten");
		}
		mySnake.push(new Victor(myPreviousBlock.x + myShift.x, myPreviousBlock.y + myShift.y));

		opponentPreviousBlock = opponentSnake[opponentSnake.length-1];
		if(opponentEaten == false){
			opponentSnake.shift(); //remove first element from snake array
		}
		opponentEaten = false;
		opponentSnake.push(new Victor( opponentPreviousBlock.x + opponentShift.x, opponentPreviousBlock.y + opponentShift.y));
		

		
		checkCrash();
		checkWall();

		console.log(mySnake);
		drawSnakes();
	})

	socket.on("newFood", function(data){
		foodLocation = data;	//set new food location
	})

	socket.on("opponentEat", function(){
		opponentEaten = true;
		console.log("opponent has eaten");
	})

	function drawSnakes(){
		ctx.fillStyle = "#262626";
		ctx.fillRect(0, 0, width, height);

		ctx.fillStyle = foodColor;
		ctx.fillRect(foodLocation.x, foodLocation.y, scale, scale);	//draw food

		ctx.fillStyle = myColor; // draw my snake
		var i;
		for(i = 0; i < mySnake.length; i++){
			ctx.fillRect(mySnake[i].x, mySnake[i].y, scale, scale);
		}

		ctx.fillStyle = opponentColor; // draw opponent snake
		for(i = 0; i < opponentSnake.length; i++){
			ctx.fillRect(opponentSnake[i].x, opponentSnake[i].y, scale, scale);
		}
	}


	function checkFood(){
		console.log("food check");
		if(foodLocation.x == mySnake[mySnake.length - 1].x && foodLocation.y == mySnake[mySnake.length - 1].y){
			socket.emit("foodEat", { "id":joinedGameId, "playerNumber": myPlayerNumber })	//send msg to server food eaten
			return true;
			
		}
		return false;
	}


	function checkCrash(){

	}


	function checkWall(){

	}