import {ScrollArea, ScrollBar} from '@/components/ui/scroll-area.tsx';
import {useEffect, useRef} from 'react';

import Message from '@/components/Message';
import {scrollToTop} from '@/helpers/uiHelpers.ts';
import {useMessages} from '@/hooks/useRooms';
import {useRoomMembers} from '@/hooks/useRooms.ts';
import {useRoute} from '@/contexts/RouteContext';
import {getRoomIDFromRoute} from '@/helpers/routeHelpers';

export default function ChatWindow() {
    const {route} = useRoute();
    const currentRoomID = getRoomIDFromRoute(route);
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
                {messages ? (
                    messages.map(message => (
                        <Message
                            key={message.id}
                            sender={
                                members
                                    ? members.find(
                                          m => m.id === message.sender_id,
                                      )?.username || ''
                                    : membersLoading
                                      ? 'Loading...'
                                      : 'Unknown'
                            }
                            body={message.body}
                        />
                    ))
                ) : messagesLoading ? (
                    <div>Loading...</div>
                ) : (
                    <></>
                )}
                <div ref={chatBottomRef}></div>
            </div>
            <ScrollBar />
        </ScrollArea>
    );
}
