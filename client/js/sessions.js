
var joined = false;
var joinedGameId;
var myPlayerNumber;
		
		var socket = io();

		socket.on('gameList',function(data){


			//	console.log(data)	;
			var GAMES_LIST = data;
			var gamesStr = "";

			var i;
			for(i = 0; i< GAMES_LIST.length; i++){
				if(GAMES_LIST[i] == undefined){
					continue;
				}


				gamesStr +='<div id=game';
				gamesStr += GAMES_LIST[i].id; 
				gamesStr += ' style="border:2px solid orange; width: 75%; height: 20px;">Založil: ';
				gamesStr += GAMES_LIST[i].founder; 
				gamesStr += '  Hráči: ';
				gamesStr += GAMES_LIST[i].players;
				gamesStr += '     <button onclick="join(this.id)" id="'
				gamesStr += GAMES_LIST[i].id; 
				gamesStr += '">Připojit se</button> </div>'
			}

			document.getElementById("games").innerHTML = gamesStr	;
		});		

		socket.on('startGame',function(data){
			myPlayerNumber = data;
			joined = true;
			startGame();



		});	




		function setName(){
		 socket.emit("setName", {
			name: document.getElementById("nameInput").value
			});
		 document.getElementById("nameInput").value = "";
		}

		function newGame(){
			socket.emit("newGame");
		}

		function join(id){
			socket.emit('join', id);
			joinedGameId = id;
		}

