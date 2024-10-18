export default function ChatIcon({currentRoom, room, onRoomClick}) {
    const isActive = room === currentRoom;
    const colors = isActive
        ? 'bg-purple-600 text-white font-bold'
        : 'bg-gray-200 text-gray-800 hover:bg-gray-300';

    return (
        <div
            className={`rounded-md h-6 text-center p-10 flex 
                flex-col items-start justify-center 
                hover:cursor-pointer
                ${colors}`}
            onClick={() => onRoomClick(room)}
        >
            {room}
        </div>
    );
}
