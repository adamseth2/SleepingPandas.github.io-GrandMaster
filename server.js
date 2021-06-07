const path = require('path');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
//Set static folder
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, 'games')));

//Run when client connects
io.on('connection', socket => {
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
    socket.broadcast.emit('clickBoardHandler', squareId);
  });
  //Restarts Game
  socket.on('restart', player1Turn => {
    socket.broadcast.emit('restartHanlder', player1Turn);
  });
});

const PORT = 3000 ?? process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
