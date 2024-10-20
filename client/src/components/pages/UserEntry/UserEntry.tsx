import {useState} from 'react';

import SignUp from '@/components/pages/SignUp';
import Login from '@/components/pages/Login';
import {UserAPI} from '@/interfaces/apiInterfaces';
import UserContext from '@/contexts/UserContext';

export default function UserEntry({
    children: App,
}: {
    children: React.ReactNode;
}) {
    const [request, setRequest] = useState('login');
    const [authenticatedUser, setAuthenticatedUser] = useState<UserAPI | null>(
        null,
    );

    if (authenticatedUser) {
        return (
            <UserContext.Provider value={authenticatedUser}>
                {App}
            </UserContext.Provider>
        );
    } else if (request === 'signup') {
        return (
            <SignUp
                setAuthenticatedUser={setAuthenticatedUser}
                setRequest={setRequest}
            />
        );
    } else {
        return (
            <Login
                setAuthenticatedUser={setAuthenticatedUser}
                setRequest={setRequest}
            />
        );
    }
}
