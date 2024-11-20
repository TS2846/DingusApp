export interface UserAPI {
    id: number | bigint;
    username: string;
    about_me: string;
}

export interface ContactAPI {
    id: number | bigint;
    room_id: number | bigint;
    username: string;
    about_me: string;
}

export interface RoomAPI {
    id: number | bigint;
    type: 'chat' | 'group';
    title: string;
    created_date: number;
    last_activity: number;
    members_id: (number | bigint)[];
}

export interface MessageAPI {
    id: number | bigint;
    sender_id: number | bigint;
    room_id: number | bigint;
    sent_date: number;
    body: string;
}
