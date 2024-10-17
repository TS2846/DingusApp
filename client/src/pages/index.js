import React, {useRef, useState, useEffect} from 'react';
import {io} from 'socket.io-client';
import {v4 as uuidv4} from 'uuid';

import ChatWindow from '@/components/organisms/ChatWindow';
import RecipientBox from '@/components/organisms/RoomBox';
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
    const [roomStack, updateRoomStack] = useState([]);

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
        updateRoomStack((prev) => ([...prev, room])); //what the fuck??????????????????????
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

        return () => {
            socket.off('message:update', onMessageStackChange);
            socket.off('room:change', onRoomChange);
            socket.disconnect();
        };
    }, []);

    return (
        <UserContext.Provider value={userID}>
          <div className="container flex flex-row items-center h-screen m-auto gap-4">
                <div className="w-1/3 p-3 h-3/5 flex content-stretch justify-end">
                  <RecipientBox
                    roomStack={roomStack}>
                </RecipientBox>
                </div>
            <div className="flex-grow my-5 flex flex-col gap-4 justify-start p-3">
                
                <ChatWindow
                    messageInput={messageInput}
                    setMessageInput={setMessageInput}
                    onMessageSubmit={onMessageSubmit}
                    messageStack={messageStack}
                />
                <form
                    className="w-full md:w-1/2 flex flex-col gap-4 items-start"
                    autoComplete="off"
                >
                    <div className="flex flex-col w-full items-start">
                        <label htmlFor="room-input">Room</label>
                        <div className="flex flex-row gap-2 w-full items-start">
                            <Input
                                id="room-input"
                                className="grow"
                                type="text"
                                ref={roomInput}
                            />
                            <Button
                                label="Join"
                                className="px-6 py-2"
                                type="submit"
                                onClick={onRoomJoinClick}
                            />
                        </div>
                    </div>
                </form>
            </div>
            </div>
        </UserContext.Provider>
    );
}
