import {createContext, useContext} from 'react';

import {UserAPI} from '@/interfaces/apiInterfaces';

const UserContext = createContext<UserAPI | null>(null);

export default UserContext;

export function useUserContext() {
    return useContext(UserContext);
}
