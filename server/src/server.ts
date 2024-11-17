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
import {RoomAPI, UserAPI, MessageAPI} from './interfaces/apiInterfaces';
import {getUser, upsertUserToken} from './helpers/dbHelpers';

const app = express();

declare global {
    namespace Express {
        interface User {
            id: number | bigint;
            uuid: string;
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
            data: {id: user.id, uuid: user.uuid, username: user.username},
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
            data: {id: user.id, uuid: user.uuid, username: user.username},
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
                uuid: user.uuid,
                username: user.username,
                about_me: user.about_me,
            },
            token: createToken(user),
            refreshToken: refreshToken,
        });
        console.log(`User ${username} has logged in.`);
    } catch (error) {
        if (
            error instanceof DBErrors.UserDoesNotExistError ||
            error instanceof DBErrors.IncorrectPasswordError ||
            error instanceof DBErrors.InvalidParametersError
        ) {
            res.status(401).json({err_msg: error.message});
        } else {
            res.status(500).json({err_msg: 'Server error.'});
        }
        console.error(error);
    }
});

app.post('/signup', (req, res) => {
    try {
        console.log('User signing up...');
        const {
            user_uuid,
            username,
            password,
            about_me,
        }: {
            user_uuid: string;
            username: string;
            password: string;
            about_me: string;
        } = req.body;
        const user = helpers.insertUser({
            user_uuid: user_uuid,
            username: username,
            password: password,
            about_me: about_me,
        });
        const refreshToken = createRefreshToken(user);
        helpers.upsertUserToken(user.id, refreshToken);
        res.json({
            user: {
                uuid: user.uuid,
                username: user.username,
                about_me: user.about_me,
            },
            token: createToken(user),
            refreshToken: refreshToken,
        });
        console.log(`User ${username} has successfully signed up.`);
    } catch (error) {
        if (
            error instanceof DBErrors.UserAlreadyExistsError ||
            error instanceof DBErrors.InvalidParametersError
        ) {
            res.status(401).json({err_msg: error.message});
        } else {
            res.status(500).json({err_msg: 'Server error.'});
        }
        console.error(error);
    }
});

app.post(
    '/logout',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
        try {
            if (req.user) {
                const user = getUser(req.user.uuid);
                upsertUserToken(user.id, null);
                res.json({status_msg: 'OK'});
                console.log(`User ${user.username} has logged out.`);
            }
        } catch (error) {
            if (error instanceof DBErrors.GetDataError) {
                res.status(404).json({
                    err_msg: 'User not found, could not log out.',
                });
            }
            res.status(500);
            console.log(error);
        }
    },
);

app.get('/self', passport.authenticate('jwt', {session: false}), (req, res) => {
    if (req.user) {
        const user = getUser(req.user.uuid);
        const userapi: UserAPI = {
            uuid: user.uuid,
            username: user.username,
            about_me: user.about_me,
        };
        res.json(userapi);
    } else {
        res.status(401).end();
    }
});

app.get(
    '/messages/:room_uuid',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
        if (!req.user) {
            res.send(401).end();
            return;
        }

        const room_uuid = req.params.room_uuid;

        if (!helpers.isUserInRoom(req.user.uuid, room_uuid)) {
            res.send(401).send();
            return;
        }

        if (helpers.chatExists(room_uuid)) {
            res.json(helpers.getChatMessages(room_uuid));
        } else if (helpers.groupExists(room_uuid)) {
            res.json(helpers.getGroupMessages(room_uuid));
        } else {
            res.status(404).send();
        }
    },
);

app.get(
    '/room/:room_uuid',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
        if (!req.user) {
            res.send(401).end();
            return;
        }

        try {
            const room_uuid = req.params.room_uuid;
            const rooms: RoomAPI[] = helpers.getUserRooms(req.user.uuid);

            const room: RoomAPI | undefined = rooms.find(
                r => r.uuid === room_uuid,
            );
            if (!room) throw new Error('Room not found');
            res.json(room);
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
        if (!req.user) {
            res.send(401).end();
            return;
        }
        try {
            const rooms: RoomAPI[] = helpers.getUserRooms(req.user.uuid);
            res.json(rooms);
        } catch (error) {
            console.error(error);
            res.status(500).json({err_msg: 'Server error.'});
        }
    },
);

app.get(
    '/members/:room_uuid',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
        if (!req.user) {
            res.send(401).end();
            return;
        }

        const room_uuid = req.params.room_uuid;

        try {
            if (helpers.chatExists(room_uuid)) {
                res.json(helpers.getChatMembers(room_uuid));
            } else if (helpers.groupExists(room_uuid)) {
                res.json(helpers.getGroupMembers(room_uuid));
            } else {
                res.status(404).json({err_msg: 'Room not found!'});
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({err_msg: 'Server error.'});
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
    socket.join(user.uuid);
    console.log(`User ${user.username} connected at socket ${socket.id}`);

    socket.on(
        'message:send',
        ({room_uuid, sender_uuid, sent_date, body}: MessageAPI) => {
            console.log(`New Message: ${body}`);
            helpers.insertMessage(sender_uuid, room_uuid, sent_date, body);
            io.emit('message:new', room_uuid);
        },
    );

    socket.on('disconnect', () => {
        console.log(`User ${user.username} disconnected`);
    });
});

server.listen(config.SERVER_PORT, () => {
    console.log('server running at ' + config.SERVER_URI);
});
