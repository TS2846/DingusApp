const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

module.exports.dbInit = (dbFile) => {
    try {
        fs.writeFileSync(dbFile, '', {flag: 'wx'});
        console.log('DB File does not exit. Created new DB.');
    } catch (error) {
        console.log('DB File found.');
    }

    const db = new sqlite3.Database(dbFile);

    db.run(`
        CREATE TABLE IF NOT EXISTS users(
            id          NCHAR(36)       PRIMARY KEY,
            username    VARCHAR(60)     UNIQUE NOT NULL,
            _password   VARCHAR(255)    NOT NULL,
            name        VARCHAR(60)     NOT NULL

        ) WITHOUT ROWID;
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS rooms(
            id          NCHAR(36)       PRIMARY KEY,
            name        VARCHAR(60)     NOT NULL

        ) WITHOUT ROWID;
    `);

    db.run(`
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

    db.run(`
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
};
