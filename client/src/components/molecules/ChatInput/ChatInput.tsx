import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import {useRoomContext} from '@/contexts/RoomContext';
import {useUserContext} from '@/contexts/UserContext';
import {socket} from '@/socket';

type ChatInputProps = {
    messageInput: string;
    setMessageInput: React.Dispatch<React.SetStateAction<string>>;
};

export default function ChatInput({
    messageInput,
    setMessageInput,
}: ChatInputProps) {
    const user = useUserContext();
    const room = useRoomContext();

    const onMessageSubmit = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    ) => {
        e.preventDefault();
        if (!messageInput) return;

        socket.emit(
            'message:submit',
            user?.uuid,
            room?.uuid,
            Date.now(),
            messageInput,
        );
        setMessageInput('');
    };

    return (
        <form
            className="w-full flex flex-col gap-4 items-start"
            autoComplete="off"
        >
            <div className="flex flex-row gap-2 w-full items-start">
                <Input
                    id="message-input"
                    className="grow"
                    value={messageInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setMessageInput(e.target.value)
                    }
                    type="text"
                />
                <Button
                    ButtonLabel="Send"
                    className="px-5 py-2 bg-white"
                    type="submit"
                    onClick={onMessageSubmit}
                />
            </div>
        </form>
    );
}
