import {FaUser} from 'react-icons/fa';

import {useUserContext} from '@/contexts/UserContext';
import {UserAPI} from '@/interfaces/apiInterfaces';

type MessageProps = {
    sender_username: string;
    body: string;
};

export default function Message({sender_username, body}: MessageProps) {
    const user: UserAPI = useUserContext()!;

    return (
        <div
            className={
                'flex flex-col py-2 bg-gray-50 px-5 border-b border-gray-400 ' +
                (user.username === sender_username
                    ? 'items-end'
                    : 'items-start')
            }
        >
            <span className="text-sm flex flex-row items-center gap-1">
                <span>{<FaUser />}</span>
                <span className="text-gray-400 font-semibold">
                    {sender_username}
                </span>
            </span>
            <div className="text-base pl-5">{body}</div>
        </div>
    );
}
