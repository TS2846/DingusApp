import {useRef, useEffect} from 'react';
import {FaUser} from 'react-icons/fa';

function Message({user, message}) {
    return (
        <div className="flex flex-col items-start px-2 py-2 bg-gray-50">
            <span className="text-sm flex flex-row items-center gap-1">
                <span>{<FaUser />}</span>
                <span className="text-gray-400 font-semibold">{user}</span>
            </span>
            <div className="text-base pl-5">{message}</div>
        </div>
    );
}

export default function ChatWindow({
    messageInput,
    setMessageInput,
    onMessageSubmit,
    messageStack,
}) {
    const chatBottomRef = useRef(null);

    useEffect(() => {
        console.log('Scrolling initiating..');

        if (chatBottomRef.current) {
            console.log('Scrolling To bot');
            chatBottomRef.current.scrollTop =
                chatBottomRef.current.scrollHeight;
        }
    }, [messageStack]);

    return (
        <>
            <div
                id="chat-window"
                className="w-full md:w-7/12 h-96 border border-black flex flex-col gap-2 overflow-y-auto py-2"
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

            <form className="w-full md:w-1/2 flex flex-col gap-4 items-start">
                <div className="flex flex-col w-full items-start">
                    <label htmlFor="message-input">Message</label>
                    <div className="flex flex-row gap-2 w-full items-start">
                        <input
                            id="message-input"
                            className="px-2 py-2 grow rounded-md border border-black"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            type="text"
                        />
                        <button
                            type="submit"
                            onClick={onMessageSubmit}
                            className="px-5 py-2 rounded-md border border-black"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </form>
        </>
    );
}
