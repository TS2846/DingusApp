import getDBConnection from '../db/connection';
import {createTables, dropTables} from '../db/schema';
import {compareSync, genSaltSync, hashSync} from 'bcrypt';

import * as DBErrors from '../errors/dbErrors';
import {GetDataError} from '../errors/dbErrors';
import {ChatModel, GroupModel, UserModel, UserToken} from '../models/dbModels';
import {SignupPayload} from '../types/payload';
import {MessageAPI, RoomAPI, UserAPI} from '../interfaces/apiInterfaces';
import Database from 'better-sqlite3';

const db = getDBConnection();

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

export function authenticateUser(
    username: string,
    password: string,
): UserModel {
    const user = db
        .prepare<string, UserModel>(`SELECT *FROM users WHERE username = ?`)
        .get(username);

    if (!user) throw new DBErrors.UserDoesNotExistError('user does not exist');

    if (!compareSync(password, user._password))
        throw new DBErrors.IncorrectPasswordError('password is invalid');

    return user;
}

// PUT Functions

export function upsertUserToken(
    user_id: number | bigint,
    token: string | null,
) {
    db.prepare('DELETE FROM user_tokens WHERE user_id = ?').run(user_id);
    db.prepare('INSERT INTO user_tokens(user_id, token) VALUES (?, ?);').run(
        user_id,
        token,
    );
}

export function insertUser(user: SignupPayload): UserModel {
    if (userExists(user.username))
        throw new DBErrors.UserAlreadyExistsError('username already exists');

    const _password = hashSync(user.password, genSaltSync());

    const res: Database.RunResult = db
        .prepare(
            `INSERT INTO users 
            (uuid, username, _password, about_me) 
            VALUES (?, ?, ?, ?)`,
        )
        .run(user.user_uuid, user.username, _password, user.about_me);

    return {
        id: res.lastInsertRowid,
        uuid: user.user_uuid,
        username: user.username,
        _password: _password,
        about_me: user.about_me,
    };
}

export function insertContact(
    user_uuid: string,
    friend_uuid: string,
    chat_id: number | BigInt,
): [rowid1: number | BigInt, rowid2: number | BigInt] {
    const user = getUser(user_uuid);
    const friend = getUser(friend_uuid);

    const stmt = db.prepare<(number | BigInt)[]>(
        `INSERT INTO contacts (user_id, friend_id, chat_id) VALUES (?, ?, ?)`,
    );

    const rowId1 = stmt.run(user.id, friend.id, chat_id).lastInsertRowid;
    const rowId2 = stmt.run(friend.id, user.id, chat_id).lastInsertRowid;

    return [rowId1, rowId2];
}

export function insertUserGroup(user_uuid: string, group_uuid: string) {
    const user = getUser(user_uuid);
    const group = getGroup(group_uuid);

    db.prepare<(number | BigInt)[]>(
        `INSERT INTO users_groups (user_id, group_id) VALUES (?, ?)`,
    ).run(user.id, group.id);
}

export function insertGroup(
    group_uuid: string,
    created_date: number,
    last_activity: number,
    title: string,
): number | BigInt {
    return db
        .prepare<
            [string, number, number, string]
        >(`INSERT INTO groups (uuid, created_date, last_activity, title) VALUES (?, ?, ?, ?)`)
        .run(group_uuid, created_date, last_activity, title).lastInsertRowid;
}

export function insertChat(
    chat_uuid: string,
    created_date: number,
    last_activity: number,
): number | BigInt {
    const stmt = db.prepare<[string, number, number]>(
        `INSERT INTO chats (uuid, created_date, last_activity) VALUES (?, ?, ?)`,
    );

    return stmt.run(chat_uuid, created_date, last_activity).lastInsertRowid;
}

