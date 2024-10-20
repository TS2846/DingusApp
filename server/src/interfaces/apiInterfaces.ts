export interface MessageAPI {
    sender_id: string;
    room_id: string;
    sent_at: Date;
    body: string;
}

export interface RoomAPI {
    id: string;
    name: string;
    members: UserAPI[];
}

export interface UserAPI {
    id: string;
    username: string;
    name: string;
}
