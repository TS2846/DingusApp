import ChatRoomLayout from '@/layout/ChatRoomLayout';
import ChatRoomHeader from '@/components/ChatRoomHeader';
import ChatInput from '@/components/ChatInput';
import ChatWindow from '@/components/ChatWindow';

export default function Room() {
    return (
        <ChatRoomLayout
            ChatHeader={<ChatRoomHeader />}
            ChatWindow={<ChatWindow />}
            ChatInput={<ChatInput />}
        ></ChatRoomLayout>
    );
}
