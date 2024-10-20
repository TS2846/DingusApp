import {FaUser} from 'react-icons/fa';

import {useUserContext} from '@/contexts/UserContext';
import {MessageAPI} from '@/interfaces/apiInterfaces';

type MessageProps = {
    message: MessageAPI;
};

export default function Message({message}: MessageProps) {
    const user = useUserContext()!;
    return (
        <div
            className={
                'flex flex-col py-2 bg-gray-50 px-5 border-b border-gray-400 ' +
                (user.id === message.senderId ? 'items-end' : 'items-start')
            }
        >
            <span className="text-sm flex flex-row items-center gap-1">
                <span>{<FaUser />}</span>
                <span className="text-gray-400 font-semibold">
                    {message.senderId}
                </span>
            </span>
            <div className="text-base pl-5">{message.body}</div>
        </div>
    );
}
