import React, {useState} from 'react';

import {SidebarProvider} from '@/components/ui/sidebar.tsx';
import AppSidebar from '@/components/AppSidebar';
import RoomContext from '@/contexts/RoomContext';

export default function AppLayout({children}: {children: React.ReactNode}) {
    const [currentRoomUUID, setCurrentRoomUUID] = useState('');
    return (
        <RoomContext.Provider value={[currentRoomUUID, setCurrentRoomUUID]}>
            <SidebarProvider>
                <AppSidebar />
                <main className="w-full grid grid-rows-10 bg-secondary">
                    {currentRoomUUID === '' ? <></> : children}
                </main>
            </SidebarProvider>
        </RoomContext.Provider>
    );
}
