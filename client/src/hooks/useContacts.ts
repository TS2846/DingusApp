import api from '@/api';

import {useQuery} from '@tanstack/react-query';
import {ContactAPI} from '@/interfaces/apiInterfaces.ts';

const useContacts = () => {
    return useQuery<ContactAPI[]>({
        queryKey: ['contacts'],
        queryFn: async () => {
            const response = await api.get<ContactAPI[]>('/contacts');
            return response.data;
        },
        staleTime: 1000 * 60 * 60,
    });
};

export default useContacts;
