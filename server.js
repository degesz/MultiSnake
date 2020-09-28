const { dir } = require('console');
var express = require('express');
const Victor = require('victor');
var app = express();
var serv = require('http').Server(app);
 
app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));
 
const port = process.env.PORT || 3000;

serv.listen(port);
console.log("Server started.");
 
var SOCKET_LIST = {};
var GAME_LIST = [];
var GAME_DATA = [];



var framerate = 8; ///////////////	SET FRAMERATE	///////////////////

function gameDataObject(){
	this.id = GAME_DATA.length;
	this.players = [];
	this.sockets = [];
	this.player0Dir = new Victor(1, 0);
	this.player1Dir = new Victor(-1, 0);

}

function gameObject(){
	this.founder;
	this.id = GAME_LIST.length;
	this.players = [];
}
 
var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	socket.id = Math.random();
	socket.joined = false;
	sendGameList();
	SOCKET_LIST[socket.id] = socket;

	socket.on('setName', function(data){	//nastaveni jmena
		socket.name = data.name;
		console.log(socket.name);
		sendGameList();
	});
 
	socket.on('newGame',function(){ 
		var i;
		for(i = 0; i < GAME_LIST.length; i++ ){
			if(GAME_LIST[i] == undefined){
				continue;
			}

			if (GAME_LIST[i].founder == socket.name) {
				return;
			}
		}

		if(socket.name == null){
			return;
		}
		if(socket.joined){
			return;
		}

		GAME_LIST.push(new gameObject);
		GAME_LIST[GAME_LIST.length - 1].founder = socket.name;

		GAME_DATA.push(new gameDataObject);
		
    	console.log(GAME_LIST);
			sendGameList();
	});

	socket.on('join',function(data){
		if(socket.joined){
			console.log("already joined");
			return;
		}

		id = data;

		if(GAME_LIST[id].players.length >= 2){
			console.log("game full");
			return; 
		}

		socket.joined = true;		
		GAME_LIST[id].players.push(socket.name);
		GAME_DATA[id].players.push(socket.name);
		GAME_DATA[id].sockets.push(socket);
		sendGameList();

		if(GAME_LIST[id].players.length >= 2){
			startGame(id);
		}
	});

	

	socket.on('crash', function(data){
		console.log("hra " + data + " je vyhraná")

		socket.joined = false;
		if(GAME_DATA[data.id].sockets[0] == socket){
			GAME_DATA[data.id].sockets[1].joined = false;
			GAME_DATA[data.id].sockets[1].emit("win");
		}
		else{
			GAME_DATA[data.id].sockets[0].joined = false;
			GAME_DATA[data.id].sockets[0].emit("win");
		}

		delete GAME_DATA[data.id];
		delete GAME_LIST[data.id];

		sendGameList();



	});



	socket.on('changeDir',function(data){


		if (data.playerNumber == 0) {	//check if player isn't turning 180 degrees
			if(GAME_DATA[data.id].player0Dir.x == data.dir.x * -1 || GAME_DATA[data.id].player0Dir.y == data.dir.y * -1){
				return;
			}
		}
		else{
			if(GAME_DATA[data.id].player1Dir.x == data.dir.x * -1 || GAME_DATA[data.id].player1Dir.y == data.dir.y * -1){
				return;
			}
		}

		if (data.playerNumber == 0) { //set the player direction
			GAME_DATA[data.id].player0Dir = data.dir;
		}
		else{
			GAME_DATA[data.id].player1Dir = data.dir;
		}
		console.log(data.dir);
	});

	socket.on("foodEat", function(data){
		newFood(data.id);
		if (data.playerNumber == 0) { //set the player direction
			GAME_DATA[data.id].sockets[1].emit("opponentEat");
		}
		else{
			GAME_DATA[data.id].sockets[0].emit("opponentEat");
		}
	})
	
	
	socket.on('disconnect',function(){
		delete SOCKET_LIST[socket.id];
	});
 
});

function sendGameList(){
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('gameList',GAME_LIST);
	}
}

function startGame(id){
		var socket = GAME_DATA[id].sockets[0];	
		socket.emit('startGame', 0); //assign player IDs
		var socket = GAME_DATA[id].sockets[1];
		socket.emit('startGame', 1);
		newFood(id);	//generate first food
}

function newFood(gameId){
	var foodLoc = new Victor(Math.floor(Math.random() * 40) * 20, Math.floor(Math.random() * 40) * 20) ; //generate random location
	GAME_DATA[gameId].sockets[0].emit("newFood", foodLoc);	//send food location to players
	GAME_DATA[gameId].sockets[1].emit("newFood", foodLoc);
	
}

setInterval(function(){

	for(var i in GAME_DATA){
		if(GAME_DATA[i].sockets.length < 2){	//don't send to games without 2 players
			continue;
		}
		GAME_DATA[i].sockets[0].emit("directions", {"myDir": GAME_DATA[i].player0Dir, "opponentDir": GAME_DATA[i].player1Dir});//send directions to players
		GAME_DATA[i].sockets[1].emit("directions", {"myDir": GAME_DATA[i].player1Dir, "opponentDir": GAME_DATA[i].player0Dir});
	}
 
},1000/framerate);	