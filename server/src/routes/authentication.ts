import {Router} from 'express';
import passport from 'passport';

import * as helpers from '../helpers/dbHelpers';
import * as DBErrors from '../errors/dbErrors';
import {
    verifyRefreshToken,
    createToken,
    createRefreshToken,
} from '../authorization';
import {handleErrors} from '../helpers/requestHelpers';
import {UserAPI} from '../interfaces/apiInterfaces';

const router = Router();

router.post(
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
            res.status(403).json({err_msg: 'Token could not be refreshed.'});
        }
    },
);

router.post('/login', (req, res) => {
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

router.post('/signup', (req, res) => {
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

router.get(
    '/self',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
        try {
            if (!req.user) {
                throw new DBErrors.UserAuthorizationError(
                    'User is not authorized',
                );
            }

            const user = helpers.getUser(req.user.id);
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
    },
);

router.post(
    '/logout',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
        try {
            if (req.user) {
                const user = helpers.getUser(req.user.id);
                if (!user)
                    throw new DBErrors.GetDataError(
                        'User not found, could not log out.',
                    );
                helpers.upsertUserToken(user.id, null);
                res.json({status_msg: 'OK'});
                console.log(`User ${user.username} has logged out.`);
            }
        } catch (error) {
            handleErrors(error, res);
        }
    },
);

export default router;
