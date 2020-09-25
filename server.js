var express = require('express');
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

function gameDataObject(){
	this.id = GAME_DATA.length;
	this.players = [];
	this.sockets = [];

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
	//socket.name;
	//socket.x = 0;
	//socket.y = 0;
	//socket.number = "" + Math.floor(10 * Math.random());
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

	socket.on('myNewSquare',function(data){

		

		if (data.mySign == "x") {
			GAME_DATA[data.gameId].sockets[1].emit('newCompetitorSquare', data);
		}
		if (data.mySign == "o") {
			GAME_DATA[data.gameId].sockets[0].emit('newCompetitorSquare', data);
		}
		

	});

	socket.on('win', function(data){
		console.log("hra " + data + " je vyhraná")

		socket.joined = false;
		if(GAME_DATA[data].sockets[0] == socket){
			GAME_DATA[data].sockets[1].joined = false;
		}
		else{
			GAME_DATA[data].sockets[0].joined = false;
		}

		delete GAME_DATA[data];
		delete GAME_LIST[data];

		sendGameList();



	});
	
	
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

	

	GAME_DATA[id].sockets[0].emit('startGame', 'x');
	GAME_DATA[id].sockets[1].emit('startGame', 'o');
}


 /*
setInterval(function(){

 
 
 
},1000/25);		
 */