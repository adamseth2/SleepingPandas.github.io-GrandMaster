const path = require('path');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const PORT = process.env.PORT ?? 5500;

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
    methods: ['GET', 'POST'],
    transports: ['websocket', 'polling'],
    credentials: true,
  },
  allowEIO3: true,
});
// io.set('origins', '*:*');
// io.set(allowedHeaders, '*');
//Set static folder
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, 'games')));

//Constants
const clientRooms = {};

//Run when client connects
io.on('connection', socket => {
  socket.on('joinGame', handleJoinGame);
  socket.on('newGame', handleNewGame);
  //joinGame
  function handleJoinGame(roomName) {
    console.log(`Room ID on server is ${roomName}`);
    const room = io.sockets.adapter.rooms.get(roomName);
    socket.emit('console', clientRooms);
    socket.emit('console', room);
    socket.emit('console', io.of('/').adapter.rooms);
    // const rooms = Object.keys(io.sockets.adapter.rooms);
    // console.log(io.sockets.adapter.rooms);
    // socket.broadcast.emit('console', io.sockets.adapter);
    // console.log(io.nsps['/'].adapter.rooms);
    // console.log(`Room is equals ${room}`);

    console.log(clientRooms.roomName);
    console.log(clientRooms);
    console.log(io.sockets.adapter.rooms.has(clientRooms[socket.id]));
    console.log(io.sockets.adapter.rooms);
    console.log(room);

    let numClients = 0;
    if (room) {
      console.log(room);
      numClients = room.size;
      console.log(`The number of clients is ${numClients}`);
    }
    if (numClients === 0) {
      socket.emit('unknownCodeHandler');
      return;
    } else if (numClients > 1) {
      socket.emit('tooManyPlayersHandler');
      return;
    }
    clientRooms[socket.id] = roomName;
    socket.join(roomName);
    socket.emit('codeSucessfulHandler');
    socket.to(clientRooms[socket.id]).emit('userJoinedHandler');
    socket.number = 2;
  }
  function handleNewGame() {
    let joinCode = makeId(4);
    clientRooms[socket.id] = joinCode;
    socket.emit('gameCodeHandler', joinCode);

    socket.join(joinCode);
    socket.number = 1;
  }
  console.log('New WS Connection...');
  socket.on('clickBoard', number => {
    console.log(number);
  });
  //When user joins
  socket.broadcast.emit('console', 'A user has joined the chat');
  //disconnects
  socket.on('disconnect', () => {
    io.emit('console', 'A user has left the chat');
  });

  //Listen for valid click board
  socket.on('clickBoard', squareId => {
    io.to(clientRooms[socket.id]).emit('clickBoardHandler', squareId);
  });
  //Restarts Game
  socket.on('restart', player1Turn => {
    socket.broadcast.emit('restartHanlder', player1Turn);
  });
});

//Make unique ID
function makeId(length) {
  var result = '';
  var characters = '0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
