import {useEffect} from 'react';

import SignUp from '@/pages/SignUp';
import Login from '@/pages/Login';
import ChatApp from '@/pages/ChatApp';
import {refresh} from '@/hooks/useRequest';
import {useRoute} from '@/contexts/RouteContext';

export default function UserEntry() {
    const {route, isAuthenticated, setAuthenticated} = useRoute();
    useEffect(() => {
        if (
            ['login', 'signup'].includes(route) &&
            localStorage.getItem('refreshToken') &&
            localStorage.getItem('token')
        ) {
            refresh()
                .then(res => {
                    localStorage.setItem('token', res.data.token);
                    localStorage.setItem('refreshToken', res.data.refreshToken);
                    setAuthenticated(true);
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    setAuthenticated(false);
                });
        }
    }, [route]);

    const renderPage = () => {
        if (isAuthenticated) {
            return <ChatApp />;
        } else {
            return (
                <div className="h-full">
                    {route === 'signup' ? <SignUp /> : <Login />}
                </div>
            );
        }
    };

    return renderPage();
}
