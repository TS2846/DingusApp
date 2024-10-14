import React, {useRef, useState, useEffect} from 'react';
import {io} from 'socket.io-client';
import {v4 as uuidv4} from 'uuid';

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

    const onMessageSubmit = (e) => {
        e.preventDefault();

        if (!socket.connected) return;

        if (!messageInput) return;

        if (!currentRoom) return;

        console.log('Emitting Message');
        socket.emit('message:send', userID, messageInput, currentRoom);

        setMessageInput('');
    };

    const onRoomJoinClick = (e) => {
        e.preventDefault();

        const room = roomInput.current.value;

        if (!socket.connected) return;

        if (!room) return;

        socket.emit('room:join', userID, room);
    };

    useEffect(() => {
        socket.connect();

        console.log('Connected to socket');

        function onMessageStackChange(user, message, room) {
            updateMessageStack((prev) => [...prev, {user, message, room}]);
        }

        function onRoomChange(user, room) {
            setCurrentRoom(room);

            // TODO: Notify user
        }

        socket.on('message:update', onMessageStackChange);
        socket.on('room:change', onRoomChange);

        return () => {
            socket.off('message:update', onMessageStackChange);
            socket.off('room:change', onRoomChange);

            socket.disconnect();

            console.log('Disconnect from socket');
        };
    }, []);

    return (
        <div className="container mx-auto my-5 flex flex-col gap-4 items-center">
            <div
                id="message-container"
                className="w-full md:w-7/12 h-96 border border-black"
            ></div>
            <form className="w-full md:w-1/2 flex flex-col gap-4 items-start">
                <div className="flex flex-col w-full items-start">
                    <label htmlFor="message-input">Message</label>
                    <div className="flex flex-row gap-2 w-full items-start">
                        <input
                            id="message-input"
                            className="px-2 py-2 grow rounded-md border border-black"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            type="text"
                        />
                        <button
                            type="submit"
                            onClick={onMessageSubmit}
                            className="px-5 py-2 rounded-md border border-black"
                        >
                            Send
                        </button>
                    </div>
                </div>

                <div className="flex flex-col w-full items-start">
                    <label htmlFor="room-input">Room</label>
                    <div className="flex flex-row gap-2 w-full items-start">
                        <input
                            id="room-input"
                            className="px-2 py-2 grow rounded-md border border-black"
                            ref={roomInput}
                            type="text"
                        />
                        <button
                            type="button"
                            onClick={onRoomJoinClick}
                            className="px-6 py-2 rounded-md border border-black"
                        >
                            Join
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
