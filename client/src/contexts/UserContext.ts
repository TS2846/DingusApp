import {createContext, useContext} from 'react';

import {UserAPI} from '@/interfaces/apiInterfaces';

const UserContext = createContext<UserAPI | undefined>(undefined);

export default UserContext;

export function useUserContext() {
    return useContext(UserContext);
}
