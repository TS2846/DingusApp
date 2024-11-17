export interface UserModel {
    id: number | bigint;
    uuid: string;
    username: string;
    _password: string;
    about_me: string;
}

export interface ChatModel {
    id: number | bigint;
    uuid: string;
    created_date: number;
    last_activity: number;
}

export interface GroupModel {
    id: number | bigint;
    uuid: string;
    created_date: number;
    last_activity: number;
    title: string;
}

export interface ContactModel {
    id: number | bigint;
    user_id: number | bigint;
    friend_id: number | bigint;
    chat_id: number | bigint;
}

export interface UserGroupModel {
    id: number | bigint;
    user_id: number | bigint;
    group_id: number | bigint;
}

export interface MessageModel {
    id: number | bigint;
    sender_id: number | bigint;
    sent_date: number;
    body: string;
    chat_id: number | bigint | null;
    group_id: number | bigint | null;
}

export interface UserToken {
    id: number | bigint;
    user_id: number | bigint;
    token: string | null;
}
