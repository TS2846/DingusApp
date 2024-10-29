import db from './connection';

export function createTables() {
    db.exec(`
        CREATE TABLE users (
            id              INTEGER         PRIMARY KEY AUTOINCREMENT,
            uuid            NCHAR(36)       UNIQUE NOT NULL,
            username        VARCHAR(60)     UNIQUE NOT NULL,
            _password       VARCHAR(255)    NOT NULL,
            first_name      VARCHAR(60)     NOT NULL,
            last_name       VARCHAR(60)     NOT NULL,
            about_me        TEXT            DEFAULT ''
        );
        
        CREATE TABLE chats (
            id              INTEGER         PRIMARY KEY AUTOINCREMENT,
            uuid            NCHAR(36)       NOT NULL,
            created_date    INTEGER         NOT NULL,
            last_activity   INTEGER         NOT NULL
        );

        CREATE TABLE groups (
            id              INTEGER         PRIMARY KEY AUTOINCREMENT,
            uuid            NCHAR(36)       NOT NULL,
            created_date    INTEGER         NOT NULL,
            last_activity   INTEGER         NOT NULL,
            title           VARCHAR(60)     NOT NULL
        );

        CREATE TABLE contacts (
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
    `);
}

export function dropTables() {
    db.exec(`
        DROP TABLE IF EXISTS messages;
        DROP TABLE IF EXISTS users_groups;
        DROP TABLE IF EXISTS contacts;
        DROP TABLE IF EXISTS groups;
        DROP TABLE IF EXISTS chats;
        DROP TABLE IF EXISTS users;
    `);
}
