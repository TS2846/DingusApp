import Connect, {Database} from 'better-sqlite3';
import {hashSync, genSaltSync, compareSync} from 'bcrypt';
import {existsSync, mkdirSync, writeFileSync} from 'fs';
import {dirname} from 'path';

import {
    IncorrectPasswordError,
    UserAlreadyExistsError,
    UserDoesNotExistError,
} from '../errors/dbErrors';
import {User} from '../models/dbModels';
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

        db.exec(`
            CREATE TABLE IF NOT EXISTS rooms(
                id          NCHAR(36)       PRIMARY KEY,
                name        VARCHAR(60)     NOT NULL

            ) WITHOUT ROWID;
        `);

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
