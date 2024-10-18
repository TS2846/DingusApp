import React, {useRef, useState, useEffect} from 'react';
import {io} from 'socket.io-client';
import {v4 as uuidv4} from 'uuid';

import ChatWindow from '@/components/organisms/ChatWindow';
import ChatInput from '@/components/molecules/ChatInput';
import RoomBox from '@/components/organisms/RoomBox';
import UserContext from '@/contexts/UserContext';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';

const URL = 'http://localhost:3001';
export const socket = io(URL, {
    autoConnect: false,
});

const userID = uuidv4();

export default function Home() {
    const roomInput = useRef('');
    const [messageInput, setMessageInput] = useState('');
    const [currentRoom, setCurrentRoom] = useState('');
    const [messageStack, updateMessageStack] = useState([]);
    const [roomStack, updateRoomStack] = useState([
        'Room 1',
        'Room 2',
        'Room 3',
    ]);

    const onMessageSubmit = (e) => {
        e.preventDefault();

        if (!socket.connected) return; // TODO: Prompt use to wait for a connection

        if (!messageInput) return;

        if (!currentRoom) return; // TODO: Prompt user to join a room
        socket.emit('message:send', userID, messageInput, currentRoom);
        setMessageInput('');
    };

    const onRoomJoinClick = (e) => {
        e.preventDefault();

        const room = roomInput.current.value;

        if (!socket.connected) return;

        if (!room) return;
        updateRoomStack((prev) => [...prev, room]);
        socket.emit('room:join', userID, room);
    };

    useEffect(() => {
        socket.connect();

        function onMessageStackChange(user, message, room) {
            updateMessageStack((prev) => [...prev, {user, message, room}]);
        }

        function onRoomChange(user, room) {
            setCurrentRoom(room);
            // TODO: Notify user of successfully joining a room
        }
        socket.on('message:update', onMessageStackChange);
        socket.on('room:change', onRoomChange);

        socket.emit('room:join', userID, 'Room 1');

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
                    <RoomBox currentRoom={currentRoom} roomStack={roomStack} />
                </div>
                <div className="grow flex flex-col relative">
                    <div className="grow max-h-full flex flex-col items-center justify-center">
                        <ChatWindow messageStack={messageStack} />
                    </div>

                    <div className="absolute w-full bottom-0 p-4 flex flex-row items-center justify-center">
                        <ChatInput
                            messageInput={messageInput}
                            setMessageInput={setMessageInput}
                            onMessageSubmit={onMessageSubmit}
                        />
                    </div>
                </div>
            </div>
        </UserContext.Provider>
    );
}
