import getDBConnection from './connection';
import dummy from './dummy';
import {
    ChatModel,
    ContactModel,
    GroupModel,
    UserGroupModel,
    UserModel,
} from '../models/dbModels';

const db = getDBConnection();

export function createTables() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id              INTEGER         PRIMARY KEY AUTOINCREMENT,
            uuid            NCHAR(36)       UNIQUE NOT NULL,
            username        VARCHAR(60)     UNIQUE NOT NULL,
            _password       VARCHAR(255)    NOT NULL,
            about_me        TEXT            DEFAULT ''
        );
        
        CREATE TABLE IF NOT EXISTS chats (
            id              INTEGER         PRIMARY KEY AUTOINCREMENT,
            uuid            NCHAR(36)       NOT NULL,
            created_date    INTEGER         NOT NULL,
            last_activity   INTEGER         NOT NULL
        );

        CREATE TABLE IF NOT EXISTS groups (
            id              INTEGER         PRIMARY KEY AUTOINCREMENT,
            uuid            NCHAR(36)       NOT NULL,
            created_date    INTEGER         NOT NULL,
            last_activity   INTEGER         NOT NULL,
            title           VARCHAR(60)     NOT NULL
        );

        CREATE TABLE IF NOT EXISTS contacts (
            id              INTEGER         PRIMARY KEY AUTOINCREMENT,
            user_id         INTEGER         NOT NULL,
            friend_id       INTEGER         NOT NULL,
            chat_id         INTEGER         NOT NULL,

            FOREIGN KEY (user_id)
                REFERENCES users (id)
                ON DELETE CASCADE
                ON UPDATE NO ACTION,
            FOREIGN KEY (friend_id)
                REFERENCES users (id)
                ON DELETE CASCADE
                ON UPDATE NO ACTION,
            FOREIGN KEY (chat_id)
                REFERENCES chats (id)
        );

        CREATE TABLE IF NOT EXISTS users_groups (
            id              INTEGER         PRIMARY KEY AUTOINCREMENT,
            user_id         INTEGER         NOT NULL,
            group_id        INTEGER         NOT NULL,

            FOREIGN KEY (user_id)
                REFERENCES users (id)
                ON DELETE CASCADE
                ON UPDATE NO ACTION,
            FOREIGN KEY (group_id)
                REFERENCES groups (id)
                ON DELETE CASCADE
                ON UPDATE NO ACTION
        );

        CREATE TABLE IF NOT EXISTS messages (
            id              INTEGER         PRIMARY KEY AUTOINCREMENT,
            sender_id       INTEGER         NOT NULL,
            sent_date       INTEGER         NOT NULL,
            body            TEXT            NOT NULL,
            chat_id         INTEGER,
            group_id        INTEGER,
            
            FOREIGN KEY (sender_id)
                REFERENCES users (id)
                ON DELETE CASCADE
                ON UPDATE NO ACTION,
            FOREIGN KEY (chat_id)
                REFERENCES chats (id)
                ON DELETE CASCADE
                ON UPDATE NO ACTION,
            FOREIGN KEY (group_id)
                REFERENCES groups (id)
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

    console.log('Inserting dummy data ...');

    const smt_users = db.prepare(
        `INSERT INTO users (id, uuid, username, _password, about_me) VALUES (@id, @uuid, @username, @_password, @about_me)`,
    );
    const smt_chats = db.prepare(
        `INSERT INTO chats (id, uuid, created_date, last_activity) VALUES (@id, @uuid, @created_date, @last_activity)`,
    );
    const smt_groups = db.prepare(
        `INSERT INTO groups (id, uuid, created_date, last_activity, title) VALUES (@id, @uuid, @created_date, @last_activity, @title)`,
    );
    const smt_users_groups = db.prepare(
        `INSERT INTO users_groups (id, group_id, user_id) VALUES (@id, @group_id, @user_id)`,
    );
    const smt_contacts = db.prepare(
        `INSERT INTO contacts (id, user_id, friend_id, chat_id) VALUES (@id, @user_id, @friend_id, @chat_id)`,
    );

    const users_transaction = db.transaction((payload: UserModel[]) => {
        for (const user of payload) smt_users.run(user);
    });
    const chats_transaction = db.transaction((payload: ChatModel[]) => {
        for (const chat of payload) smt_chats.run(chat);
    });
    const groups_transaction = db.transaction((payload: GroupModel[]) => {
        for (const group of payload) smt_groups.run(group);
    });
    const users_groups_transaction = db.transaction(
        (payload: UserGroupModel[]) => {
            for (const ug of payload) smt_users_groups.run(ug);
        },
    );
    const contacts_transaction = db.transaction((payload: ContactModel[]) => {
        for (const contact of payload) smt_contacts.run(contact);
    });

    users_transaction(dummy.users);
    chats_transaction(dummy.chats);
    groups_transaction(dummy.groups);
    users_groups_transaction(dummy.users_groups);
    contacts_transaction(dummy.contacts);
}

export function dropTables() {
    db.exec(`
        DROP TABLE IF EXISTS user_tokens;
        DROP TABLE IF EXISTS messages;
        DROP TABLE IF EXISTS users_groups;
        DROP TABLE IF EXISTS contacts;
        DROP TABLE IF EXISTS groups;
        DROP TABLE IF EXISTS chats;
        DROP TABLE IF EXISTS users;
    `);
    console.log('Dropped tables...');
}
