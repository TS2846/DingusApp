import {compareSync, genSaltSync, hashSync} from 'bcrypt';

import getDBConnection from '../db/connection';
import {createTables, dropTables} from '../db/schema';
import * as DBErrors from '../errors/dbErrors';
import {
    ChatModel,
    ContactModel,
    GroupModel,
    MessageModel,
    UserRoomModel,
    UserModel,
    UserToken,
    RoomModel,
} from '../models/dbModels';
import {RunResult} from 'better-sqlite3';

const db = getDBConnection();

type ID = number | bigint;

export function initializeDatabase() {
    try {
        dropTables();
        createTables();
    } catch (error) {
        if (error instanceof Error) {
            console.error(error);
        } else {
            console.error('Could not initialize tables into database.');
        }
    }
}

// Authentication Functions

export function authenticateUser(
    username: string,
    password: string,
): UserModel {
    const user = db
        .prepare<string, UserModel>(`SELECT *FROM users WHERE username = ?;`)
        .get(username);

    if (!user) throw new DBErrors.UserDoesNotExistError('user does not exist');

    if (!compareSync(password, user._password))
        throw new DBErrors.IncorrectPasswordError('password is invalid');

    return user;
}

// CREATE Functions

export function upsertUserToken(user_id: ID, token: string | null) {
    db.prepare('DELETE FROM user_tokens WHERE user_id = ?;').run(user_id);
    db.prepare('INSERT INTO user_tokens(user_id, token) VALUES (?, ?);').run(
        user_id,
        token,
    );
}

export function insertUser(
    username: string,
    password: string,
    about_me: string,
): UserModel {
    const _password = hashSync(password, genSaltSync());

    const rowId = db
        .prepare<string[], RunResult>(
            `INSERT INTO users 
                (username, _password, about_me) 
                VALUES (?, ?, ?);`,
        )
        .run(username, _password, about_me).lastInsertRowid;

    return {
        id: rowId,
        username: username,
        _password: _password,
        about_me: about_me,
    };
}

export function insertMessage(
    sender_id: ID,
    room_id: ID,
    body: string,
): MessageModel {
    const now = Date.now();
    const rowId = db
        .prepare<[ID, ID, number, string], RunResult>(
            `INSERT INTO 
                messages(sender_id, room_id, sent_date, body)
                VALUES (?, ?, ?, ?);`,
        )
        .run(sender_id, room_id, now, body).lastInsertRowid;

    return {
        id: rowId,
        sender_id: sender_id,
        room_id: room_id,
        sent_date: now,
        body: body,
    };
}

export function addFriend(user_id: ID, friend_id: ID): RoomModel {
    const chat = createChat();
    const room = createRoom(chat.id, null);

    addUserToRoom(user_id, room.id);
    addUserToRoom(friend_id, room.id);

    createContact(user_id, friend_id, room.id);
    createContact(friend_id, user_id, room.id);

    return room;
}

export function addGroup(title: string, members: ID[]): RoomModel {
    const group = createGroup(title);
    const room = createRoom(null, group.id);

    members.forEach(user_id => {
        addUserToRoom(user_id, room.id);
    });

    return room;
}

export function joinGroup(user_id: ID, room_id: ID): RoomModel | null {
    const room = getRoom(room_id);
    if (!room || !room.group_id) return null;
    addUserToRoom(user_id, room_id);
    return room;
}

function createChat(): ChatModel {
    const rowId = db
        .prepare<{}, RunResult>(`INSERT INTO chats DEFAULT VALUES;`)
        .run({}).lastInsertRowid;

    return {id: rowId};
}

function createGroup(title: string): GroupModel {
    const rowId = db
        .prepare<[string], RunResult>(`INSERT INTO groups(title) VALUES(?);`)
        .run(title).lastInsertRowid;

    return {id: rowId, title: title};
}

function createRoom(chat_id: ID | null, group_id: ID | null): RoomModel {
    const now = Date.now();
    const rowId = db
        .prepare<[number, number, ID | null, ID | null], RunResult>(
            `INSERT INTO 
                rooms(created_date, last_activity, chat_id, group_id) 
                VALUES(?, ?, ?, ?);`,
        )
        .run(now, now, chat_id, group_id).lastInsertRowid;
    return {
        id: rowId,
        created_date: now,
        last_activity: now,
        chat_id: chat_id,
        group_id: group_id,
    };
}

