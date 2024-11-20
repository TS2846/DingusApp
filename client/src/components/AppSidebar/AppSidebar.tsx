import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
} from '@/components/ui/sidebar';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {Separator} from '@/components/ui/separator';
import {FaRobot, FaMicrophone, FaHeadphones} from 'react-icons/fa6';
import {ImExit} from 'react-icons/im';
import {FaUserFriends} from 'react-icons/fa';
import {X} from 'lucide-react';
import {useQueryClient} from '@tanstack/react-query';

import MiniProfile from '@/components/MiniProfile';
import SidebarFindRoomDialogue from '@/components/SidebarFindRoomDialogue';
import AppSidebarDMPopover from '@/components/AppSidebarDMPopover';
import SidebarMenuItem from '@/components/SidebarMenuItem';
import {useRooms} from '@/hooks/useRooms.ts';
import useSelf from '@/hooks/useSelf';
import {useAuthentication} from '@/contexts/AuthenticationContext';
import {logout} from '@/api';
import {useCurrentRoom} from '@/contexts/RoomContext';

const sidebarMenuItems = [
    {
        title: 'Friends',
        icon: FaUserFriends,
        iconSize: 25,
    },
    {
        title: 'ChatBot',
        icon: FaRobot,
        iconSize: 25,
    },
];

export default function AppSidebar() {
    const {data: rooms} = useRooms();
    const {data: selfData} = useSelf();
    const setAuthenticated = useAuthentication()[1];
    const [currentRoomID, setCurrentRoomID] = useCurrentRoom();
    const client = useQueryClient();

    const onLogout = () => {
        logout()
            .then(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                setAuthenticated(false);
                client.invalidateQueries();
            })
            .catch(console.error);
    };

    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarFindRoomDialogue rooms={rooms || []} />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent className="text-lg text-gray-400">
                        <SidebarMenu className="gap-1">
                            {sidebarMenuItems.map((item, i) => (
                                <SidebarMenuItem
                                    key={i}
                                    title={item.title}
                                    Icon={item.icon}
                                    iconSize={item.iconSize}
                                />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        <div className="flex flex-row items-center justify-between w-full">
                            <span>Direct Messages</span>
                        </div>
                        <AppSidebarDMPopover contacts={rooms || []} />
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <div className="pr-4 flex flex-col gap-1">
                            {rooms?.map((room, i) => (
                                <div
                                    key={i}
                                    className={`
                                        flex flex-row items-center justify-between
                                        hover:bg-accent cursor-pointer rounded-sm
                                        group/item ${currentRoomID === room.id ? 'bg-accent' : ''}
                                        `}
                                    onClick={() => {
                                        setCurrentRoomID(room.id);
                                    }}
                                >
                                    <div
                                        key={2 * i}
                                        className="
                                            text-sm p-1  flex
                                            flex-row items-center gap-3
                                            "
                                    >
                                        <MiniProfile
                                            key={2 * i + 1}
                                            title={room.title}
                                            status="online"
                                        />
                                    </div>
                                    <span
                                        className="text-primary-muted p-2 invisible
                                                group-hover/item:visible
                                                hover:text-primary"
                                    >
                                        <X size={15} />
                                    </span>
                                </div>
                            ))}
                        </div>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <Separator />
                <section className="flex flex-row items-center justify-between">
                    <div
                        className="
                                            text-sm p-1  flex
                                            flex-row items-center gap-3
                                            "
                    >
                        <MiniProfile
                            title={selfData?.username || ''}
                            status="online"
                        />
                    </div>
                    <div className="flex flex-row items-center justify-start gap-3 ">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <FaMicrophone
                                        size={15}
                                        className="text-primary-muted hover:text-primary cursor-pointer"
                                    />
                                </TooltipTrigger>
                                <TooltipContent>
                                    Mute/Unmute Microphone
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <FaHeadphones
                                        size={16}
                                        className="text-primary-muted hover:text-primary cursor-pointer"
                                    />
                                </TooltipTrigger>
                                <TooltipContent>Deafen</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <ImExit
                                        size={15}
                                        className="text-destructive-foreground hover:text-destructive cursor-pointer"
                                        onClick={e => {
                                            e.preventDefault();
                                            onLogout();
                                        }}
                                    />
                                </TooltipTrigger>
                                <TooltipContent>Log Out</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </section>
            </SidebarFooter>
        </Sidebar>
    );
}
