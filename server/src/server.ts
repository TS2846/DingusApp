import express from 'express';
import {createServer} from 'node:http';
import {Server} from 'socket.io';
import {join} from 'path';
import parser from 'body-parser';

import {
    authenticateUser,
    initializeDatabase,
    insertUser,
} from './helpers/dbHelpers';
import {
    IncorrectPasswordError,
    InvalidParametersError,
    UserAlreadyExistsError,
} from './errors/dbErrors';

const ORIGIN = 3000;
const PORT = 3001;

const jsonParser = parser.json({strict: true});
const app = express();
app.use(jsonParser);

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:' + ORIGIN,
        methods: ['GET', 'POST'],
    },
});

const DB_PATH = join(__dirname, '../sqlite/messageapp.db');
const db = initializeDatabase(DB_PATH);

io.on('connection', (socket) => {
    console.log('a user connected ' + socket.id);

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('message:send', (user, message, room) => {
        io.to(room).emit('message:update', user, message, room);
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

app.post('/signup', (req, res) => {
    try {
        if (
            !req.body.id ||
            !req.body.username ||
            !req.body.password ||
            !req.body.name
        )
            throw new InvalidParametersError(
                'missing parameters. Required: {id, username, password, name}',
            );

        insertUser(db, req.body);
        res.status(200).json({status: 'OK!'});
    } catch (error) {
        let err_msg = 'server error...';

        if (
            error instanceof UserAlreadyExistsError ||
            error instanceof InvalidParametersError
        ) {
            err_msg = error.message;
        } else if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({status: err_msg});
        }

        res.status(400).json({status: err_msg});
    }
});

app.post('/login', (req, res) => {
    try {
        if (!req.body.username || !req.body.password)
            throw new InvalidParametersError(
                'missing parameters. Required: {username, password}',
            );
        authenticateUser(db, req.body);
        res.status(200).json({status: 'OK'});
    } catch (error) {
        let err_msg = 'server error...';

        if (
            error instanceof UserAlreadyExistsError ||
            error instanceof IncorrectPasswordError ||
            error instanceof InvalidParametersError
        ) {
            err_msg = error.message;
        } else if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({status: err_msg});
        }

        res.status(400).json({status: err_msg});
    }
});

server.listen(PORT, () => {
    console.log('server running at http://localhost:' + PORT);
});
