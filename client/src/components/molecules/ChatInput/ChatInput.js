import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';

export default function ChatInput({
    messageInput,
    setMessageInput,
    onMessageSubmit,
}) {
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
                    onChange={(e) => setMessageInput(e.target.value)}
                    type="text"
                />
                <Button
                    label="Send"
                    className="px-5 py-2 bg-white"
                    type="submit"
                    onClick={onMessageSubmit}
                />
            </div>
        </form>
    );
}
