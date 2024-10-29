
import Room from '@/components/molecules/Room';
import {RoomAPI} from '@/interfaces/apiInterfaces';
import {useUserContext} from '@/contexts/UserContext';
import {socket} from '@/socket';
import Input from '@/components/atoms/Input'
import Button from '@/components/atoms/Button';
import { useState } from 'react';

type RoomListProps = {
    roomStack: RoomAPI[];
};

export default function RoomList({roomStack}: RoomListProps) {
    const user = useUserContext()!;
    const onCreateRoom = (friend_uuid: string) => {
        socket.emit('chat:create', user.uuid, friend_uuid);
    };
    const [friendUuid, setFriendUuid] = useState('')
    return (
        <div
            id="room-box"
            className="w-full h-full border border-black rounded-md justify-center p-2 relative flex flex-col"
        >
            <div className="text-xl font-bold flex flex-col items-center justify-center p-2">
                Your Rooms
            </div>
            <div
                className="h-full grow overflow-y-scroll flex flex-col gap-2
                    [&::-webkit-scrollbar]:w-2
                    [&::-webkit-scrollbar-track]:rounded-full
                    [&::-webkit-scrollbar-track]:bg-gray-100
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-thumb]:bg-gray-300"
            >
                {roomStack.map((item, index) => (
                    <Room key={index} room={item} />
                ))}
            </div>
            <div
                className="
                    flex flex-col items-center justify-center 

                    "  
            >
                <div
                    className="
                        flex flex-row
                    "
                >
                    <Input value={friendUuid} onChange={(e) => {setFriendUuid(e.target.value)}}/>

                    <Button label='Add Friend'
                        onClick={() => {onCreateRoom(friendUuid)}}
                    />
                </div>
            </div>
        </div>
    );
}
