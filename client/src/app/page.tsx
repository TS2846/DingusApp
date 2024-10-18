'use client';

import React, {useState, useEffect} from 'react';
import {io} from 'socket.io-client';
import {v4 as uuidv4} from 'uuid';
import {FaPlus} from 'react-icons/fa';

import ChatWindow from '@/components/organisms/ChatWindow';
import ChatInput from '@/components/molecules/ChatInput';
import RoomList from '@/components/organisms/RoomList';
import UserContext from '@/contexts/UserContext';
import RoomContext from '@/contexts/RoomContext';
import {MessageAPI, RoomAPI} from '@/interfaces/apiInterfaces';

const URL = 'http://localhost:3001';
export const socket = io(URL, {
    autoConnect: false,
});

const user = {
    id: uuidv4(),
    username: 'pdad12',
    displayName: 'Deepta',
};

export default function Home() {
    const [messageInput, setMessageInput] = useState<string>('');
    const [currentRoom, setCurrentRoom] = useState<RoomAPI | undefined>(
        undefined,
    );
    const [messageStack, updateMessageStack] = useState<MessageAPI[]>([]);
    const [roomStack, updateRoomStack] = useState<RoomAPI[]>([]);

    const onMessageSubmit = (
        e: React.MouseEvent<HTMLButtonElement, React.MouseEvent>,
    ) => {
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
    };

    const onCreateRoom = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!socket.connected) return; // TODO: Notify user about connection problem

        const newRoom = {
            id: uuidv4(),
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

            if (!currentRoom || currentRoom.id !== roomId) return; // TODO: Notify user about new message

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

    return (
        <UserContext.Provider value={user}>
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
                        {currentRoom ? (
                            <ChatWindow messageStack={messageStack} />
                        ) : (
                            <div className="flex flex-row gap-1 items-center justify-center">
                                <div>Click the</div>
                                <FaPlus className="inline" />
                                <div>
                                    icon to <b>create a Room</b>.
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="absolute w-full bottom-0 p-4 flex flex-row items-center justify-center">
                        {currentRoom ? (
                            <ChatInput
                                messageInput={messageInput}
                                setMessageInput={setMessageInput}
                                onMessageSubmit={onMessageSubmit}
                            />
                        ) : (
                            ''
                        )}
                    </div>
                </div>
            </RoomContext.Provider>
        </UserContext.Provider>
    );
}
