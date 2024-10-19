import {useState} from 'react';

import SignUp from '@/components/pages/SignUp';
import Login from '@/components/pages/Login';

export default function UserEntry({
    children: App,
}: {
    children: React.ReactNode;
}) {
    const [request, setRequest] = useState('login');
    const [isAuthenticated, setAuthenticated] = useState(false);

    if (isAuthenticated) {
        return App;
    } else if (request === 'signup') {
        return (
            <SignUp
                setAuthenticated={setAuthenticated}
                setRequest={setRequest}
            />
        );
    } else {
        return (
            <Login
                setAuthenticated={setAuthenticated}
                setRequest={setRequest}
            />
        );
    }
}
