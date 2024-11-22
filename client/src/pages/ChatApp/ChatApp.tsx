import {useEffect} from 'react';
import {useQueryClient} from '@tanstack/react-query';

import getSocket from '@/socket';
import {SidebarProvider} from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import {useRoute} from '@/contexts/RouteContext';
import {routeIsRoom} from '@/helpers/routeHelpers';
import Room from '@/pages/ChatApp/Room';
import Friends from '@/pages/ChatApp/Friends';
import ChatBot from '@/pages/ChatApp/ChatBot';
import AppLayout from '@/layout/AppLayout';

export default function ChatApp() {
    const client = useQueryClient();
    const {route} = useRoute();

    useEffect(() => {
        const socket = getSocket();
        socket.connect();

        const onNewMessage = (room_id: number | bigint) => {
            client.invalidateQueries({
                queryKey: ['rooms', room_id, 'messages'],
            });
        };

        const onGroupCreated = () => {
            client.invalidateQueries({
                queryKey: ['rooms'],
            });
        };

        socket.on('message:new', onNewMessage);
        socket.on('group:created', onGroupCreated);

        return () => {
            socket.off('message:new', onNewMessage);
            socket.off('group:created', onGroupCreated);
            socket.disconnect();
        };
    }, [client]);

    return (
        <SidebarProvider>
            <AppSidebar />
            <AppLayout>
                {route === 'friends' ? (
                    <Friends />
                ) : route === 'chatbot' ? (
                    <ChatBot />
                ) : routeIsRoom(route) ? (
                    <Room />
                ) : (
                    <></>
                )}
            </AppLayout>
        </SidebarProvider>
    );
}
