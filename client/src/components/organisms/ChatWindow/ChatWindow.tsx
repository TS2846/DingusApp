import {useRef, useEffect} from 'react';

import Message from '@/components/molecules/Message';
import {MessageAPI} from '@/interfaces/apiInterfaces';
import {scrollToTop} from '@/helpers/uiHelpers';

type ChatWindowProps = {
    messageStack: MessageAPI[];
};

export default function ChatWindow({messageStack}: ChatWindowProps) {
    const chatBottomRef = useRef<HTMLDivElement>(null);

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
            {messageStack.map((item, index) => (
                <Message key={index} message={item} />
            ))}
            <div ref={chatBottomRef}></div>
        </div>
    );
}
