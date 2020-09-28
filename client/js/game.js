// const Victor = require("victor");


	var myColor = "#FF9900"
	var opponentColor = "#0066FF"
	var foodColor = "#FF6666"
	var width = 300;
	var height = 300;
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

		/////// Wrapping around walls
		 if(mySnake[mySnake.length-1].x == 0 && data.myDir.x == -1){	
			myShift.x = width - scale ;
		}
		if(mySnake[mySnake.length-1].x == width-scale && data.myDir.x == 1){	
			myShift.x = (width - scale)*-1 ;
		}
		if(mySnake[mySnake.length-1].y == 0 && data.myDir.y == -1){	
			myShift.y = height-scale ;
		}
		if(mySnake[mySnake.length-1].y == height-scale && data.myDir.y == 1){	
			myShift.y = (height-scale)*-1 ;
		}

		if(opponentSnake[opponentSnake.length-1].x == 0 && data.opponentDir.x == -1){	
			opponentShift.x = width - scale ;
		}
		if(opponentSnake[opponentSnake.length-1].x == width-scale && data.opponentDir.x == 1){	
			opponentShift.x = (width - scale)*-1 ;
		}
		if(opponentSnake[opponentSnake.length-1].y == 0 && data.opponentDir.y == -1){	
			opponentShift.y = height-scale ;
		}
		if(opponentSnake[opponentSnake.length-1].y == height-scale && data.opponentDir.y == 1){	
			opponentShift.y = (height-scale)*-1 ;
		}
	
		if(checkFood() == false){
			mySnake.shift(); //remove first element from snake array only if food wasn't eaten
		}
		mySnake.push(new Victor(myPreviousBlock.x + myShift.x, myPreviousBlock.y + myShift.y));

		opponentPreviousBlock = opponentSnake[opponentSnake.length-1];
		if(opponentEaten == false){
			opponentSnake.shift(); //remove first element from snake array
		}
		opponentEaten = false;
		opponentSnake.push(new Victor( opponentPreviousBlock.x + opponentShift.x, opponentPreviousBlock.y + opponentShift.y));
		drawSnakes();
		checkCrash();

		
		//console.log(mySnake);
		
	})

	socket.on("newFood", function(data){
		foodLocation = data;	//set new food location
	})

	socket.on("opponentEat", function(){
		opponentEaten = true;
	})


	function checkFood(){
		if(foodLocation.x == mySnake[mySnake.length - 1].x && foodLocation.y == mySnake[mySnake.length - 1].y){
			socket.emit("foodEat", { "id":joinedGameId, "playerNumber": myPlayerNumber })	//send msg to server food eaten
			return true;
			
		}
		return false;
	}


	function checkCrash(){
		var j;
			for(j = 0; j < mySnake.length - 1; j++){	//check for crashes against my blocks
				if(mySnake[mySnake.length-1].x == mySnake[j].x && mySnake[mySnake.length-1].y == mySnake[j].y){
					crash();
				}
			}
			for(j = 0; j < opponentSnake.length; j++){	//check for crashes against opponents blocks
				if(mySnake[mySnake.length-1].x == opponentSnake[j].x && mySnake[mySnake.length-1].y == opponentSnake[j].y){	
					crash();
				}
			}
		}
	
	function crash(){
		socket.emit("crash",  { "id":joinedGameId, "playerNumber": myPlayerNumber }); //notify server
		document.getElementById("gameDiv").style = "display: none"	; //make gameDiv invisible
		joinedGameId = null;
		myPlayerNumber = null;
		mySnake = [];
		opponentSnake = [];
		foodLocation = new Victor();
		opponentEaten = false;
		alert("crash!");
	}

	/*socket.on("win", function(){
		document.getElementById("gameDiv").style = "display: none"	; //make gameDiv invisible
		joinedGameId = null;
		myPlayerNumber = null;
		mySnake = [];
		opponentSnake = [];
		foodLocation = new Victor();
		opponentEaten = false;
		alert("Win!");
	})*/



	
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
