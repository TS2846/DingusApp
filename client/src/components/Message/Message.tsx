import {Avatar, AvatarFallback} from '@/components/ui/avatar.tsx';

type MessageProps = {
    sender: string;
    body: string;
};

export default function Message({sender, body}: MessageProps) {
    return (
        <div className="mb-5 flex flex-row gap-2 items-center">
            <Avatar>
                <AvatarFallback className="bg-muted">
                    {sender.charAt(0).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div>
                <span className="text-sm font-bold">{sender}</span>
                <p>{body}</p>
            </div>
        </div>
    );
}
