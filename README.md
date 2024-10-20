# Messaging App

Demo messaging app built with express and socket io

## How to run the App

To run the app with full functionality you must run both the client and server components:

1.  Install **server** dependencies by running the command `npm install` while in the `server` directory.
2.  Install **client** dependencies by running the command `npm install` while in the `client` directory.
3.  Start the **server** component by running the command `npm run dev` while in the `server` directory.
4.  In another terminal window, start the **client** component by running the command `npm run dev` while in the `client` directory.

By default the front-end of the app is served at `http://localhost:3000`. If you want to change the default ports, create a `.env` file in the root directory.

### Sample `.env` Template

```
# create the .env file in the project root directory

APP_CLIENT_PORT = 3000      # port where the client runs
APP_SERVER_PORT = 3001      # port where the server runs
```

Since the `client` and `server` needs to communicate with each other you

## Technology Stack

![Vite](https://ziadoua.github.io/m3-Markdown-Badges/badges/ViteJS/vitejs1.svg) ![React](https://ziadoua.github.io/m3-Markdown-Badges/badges/React/react1.svg) ![TypeScript](https://ziadoua.github.io/m3-Markdown-Badges/badges/TypeScript/typescript1.svg)

![Express](https://ziadoua.github.io/m3-Markdown-Badges/badges/Express/express3.svg) ![Socket.io](https://ziadoua.github.io/m3-Markdown-Badges/badges/SocketIO/socketio3.svg) ![SQLite](https://ziadoua.github.io/m3-Markdown-Badges/badges/SQLite/sqlite1.svg)

### Other Dependencies

-   [react-toastify](https://www.npmjs.com/package/react-toastify)
-   [react-icons](https://www.npmjs.com/package/react-icons)
-   [react-html-props](https://www.npmjs.com/package/react-html-props)
-   [uuid](https://www.npmjs.com/package/uuid)
-   [nodemon](https://www.npmjs.com/package/nodemon)
-   [bcrypt](https://www.npmjs.com/package/bcrypt)
-   [better-sqlite3](https://www.npmjs.com/package/better-sqlite3)
