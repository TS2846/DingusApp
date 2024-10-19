import express from 'express';
import {createServer} from 'node:http';
import {Server} from 'socket.io';
import {join} from 'path';
import parser from 'body-parser';
import cors from 'cors';
import config from './config';

import {
    authenticateUser,
    getMessages,
    getRooms,
    initializeDatabase,
    insertMessage,
    insertUser,
} from './helpers/dbHelpers';
import {
    IncorrectPasswordError,
    InvalidParametersError,
    UserAlreadyExistsError,
    UserDoesNotExistError,
} from './errors/dbErrors';

const app = express();

const jsonParser = parser.json({strict: true});
app.use(jsonParser);

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: config.CLIENT_URI,
        methods: ['GET', 'POST'],
    },
});

app.use(cors());

const DB_PATH = join(__dirname, '../sqlite/messageapp.db');
const db = initializeDatabase(DB_PATH);

io.on('connection', socket => {
    socket.join('6d612b41-3440-4f51-8e86-b88c6d60d83f');
    console.log('a user connected ' + socket.id);

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('message:send', (user, message, room, time) => {
        const row_id = insertMessage(db, user, room, message, time);
        io.to(room).emit('message:new', {
            id: row_id,
            senderId: user,
            roomId: room,
            sent: time,
            body: message,
        }); // AFTER ENTERING THINGS INTO DB
        console.log(
            'User ' +
                user +
                ' sending "' +
                message +
                '" to room ' +
                room +
                ' at ' +
                time,
        );
    });

    socket.on('room:join', (user, room) => {
        socket.join(room);
        io.to(socket.id).emit('room:change', user, room);
        console.log('User ' + user + ' joined room ' + room);
    });
});

app.options('/signup', cors());
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

        const user = insertUser(db, req.body);
        res.status(200).json(user);
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
            return;
        }

        res.status(400).json({status: err_msg});
    }
});

app.options('/login', cors());
app.post('/login', (req, res) => {
    try {
        if (!req.body.username || !req.body.password)
            throw new InvalidParametersError(
                'missing parameters. Required: {username, password}',
            );
        const user = authenticateUser(db, req.body);
        res.status(200).json(user);
    } catch (error) {
        let err_msg = 'server error...';

        if (
            error instanceof UserDoesNotExistError ||
            error instanceof IncorrectPasswordError ||
            error instanceof InvalidParametersError
        ) {
            err_msg = error.message;
        } else if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({status: err_msg});
            return;
        }

        console.error(err_msg);
        res.status(400).json({status: err_msg});
    }
});

app.get('/messages/:room_id', (req, res) => {
    //dumb
    const room_id = req.params.room_id;
    const messages = getMessages(db, room_id);
    res.json(messages);
});

app.get('/rooms/:user_id', (req, res) => {
    const user_id = req.params.user_id;
    const rooms = getRooms(db, user_id);
    res.json(rooms);
});

server.listen(config.SERVER_PORT, () => {
    console.log('server running at ' + config.SERVER_URI);
});
