import {
    ChatModel,
    ContactModel,
    UserRoomModel,
    UserModel,
    RoomModel,
} from '../models/dbModels';

export const users: UserModel[] = [
    {
        id: 1,
        username: 'ballsworth',
        _password:
            '$2b$10$VoHixe82EgYUOwBro/m98uLHAj6LRA5wpsNLMjsoC23.JOFfwtJwa',

        about_me: 'Object-based tangible database',
    },
    {
        id: 2,
        username: 'mricket1',
        _password:
            '$2b$10$VoHixe82EgYUOwBro/m98uLHAj6LRA5wpsNLMjsoC23.JOFfwtJwa',
        about_me: 'Synergistic dynamic parallelism',
    },
    {
        id: 3,
        username: 'odossetter2',
        _password:
            '$2b$10$VoHixe82EgYUOwBro/m98uLHAj6LRA5wpsNLMjsoC23.JOFfwtJwa',
        about_me: 'Versatile modular instruction set',
    },
    {
        id: 4,
        username: 'aaleksankin3',
        _password:
            '$2b$10$VoHixe82EgYUOwBro/m98uLHAj6LRA5wpsNLMjsoC23.JOFfwtJwa',
        about_me: 'Function-based reciprocal monitoring',
    },
    {
        id: 5,
        username: 'lminihane4',
        _password:
            '$2b$10$VoHixe82EgYUOwBro/m98uLHAj6LRA5wpsNLMjsoC23.JOFfwtJwa',
        about_me: 'Horizontal hybrid website',
    },
    {
        id: 6,
        username: 'jbrazier5',
        _password:
            '$2b$10$VoHixe82EgYUOwBro/m98uLHAj6LRA5wpsNLMjsoC23.JOFfwtJwa',
        about_me: 'Function-based optimal collaboration',
    },
    {
        id: 7,
        username: 'glowne6',
        _password:
            '$2b$10$VoHixe82EgYUOwBro/m98uLHAj6LRA5wpsNLMjsoC23.JOFfwtJwa',
        about_me: 'Front-line composite Graphic Interface',
    },
    {
        id: 8,
        username: 'dpothergill7',
        _password:
            '$2b$10$VoHixe82EgYUOwBro/m98uLHAj6LRA5wpsNLMjsoC23.JOFfwtJwa',
        about_me: 'Re-contextualized high-level open architecture',
    },
    {
        id: 9,
        username: 'acrate8',
        _password:
            '$2b$10$VoHixe82EgYUOwBro/m98uLHAj6LRA5wpsNLMjsoC23.JOFfwtJwa',
        about_me: 'Re-contextualized empowering matrices',
    },
    {
        id: 10,
        username: 'sstidson9',
        _password:
            '$2b$10$VoHixe82EgYUOwBro/m98uLHAj6LRA5wpsNLMjsoC23.JOFfwtJwa',
        about_me: 'Persistent tertiary hardware',
    },
];

const n = users.length;

export const chats: ChatModel[] = Array((n * (n - 1)) / 2)
    .fill(0)
    .map((_, index) => ({
        id: index + 1,
    }));

export const rooms: RoomModel[] = Array(chats.length)
    .fill(0)
    .map((_, index) => ({
        id: index + 1,
        created_date: Date.now(),
        last_activity: Date.now(),
        chat_id: index + 1,
        group_id: null,
    }));

export const contacts: ContactModel[] = [];
export const users_rooms: UserRoomModel[] = [];

let room_id = 1;
for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
        contacts.push({
            id: 2 * room_id - 1,
            user_id: i + 1,
            friend_id: j + 1,
            room_id: room_id,
        });

        contacts.push({
            id: 2 * room_id,
            user_id: j + 1,
            friend_id: i + 1,
            room_id: room_id,
        });

        users_rooms.push({
            id: 2 * room_id - 1,
            user_id: i + 1,
            room_id: room_id,
        });

        users_rooms.push({
            id: 2 * room_id,
            user_id: j + 1,
            room_id: room_id,
        });

        room_id += 1;
    }
}

export default {
    users,
    chats,
    rooms,
    contacts,
    users_rooms,
};
