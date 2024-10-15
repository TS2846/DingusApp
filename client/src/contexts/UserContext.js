import {createContext, useContext} from 'react';

const UserContext = createContext(null);

export default UserContext;

export function useUserContext() {
    const user = useContext(UserContext);

    if (user === undefined) {
        throw new Error('useUserContext must be used with a UserContext.');
    }

    return user;
}
