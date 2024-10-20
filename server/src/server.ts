import express from 'express';
import {createServer} from 'node:http';
import {Server} from 'socket.io';
import {join} from 'path';
import parser from 'body-parser';
import cors from 'cors';
import config from './config';
import {v4 as uuidv4} from 'uuid';

import * as helpers from './helpers/dbHelpers';
import * as DBErrors from './errors/dbErrors';
import {RoomAPI, UserAPI} from './interfaces/apiInterfaces';

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
const db = helpers.initializeDatabase(DB_PATH);

io.on('connection', socket => {
    let user: UserAPI | null = null;

    socket.on('user:authenticate', (username: string, password: string) => {
        try {
            user = helpers.authenticateUser(db, {username, password});
            io.to(socket.id).emit('user:authenticated', user);
            console.log('User ' + user.name + ' logged in');
        } catch (error) {
            let err_msg = 'Server error!';

            if (
                error instanceof DBErrors.UserDoesNotExistError ||
                error instanceof DBErrors.IncorrectPasswordError ||
                error instanceof DBErrors.InvalidParametersError
            ) {
                io.to(socket.id).emit(
                    'user:authentication_error',
                    error.message,
                );
            } else {
                console.error(error);
                io.to(socket.id).emit('user:authentication_error', err_msg);
            }
        }
    });

    socket.on(
        'user:register',
        (name: string, username: string, password: string) => {
            try {
                user = helpers.insertUser(db, {
                    id: uuidv4(),
                    name,
                    username,
                    password,
                });

                io.to(socket.id).emit('user:registered', user);
                console.log('User ' + user.name + ' logged in');
            } catch (error) {
                let err_msg = 'Server error!';

                if (
                    error instanceof DBErrors.UserAlreadyExistsError ||
                    error instanceof DBErrors.InvalidParametersError
                ) {
                    io.to(socket.id).emit(
                        'user:registration_error',
                        error.message,
                    );
                } else {
                    console.error(error);
                    io.to(socket.id).emit('user:registration_error', err_msg);
                }
            }
        },
    );

    socket.on('disconnect', () => {
        console.log('User ' + user?.name + ' disconnected.');
    });

    socket.on('room:create', (user_id: string, room_name: string) => {
        const room_id = uuidv4();
        helpers.insertRoom(db, {id: room_id, name: room_name});
        helpers.insertUserInRoom(db, user_id, room_id);

        socket.join(room_id);
        io.to(socket.id).emit('room:created', {
            id: room_id,
            name: room_name,
            members: [user],
        });
    });

    socket.on('room:join', (user_id: string, room_id: string) => {
        if (helpers.isUserInRoom(db, user_id, room_id)) {
            const room = helpers.getRoom(db, room_id);
            const members = helpers.getRoomMembers(db, room_id);
            const messages = helpers.getMessages(db, room_id);
            socket.join(room_id);
            io.to(socket.id).emit('room:joined', {...room, members}, messages);
        }
    });

    socket.on(
        'message:submit',
        (sender_id: string, room_id: string, sent_at: Date, body: string) => {
            helpers.insertMessage(db, {sender_id, room_id, sent_at, body});

            io.emit('message:submitted', {
                sender_id,
                room_id,
                sent_at,
                body,
            });
        },
    );

    socket.on('user:get_rooms_req', (user_id: string) => {
        const rooms = helpers.getUserRooms(db, user_id);
        const rooms_api: RoomAPI[] = rooms.map(room => {
            return {...room, members: helpers.getRoomMembers(db, room.id)};
        });
        io.to(socket.id).emit('user:get_rooms_res', rooms_api);
    });
});

server.listen(config.SERVER_PORT, () => {
    console.log('server running at ' + config.SERVER_URI);
});
