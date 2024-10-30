import {useState, useEffect} from 'react';
import {MdPersonAddAlt1} from 'react-icons/md';
import {toast} from 'react-toastify';

import ChatWindow from '@/components/organisms/ChatWindow';
import ChatInput from '@/components/molecules/ChatInput';
import RoomList from '@/components/organisms/RoomList';
import RoomContext from '@/contexts/RoomContext';
import {MessageAPI, RoomAPI, UserAPI} from '@/interfaces/apiInterfaces';
import {useUserContext} from '@/contexts/UserContext';
import {socket} from '@/socket';

type ChatAppProps = {
    setAuthenticatedUser: React.Dispatch<React.SetStateAction<UserAPI | null>>;
    setRequest: React.Dispatch<React.SetStateAction<string>>;
};

export default function ChatApp({
    setAuthenticatedUser,
    setRequest,
}: ChatAppProps) {
    const user = useUserContext()!;

    const [messageInput, setMessageInput] = useState<string>('');
    const [currentRoom, setCurrentRoom] = useState<RoomAPI | null>(null);
    const [messageStack, updateMessageStack] = useState<MessageAPI[]>([]);
    const [roomStack, updateRoomStack] = useState<RoomAPI[]>([]);

    useEffect(() => {
        socket.emit('user:get_rooms_req');

        const onGetRoomsResponse = (rooms: RoomAPI[]) => {
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
            toast('Room created!', {
                type: 'success',
                autoClose: 50,
                hideProgressBar: true,
            });
            updateRoomStack(prev => [room, ...prev]);
            updateMessageStack([]);
            setCurrentRoom(room);
        };

        const onRoomJoined = (room_uuid: string, messages: MessageAPI[]) => {
            toast('Room joined!', {
                type: 'success',
                autoClose: 50,
                hideProgressBar: true,
            });
            const room = roomStack.filter(r => r.uuid === room_uuid);

            setCurrentRoom(room[0]);
            updateMessageStack(messages);
        };

        const onRoomInvitation = (room: RoomAPI) => {
            toast('New invitation received', {
                type: 'info',
                hideProgressBar: true,
            });
            updateRoomStack(prev => [room, ...prev]);
        };

        const onMessageSubmitted = (message: MessageAPI) => {
            const roomId = message.room_uuid;

            if (!currentRoom || currentRoom.uuid !== roomId) {
                toast('New message received', {type: 'info'});
                return;
            }

            updateMessageStack(prev => [...prev, message]);
        };

        const onAuthorizationError = (err_msg: string) => {
            // logout user
            setAuthenticatedUser(null);
            setRequest('login');
            toast(err_msg, {
                type: 'error',
            });
        };

        const onRequestError = (err_msg: string) => {
            toast(err_msg, {
                type: 'error',
            });
        };

        const clean_up = () => {
            socket.off('chat:created', onRoomCreated);
            socket.off('room:joined', onRoomJoined);
            socket.off('room:invitation', onRoomInvitation);
            socket.off('message:submitted', onMessageSubmitted);
            socket.off('user:authorization_error', onAuthorizationError);
            socket.off('user:request_error', onRequestError);
        };

        socket.on('chat:created', onRoomCreated);
        socket.on('room:joined', onRoomJoined);
        socket.on('room:invitation', onRoomInvitation);
        socket.on('message:submitted', onMessageSubmitted);
        socket.on('user:authorization_error', onAuthorizationError);
        socket.on('user:request_error', onRequestError);

        return clean_up;
    }, [currentRoom, user, roomStack, setAuthenticatedUser, setRequest]);

    const renderChatWindow = () => {
        if (!roomStack.length) {
            return (
                <div className="flex flex-row gap-1 items-center justify-center">
                    <div>Add a friend</div>
                    <MdPersonAddAlt1 className="inline" />
                    <div>using their username.</div>
                </div>
            );
        } else if (!currentRoom) {
            return (
                <>
                    <div>
                        <b>Join a Room</b> to start chatting!
                    </div>
                    <div className="flex flex-row gap-1 items-center justify-center">
                        <div>or, add a friend</div>
                        <MdPersonAddAlt1 className="inline" />
                        <div>using their username.</div>
                    </div>
                </>
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
