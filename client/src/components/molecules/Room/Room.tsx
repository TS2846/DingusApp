import {useRoomContext} from '@/contexts/RoomContext';
import {useUserContext} from '@/contexts/UserContext';
import {RoomAPI} from '@/interfaces/apiInterfaces';
import {socket} from '@/socket';

type RoomProps = {
    room: RoomAPI;
};

export default function Room({room}: RoomProps) {
    const currentRoom = useRoomContext();
    const user = useUserContext()!;

    const onRoomJoin = (room: RoomAPI) => {
        if (room.id === currentRoom?.id) return;

        socket.emit('room:join', user.id, room.id);
    };

    const isActive = room.id === currentRoom?.id;
    const colors = isActive
        ? 'bg-purple-600 text-white font-bold'
        : 'bg-gray-200 text-gray-800 hover:bg-gray-300';

    return (
        <div
            className={`rounded-md h-6 text-center p-10 flex 
                flex-col items-start justify-center 
                hover:cursor-pointer
                ${colors}`}
            onClick={() => onRoomJoin(room)}
        >
            {room.name}
        </div>
    );
}
