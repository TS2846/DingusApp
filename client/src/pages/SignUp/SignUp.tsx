import {useState, Dispatch, SetStateAction} from 'react';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {signup} from '@/api';
import {useAuthentication} from '@/contexts/AuthenticationContext';

type SignUpProps = {
    setRequest: Dispatch<SetStateAction<string>>;
};

export default function SignUp({setRequest}: SignUpProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [aboutMe, setAboutMe] = useState('');
    const setAuthenticated = useAuthentication()[1];

    const onSignupSubmit = () => {
        if (!username.trim() || !password.trim()) return;
        signup(username, password, aboutMe)
            .then(res => {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('refreshToken', res.data.refreshToken);
                setAuthenticated(true);
            })
            .catch(console.error);
    };

    return (
        <form className="w-full h-full flex flex-col items-center justify-center gap-3">
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
                            setRequest('login');
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
