import {useState} from 'react';
import {IoSend} from 'react-icons/io5';
import {Button} from '@/components/ui/button.tsx';
import {Textarea} from '@/components/ui/textarea.tsx';

import getSocket from '@/socket.ts';
import useSelf from '@/hooks/useSelf';
import {useCurrentRoom} from '@/contexts/RoomContext';

export default function ChatInput() {
    const socket = getSocket();
    const [messageInput, setMessageInput] = useState('');
    const {data: self, isLoading: userLoading} = useSelf();
    const currentRoomID = useCurrentRoom()[0];

    const onMessageSubmit = () => {
        const body = messageInput.trim();
        if (body === '' || userLoading) return;

        setMessageInput('');

        socket.emit('message:send', self!.id, currentRoomID, body);
    };

    return (
        <form
            className="flex flex-col gap-4 items-start px-5 bg-primary-foreground"
            autoComplete="off"
        >
            <div className="flex flex-row gap-2 w-full items-center">
                <Textarea
                    id="message-input"
                    className="resize-none grow bg-muted font-mono"
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter' && e.shiftKey) {
                            e.preventDefault();
                            setMessageInput(prev => prev + '\n');
                            return;
                        }
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            onMessageSubmit();
                            return;
                        }
                    }}
                />
                <Button
                    className="px-5 py-2"
                    type="submit"
                    onClick={e => {
                        e.preventDefault();
                        onMessageSubmit();
                    }}
                >
                    <IoSend />
                </Button>
            </div>
        </form>
    );
}
