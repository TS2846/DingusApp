import React, {useState, useEffect} from 'react';
import {useQueryClient} from '@tanstack/react-query';

import {SidebarProvider} from '@/components/ui/sidebar.tsx';
import AppSidebar from '@/components/AppSidebar';
import RoomContext from '@/contexts/RoomContext';
import PageStatusContext, {pageStatusType} from '@/contexts/PageStatusContext';

import FriendWindow from '@/components/FriendWindow';
import FriendHeader from '@/components/FriendHeader';
import FriendLayout from '@/layout/FriendLayout';

import getSocket from '@/socket';

export default function AppLayout({children}: {children: React.ReactNode}) {
    const [currentRoomID, setCurrentRoomID] = useState<number | bigint | null>(
        null,
    );
    const client = useQueryClient();
    useEffect(() => {
        const socket = getSocket();
        socket.connect();

        const onNewMessage = (room_id: number | bigint) => {
            client.invalidateQueries({
                queryKey: ['rooms', room_id, 'messages'],
            });
        };

        const onGroupCreated = () => {
            console.log('Group Created!!!!');
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
    const [pageStatus, setPageStatus] = useState<pageStatusType>('friends');

    const renderChildren = () => {
        if (pageStatus === 'room' && currentRoomID) {
            return children;
        } else if (pageStatus === 'friends') {
            return (
                <FriendLayout
                    FriendHeader={<FriendHeader />}
                    FriendWindow={<FriendWindow />}
                />
            );
        } else {
            return <></>;
        }
    };

    return (
        <PageStatusContext.Provider value={[pageStatus, setPageStatus]}>
            <RoomContext.Provider value={[currentRoomID, setCurrentRoomID]}>
                <SidebarProvider>
                    <AppSidebar />
                    <main className="w-full grid grid-rows-10 bg-secondary">
                        {renderChildren()}
                    </main>
                </SidebarProvider>
            </RoomContext.Provider>
        </PageStatusContext.Provider>
    );
}
