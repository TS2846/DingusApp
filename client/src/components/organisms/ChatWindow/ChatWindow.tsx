import {useRef, useEffect, useState} from 'react';

import Message from '@/components/molecules/Message';
import {MessageAPI} from '@/interfaces/apiInterfaces';
import {scrollToTop} from '@/helpers/uiHelpers';
import {socket} from '@/socket.ts';
import {useRoomContext} from '@/contexts/RoomContext.ts';
import {UserAPI} from '@/interfaces/apiInterfaces.ts';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';

type ChatWindowProps = {
    messageStack: MessageAPI[];
};

export default function ChatWindow({messageStack}: ChatWindowProps) {
    const chatBottomRef = useRef<HTMLDivElement>(null);
    const currentRoom = useRoomContext();
    const [members, setMembers] = useState<Map<string, UserAPI>>(new Map());
    const [friendUsername, setFriendUsername] = useState('');

    const onAddFriend = (friend_username: string) => {
        socket.emit('group:add', currentRoom?.uuid, friend_username);
        setFriendUsername('');
    };

    useEffect(() => {
        socket.emit('user:get_room_members_req', currentRoom?.uuid);

        const onGetMembersResponse = (members: UserAPI[]) => {
            const members_map: [string, UserAPI][] = members.map(m => [
                m.uuid,
                m,
            ]);

            setMembers(new Map(members_map));
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
            [&::-webkit-scrollbar-thumb]:bg-gray-300
            relative"
            ref={chatBottomRef}
        >
            {messageStack.map((message, index) => (
                <Message
                    key={index}
                    sender_username={
                        members.get(message.sender_uuid)?.username ||
                        message.sender_uuid
                    }
                    body={message.body}
                />
            ))}
            <div ref={chatBottomRef}></div>
            <div className="rounded-md absolute top-0 w-full h-16 flex flex-row items-center justify-between px-5 bg-purple-700 text-white">
                <div>{`Members: ${Array.from(members.values()).reduce((acc: string, m, i, l) => acc + m.username + (i === l.length - 2 ? ' & ' : i === l.length - 1 ? '' : ', '), '')}`}</div>
                <form>
                    <Input
                        className="py-3 mx-2 text-black"
                        value={friendUsername}
                        onChange={e => setFriendUsername(e.target.value)}
                    />
                    <Button
                        type="submit"
                        ButtonLabel="Add Friend"
                        onClick={e => {
                            e.preventDefault();
                            onAddFriend(friendUsername);
                        }}
                        className="font-medium bg-purple-950"
                    />
                </form>
            </div>
        </div>
    );
}
