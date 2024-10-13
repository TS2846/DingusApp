const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.use(express.static('public'))


io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('message', (message, room) => {
    if (!room) {
      socket.broadcast.emit('message-recieve', message)
    }
    
    socket.to(room).emit('message-recieve', message);
  });

  socket.on('join-room', (room) => {
    socket.join(room);
    socket.emit('join-room', room);
  })
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});