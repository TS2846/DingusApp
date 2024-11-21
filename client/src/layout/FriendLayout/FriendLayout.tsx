import React from 'react';

interface ChatRoomLayoutProps {
    FriendHeader: React.ReactNode;
    FriendWindow: React.ReactNode;
}

export default function ChatRoomLayout({
    FriendHeader,
    FriendWindow,
}: ChatRoomLayoutProps) {
    return (
        <>
            <section className="row-span-1 bg-secondary drop-shadow-lg flex flex-row items-center justify-between px-5">
                {FriendHeader}
            </section>
            <section className="row-span-9">{FriendWindow}</section>
        </>
    );
}
