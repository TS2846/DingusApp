import {useRef, useEffect, useState} from 'react';

import Message from '@/components/molecules/Message';
import {MessageAPI} from '@/interfaces/apiInterfaces';
import {scrollToTop} from '@/helpers/uiHelpers';
import {socket} from '@/socket.ts';
import {useRoomContext} from '@/contexts/RoomContext.ts';
import {UserAPI} from '@/interfaces/apiInterfaces.ts';

type ChatWindowProps = {
    messageStack: MessageAPI[];
};

export default function ChatWindow({messageStack}: ChatWindowProps) {
    const chatBottomRef = useRef<HTMLDivElement>(null);
    const currentRoom = useRoomContext();
    const [members, setMembers] = useState<{[user_uuid: string]: UserAPI}>({});

    useEffect(() => {
        socket.emit('user:get_room_members_req', currentRoom?.uuid);

        const onGetMembersResponse = (members: UserAPI[]) => {
            const members_map = members.reduce(
                (accumulator: {[x: string]: UserAPI}, member) => {
                    accumulator[member.uuid] = member;
                    return accumulator;
                },
                {},
            );

            setMembers(members_map);
        };

        socket.on('user:get_room_members_res', onGetMembersResponse);

        return () => {
            socket.off('user:get_room_members_res', onGetMembersResponse);
        };
    }, [currentRoom]);

    useEffect(() => {
        scrollToTop(chatBottomRef);
    }, [messageStack]);

    return (
        <div
            id="chat-window"
            className="h-full w-full flex flex-col gap-2 py-2 overflow-y-scroll pt-20 pb-20
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:rounded-full
            [&::-webkit-scrollbar-track]:bg-gray-100
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-gray-300"
            ref={chatBottomRef}
        >
            {messageStack.map((message, index) => (
                <Message
                    key={index}
                    sender_username={
                        members[message.sender_uuid]?.username ||
                        message.sender_uuid
                    }
                    body={message.body}
                />
            ))}
            <div ref={chatBottomRef}></div>
        </div>
    );
}
