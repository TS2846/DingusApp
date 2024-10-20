import React, {useState, useEffect} from 'react';
import {io} from 'socket.io-client';
import {FaPlus} from 'react-icons/fa';

import ChatWindow from '@/components/organisms/ChatWindow';
import ChatInput from '@/components/molecules/ChatInput';
import RoomList from '@/components/organisms/RoomList';
import RoomContext from '@/contexts/RoomContext';
import {MessageAPI, RoomAPI} from '@/interfaces/apiInterfaces';
import config from '@/config';
import {useUserContext} from '@/contexts/UserContext';

const socket = io(config.SERVER_URI, {
    autoConnect: false,
});

export default function ChatApp() {
    const user = useUserContext()!;

    const [messageInput, setMessageInput] = useState<string>('');
    const [currentRoom, setCurrentRoom] = useState<RoomAPI | null>(null);
    const [messageStack, updateMessageStack] = useState<MessageAPI[]>([]);
    const [roomStack, updateRoomStack] = useState<RoomAPI[]>([]); // TODO: Fetch roomstack from backend

    const onMessageSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (!socket.connected) return; // TODO: Prompt use to wait for a connection

        if (!messageInput) return;

        if (!currentRoom) return; // TODO: Prompt user to join a room
        socket.emit(
            'message:send',
            user.id,
            messageInput,
            currentRoom.id,
            Date.now(),
        );
        setMessageInput('');
    };

    const onRoomClick = (room: RoomAPI) => {
        if (room.id === currentRoom?.id) return;

        if (!socket.connected) return; // TODO: Notify the of the connection problem

        socket.emit('room:join', user.id, room.id);
        // TODO: get roomstack from api
    };

    const onCreateRoom = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!socket.connected) return; // TODO: Notify user about connection problem

        const newRoom = {
            id: 'id',
            roomName: `Room ${roomStack.length + 1}`,
            members: [user.id],
        };
        updateRoomStack(prev => [newRoom, ...prev]);
        socket.emit('room:join', user.id, newRoom.id);
    };

    useEffect(() => {
        socket.connect();

        function onNewMessage(message: MessageAPI) {
            const roomId = message.roomId;

            if (!currentRoom || currentRoom.id !== roomId) {
                console.log('Room mismatch');
                return;
            } // TODO: Notify user about new message

            updateMessageStack(prev => [...prev, message]);
        }

        function onRoomChange(room: RoomAPI) {
            setCurrentRoom(room);
            // TODO: Notify user of successfully joining a room
        }
        socket.on('message:new', onNewMessage);
        socket.on('room:change', onRoomChange);

        return () => {
            socket.off('message:new', onNewMessage);
            socket.off('room:change', onRoomChange);
            socket.disconnect();
        };
    }, [currentRoom]);

    const renderChatWindow = () => {
        if (!roomStack.length) {
            return (
                <div className="flex flex-row gap-1 items-center justify-center">
                    <div>Click the</div>
                    <FaPlus className="inline" />
                    <div>
                        icon to <b>create a Room</b>.
                    </div>
                </div>
            );
        } else if (!currentRoom) {
            return (
                <div>
                    <b>Join a Room</b> to start chatting!
                </div>
            );
        } else {
            return <ChatWindow messageStack={messageStack} />;
        }
    };

    const renderChatInput = () => {
        if (currentRoom)
            return (
                <ChatInput
                    messageInput={messageInput}
                    setMessageInput={setMessageInput}
                    onMessageSubmit={onMessageSubmit}
                />
            );

        return '';
    };

    return (
        <RoomContext.Provider value={currentRoom}>
            <div className="w-80 min-w-80 border-t border-l flex flex-col items-center justify-center">
                <RoomList
                    roomStack={roomStack}
                    onRoomClick={onRoomClick}
                    onCreateRoom={onCreateRoom}
                />
            </div>
            <div className="grow flex flex-col relative">
                <div
                    className="grow max-h-full flex flex-col items-center justify-center border-r 
                                    border-b border-t border-black rounded-md"
                >
                    {renderChatWindow()}
                </div>

                <div className="absolute w-full bottom-0 p-4 flex flex-row items-center justify-center">
                    {renderChatInput()}
                </div>
            </div>
        </RoomContext.Provider>
    );
}
