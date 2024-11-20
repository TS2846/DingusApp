import express, {type Request, type Response} from 'express';
import {createServer} from 'node:http';
import {Server} from 'socket.io';
import parser from 'body-parser';
import cors from 'cors';
import {Strategy as JwtStrategy, ExtractJwt} from 'passport-jwt';
import jwt from 'jsonwebtoken';
import passport from 'passport';

import * as config from './config';
import * as helpers from './helpers/dbHelpers';
import * as DBErrors from './errors/dbErrors';
import {
    RoomAPI,
    UserAPI,
    MessageAPI,
    ContactAPI,
} from './interfaces/apiInterfaces';
import {getUser, upsertUserToken} from './helpers/dbHelpers';

const app = express();

type ID = number | bigint;

declare global {
    namespace Express {
        interface User {
            id: ID;
            username: string;
        }
    }
}

const jsonParser = parser.json({strict: true});
app.use(jsonParser);

const server = createServer(app);

app.use(cors());

helpers.initializeDatabase();

const verifyRefreshToken = (refreshToken: string): boolean => {
    try {
        jwt.verify(refreshToken, config.JWT_REFRESH_SECRET, {
            issuer: config.JWT_ISSUER,
            audience: config.JWT_AUDIENCE,
        });
        return true;
    } catch (error) {
        console.error('Invalid refresh token.');
        return false;
    }
};

const createToken = (user: Express.User): string => {
    return jwt.sign(
        {
            data: {id: user.id, username: user.username},
        },
        config.JWT_SECRET,
        {
            issuer: config.JWT_ISSUER,
            audience: config.JWT_AUDIENCE,
            expiresIn: config.JWT_EXPIRY,
        },
    );
};

const createRefreshToken = (user: Express.User): string => {
    return jwt.sign(
        {
            data: {id: user.id, username: user.username},
        },
        config.JWT_REFRESH_SECRET,
        {
            issuer: config.JWT_ISSUER,
            audience: config.JWT_AUDIENCE,
            expiresIn: config.JWT_REFRESH_EXPIRY,
        },
    );
};

const jwtDecodeOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.JWT_SECRET,
    issuer: config.JWT_ISSUER,
    audience: config.JWT_AUDIENCE,
};

const jwtStrategy = new JwtStrategy(jwtDecodeOptions, (payload, done) => {
    return done(null, payload.data);
});

const jwtRefreshDecodeOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('x-refresh-token'),
    secretOrKey: config.JWT_REFRESH_SECRET,
    issuer: config.JWT_ISSUER,
    audience: config.JWT_AUDIENCE,
};

const jwtRefreshStrategy = new JwtStrategy(
    jwtRefreshDecodeOptions,
    (payload, done) => {
        return done(null, payload.data);
    },
);

const jwtDecodeExpiredOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.JWT_SECRET,
    issuer: config.JWT_ISSUER,
    audience: config.JWT_AUDIENCE,
    ignoreExpiration: true,
};

const jwtExpiredStrategy = new JwtStrategy(
    jwtDecodeExpiredOptions,
    (payload, done) => {
        return done(null, payload.data);
    },
);

passport.use('jwt', jwtStrategy);
passport.use('jwt-refresh', jwtRefreshStrategy);
passport.use('jwt-expired', jwtExpiredStrategy);

function handleErrors(error: unknown, res: Response) {
    if (error instanceof DBErrors.GetDataError) {
        res.status(404).json({
            message: error.message,
        });
    } else if (error instanceof DBErrors.IncorrectPasswordError) {
        res.status(401).json({
            message: error.message,
        });
    } else if (error instanceof DBErrors.InvalidParametersError) {
        res.status(411).json({
            message: error.message,
        });
    } else if (error instanceof DBErrors.UserAlreadyExistsError) {
        res.status(400).json({
            message: error.message,
        });
    } else if (error instanceof DBErrors.UserDoesNotExistError) {
        res.status(404).json({
            message: error.message,
        });
    } else if (error instanceof DBErrors.UserAuthorizationError) {
        res.status(401).json({
            message: error.message,
        });
    } else {
        res.status(500).json({
            message: 'Internal server error.',
        });
    }

    console.error(error);
}

app.post(
    '/refresh-token',
    passport.authenticate(['jwt-expired', 'jwt-refresh'], {session: false}),
    (req, res) => {
        try {
            if (!req.user) {
                throw new Error('Unauthorized user.');
            }
            const refresh_token = req.header('x-refresh-token') || '';
            const dbToken = helpers.getUserRefreshToken(req.user.id);

            if (!dbToken) {
                throw new Error('Refresh token not found in database.');
            }
            if (refresh_token !== dbToken) {
                throw new Error('Refresh token do not match.');
            }
            res.json({
                token: createToken(req.user),
                refresh_token: dbToken,
            });
        } catch (error) {
            console.error(error);
            res.status(401).json({err_msg: 'Token could not be refreshed.'});
        }
    },
);

