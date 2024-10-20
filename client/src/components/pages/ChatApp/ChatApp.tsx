import React, {useState, useEffect} from 'react';
import {FaPlus} from 'react-icons/fa';

import ChatWindow from '@/components/organisms/ChatWindow';
import ChatInput from '@/components/molecules/ChatInput';
import RoomList from '@/components/organisms/RoomList';
import RoomContext from '@/contexts/RoomContext';
import {MessageAPI, RoomAPI} from '@/interfaces/apiInterfaces';
import {useUserContext} from '@/contexts/UserContext';
import {socket} from '@/socket';

export default function ChatApp() {
    const user = useUserContext()!;

    const [messageInput, setMessageInput] = useState<string>('');
    const [currentRoom, setCurrentRoom] = useState<RoomAPI | null>(null);
    const [messageStack, updateMessageStack] = useState<MessageAPI[]>([]);
    const [roomStack, updateRoomStack] = useState<RoomAPI[]>([]);

    useEffect(() => {
        socket.emit('user:get_rooms_req', user.id);

        const onGetRoomsResponse = (rooms: RoomAPI[]) => {
            console.log(rooms);
            updateRoomStack(rooms);
        };

        const clean_up = () => {
            socket.off('user:get_rooms_res', onGetRoomsResponse);
        };

        socket.on('user:get_rooms_res', onGetRoomsResponse);

        return clean_up;
    }, [user]);

    useEffect(() => {
        const onRoomCreated = (room: RoomAPI) => {
            console.log(room);
            updateRoomStack(prev => [room, ...prev]);
            updateMessageStack([]);
            setCurrentRoom(room);
            // TODO: Show success Toast
        };

        const onRoomJoined = (room: RoomAPI, messages: MessageAPI[]) => {
            console.log(messages);
            setCurrentRoom(room);
            updateMessageStack(messages);
            // TODO: Show success toast
        };

        const onMessageSubmitted = (message: MessageAPI) => {
            console.log(message);
            const roomId = message.room_id;

            if (!currentRoom || currentRoom.id !== roomId) {
                console.log('Room mismatch');
                return;
            } // TODO: Show new message toast

            updateMessageStack(prev => [...prev, message]);
        };

        const clean_up = () => {
            socket.off('room:created', onRoomCreated);
            socket.off('room:joined', onRoomJoined);
            socket.off('message:submitted', onMessageSubmitted);
        };

        socket.on('room:created', onRoomCreated);
        socket.on('room:joined', onRoomJoined);
        socket.on('message:submitted', onMessageSubmitted);

        return clean_up;
    }, [currentRoom, user]);

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
                />
            );

        return '';
    };

    return (
        <RoomContext.Provider value={currentRoom}>
            <div className="w-80 min-w-80 border-t border-l flex flex-col items-center justify-center">
                <RoomList roomStack={roomStack} />
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
