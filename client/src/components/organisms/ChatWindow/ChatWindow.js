import {useRef, useEffect} from 'react';

import Message from '@/components/molecules/Message';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import {scrollToTop} from '@/helpers/ui_helpers';

export default function ChatWindow({
    messageInput,
    setMessageInput,
    onMessageSubmit,
    messageStack,
}) {
    const chatBottomRef = useRef(null);

    useEffect(() => {
        scrollToTop(chatBottomRef);
    }, [messageStack]);

    return (
        <>
            <div
                id="chat-window"
                className="w-2/3 md:w-7/12 h-96 border border-black flex flex-col gap-2 py-2 overflow-y-scroll 
                  [&::-webkit-scrollbar]:w-2
                  [&::-webkit-scrollbar-track]:rounded-full
                  [&::-webkit-scrollbar-track]:bg-gray-100
                  [&::-webkit-scrollbar-thumb]:rounded-full
                  [&::-webkit-scrollbar-thumb]:bg-gray-300"
                ref={chatBottomRef}
            >
                {messageStack.map((item, index) => (
                    <Message
                        key={index}
                        user={item.user}
                        message={item.message}
                    />
                ))}
                <div ref={chatBottomRef}></div>
            </div>

            <form
                className="w-full md:w-1/2 flex flex-col gap-4 items-start"
                autoComplete="off"
            >
                <div className="flex flex-col w-full items-start">
                    <label htmlFor="message-input">Message</label>
                    <div className="flex flex-row gap-2 w-full items-start">
                        <Input
                            id="message-input"
                            className="grow"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            type="text"
                        />
                        <Button
                            label="Send"
                            className="px-5 py-2"
                            type="submit"
                            onClick={onMessageSubmit}
                        />
                    </div>
                </div>
            </form>
        </>
    );
}
