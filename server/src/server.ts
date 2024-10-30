import express from 'express';
import {createServer} from 'node:http';
import {Server} from 'socket.io';
import parser from 'body-parser';
import cors from 'cors';
import config from './config';
import {v4 as uuidv4} from 'uuid';

import * as helpers from './helpers/dbHelpers';
import * as DBErrors from './errors/dbErrors';
import {RoomAPI} from './interfaces/apiInterfaces';
import {User} from './models/dbModels';

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
helpers.initializeDatabase();

function authorizeUser(user: User | null) {
    if (!user) {
        throw new DBErrors.UserAuthorizationError(
            'user is not authorized to perform this action',
        );
    }
}

io.on('connection', socket => {
    let user: User;

    socket.on('disconnect', () => {
        if (user) {
            console.log('User ' + user.username + ' disconnected.');
        }
    });

    socket.on('user:authenticate', (username: string, password: string) => {
        try {
            user = helpers.authenticateUser(username, password);
            socket.join(user.uuid);
            io.to(user.uuid).emit('user:authenticated', user);
            console.log('User ' + user.username + ' logged in');
        } catch (error) {
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
                io.to(socket.id).emit(
                    'user:authentication_error',
                    'Server error!',
                );
            }
            console.error(error);
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
                socket.join(user.uuid);
                io.to(user.uuid).emit('user:registered', user);
                console.log('User ' + user.username + ' logged in');
            } catch (error) {
                if (
                    error instanceof DBErrors.UserAlreadyExistsError ||
                    error instanceof DBErrors.InvalidParametersError
                ) {
                    io.to(socket.id).emit(
                        'user:registration_error',
                        error.message,
                    );
                } else {
                    io.to(socket.id).emit(
                        'user:registration_error',
                        'Server error!',
                    );
                }
                console.error(error);
            }
        },
    );

    socket.on('room:join', (room_uuid: string) => {
        try {
            authorizeUser(user);
            socket.join(room_uuid);
            if (helpers.chatExists(room_uuid)) {
                io.to(user.uuid).emit(
                    'room:joined',
                    room_uuid,
                    helpers.getChatMessages(room_uuid),
                );
            } else if (helpers.groupExists(room_uuid)) {
                io.to(user.uuid).emit(
                    'room:joined',
                    room_uuid,
                    helpers.getGroupMessages(room_uuid),
                );
            } else {
                io.to(user.uuid).emit(
                    'user:request_error',
                    'Room is not available to join',
                );
            }
        } catch (error) {
            if (error instanceof DBErrors.UserAuthorizationError) {
                io.to(socket.id).emit(
                    'user:authorization_error',
                    error.message,
                );
            } else {
                io.to(socket.id).emit('user:request_error', 'Server error!');
            }
            console.error(error);
        }
    });

    socket.on('chat:create', (friend_username: string) => {
        try {
            authorizeUser(user);
            const friend = helpers.getUserByUsername(friend_username);
            const room_uuid = helpers.contactExists(user.uuid, friend.uuid);
            if (typeof room_uuid === 'string') {
                io.to(user.uuid).emit(
                    'room:joined',
                    room_uuid,
                    helpers.getChatMessages(room_uuid),
                );
            } else {
                const chat_uuid = uuidv4();
                const now = Date.now();
                const chat_id = helpers.insertChat(chat_uuid, now, now);
                helpers.insertContact(user.uuid, friend.uuid, chat_id);
                socket.join(chat_uuid);

                const room: RoomAPI = {
                    uuid: chat_uuid,
                    type: 'chat',
                    title: friend.username,
                    created_date: now,
                    last_activity: now,
                    members_uuid: [user.uuid, friend.uuid],
                };

                io.to(user.uuid).emit('chat:created', room);

                io.to(friend.uuid).emit('room:invitation', {
                    ...room,
                    title: user.username,
                });
            }
        } catch (error) {
            if (error instanceof DBErrors.UserAuthorizationError) {
                io.to(socket.id).emit(
                    'user:authorization_error',
                    error.message,
                );
            } else if (error instanceof DBErrors.GetDataError) {
                io.to(socket.id).emit('user:request_error', error.message);
            } else {
                io.to(socket.id).emit('user:request_error', 'Server error!');
            }
            console.error(error);
        }
    });

    socket.on(
        'message:submit',
        (
            sender_uuid: string,
            room_uuid: string,
            sent_date: number,
            body: string,
        ) => {
            try {
                authorizeUser(user);
                if (helpers.isUserInRoom(sender_uuid, room_uuid)) {
                    helpers.insertMessage(
                        sender_uuid,
                        room_uuid,
                        sent_date,
                        body,
                    );
                    io.emit('message:submitted', {
                        sender_uuid,
                        room_uuid,
                        sent_date,
                        body,
                    });
                } else {
                    io.to(user.uuid).emit(
                        'user:request_error',
                        'Could not send message to this room',
                    );
                }
            } catch (error) {
                if (error instanceof DBErrors.UserAuthorizationError) {
                    io.to(socket.id).emit(
                        'user:authorization_error',
                        error.message,
                    );
                } else if (error instanceof DBErrors.GetDataError) {
                    io.to(socket.id).emit('user:request_error', error.message);
                } else {
                    io.to(socket.id).emit(
                        'user:request_error',
                        'Server error!',
                    );
                }
                console.error(error);
            }
        },
    );

    socket.on('user:get_rooms_req', () => {
        try {
            authorizeUser(user);
            const rooms: RoomAPI[] = helpers.getUserRooms(user.uuid);
            io.to(user.uuid).emit('user:get_rooms_res', rooms);
        } catch (error) {
            if (error instanceof DBErrors.UserAuthorizationError) {
                io.to(socket.id).emit(
                    'user:authorization_error',
                    error.message,
                );
            } else {
                io.to(socket.id).emit('user:request_error', 'Server error!');
            }
            console.error(error);
        }
    });

    socket.on('user:get_room_members_req', (room_uuid: string) => {
        try {
            authorizeUser(user);
            if (helpers.chatExists(room_uuid)) {
                io.to(user.uuid).emit(
                    'user:get_room_members_res',
                    helpers.getChatMembers(room_uuid),
                );
            } else if (helpers.groupExists(room_uuid)) {
                io.to(user.uuid).emit(
                    'user:get_room_members_res',
                    helpers.getGroupMembers(room_uuid),
                );
            } else {
                io.to(user.uuid).emit(
                    'user:request_error',
                    'Room members could not be found...',
                );
            }
        } catch (error) {
            if (error instanceof DBErrors.UserAuthorizationError) {
                io.to(socket.id).emit(
                    'user:authorization_error',
                    error.message,
                );
            } else {
                io.to(socket.id).emit('user:request_error', 'Server error!');
            }
            console.error(error);
        }
    });
});

server.listen(config.SERVER_PORT, () => {
    console.log('server running at ' + config.SERVER_URI);
});
