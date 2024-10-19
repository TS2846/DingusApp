import {useState} from 'react';

import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';

type LoginProps = {
    setRequest: React.Dispatch<React.SetStateAction<string>>;
    setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Login({setRequest, setAuthenticated}: LoginProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <Input
                id="username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
            />
            <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
            />
            <div className="flex flex-row gap-2">
                <Button
                    label="Login"
                    className="px-4"
                    type="button"
                    onClick={e => {
                        e.preventDefault();
                        setAuthenticated(true);
                    }}
                />
            </div>
            <div>
                <p>
                    Don&apos;t have an account?
                    <span
                        className="p-2 mx-1 rounded-md cursor-pointer hover:bg-blue-400
                                    hover:text-white transition-all ease-in"
                        onClick={e => {
                            e.preventDefault();
                            setRequest('signup');
                        }}
                    >
                        Sign up
                    </span>
                </p>
                {/* <div>
                    Status:{' '}
                    {isError ? 'Invalid Credentials' + error.message : ''}{' '}
                    {isSuccess ? 'Success!' : ''}
                </div> */}
            </div>
        </div>
    );
}
