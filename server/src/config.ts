import dotenv from 'dotenv';
dotenv.config();

export const MODE = process.env.MODE || 'development';
export const CLIENT_PORT = process.env.CLIENT_PORT || 3000;
export const SERVER_PORT = process.env.SERVER_PORT || 3001;
export const CLIENT_URI =
    process.env.CLIENT_URI || `http://localhost:${CLIENT_PORT}`;
export const SERVER_URI =
    process.env.SERVER_URI || `http://localhost:${SERVER_PORT}`;
export const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export default {
    MODE,
    CLIENT_PORT,
    SERVER_PORT,
    CLIENT_URI,
    SERVER_URI,
    JWT_SECRET,
};
