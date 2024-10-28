import {DB_PATH} from '../config';
import {existsSync, mkdirSync, writeFileSync} from 'fs';
import {dirname} from 'path';
import Connect from 'better-sqlite3';

if (!existsSync(DB_PATH)) {
    if (!existsSync(dirname(DB_PATH))) {
        mkdirSync(dirname(DB_PATH), {recursive: true});
    }
    writeFileSync(DB_PATH, '');
}

const db = Connect(DB_PATH);
db.pragma('journal_mode = WAL');

export default db;
