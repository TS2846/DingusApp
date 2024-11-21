import express, {type Response} from 'express';
import {createServer} from 'node:http';
import {Server} from 'socket.io';
import parser from 'body-parser';
import cors from 'cors';
import passport from 'passport';

import * as config from './config';
import * as helpers from './helpers/dbHelpers';
import setupSocket from './setupSocket';
import {
    jwtStrategy,
    jwtExpiredStrategy,
    jwtRefreshStrategy,
} from './authorization';
import {roomsRouter, authenticationRouter, contactsRouter} from './routes';

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

// JWT Token Authorization
passport.use('jwt', jwtStrategy);
passport.use('jwt-refresh', jwtRefreshStrategy);
passport.use('jwt-expired', jwtExpiredStrategy);

// Subcribe to routes
app.use('/', authenticationRouter);
app.use('/rooms', roomsRouter);
app.use('/contacts', contactsRouter);

// Socket IO
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

setupSocket(io);

server.listen(config.SERVER_PORT, () => {
    console.log('server running at ' + config.SERVER_URI);
});
