import {Server, DefaultEventsMap} from 'socket.io';
import {type Request} from 'express';
import * as helpers from './helpers/dbHelpers';

type ID = number | bigint;

const setupSocket = (
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
) => {
    io.on('connection', socket => {
        const req = socket.request as Request & {user: Express.User};
        let user = req.user;
        socket.join(String(user.id));
        console.log(`User ${user.username} connected at socket ${socket.id}`);

        socket.on(
            'message:send',
            (sender_id: ID, room_id: ID, body: string) => {
                helpers.insertMessage(sender_id, room_id, body);
                io.emit('message:new', room_id);
            },
        );

        socket.on('contacts:add', (friend_username: string) => {
            const friend = helpers.getUserByUsername(friend_username);
            if (!friend) {
                io.to(socket.id).emit('error', {
                    req: 'constacts:add',
                    msg: 'Friend not found',
                });
                return;
            }
            helpers.addFriend(req.user.id, friend.id);
            io.emit('contacts:added');
        });

        socket.on('group:create', (title: string | null, members: ID[]) => {
            helpers.addGroup(title || `${req.user.username}'s room`, members);
            io.emit('group:created');
        });

        socket.on('group:member:add', (member_id: ID, room_id: ID) => {
            helpers.addMember(member_id, room_id);
            io.emit('group:member:added', room_id);
        });

        socket.on('disconnect', () => {
            console.log(`User ${user.username} disconnected`);
        });
    });
};

export default setupSocket;
