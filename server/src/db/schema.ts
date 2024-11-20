import getDBConnection from './connection';
import dummy from './dummy';
import {
    ChatModel,
    ContactModel,
    RoomModel,
    UserRoomModel,
    UserModel,
} from '../models/dbModels';

const db = getDBConnection();

export function createTables() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id              INTEGER         PRIMARY KEY AUTOINCREMENT,
            username        VARCHAR(60)     UNIQUE NOT NULL,
            _password       VARCHAR(255)    NOT NULL,
            about_me        TEXT            DEFAULT ''
        );
        
        CREATE TABLE IF NOT EXISTS chats (
            id              INTEGER         PRIMARY KEY AUTOINCREMENT
        );

        CREATE TABLE IF NOT EXISTS groups (
            id              INTEGER         PRIMARY KEY AUTOINCREMENT,
            title           VARCHAR(60)     NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS rooms (
            id              INTEGER         PRIMARY KEY AUTOINCREMENT,
            created_date    INTEGER         NOT NULL,
            last_activity   INTEGER         NOT NULL,
            chat_id         INTEGER,
            group_id        INTEGER,
            
            FOREIGN KEY (chat_id)
                REFERENCES chats (id)
                ON DELETE CASCADE
                ON UPDATE NO ACTION,
            FOREIGN KEY (group_id)
                REFERENCES groups (id)
                ON DELETE CASCADE
                ON UPDATE NO ACTION
        );

        CREATE TABLE IF NOT EXISTS contacts (
            id              INTEGER         PRIMARY KEY AUTOINCREMENT,
            user_id         INTEGER         NOT NULL,
            friend_id       INTEGER         NOT NULL,
            room_id         INTEGER         NOT NULL,

            FOREIGN KEY (user_id)
                REFERENCES users (id)
                ON DELETE CASCADE
                ON UPDATE NO ACTION,
            FOREIGN KEY (friend_id)
                REFERENCES users (id)
                ON DELETE CASCADE
                ON UPDATE NO ACTION,
            FOREIGN KEY (room_id)
                REFERENCES rooms (id)
                ON DELETE CASCADE
                ON UPDATE NO ACTION
        );

        CREATE TABLE IF NOT EXISTS users_rooms (
            id              INTEGER         PRIMARY KEY AUTOINCREMENT,
            user_id         INTEGER         NOT NULL,
            room_id         INTEGER         NOT NULL,

            FOREIGN KEY (user_id)
                REFERENCES users (id)
                ON DELETE CASCADE
                ON UPDATE NO ACTION,
            FOREIGN KEY (room_id)
                REFERENCES rooms (id)
                ON DELETE CASCADE
                ON UPDATE NO ACTION
        );

        CREATE TABLE IF NOT EXISTS messages (
            id              INTEGER         PRIMARY KEY AUTOINCREMENT,
            sender_id       INTEGER         NOT NULL,
            room_id         INTEGER         NOT NULL,
            sent_date       INTEGER         NOT NULL,
            body            TEXT            NOT NULL,
            
            FOREIGN KEY (sender_id)
                REFERENCES users (id)
                ON DELETE CASCADE
                ON UPDATE NO ACTION,
            FOREIGN KEY (room_id)
                REFERENCES rooms (id)
                ON DELETE CASCADE
                ON UPDATE NO ACTION
        );

        CREATE TABLE IF NOT EXISTS user_tokens (
            id              INTEGER         PRIMARY KEY AUTOINCREMENT,
            user_id         INTEGER         NOT NULL,
            token           TEXT,

            FOREIGN KEY (user_id)
                REFERENCES users (id)
                ON DELETE CASCADE
                ON UPDATE NO ACTION
        );
    `);

    console.log('Created tables...');

    console.log('inserting dummy data ...');

    const smt_users = db.prepare(
        `INSERT INTO users (id, username, _password, about_me) VALUES (@id, @username, @_password, @about_me)`,
    );
    const smt_chats = db.prepare(`INSERT INTO chats DEFAULT VALUES`);
    const smt_rooms = db.prepare(
        `INSERT INTO rooms (id, created_date, last_activity, chat_id, group_id) VALUES (@id, @created_date, @last_activity, @chat_id, @group_id)`,
    );
    const smt_users_rooms = db.prepare(
        `INSERT INTO users_rooms (id, user_id, room_id) VALUES (@id, @user_id, @room_id)`,
    );
    const smt_contacts = db.prepare(
        `INSERT INTO contacts (id, user_id, friend_id, room_id) VALUES (@id, @user_id, @friend_id, @room_id)`,
    );

    const users_transaction = db.transaction((payload: UserModel[]) => {
        for (const user of payload) smt_users.run(user);
    });
    const chats_transaction = db.transaction((payload: ChatModel[]) => {
        for (const _ of payload) smt_chats.run();
    });
    const rooms_transaction = db.transaction((payload: RoomModel[]) => {
        for (const room of payload) smt_rooms.run(room);
    });
    const users_rooms_transaction = db.transaction(
        (payload: UserRoomModel[]) => {
            for (const ug of payload) smt_users_rooms.run(ug);
        },
    );
    const contacts_transaction = db.transaction((payload: ContactModel[]) => {
        for (const contact of payload) smt_contacts.run(contact);
    });

    users_transaction(dummy.users);
    chats_transaction(dummy.chats);
    rooms_transaction(dummy.rooms);
    users_rooms_transaction(dummy.users_rooms);
    contacts_transaction(dummy.contacts);
}

export function dropTables() {
    db.exec(`
        DROP TABLE IF EXISTS user_tokens;
        DROP TABLE IF EXISTS messages;
        DROP TABLE IF EXISTS users_rooms;
        DROP TABLE IF EXISTS contacts;
        DROP TABLE IF EXISTS rooms;
        DROP TABLE IF EXISTS groups;
        DROP TABLE IF EXISTS chats;
        DROP TABLE IF EXISTS users;
    `);
    console.log('Dropped tables...');
}
