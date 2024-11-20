import api from '@/api';

import {useQuery} from '@tanstack/react-query';
import {RoomAPI, UserAPI, MessageAPI} from '@/interfaces/apiInterfaces.ts';

export const useRooms = () => {
    return useQuery<RoomAPI[]>({
        queryKey: ['rooms'],
        queryFn: async () => {
            const response = await api.get<RoomAPI[]>('/rooms');
            return response.data;
        },
        staleTime: 1000 * 60 * 60,
    });
};

export const useRoomMembers = (room_id: number | bigint) => {
    return useQuery<UserAPI[]>({
        queryKey: ['rooms', room_id, 'members'],
        queryFn: async () => {
            const response = await api.get<UserAPI[]>(
                `/rooms/${room_id}/members`,
            );
            return response.data;
        },
        staleTime: 1000 * 60 * 60,
    });
};

export const useMessages = (room_id: number | bigint) => {
    return useQuery<MessageAPI[]>({
        queryKey: ['rooms', room_id, 'messages'],
        queryFn: async () => {
            const response = await api.get<MessageAPI[]>(
                `/rooms/${room_id}/messages`,
            );
            return response.data;
        },
        staleTime: 1000 * 60 * 60,
    });
};
