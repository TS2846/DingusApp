import {IconType} from 'react-icons';

interface SidebarMenuItemProps {
    title: string;
    Icon: IconType;
    iconSize?: number; // Icon size in pixels. Default is 25.
}

export default function SidebarMenuItem({
    title,
    Icon,
    iconSize = 25,
}: SidebarMenuItemProps) {
    return (
        <li className="grid grid-cols-7 hover:bg-muted py-3 hover:text-primary rounded-sm cursor-pointer">
            <Icon size={iconSize} className="col-span-2 place-self-center" />
            <span className="col-span-5">{title}</span>
        </li>
    );
}
