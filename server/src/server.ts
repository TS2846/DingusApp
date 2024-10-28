import express from 'express';
import {createServer} from 'node:http';
import {Server} from 'socket.io';
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

io.on('connection', socket => {
    let user: UserAPI | null = null;

    socket.on('user:authenticate', (username: string, password: string) => {
        try {
            user = helpers.authenticateUser(username, password);
            io.to(socket.id).emit('user:authenticated', user);
            console.log('User ' + user.username + ' logged in');
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
        (
            username: string,
            password: string,
            first_name: string,
            last_name: string,
            about_me: string,
        ) => {
            try {
                user = helpers.insertUser({
                    user_uuid: uuidv4(),
                    username: username,
                    password: password,
                    first_name: first_name,
                    last_name: last_name,
                    about_me: about_me,
                });

                io.to(socket.id).emit('user:registered', user);
                console.log('User ' + user.username + ' logged in');
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
        if (user) {
            console.log('User ' + user.username + ' disconnected.');
        }
    });

    socket.on('chat:create', (user_uuid: string, friend_uuid: string) => {
        const chat_uuid = uuidv4();
        const now = Date.now();
        const chat_id = helpers.insertChat(chat_uuid, now, now);
        helpers.insertContact(user_uuid, friend_uuid, chat_id);

        socket.join(chat_uuid);

        const room: RoomAPI = {
            uuid: user_uuid,
            type: 'chat',
            title: helpers.getUser(friend_uuid).username,
            created_date: now,
            last_activity: now,
            members_uuid: [user_uuid, friend_uuid],
        };

        io.to(socket.id).emit('chat:created', room);
    });

    socket.on(
        'message:submit',
        (
            sender_uuid: string,
            room_uuid: string,
            sent_date: number,
            body: string,
        ) => {
            if (helpers.isUserInRoom(sender_uuid, room_uuid)) {
                helpers.insertMessage(sender_uuid, room_uuid, sent_date, body);
                io.emit('message:submitted', {
                    sender_uuid,
                    room_uuid,
                    sent_date,
                    body,
                });
            }
        },
    );

    socket.on('user:get_rooms_req', (user_id: string) => {
        const rooms: RoomAPI[] = helpers.getUserRooms(user_id);
        io.to(socket.id).emit('user:get_rooms_res', rooms);
    });
});

server.listen(config.SERVER_PORT, () => {
    console.log('server running at ' + config.SERVER_URI);
});
