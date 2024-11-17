import api from '@/api';

import {useQuery} from '@tanstack/react-query';
import {RoomAPI, UserAPI} from '@/interfaces/apiInterfaces.ts';

export const useAllRooms = () => {
    return useQuery<RoomAPI[]>({
        queryKey: ['rooms'],
        queryFn: async () => {
            const response = await api.get<RoomAPI[]>('/rooms');
            return response.data;
        },
        staleTime: 1000 * 60 * 60,
    });
};

export const useRoom = (room_uuid: string) => {
    return useQuery<RoomAPI>({
        queryKey: ['room', room_uuid],
        queryFn: async () => {
            const response = await api.get<RoomAPI>(`/room/${room_uuid}`);
            return response.data;
        },
        staleTime: 1000 * 60 * 60,
    });
};

export const useRoomMembers = (room_uuid: string) => {
    return useQuery<UserAPI[]>({
        queryKey: ['room', room_uuid, 'members'],
        queryFn: async () => {
            const response = await api.get<UserAPI[]>(`/members/${room_uuid}`);
            return response.data;
        },
        staleTime: 1000 * 60 * 60,
    });
};
