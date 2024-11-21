import {Router} from 'express';
import passport from 'passport';
import * as DBErrors from '../errors/dbErrors';
import * as helpers from '../helpers/dbHelpers';

import {RoomAPI, UserAPI, MessageAPI} from '../interfaces/apiInterfaces';
import {handleErrors} from '../helpers/requestHelpers';

const router = Router();

router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    try {
        if (!req.user) {
            throw new DBErrors.UserAuthorizationError('User is not authorized');
        }
        const rooms = helpers.getRooms(req.user.id);
        const data: RoomAPI[] = rooms.map(room => ({
            id: room.id,
            type: room.group_id ? 'group' : 'chat',
            title: helpers.getRoomTitle(room.id, req.user!.id),
            created_date: room.created_date,
            last_activity: room.last_activity,
            members_id: helpers.getMembers(room.id),
        }));
        res.json(data);
    } catch (error) {
        handleErrors(error, res);
    }
});

router.get(
    '/:room_id',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
        try {
            if (!req.user) {
                throw new DBErrors.UserAuthorizationError(
                    'User is not authorized',
                );
            }
            const room_id = BigInt(req.params.room_id);
            const room = helpers.getRoom(room_id);
            if (!room) {
                throw new DBErrors.GetDataError('Room not found');
            }

            const data: RoomAPI = {
                id: room.id,
                type: room.group_id ? 'group' : 'chat',
                title: helpers.getRoomTitle(room.id, req.user.id),
                created_date: room.created_date,
                last_activity: room.last_activity,
                members_id: helpers.getMembers(room.id),
            };

            res.json(data);
        } catch (error) {
            console.error(error);
            res.status(403).send();
        }
    },
);

router.get(
    '/:room_id/messages',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
        try {
            if (!req.user) {
                throw new DBErrors.UserAuthorizationError(
                    'User is not authorized',
                );
            }

            const room_id = BigInt(req.params.room_id);

            if (!helpers.getRoom(room_id)) {
                throw new DBErrors.GetDataError('Room not found');
            }

            if (!helpers.userInRoom(req.user.id, room_id)) {
                throw new DBErrors.UserAuthorizationError('User not in room');
            }

            const messages = helpers.getMessages(room_id);

            const data: MessageAPI[] = messages.map(msg => ({
                id: msg.id,
                sender_id: msg.sender_id,
                room_id: msg.room_id,
                sent_date: msg.sent_date,
                body: msg.body,
            }));

            res.json(data);
        } catch (error: unknown) {
            handleErrors(error, res);
        }
    },
);

router.get(
    '/:room_id/members',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
        try {
            if (!req.user) {
                throw new DBErrors.UserAuthorizationError(
                    'User is not authorized',
                );
            }

            const room_id = BigInt(req.params.room_id);

            const members = helpers.getMembers(room_id);
            const data: UserAPI[] = members.map(id => helpers.getUser(id)!);

            res.json(data);
        } catch (error) {
            handleErrors(error, res);
        }
    },
);

export default router;