app.post('/login', (req, res) => {
    try {
        const {username, password}: {username: string; password: string} =
            req.body;
        const user = helpers.authenticateUser(username, password);
        let refreshToken = helpers.getUserRefreshToken(user.id);

        if (!refreshToken || !verifyRefreshToken(refreshToken)) {
            refreshToken = createRefreshToken(user);
            helpers.upsertUserToken(user.id, refreshToken);
        }

        res.json({
            user: {
                id: user.id,
                username: user.username,
                about_me: user.about_me,
            },
            token: createToken(user),
            refreshToken: refreshToken,
        });
        console.log(`User ${username} has logged in.`);
    } catch (error) {
        handleErrors(error, res);
    }
});

app.post('/signup', (req, res) => {
    try {
        const {username, password, about_me} = req.body;

        if (!username || !password) {
            throw new DBErrors.IncorrectPasswordError(
                'Invalied username and or password',
            );
        }

        if (helpers.userExists(username)) {
            throw new DBErrors.UserAlreadyExistsError(
                'Username already exists',
            );
        }

        const user = helpers.insertUser(username, password, about_me);

        const refreshToken = createRefreshToken(user);
        helpers.upsertUserToken(user.id, refreshToken);
        res.json({
            user: {
                id: user.id,
                username: user.username,
                about_me: user.about_me,
            },
            token: createToken(user),
            refreshToken: refreshToken,
        });

        console.log(
            `User ${username} has successfully signed up and logged in.`,
        );
    } catch (error) {
        handleErrors(error, res);
    }
});

app.post(
    '/logout',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
        try {
            if (req.user) {
                const user = getUser(req.user.id);
                if (!user)
                    throw new DBErrors.GetDataError(
                        'User not found, could not log out.',
                    );
                upsertUserToken(user.id, null);
                res.json({status_msg: 'OK'});
                console.log(`User ${user.username} has logged out.`);
            }
        } catch (error) {
            handleErrors(error, res);
        }
    },
);

app.get('/self', passport.authenticate('jwt', {session: false}), (req, res) => {
    try {
        if (!req.user) {
            throw new DBErrors.UserAuthorizationError('User is not authorized');
        }

        const user = getUser(req.user.id);
        if (!user) throw new DBErrors.GetDataError('User not found!');
        const data: UserAPI = {
            id: user.id,
            username: user.username,
            about_me: user.about_me,
        };
        res.json(data);
    } catch (error) {
        handleErrors(error, res);
    }
});

app.get(
    '/rooms/:room_id/messages',
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

app.get(
    '/rooms/:room_id',
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
            res.status(401).send();
        }
    },
);

app.get(
    '/rooms',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
        try {
            if (!req.user) {
                throw new DBErrors.UserAuthorizationError(
                    'User is not authorized',
                );
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
    },
);

app.get(
    '/rooms/:room_id/members',
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

app.get(
    '/contacts',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
        try {
            if (!req.user) {
                throw new DBErrors.UserAuthorizationError(
                    'User is not authorized',
                );
            }

            const contacts = helpers.getContacts(req.user.id);
            const data: ContactAPI[] = contacts.map(contact => ({
                id: contact.friend_id,
                room_id: contact.room_id,
                username: helpers.getUser(contact.friend_id)?.username || '',
                about_me: helpers.getUser(contact.friend_id)?.about_me || '',
            }));

            res.json(data);
        } catch (error) {
            handleErrors(error, res);
        }
    },
);

const io = new Server(server, {
    cors: {
        origin: config.CLIENT_URI,
        methods: ['GET', 'POST'],
    },
});

io.engine.use(
    (req: {_query: Record<string, string>}, res: Response, next: Function) => {
        const isHandshake = req._query.sid === undefined;
        if (isHandshake) {
            passport.authenticate('jwt', {session: false})(req, res, next);
        } else {
            next();
        }
    },
);

io.on('connection', socket => {
    const req = socket.request as Request & {user: Express.User};
    let user = req.user;
    socket.join(String(user.id));
    console.log(`User ${user.username} connected at socket ${socket.id}`);

    socket.on('message:send', (sender_id: ID, room_id: ID, body: string) => {
        helpers.insertMessage(sender_id, room_id, body);
        io.emit('message:new', room_id);
    });

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
        const rooms = helpers.addGroup(
            title || `${req.user.username}'s room`,
            members,
        );
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

server.listen(config.SERVER_PORT, () => {
    console.log('server running at ' + config.SERVER_URI);
});
