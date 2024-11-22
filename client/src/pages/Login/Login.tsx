import {useState, useEffect} from 'react';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {useRoute} from '@/contexts/RouteContext';
import {useLogin} from '@/hooks/useRequest';
import AuthenticationLoading from '@/components/Loading';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const {isLoading, data, queryFn: login} = useLogin();
    const {setRoute, setAuthenticated} = useRoute();

    const onLoginSubmit = () => {
        if (!username.trim() || !password.trim() || isLoading) return;
        login(username, password);
    };

    useEffect(() => {
        if (data) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('refreshToken', data.refreshToken);
            setAuthenticated(true);
        }
    }, [data]);

    return isLoading ? (
        <div className="w-full h-full flex justify-center items-center">
            <AuthenticationLoading />
        </div>
    ) : (
        <form
            className="w-full h-full flex flex-col 
                items-center justify-center gap-1"
            onSubmit={event => {
                event.preventDefault();
                onLoginSubmit();
            }}
        >
            <div className="w-54 flex flex-col gap-1">
                <Label htmlFor="username">Username</Label>
                <Input
                    id="username"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />
            </div>
            <div className="w-54 flex flex-col gap-1">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
            </div>
            <div className="flex flex-row gap0">
                <Button
                    type="submit"
                    className="px-2"
                    onSubmit={e => {
                        e.preventDefault();
                        onLoginSubmit();
                    }}
                >
                    Login
                </Button>
            </div>
            <div>
                <p>
                    Don&apos;t have an account?
                    <Button
                        type="submit"
                        className="mx1 px-2 hover:bg-gray-500 hover:text-white"
                        onClick={e => {
                            e.preventDefault();
                            setRoute('signup');
                        }}
                        variant="ghost"
                    >
                        Sign up
                    </Button>
                </p>
            </div>
        </form>
    );
}
