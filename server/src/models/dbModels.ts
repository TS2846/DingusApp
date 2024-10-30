export interface User {
    id: number | bigint;
    uuid: string;
    username: string;
    _password: string;
    first_name: string;
    last_name: string;
    about_me: string;
}

export interface Chat {
    id: number | bigint;
    uuid: string;
    created_date: number;
    last_activity: number;
}

export interface Group {
    id: number | bigint;
    uuid: string;
    created_date: number;
    last_activity: number;
    title: string;
}

export interface Contact {
    id: number | bigint;
    user_id: number | bigint;
    friend_id: number | bigint;
    chat_id: number | bigint;
}

export interface UserGroup {
    id: number | bigint;
    user_id: number | bigint;
    group_id: number | bigint;
}

export interface Message {
    id: number | bigint;
    sender_id: number | bigint;
    sent_date: number;
    body: string;
    chat_id: number | bigint | null;
    group_id: number | bigint | null;
}
