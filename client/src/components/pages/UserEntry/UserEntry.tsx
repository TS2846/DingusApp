import {useEffect, useState} from 'react';
import {toast} from 'react-toastify';

import SignUp from '@/components/pages/SignUp';
import Login from '@/components/pages/Login';
import {UserAPI} from '@/interfaces/apiInterfaces';
import UserContext from '@/contexts/UserContext';
import {socket} from '@/socket';
import ChatApp from '@/components/pages/ChatApp';

export default function UserEntry() {
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
            toast('Successfully logged in!', {type: 'success'});
            setAuthenticatedUser(user);
            clean_up();
        };

        const onUserAuthenticationError = (err_msg: string) => {
            toast(err_msg, {type: 'error'});
            // Show an error toast
            setAuthenticatedUser(null);
            setRequest('login');
        };

        const onUserRegistered = (user: UserAPI) => {
            toast('Successfully registered and logged in!', {type: 'success'});
            setAuthenticatedUser(user);
            clean_up();
        };

        const onUserRegistrationError = (err_msg: string) => {
            toast(err_msg, {type: 'error'});
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
                <ChatApp
                    setAuthenticatedUser={setAuthenticatedUser}
                    setRequest={setRequest}
                />
            </UserContext.Provider>
        );
    } else if (request === 'signup') {
        return <SignUp setRequest={setRequest} />;
    } else {
        return <Login setRequest={setRequest} />;
    }
}
