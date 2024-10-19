import {useState} from 'react';

import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';

type SignUpProps = {
    setRequest: React.Dispatch<React.SetStateAction<string>>;
    setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function SignUp({setRequest, setAuthenticated}: SignUpProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <Input
                type="text"
                placeholder="Name"
                value={name}
                onChange={e => setName(e.target.value)}
            />
            <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
            />
            <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
            />
            <div className="flex flex-row gap-2">
                <Button
                    type="submit"
                    label="Sign Up"
                    className="px-4"
                    onClick={e => {
                        e.preventDefault();
                        setAuthenticated(true);
                    }}
                />
            </div>
            <div>
                <p>
                    Already have an account?
                    <span
                        className="p-2 mx-1 rounded-md cursor-pointer hover:bg-emerald-400
                                    hover:text-white transition-all ease-in"
                        onClick={e => {
                            e.preventDefault();
                            setRequest('login');
                        }}
                    >
                        Login
                    </span>
                </p>
            </div>
        </div>
    );
}
