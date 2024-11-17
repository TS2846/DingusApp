import {DB_PATH} from '../config';
import {existsSync, mkdirSync, writeFileSync} from 'fs';
import {dirname} from 'path';
import Connect from 'better-sqlite3';

if (!existsSync(DB_PATH)) {
    writeFileSync(DB_PATH, '');
}

let db: Connect.Database | null = null;

const getDBConnection = (): Connect.Database => {
    if (db) return db;

    if (!existsSync(dirname(DB_PATH))) {
        mkdirSync(dirname(DB_PATH), {recursive: true});
    }

    if (!existsSync(DB_PATH)) {
        writeFileSync(DB_PATH, '');
    }

    db = Object.freeze(Connect(DB_PATH));
    db.pragma('journal_mode = WAL');

    return db;
};

export default getDBConnection;
