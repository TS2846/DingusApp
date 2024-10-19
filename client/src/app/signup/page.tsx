'use client';

import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Link from 'next/link';

export default function SignUp() {
    return (
        <form className="w-full h-full flex flex-col items-center justify-center gap-2">
            <Input type="text" placeholder="Name" />
            <Input type="text" placeholder="Username" />
            <Input type="password" placeholder="Password" />
            <div className="flex flex-row gap-2">
                <Button type="submit" label="Sign Up" className="px-4" />
            </div>
            <div>
                <p>
                    Already have an account?
                    <Link
                        className="p-2 mx-1 rounded-md cursor-pointer hover:bg-emerald-400
                     hover:text-white transition-all ease-in"
                        href={'/login'}
                    >
                        Login
                    </Link>
                </p>
            </div>
        </form>
    );
}
