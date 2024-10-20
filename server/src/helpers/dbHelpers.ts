import Connect, {Database} from 'better-sqlite3';
import {hashSync, genSaltSync, compareSync} from 'bcrypt';
import {existsSync, mkdirSync, writeFileSync} from 'fs';
import {dirname} from 'path';

import {
    IncorrectPasswordError,
    UserAlreadyExistsError,
    UserDoesNotExistError,
} from '../errors/dbErrors';
import {User, Message, Room} from '../models/dbModels';
import {LoginPayload, SignupPayload} from '../types/payload';
import {MessageAPI, UserAPI} from '../interfaces/apiInterfaces';

export function initializeDatabase(file: string): Database {
    let db = null;

    const dir = dirname(file);

    if (!existsSync(dir)) {
        mkdirSync(dir, {recursive: true});
    }

    if (!existsSync(file)) {
        writeFileSync(file, '');
    }

    try {
        db = Connect(file);
    } catch (error: any) {
        let errMsg = 'unknown error';
        if (error instanceof Error) errMsg = error.message;

        console.error(
            'Could not connect to the database: ' +
                errMsg +
                ' using in-memory database...',
        );

        db = Connect();
    }

    try {
        db.pragma('journal_mode = WAL');

        db.exec(`
            CREATE TABLE IF NOT EXISTS users(
                id          NCHAR(36)       PRIMARY KEY,
                username    VARCHAR(60)     UNIQUE NOT NULL,
                _password   VARCHAR(255)    NOT NULL,
                name        VARCHAR(60)     NOT NULL

            ) WITHOUT ROWID;
        `);

        db.exec(`
            CREATE TABLE IF NOT EXISTS rooms(
                id          NCHAR(36)       PRIMARY KEY,
                name        VARCHAR(60)     NOT NULL

            ) WITHOUT ROWID;
        `);

        db.exec(`
            CREATE TABLE IF NOT EXISTS users_rooms(
                user_id     NCHAR(36),
                room_id     NCHAR(36),
                
                PRIMARY KEY (user_id, room_id),
                FOREIGN KEY (user_id)
                    REFERENCES users (id)
                        ON DELETE CASCADE
                        ON UPDATE NO ACTION,
                FOREIGN KEY (room_id)
                    REFERENCES rooms (id)
                        ON DELETE CASCADE
                        ON UPDATE NO ACTION
            );
        `);

        db.exec(`
            CREATE TABLE IF NOT EXISTS messages (
                id              INTEGER         PRIMARY KEY AUTOINCREMENT,
                sender_id       NCHAR(36),
                room_id         NCHAR(36),
                sent_at         DATETIME        NOT NULL,
                body            TEXT,

                FOREIGN KEY (sender_id)
                    REFERENCES users (id)
                        ON DELETE CASCADE
                        ON UPDATE NO ACTION,
                FOREIGN KEY (room_id)
                    REFERENCES rooms (id)
                        ON DELETE CASCADE
                        ON UPDATE NO ACTION
            );
        `);
    } catch (error) {
        let errMsg = 'unknown error';
        if (error instanceof Error) errMsg = error.message;

        console.error('Could not initialize tables into database: ' + errMsg);
    }

    return db;
}

export function authenticateUser(db: Database, user: LoginPayload) {
    const row = db
        .prepare<string[], User>(`SELECT * FROM users WHERE username = ?`)
        .get(user.username);

    if (!row) throw new UserDoesNotExistError('user does not exist');

    if (!compareSync(user.password, row._password))
        throw new IncorrectPasswordError('password is invalid');

    return {id: row.id, username: row.username, name: row.name};
}

// PUT Functions

export function insertUser(db: Database, user: SignupPayload) {
    if (userExists(db, user.id, user.username))
        throw new UserAlreadyExistsError('username already exists');

    const stmt = db.prepare(
        `INSERT INTO users (id, username, _password, name) VALUES (?, ?, ?, ?)`,
    );

    const _password = hashSync(user.password, genSaltSync());

    stmt.run(user.id, user.username, _password, user.name);

    return {id: user.id, username: user.username, name: user.name};
}

export function insertMessage(db: Database, message: MessageAPI) {
    const stmt = db.prepare(
        `INSERT INTO messages (sender_id, room_id, sent_at, body) VALUES (?, ?, ?, ?)`,
    );
    stmt.run(message.sender_id, message.room_id, message.sent_at, message.body);
}

export function insertRoom(db: Database, room: Room) {
    const stmt = db.prepare('INSERT INTO rooms (id, name) VALUES (?, ?)');
    stmt.run(room.id, room.name);
}

export function insertUserInRoom(
    db: Database,
    user_id: string,
    room_id: string,
) {
    const stmt = db.prepare(
        'INSERT INTO users_rooms (user_id, room_id) VALUES (?, ?)',
    );
    stmt.run(user_id, room_id);
}

// GET Functions

export function getMessages(db: Database, room_id: string) {
    const messages = db
        .prepare<string[], Message>(`SELECT * FROM messages WHERE room_id = ?`)
        .all(room_id);
    return messages;
}

export function getRoom(db: Database, room_id: string) {
    const room = db
        .prepare<string[], Room>(`SELECT * FROM rooms WHERE id = ?`)
        .get(room_id);
    return room;
}

export function getRoomMembers(db: Database, room_id: string) {
    const members = db
        .prepare<string[], UserAPI>(
            `SELECT users.id, users.name, users.username FROM users INNER JOIN users_rooms ON users.id = users_rooms.user_id WHERE room_id = ?`,
        )
        .all(room_id);

    return members;
}

export function getUserRooms(db: Database, user_id: string) {
    const rooms = db
        .prepare<string[], Room>(
            'SELECT rooms.id, rooms.name FROM rooms INNER JOIN users_rooms ON rooms.id = users_rooms.room_id WHERE users_rooms.user_id = ?',
        )
        .all(user_id);

    return rooms;
}

// CHECK Functions

export function userExists(
    db: Database,
    user_id: string,
    username: string,
): boolean {
    const row = db
        .prepare<string[], User>(
            `SELECT * FROM users WHERE id = ? OR username = ?`,
        )
        .get(user_id, username);

    return row ? true : false;
}

export function roomExists(db: Database, room_id: string) {
    const row = db
        .prepare<string[], Room>(`SELECT * FROM rooms WHERE id = ?`)
        .get(room_id);

    return row ? true : false;
}

export function isUserInRoom(db: Database, user_id: string, room_id: string) {
    const row = db
        .prepare('SELECT * FROM users_rooms WHERE user_id = ? AND room_id = ?')
        .get(user_id, room_id);

    return row ? true : false;
}
