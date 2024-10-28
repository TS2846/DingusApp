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

export default {
    CLIENT_PORT,
    SERVER_PORT,
    CLIENT_URI,
    SERVER_URI,
};
