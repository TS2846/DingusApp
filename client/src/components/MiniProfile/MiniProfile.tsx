import {Avatar, AvatarFallback} from '@/components/ui/avatar.tsx';
import {
    TooltipProvider,
    TooltipContent,
    Tooltip,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface MiniProfileProps {
    title: string;
    avatarSize?: number;
    status: string;
    statusBorder?: string;
}

export default function MiniProfile({
    title,
    status,
    avatarSize = 10,
    statusBorder = 'border-background',
}: MiniProfileProps) {
    const statusColor =
        status === 'online'
            ? 'bg-green-500'
            : status === 'busy'
              ? 'bg-red-500'
              : status === 'idle'
                ? 'bg-yellow-500'
                : 'bg-gray-500';
    return (
        <>
            <span className="relative">
                <Avatar className={`h-${avatarSize} w-${avatarSize}`}>
                    <AvatarFallback className="bg-muted">
                        {title.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger
                            className={`w-4 h-4 rounded-full absolute
                                        bottom-0 right-0 border-4 ${statusBorder}
                                        ${statusColor}
                                        `}
                        >
                            <span></span>
                        </TooltipTrigger>
                        <TooltipContent>{status}</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </span>
            <span className="font-bold">{title}</span>
        </>
    );
}
