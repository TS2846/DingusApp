import {useState, useEffect} from 'react';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {useSignup} from '@/hooks/useRequest';
import AuthenticationLoading from '@/components/Loading';
import {useRoute} from '@/contexts/RouteContext';

export default function SignUp() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [aboutMe, setAboutMe] = useState('');
    const {isLoading, data, queryFn: signup} = useSignup();
    const {setRoute, setAuthenticated} = useRoute();

    const onSignupSubmit = () => {
        if (!username.trim() || !password.trim() || isLoading) return;
        signup(username, password, aboutMe);
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
                items-center justify-center gap-3"
        >
            <div className="w-56 flex flex-col gap-1">
                <Label htmlFor="username">Username</Label>
                <Input
                    id="username"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />
            </div>
            <div className="w-56 flex flex-col gap-1">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
            </div>
            <div className="w-56 flex flex-col gap-1">
                <Label htmlFor="aboutme">About Me</Label>
                <Input
                    id="aboutme"
                    type="text"
                    placeholder="About Me 😁"
                    value={aboutMe}
                    onChange={e => setAboutMe(e.target.value)}
                />
            </div>
            <div className="flex flex-row gap-2">
                <Button
                    type="submit"
                    onClick={e => {
                        e.preventDefault();
                        onSignupSubmit();
                    }}
                >
                    Sign Up
                </Button>
            </div>
            <div>
                <p>
                    Already have an account?
                    <Button
                        className="mx-1 px-2 hover:bg-gray-500 hover:text-white"
                        onClick={e => {
                            e.preventDefault();
                            setRoute('login');
                        }}
                        variant="ghost"
                    >
                        Login
                    </Button>
                </p>
            </div>
        </form>
    );
}
