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

        const dummyUser = {id: 'f8823e0f-28aa-4471-9e1b-dcb400091efd', username: 'pdad12', password: 'password', name:'Deepta'};
        if (!userExists(db, dummyUser.id, dummyUser.username)){
            insertUser(db, dummyUser)
            console.log('inserted dummy user')
        }
        
        db.exec(`
            CREATE TABLE IF NOT EXISTS rooms(
                id          NCHAR(36)       PRIMARY KEY,
                name        VARCHAR(60)     NOT NULL

            ) WITHOUT ROWID;
        `);
        const dummyRoom = {
            id:'6d612b41-3440-4f51-8e86-b88c6d60d83f',
            name:'Room 1'
        }
        if (!roomExists(db, dummyRoom.id)){
            insertRoom(db, dummyRoom)
        }
        db.exec(`
            CREATE TABLE IF NOT EXISTS users_rooms(
                id          INTEGER         PRIMARY KEY AUTOINCREMENT,
                user_id     NCHAR(36),
                room_id     NCHAR(36),
                
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
                id          INTEGER         PRIMARY KEY AUTOINCREMENT,
                user_id     NCHAR(36),
                room_id     NCHAR(36),
                sent_at     DATETIME        NOT NULL,
                body        TEXT,

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
    } catch (error) {
        let errMsg = 'unknown error';
        if (error instanceof Error) errMsg = error.message;

        console.error('Could not initialize tables into database: ' + errMsg);
    }

    return db;
}

export function insertUser(db: Database, user: SignupPayload) {
    if (userExists(db, user.id, user.username))
        throw new UserAlreadyExistsError('username already exists');

    const stmt = db.prepare(
        `INSERT INTO users (id, username, _password, name) VALUES (?, ?, ?, ?)`,
    );

    const _password = hashSync(user.password, genSaltSync());

    stmt.run(user.id, user.username, _password, user.name);
}

export function authenticateUser(db: Database, user: LoginPayload) {
    const row = db
        .prepare<string[], User>(`SELECT * FROM users WHERE username = ?`)
        .get(user.username);

    if (!row) throw new UserDoesNotExistError('user does not exist');

    if (!compareSync(user.password, row._password))
        throw new IncorrectPasswordError('password is invalid');
}

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

export function insertMessage(
    db: Database,
    user_id: string,
    room_id: string,
    message: string,
    time: Date
){
    const stmt = db.prepare(
        `INSERT INTO messages (user_id, room_id, sent_at, body) VALUES (?, ?, ?, ?)`,
    );
    const info = stmt.run(user_id, room_id, time, message);
    return info.lastInsertRowid;
}

export function getMessages(
    db: Database,
    room_id: string
){
    const messages = db.prepare<string[], Message>(
        `SELECT * FROM messages WHERE room_id = ?`
    ).all(room_id)
    return messages
}

export function insertRoom(
    db: Database,
    room: Room
){
    const stmt = db.prepare(
            'INSERT INTO rooms (id, name) VALUES (?, ?)'
        )
    stmt.run(room.id, room.name);
}

export function roomExists(
    db: Database,
    room_id: string
){
    const row = db
        .prepare<string[], Room>(
            `SELECT * FROM rooms WHERE id = ?`,
        )
        .get(room_id);

    return row ? true : false;
}

export function getRooms(
    db: Database, 
    user_id: string
){
    const row = db.prepare<string[], Room>(
            'SELECT rooms.id, rooms.name FROM rooms INNER JOIN users_rooms ON rooms.id = users_rooms.room_id WHERE users_rooms.user_id = ?'        
        )
        .all(user_id)
        
    return row
}
//TODO: implement function to write message and room into SQLite db
// when user creates room, insert room into db and create link to user
// when getting a message put message into db
