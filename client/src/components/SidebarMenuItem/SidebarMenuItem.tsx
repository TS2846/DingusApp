import {IconType} from 'react-icons';
import {twMerge} from 'tailwind-merge';

interface SidebarMenuItemProps {
    title: string;
    Icon: IconType;
    iconSize?: number; // Icon size in pixels. Default is 25.
    selected?: boolean;
    onClick: () => void;
}

export default function SidebarMenuItem({
    title,
    Icon,
    iconSize = 25,
    selected = false,
    onClick,
}: SidebarMenuItemProps) {
    return (
        <li
            className={twMerge(
                'grid grid-cols-7 hover:bg-muted py-3 hover:text-primary rounded-sm cursor-pointer',
                selected ? 'bg-muted text-primary' : '',
            )}
            onClick={onClick}
        >
            <Icon size={iconSize} className="col-span-2 place-self-center" />
            <span className="col-span-5">{title}</span>
        </li>
    );
}
