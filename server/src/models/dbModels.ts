export interface User {
    id: string;
    username: string;
    _password: string;
    name: string;
}

export interface Message {
    id: number;
    user_id: string;
    room_id: string;
    body: string;
    sent_at: Date;
}

export interface Room {
    id: string;
    name: string;
}

export interface UserRooms {
    id: number;
    user_id: string;
    room_id: string;
}
