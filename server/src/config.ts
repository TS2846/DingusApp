import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({
    path: path.join(__dirname, '../../.env'),
});

export const CLIENT_PORT = process.env.APP_CLIENT_PORT || 3000;
export const SERVER_PORT = process.env.APP_SERVER_PORT || 3001;
export const CLIENT_URI =
    process.env.CLIENT_URI || `http://localhost:${CLIENT_PORT}`;
export const SERVER_URI =
    process.env.SERVER_URI || `http://localhost:${SERVER_PORT}`;
export const DB_PATH =
    process.env.DB_PATH || path.join(__dirname, '../sqlite/messageapp.db');
export const JWT_SECRET = process.env.JWT_SECRET || 'secret';
export const JWT_REFRESH_SECRET =
    process.env.JWT_REFRESH_SECRET || 'secret-refresh';
export const JWT_ISSUER = process.env.JWT_ISSUER || 'server.messageapp.com';
export const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'client.messageapp.com';
export const JWT_EXPIRY = process.env.JWT_EXPIRY || '1h';
export const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '10d';
