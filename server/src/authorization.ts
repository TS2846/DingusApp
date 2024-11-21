import {Strategy as JwtStrategy, ExtractJwt} from 'passport-jwt';
import jwt from 'jsonwebtoken';

import * as config from './config';

const jwtDecodeOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.JWT_SECRET,
    issuer: config.JWT_ISSUER,
    audience: config.JWT_AUDIENCE,
};

const jwtRefreshDecodeOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('x-refresh-token'),
    secretOrKey: config.JWT_REFRESH_SECRET,
    issuer: config.JWT_ISSUER,
    audience: config.JWT_AUDIENCE,
};

const jwtDecodeExpiredOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.JWT_SECRET,
    issuer: config.JWT_ISSUER,
    audience: config.JWT_AUDIENCE,
    ignoreExpiration: true,
};

export const verifyRefreshToken = (refreshToken: string): boolean => {
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

export const createToken = (user: Express.User): string => {
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

export const createRefreshToken = (user: Express.User): string => {
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

export const jwtStrategy = new JwtStrategy(
    jwtDecodeOptions,
    (payload, done) => {
        return done(null, payload.data);
    },
);

export const jwtRefreshStrategy = new JwtStrategy(
    jwtRefreshDecodeOptions,
    (payload, done) => {
        return done(null, payload.data);
    },
);

export const jwtExpiredStrategy = new JwtStrategy(
    jwtDecodeExpiredOptions,
    (payload, done) => {
        return done(null, payload.data);
    },
);
