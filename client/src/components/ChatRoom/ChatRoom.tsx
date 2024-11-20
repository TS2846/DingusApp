import {useEffect} from 'react';
import {useQueryClient} from '@tanstack/react-query';

import ChatRoomLayout from '@/layout/ChatRoomLayout';
import ChatRoomHeader from '@/components/ChatRoomHeader';
import ChatInput from '@/components/ChatInput';
import ChatWindow from '@/components/ChatWindow';
import getSocket from '@/socket.ts';

export default function ChatRoom() {
    const client = useQueryClient();
    useEffect(() => {
        const socket = getSocket();
        socket.connect();

        const onNewMessage = (room_id: number | bigint) => {
            client.invalidateQueries({
                queryKey: ['rooms', room_id, 'messages'],
            });
        };

        socket.on('message:new', onNewMessage);

        return () => {
            socket.off('message:new', onNewMessage);
            socket.disconnect();
        };
    }, [client]);

    return (
        <ChatRoomLayout
            ChatHeader={<ChatRoomHeader />}
            ChatWindow={<ChatWindow />}
            ChatInput={<ChatInput />}
        ></ChatRoomLayout>
    );
}
