'use client';

import Link from 'next/link';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {cookies} from 'next/headers';

import {useLogin} from '@/hooks/dataHooks';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const cookiesStore = cookies();
    const {
        mutate: authenticateUser,
        isError,
        isSuccess,
        error,
    } = useLogin({
        onSuccess: data => {
            const ten_mins = Date.now() + 10 * 60 * 1000;
            cookiesStore.set('id', data.id, {
                expires: ten_mins,
            });
            cookiesStore.set('username', data.username, {
                expires: ten_mins,
            });
            cookiesStore.set('name', data.name, {
                expires: ten_mins,
            });

            router.push('/');
        },
    });
    const submitLogin = () => {
        authenticateUser({username, password});
    };

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
                    onClick={submitLogin}
                />
            </div>
            <div>
                <p>
                    Don&apos;t have an account?
                    <Link
                        className="p-2 mx-1 rounded-md cursor-pointer hover:bg-blue-400
                     hover:text-white transition-all ease-in"
                        href={'/signup'}
                    >
                        Sign up
                    </Link>
                </p>
                <div>
                    Status:{' '}
                    {isError ? 'Invalid Credentials' + error.message : ''}{' '}
                    {isSuccess ? 'Success!' : ''}
                </div>
            </div>
        </div>
    );
}
