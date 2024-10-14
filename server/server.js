const express = require('express');
const {createServer} = require('node:http');
const {Server} = require('socket.io');

const ORIGIN = 3000;
const PORT = 3001;

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:' + ORIGIN,
        methods: ['GET', 'POST'],
    },
});

io.on('connection', (socket) => {
    console.log('a user connected ' + socket.id);

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('message:send', (user, message, room) => {
        io.to(room).emit('message:update', message);
        console.log(
            'User ' + user + ' sending "' + message + '" to room ' + room,
        );
    });

    socket.on('room:join', (user, room) => {
        socket.join(room);
        io.to(socket.id).emit('room:change', user, room);
        console.log('User ' + user + ' joined room ' + room);
    });
});

server.listen(PORT, () => {
    console.log('server running at http://localhost:' + PORT);
});
