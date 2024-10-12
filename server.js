const express = require('express');
const {createServer} = require('node:http');
const {join} = require('node:path');
const {Server} = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public/html/index.html'));
});

io.on('connection', (socket) => {
    console.log('a user connected ' + socket.id);

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('message:sent', (message, room) => {
        socket.to(room).emit('message:recieve', message);
        console.log('User ' + socket.id + ' sending message to room ' + room);
    });

    socket.on('room:join', (room, callback) => {
        socket.join(room);
        socket.to(room).emit('room:new_member', socket.id);
        callback({status: 'ok'});
        console.log('user ' + socket.id + ' connection to room ' + room);
    });
});

server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});
