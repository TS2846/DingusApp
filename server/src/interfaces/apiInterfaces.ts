export interface UserAPI {
    uuid: string;
    username: string;
    first_name: string;
    last_name: string;
    about_me: string;
}

export interface RoomAPI {
    uuid: string;
    type: 'chat' | 'group';
    title: string;
    created_date: number;
    last_activity: number;
    members_uuid: string[];
}

export interface MessageAPI {
    sender_uuid: string;
    room_uuid: string;
    sent_date: number;
    body: string;
}
