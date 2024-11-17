import api from '@/api';

import {useQuery} from '@tanstack/react-query';
import {MessageAPI} from '@/interfaces/apiInterfaces.ts';

export const useMessages = (room_uuid: string) => {
    return useQuery<MessageAPI[]>({
        queryKey: ['messages', room_uuid],
        queryFn: async () => {
            const response = await api.get<MessageAPI[]>(
                `/messages/${room_uuid}`,
            );
            console.log(response);
            return response.data;
        },
        staleTime: 1000 * 60 * 60,
    });
};