function addUserToRoom(user_id: ID, room_id: ID): UserRoomModel {
    const rowId = db
        .prepare<
            ID[],
            RunResult
        >(`INSERT INTO users_rooms(user_id, room_id) VALUES(?, ?);`)
        .run(user_id, room_id).lastInsertRowid;

    return {
        id: rowId,
        user_id: user_id,
        room_id: room_id,
    };
}

function createContact(user_id: ID, friend_id: ID, room_id: ID): ContactModel {
    const rowId = db
        .prepare<ID[], RunResult>(
            `INSERT INTO
            contacts(user_id, friend_id, room_id)
            VALUES(?, ?, ?);`,
        )
        .run(user_id, friend_id, room_id).lastInsertRowid;

    return {
        id: rowId,
        user_id: user_id,
        friend_id: friend_id,
        room_id: room_id,
    };
}

// READ Functions

export function getUserRefreshToken(user_id: ID): string | null {
    return (
        db
            .prepare<
                [ID],
                UserToken
            >('SELECT * FROM user_tokens WHERE user_id = ?')
            .get(user_id)?.token || null
    );
}

export function getUserByUsername(username: string): UserModel | null {
    const user = db
        .prepare<string, UserModel>('SELECT * FROM users WHERE username = ?')
        .get(username);

    return user || null;
}

export function getUser(user_id: ID): UserModel | null {
    const user = db
        .prepare<[ID], UserModel>('SELECT * FROM users WHERE id = ?')
        .get(user_id);

    return user || null;
}

export function getRoom(room_id: ID): RoomModel | null {
    const room = db
        .prepare<[ID], RoomModel>('SELECT * FROM rooms WHERE id = ?')
        .get(room_id);

    return room || null;
}

export function getMessages(room_id: ID): MessageModel[] {
    const messages = db
        .prepare<[ID], MessageModel>('SELECT * FROM messages WHERE room_id = ?')
        .all(room_id);

    return messages;
}

export function getMembers(room_id: ID): ID[] {
    const members = db
        .prepare<[ID], {id: ID}>(
            'SELECT user_id as id FROM users_rooms WHERE room_id = ?',
        )
        .all(room_id)
        .map(item => item.id);

    return members;
}

export function getRooms(user_id: ID): RoomModel[] {
    const rooms = db
        .prepare<[ID], RoomModel>(
            `
SELECT
    r.id as id,
    r.created_date as created_date,
    r.last_activity as last_activity,
    r.chat_id as chat_id,
    r.group_id as group_id
FROM
    rooms r
        JOIN
    users_rooms ur ON r.id = ur.room_id
WHERE
    ur.user_id = ?
ORDER BY
    r.last_activity DESC;
    `,
        )
        .all(user_id);

    return rooms;
}

export function getRoomTitle(room_id: ID, user_id: ID): string {
    const room = getRoom(room_id);

    if (!room) {
        return '';
    } else if (room.chat_id) {
        const contact = getContact(user_id, room_id);
        if (!contact) return '';
        const friend = getUser(contact?.friend_id);
        return friend?.username || '';
    } else if (room.group_id) {
        const group = getGroup(room.group_id);
        return group?.title || '';
    } else {
        return '';
    }
}

export function getContacts(user_id: ID): ContactModel[] {
    const contacts = db
        .prepare<[ID], ContactModel>('SELECT * FROM contacts WHERE user_id = ?')
        .all(user_id);

    return contacts;
}

export function getContact(user_id: ID, room_id: ID): ContactModel | null {
    const contact = db
        .prepare<
            [ID, ID],
            ContactModel
        >('SELECT * FROM contacts WHERE user_id = ? AND room_id = ?')
        .get(user_id, room_id);

    return contact || null;
}

export function getGroup(group_id: ID): GroupModel | null {
    const group = db
        .prepare<[ID], GroupModel>('SELECT * FROM groups WHERE id = ?')
        .get(group_id);

    return group || null;
}

// CHECK Functions

export function userExists(username: string): boolean {
    const row = db
        .prepare<[string], UserModel>('SELECT * FROM users WHERE username = ?')
        .get(username);

    return !!row;
}

export function userInRoom(user_id: ID, room_id: ID): boolean {
    const row = db
        .prepare<
            ID[],
            UserRoomModel
        >('SELECT * FROM users_rooms WHERE user_id = ? AND room_id = ?')
        .get(user_id, room_id);

    return !!row;
}
