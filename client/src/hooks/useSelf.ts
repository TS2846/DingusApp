import {useQuery, UseQueryResult} from '@tanstack/react-query';

import api from '@/api';
import {UserAPI} from '@/interfaces/apiInterfaces.ts';

const useSelf = (): UseQueryResult<UserAPI, Error> => {
    return useQuery<UserAPI>({
        queryKey: ['self'],
        queryFn: async () => {
            const response = await api.get<UserAPI>('/self');
            return response.data;
        },
        staleTime: 1000 * 60 * 60,
    });
};

export default useSelf;
