import ChatIcon from '@/components/molecules/ChatIcon';
export default function RoomBox({currentRoom, roomStack}) {
    return (
        <div
            id="room-box"
            className="w-full h-full border border-black rounded-md overflow-hidden justify-center"
        >
            <div className="text-xl font-bold flex flex-col items-center justify-center p-2">
                Room List
            </div>
            <div
                className="grow h-full overflow-y-scroll flex flex-col gap-2
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
                        Room={item}
                    />
                ))}
            </div>
        </div>
    );
}
