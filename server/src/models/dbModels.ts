export interface UserModel {
    id: number | bigint;
    username: string;
    _password: string;
    about_me: string;
}

export interface ChatModel {
    id: number | bigint;
}

export interface GroupModel {
    id: number | bigint;
    title: string;
}

export interface RoomModel {
    id: number | bigint;
    created_date: number;
    last_activity: number;
    chat_id: number | bigint | null;
    group_id: number | bigint | null;
}

export interface ContactModel {
    id: number | bigint;
    user_id: number | bigint;
    friend_id: number | bigint;
    room_id: number | bigint;
}

export interface UserRoomModel {
    id: number | bigint;
    user_id: number | bigint;
    room_id: number | bigint;
}

export interface MessageModel {
    id: number | bigint;
    sender_id: number | bigint;
    room_id: number | bigint;
    sent_date: number;
    body: string;
}

export interface UserToken {
    id: number | bigint;
    user_id: number | bigint;
    token: string | null;
}
