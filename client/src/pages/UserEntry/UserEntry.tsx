import {useState, useEffect} from 'react';

import SignUp from '@/pages/SignUp';
import Login from '@/pages/Login';
import ChatRoom from '@/components/ChatRoom';
import AppLayout from '@/layout/AppLayout';
import AuthenticationContext from '@/contexts/AuthenticationContext';
import {refresh} from '@/api';

export default function UserEntry() {
    const [request, setRequest] = useState('login');
    const [isAuthenticated, setAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        if (localStorage.getItem('refreshToken')) {
            refresh()
                .then(res => {
                    localStorage.setItem('token', res.data.token);
                    localStorage.setItem('refreshToken', res.data.refreshToken);
                    setAuthenticated(true);
                    console.log('Refresh success');
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    setAuthenticated(false);
                    console.log('Refresh failed');
                });
        }
    }, []);

    if (isAuthenticated) {
        return (
            <AuthenticationContext.Provider
                value={[isAuthenticated, setAuthenticated]}
            >
                <AppLayout>
                    <ChatRoom />
                </AppLayout>
            </AuthenticationContext.Provider>
        );
    } else if (request === 'signup') {
        return (
            <AuthenticationContext.Provider
                value={[isAuthenticated, setAuthenticated]}
            >
                <SignUp setRequest={setRequest} />
            </AuthenticationContext.Provider>
        );
    } else {
        return (
            <AuthenticationContext.Provider
                value={[isAuthenticated, setAuthenticated]}
            >
                <Login setRequest={setRequest} />
            </AuthenticationContext.Provider>
        );
    }
}
