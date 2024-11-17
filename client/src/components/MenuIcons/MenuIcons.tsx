import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip.tsx';
import {IconType} from 'react-icons';

interface MenuIconsProps {
    Icon: IconType;
    tooltipMessage: string;
}

export default function MenuIcons({Icon, tooltipMessage}: MenuIconsProps) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <Icon className="cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                    <span>{tooltipMessage}</span>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
