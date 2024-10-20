import {useEffect, useState} from 'react';

import SignUp from '@/components/pages/SignUp';
import Login from '@/components/pages/Login';
import {UserAPI} from '@/interfaces/apiInterfaces';
import UserContext from '@/contexts/UserContext';
import {socket} from '@/socket';

export default function UserEntry({
    children: App,
}: {
    children: React.ReactNode;
}) {
    const [request, setRequest] = useState('login');
    const [authenticatedUser, setAuthenticatedUser] = useState<UserAPI | null>(
        null,
    );

    useEffect(() => {
        socket.connect();

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        const onUserAuthenticated = (user: UserAPI) => {
            setAuthenticatedUser(user);
            clean_up();
        };

        const onUserAuthenticationError = (err_msg: string) => {
            console.error(err_msg); // Show an error toast
            setAuthenticatedUser(null);
            setRequest('login');
        };

        const onUserRegistered = (user: UserAPI) => {
            setAuthenticatedUser(user);
            clean_up();
        };

        const onUserRegistrationError = (err_msg: string) => {
            console.error(err_msg);
            setAuthenticatedUser(null);
            setRequest('signup');
        };

        const clean_up = () => {
            socket.off('user:authenticated', onUserAuthenticated);
            socket.off('user:authentication_error', onUserAuthenticationError);
            socket.off('user:registered', onUserRegistered);
            socket.off('user:registration_error', onUserRegistrationError);
        };

        socket.on('user:authenticated', onUserAuthenticated);
        socket.on('user:authentication_error', onUserAuthenticationError);
        socket.on('user:registered', onUserRegistered);
        socket.on('user:registration_error', onUserRegistrationError);

        return clean_up;
    }, []);

    if (authenticatedUser) {
        return (
            <UserContext.Provider value={authenticatedUser}>
                {App}
            </UserContext.Provider>
        );
    } else if (request === 'signup') {
        return <SignUp setRequest={setRequest} />;
    } else {
        return <Login setRequest={setRequest} />;
    }
}
