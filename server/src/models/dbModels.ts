export interface User {
    id: number;
    uuid: string;
    username: string;
    _password: string;
    first_name: string;
    last_name: string;
    about_me: string;
}

export interface Chat {
    id: number;
    uuid: string;
    created_date: number;
    last_activity: number;
}

export interface Group {
    id: number;
    uuid: string;
    created_date: number;
    last_activity: number;
    title: string;
}

export interface Contact {
    id: number;
    user_id: number;
    friend_id: number;
    chat_id: number;
}

export interface UserGroup {
    id: number;
    user_id: number;
    group_id: number;
}

export interface Message {
    id: number;
    sender_id: number;
    sent_date: number;
    body: string;
    chat_id: number | null;
    group_id: number | null;
}
