import React from 'react';

interface ChatRoomLayoutProps {
    ChatHeader: React.ReactNode;
    ChatWindow: React.ReactNode;
    ChatInput: React.ReactNode;
}

export default function ChatRoomLayout({
    ChatHeader,
    ChatWindow,
    ChatInput,
}: ChatRoomLayoutProps) {
    return (
        <>
            <section className="row-span-1 bg-secondary drop-shadow-lg flex flex-row items-center justify-between px-5">
                {ChatHeader}
            </section>
            <section className="row-span-8">{ChatWindow}</section>
            <section className="row-span-1 pt-1 bg-primary-foreground">
                {ChatInput}
            </section>
        </>
    );
}