export function insertMessage(
    sender_uuid: string,
    room_uuid: string,
    sent_date: number,
    body: string,
) {
    const stmt = db.prepare(
        `INSERT INTO messages (sender_id, sent_date, body, chat_id, group_id) 
            VALUES (?, ?, ?, ?, ?)`,
    );

    const sender_id = getUser(sender_uuid).id;

    if (chatExists(room_uuid)) {
        const chat_id = getChat(room_uuid).id;
        stmt.run(sender_id, sent_date, body, chat_id, null);
        db.prepare(
            `
            UPDATE chats SET last_activity = ? WHERE id = ?
            `,
        ).run(sent_date, chat_id);
    } else if (groupExists(room_uuid)) {
        const group_id = getGroup(room_uuid).id;
        stmt.run(sender_id, sent_date, body, null, group_id);
        db.prepare(
            `
            UPDATE groups SET last_activity = ? WHERE id = ?
            `,
        ).run(sent_date, group_id);
    } else {
        throw new GetDataError('room not found');
    }
}

// GET Functions

export function getUserRefreshToken(user_id: number | bigint) {
    return (
        db
            .prepare<
                (number | bigint)[],
                UserToken
            >('SELECT * FROM user_tokens WHERE user_id = ?')
            .get(user_id)?.token || null
    );
}

export function getUserByUsername(username: string): UserModel {
    const user = db
        .prepare<string, UserModel>('SELECT * FROM users WHERE username = ?')
        .get(username);

    if (!user) throw new GetDataError(`user ${username} not found`);
    return user;
}

export function getUser(user_uuid: string): UserModel {
    const user = db
        .prepare<string, UserModel>('SELECT * FROM users WHERE uuid = ?')
        .get(user_uuid);

    if (!user) throw new GetDataError('user not found');
    return user;
}

export function getChat(chat_uuid: string): ChatModel {
    const chat = db
        .prepare<string, ChatModel>('SELECT * FROM chats WHERE uuid = ?')
        .get(chat_uuid);

    if (!chat) throw new GetDataError('chat not found');

    return chat;
}

export function getChatMembers(chat_uuid: string): UserAPI[] {
    return db
        .prepare<string, UserAPI>(
            `
                SELECT
                    u.uuid as uuid,
                    u.username as username,
                    u.about_me as about_me
                FROM
                    contacts con
                        JOIN
                    chats ch ON con.chat_id = ch.id
                        JOIN
                    users u ON con.user_id = u.id
                WHERE
                    ch.uuid = ?
            `,
        )
        .all(chat_uuid);
}

export function getGroup(group_uuid: string): GroupModel {
    const group = db
        .prepare<string, GroupModel>('SELECT * FROM groups WHERE uuid = ?')
        .get(group_uuid);

    if (!group) throw new GetDataError('group not found');

    return group;
}

export function getGroupMembers(group_uuid: string): UserAPI[] {
    return db
        .prepare<string, UserAPI>(
            `
                SELECT
                    u.uuid as uuid,
                    u.username as username,
                    u.about_me as about_me
                FROM
                    users_groups ug
                        JOIN
                    groups g ON ug.group_id = g.id
                        JOIN
                    users u ON ug.user_id = u.id
                WHERE
                    g.uuid = ?
            `,
        )
        .all(group_uuid);
}

function getUserChatRooms(user_uuid: string): RoomAPI[] {
    const results = db
        .prepare<
            string,
            {
                uuid: string;
                friend_uname: string;
                friend_uuid: string;
                created_date: number;
                last_activity: number;
            }
        >(
            `
        SELECT ch.uuid          as uuid,
               f.username       as friend_uname,
               f.uuid           as friend_uuid,
               ch.created_date  as created_date,
               ch.last_activity as last_activity
        FROM contacts con
                 JOIN
             users u ON con.user_id = u.id
                 JOIN
             users f ON con.friend_id = f.id
                 JOIN
             chats ch on con.chat_id = ch.id
        WHERE u.uuid = ?
        ORDER BY ch.last_activity DESC;
    `,
        )
        .all(user_uuid);

    return results.map(chat => ({
        uuid: chat.uuid,
        type: 'chat',
        title: chat.friend_uname,
        created_date: chat.created_date,
        last_activity: chat.last_activity,
        members_uuid: [user_uuid, chat.friend_uuid],
    }));
}

