import {FaPlus} from 'react-icons/fa';

import ChatIcon from '@/components/molecules/ChatIcon';
export default function RoomBox({
    currentRoom,
    roomStack,
    onRoomClick,
    onCreateRoom,
}) {
    return (
        <div
            id="room-box"
            className="w-full h-full border border-black rounded-md overflow-hidden justify-center p-2 relative"
        >
            <div className="text-xl font-bold flex flex-col items-center justify-center p-2">
                Your Rooms
            </div>
            <div
                className="grow overflow-y-scroll flex flex-col gap-2
                    [&::-webkit-scrollbar]:w-2
                    [&::-webkit-scrollbar-track]:rounded-full
                    [&::-webkit-scrollbar-track]:bg-gray-100
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-thumb]:bg-gray-300"
            >
                {roomStack.map((item, index) => (
                    <ChatIcon
                        key={index}
                        currentRoom={currentRoom}
                        room={item}
                        onRoomClick={onRoomClick}
                    />
                ))}
            </div>
            <div
                className="absolute bottom-5 right-5 w-14 h-14 
                    flex flex-col items-center justify-center 
                    rounded-full text-white bg-black hover:text-2xl 
                    transition-all ease-in hover:cursor-pointer"
                onClick={onCreateRoom}
            >
                <FaPlus />
            </div>
        </div>
    );
}
