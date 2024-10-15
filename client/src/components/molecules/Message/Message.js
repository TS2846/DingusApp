import {FaUser} from 'react-icons/fa';

import {useUserContext} from '@/contexts/UserContext';

export default function Message({user, message}) {
    const userID = useUserContext();
    console.log('Current user: ' + userID + ' loading message from ' + user);
    return (
        <div
            className={
                'flex flex-col px-2 py-2 bg-gray-50 ' +
                (user === userID ? 'items-end' : 'items-start')
            }
        >
            <span className="text-sm flex flex-row items-center gap-1">
                <span>{<FaUser />}</span>
                <span className="text-gray-400 font-semibold">{user}</span>
            </span>
            <div className="text-base pl-5">{message}</div>
        </div>
    );
}