function getUserGroupRooms(user_uuid: string): RoomAPI[] {
    const results = db
        .prepare<
            string,
            {
                uuid: string;
                title: string;
                created_date: number;
                last_activity: number;
            }
        >(
            `
        SELECT g.uuid          as uuid,
               g.title         as title,
               g.created_date  as created_date,
               g.last_activity as last_activity
        FROM users_groups ug
                 JOIN
             users u ON ug.user_id = u.id
                 JOIN
             groups g on ug.group_id = g.id
        WHERE u.uuid = ?
        ORDER BY g.last_activity DESC;
    `,
        )
        .all(user_uuid);

    const stmt_members = db.prepare<string, {uuid: string}>(`
        SELECT
            u.uuid
        FROM users_groups ug
                JOIN
             users u ON ug.user_id = u.id
                JOIN
             groups g on ug.group_id = g.id
        WHERE g.uuid = ?;
    `);

    return results.map(group => ({
        ...group,
        type: 'group',
        members_uuid: stmt_members.all(group.uuid).map(g => g.uuid),
    }));
}

export function getUserRooms(user_uuid: string): RoomAPI[] {
    const chats = getUserChatRooms(user_uuid);
    const groups = getUserGroupRooms(user_uuid);
    return [...chats, ...groups].sort(
        (a, b) => b.last_activity - a.last_activity,
    );
}

export function getChatMessages(room_uuid: string): MessageAPI[] {
    return db
        .prepare<string, MessageAPI>(
            `
        SELECT
            u.uuid as sender_uuid,
            ch.uuid as room_uuid,
            m.sent_date as sent_date,
            m.body as body
        FROM
            messages m
                JOIN
            users u ON u.id = m.sender_id
                JOIN
            chats ch ON m.chat_id = ch.id
        WHERE
            ch.uuid = ?
        ORDER BY m.sent_date ASC;
        `,
        )
        .all(room_uuid);
}

export function getGroupMessages(room_uuid: string): MessageAPI[] {
    return db
        .prepare<string, MessageAPI>(
            `
        SELECT
            u.uuid as sender_uuid,
            g.uuid as room_uuid,
            m.sent_date as sent_date,
            m.body as body
        FROM
            messages m
                JOIN
            users u ON u.id = m.sender_id
                JOIN
            groups g ON m.group_id = g.id
        WHERE
            g.uuid = ?
        ORDER BY m.sent_date ASC;
        `,
        )
        .all(room_uuid);
}

// CHECK Functions
export function contactExists(
    user_uuid: string,
    friend_uuid: string,
): boolean | string {
    const user = getUser(user_uuid);
    const friend = getUser(friend_uuid);
    const row = db
        .prepare<(number | bigint)[], {uuid: string}>(
            `
        SELECT
            ch.uuid as uuid
        FROM
            contacts con
                JOIN
            chats ch ON con.chat_id = ch.id
        WHERE
            con.user_id = ?
                AND
            con.friend_id = ?
        `,
        )
        .get(user.id, friend.id);
    return row ? row.uuid : false;
}

export function userExists(username: string): boolean {
    const row = db
        .prepare<string, number>(`SELECT * FROM users WHERE username = ?`)
        .get(username);

    return !!row;
}

export function chatExists(chat_uuid: string) {
    const row = db
        .prepare<string, number>(`SELECT * FROM chats WHERE uuid = ?`)
        .get(chat_uuid);

    return !!row;
}

export function groupExists(group_uuid: string) {
    const row = db
        .prepare<string, number>(`SELECT * FROM groups WHERE uuid = ?`)
        .get(group_uuid);

    return !!row;
}

export function isUserInRoom(user_uuid: string, room_uuid: string) {
    const row_chat = db
        .prepare(
            `
            SELECT
                *
            FROM
                contacts con
                    JOIN
                users u ON con.user_id = u.id
                    JOIN
                chats ch ON con.chat_id = ch.id
            WHERE
                u.uuid = ?
                    AND
                ch.uuid = ?
            `,
        )
        .get(user_uuid, room_uuid);

    const row_group = db
        .prepare(
            `
            SELECT
                *
            FROM
                users_groups ug
                    JOIN
                users u ON ug.user_id = u.id
                    JOIN
                groups g ON ug.group_id = g.id
            WHERE
                u.uuid = ?
                    AND
                g.uuid = ?
            `,
        )
        .get(user_uuid, room_uuid);

    return !!row_chat || !!row_group;
}
