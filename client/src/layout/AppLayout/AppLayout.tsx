import React, {useState} from 'react';

import {SidebarProvider} from '@/components/ui/sidebar.tsx';
import AppSidebar from '@/components/AppSidebar';
import RoomContext from '@/contexts/RoomContext';

export default function AppLayout({children}: {children: React.ReactNode}) {
    const [currentRoomID, setCurrentRoomID] = useState<number | bigint | null>(
        null,
    );
    return (
        <RoomContext.Provider value={[currentRoomID, setCurrentRoomID]}>
            <SidebarProvider>
                <AppSidebar />
                <main className="w-full grid grid-rows-10 bg-secondary">
                    {currentRoomID ? children : <></>}
                </main>
            </SidebarProvider>
        </RoomContext.Provider>
    );
}
