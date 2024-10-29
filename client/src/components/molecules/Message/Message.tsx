import {FaUser} from 'react-icons/fa';

import {useUserContext} from '@/contexts/UserContext';
import {MessageAPI, UserAPI} from '@/interfaces/apiInterfaces';

type MessageProps = {
    message: MessageAPI;
};

export default function Message({message}: MessageProps) {
    const user: UserAPI = useUserContext()!;
    // const room = useRoomContext()!;

    // const userMap = room.members.reduce(
    //     (accumulator: {[x: string]: UserAPI}, item) => {
    //         accumulator[item.id] = item;
    //         return accumulator;
    //     },
    //     {},
    // );



    return (
        <div
            className={
                'flex flex-col py-2 bg-gray-50 px-5 border-b border-gray-400 ' +
                (user.uuid === message.sender_uuid ? 'items-end' : 'items-start')
            }
        >
            <span className="text-sm flex flex-row items-center gap-1">
                <span>{<FaUser />}</span>
                <span className="text-gray-400 font-semibold">
                    {message.sender_uuid}
                </span>
            </span>
            <div className="text-base pl-5">{message.body}</div>
        </div>
    );
}
