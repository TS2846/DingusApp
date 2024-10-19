export const CLIENT_PORT = parseInt(import.meta.env.APP_CLIENT_PORT) || 3000;
export const SERVER_PORT = parseInt(import.meta.env.APP_SERVER_PORT) || 3001;
export const CLIENT_URI =
    import.meta.env.APP_CLIENT_URI || `http://localhost:${CLIENT_PORT}`;
export const SERVER_URI =
    import.meta.env.APP_SERVER_URI || `http://localhost:${SERVER_PORT}`;

export default {
    CLIENT_PORT,
    SERVER_PORT,
    CLIENT_URI,
    SERVER_URI,
};
