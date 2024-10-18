export interface MessageAPI {
    id: number;
    senderId: string;
    roomId: string;
    sent: Date;
    body: string;
}

export interface RoomAPI {
    id: string;
    roomName: string;
    members: string[];
}

export interface UserAPI {
    id: string;
    username: string;
    displayName: string;
}
