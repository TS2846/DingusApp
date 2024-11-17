import {ScrollArea, ScrollBar} from '@/components/ui/scroll-area.tsx';
import {useEffect, useRef} from 'react';

import Message from '@/components/Message';
import {scrollToTop} from '@/helpers/uiHelpers.ts';
import {useCurrentRoom} from '@/contexts/RoomContext';
import {useMessages} from '@/hooks/useMessages';
import {useRoomMembers} from '@/hooks/useRooms.ts';

export default function ChatWindow() {
    const currentRoomUUID = useCurrentRoom()[0];
    const {data: messages, isLoading: messagesLoading} =
        useMessages(currentRoomUUID);
    const {data: members, isLoading: membersLoading} =
        useRoomMembers(currentRoomUUID);
    const chatBottomRef = useRef(null);

    useEffect(() => {
        scrollToTop(chatBottomRef);
    }, [messages]);
    return (
        <ScrollArea className="h-full overflow-y-auto bg-primary-foreground">
            <div className="mx-5 h-96 my-2">
                {messagesLoading ? (
                    <></>
                ) : (
                    messages!.map((message, index) => (
                        <Message
                            key={index}
                            sender={
                                membersLoading
                                    ? message.sender_uuid
                                    : members!.find(
                                          m => m.uuid === message.sender_uuid,
                                      )!.username
                            }
                            body={message.body}
                        />
                    ))
                )}
                <div ref={chatBottomRef}></div>
            </div>
            <ScrollBar />
        </ScrollArea>
    );
}
