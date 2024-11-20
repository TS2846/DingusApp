import {ScrollArea, ScrollBar} from '@/components/ui/scroll-area.tsx';
import {useEffect, useRef} from 'react';

import Message from '@/components/Message';
import {scrollToTop} from '@/helpers/uiHelpers.ts';
import {useCurrentRoom} from '@/contexts/RoomContext';
import {useMessages} from '@/hooks/useRooms';
import {useRoomMembers} from '@/hooks/useRooms.ts';

export default function ChatWindow() {
    const currentRoomID = useCurrentRoom()[0]!;
    const {data: messages, isLoading: messagesLoading} =
        useMessages(currentRoomID);
    const {data: members, isLoading: membersLoading} =
        useRoomMembers(currentRoomID);
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
                    messages!.map(message => (
                        <Message
                            key={message.id}
                            sender={
                                membersLoading
                                    ? ''
                                    : members?.find(
                                          m => m.id === message.sender_id,
                                      )?.username || ''
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
