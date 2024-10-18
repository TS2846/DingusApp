import React, {useRef, useState, useEffect} from 'react';
import {io} from 'socket.io-client';
import {v4 as uuidv4} from 'uuid';
import {FaPlus} from 'react-icons/fa';

import ChatWindow from '@/components/organisms/ChatWindow';
import ChatInput from '@/components/molecules/ChatInput';
import RoomBox from '@/components/organisms/RoomBox';
import UserContext from '@/contexts/UserContext';

const URL = 'http://localhost:3001';
export const socket = io(URL, {
    autoConnect: false,
});

const userID = uuidv4();

export default function Home() {
    const [messageInput, setMessageInput] = useState('');
    const [currentRoom, setCurrentRoom] = useState('');
    const [messageStack, updateMessageStack] = useState([]);
    const [roomStack, updateRoomStack] = useState([]);

    const onMessageSubmit = (e) => {
        e.preventDefault();

        if (!socket.connected) return; // TODO: Prompt use to wait for a connection

        if (!messageInput) return;

        if (!currentRoom) return; // TODO: Prompt user to join a room
        socket.emit('message:send', userID, messageInput, currentRoom);
        setMessageInput('');
    };

    const onRoomClick = (room) => {
        if (room === currentRoom) return;

        if (!socket.connected) return; // TODO: Notify the of the connection problem

        socket.emit('room:join', userID, room);
    };

    const onCreateRoom = () => {
        if (!socket.connected) return; // TODO: Notify the of the connection problem

        const newRoom = `Room ${roomStack.length + 1}`;
        updateRoomStack((prev) => [newRoom, ...prev]);
        socket.emit('room:join', userID, newRoom);
    };

    useEffect(() => {
        socket.connect();

        function onMessageStackChange(user, message, room) {
            updateMessageStack((prev) => [...prev, {user, message, room}]);
        }

        function onRoomChange(user, room) {
            setCurrentRoom(room);
            updateMessageStack([]);
            // TODO: Notify user of successfully joining a room
        }
        socket.on('message:update', onMessageStackChange);
        socket.on('room:change', onRoomChange);

        return () => {
            socket.off('message:update', onMessageStackChange);
            socket.off('room:change', onRoomChange);
            socket.disconnect();
        };
    }, []);

    return (
        <UserContext.Provider value={userID}>
            <div className="container flex flex-row mx-auto h-screen min-h-96">
                <div className="w-80 min-w-80 border-t border-l flex flex-col items-center justify-center">
                    <RoomBox
                        currentRoom={currentRoom}
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
            </div>
        </UserContext.Provider>
    );
}
