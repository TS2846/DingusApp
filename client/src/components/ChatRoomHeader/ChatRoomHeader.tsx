import {PiPhoneCallFill} from 'react-icons/pi';
import {FaVideo} from 'react-icons/fa6';
import {BiSolidUserRectangle} from 'react-icons/bi';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';

import {Input} from '@/components/ui/input';
import MiniProfile from '@/components/MiniProfile';
import MenuIcons from '@/components/MenuIcons';
import {useRooms} from '@/hooks/useRooms';
import {useRoomMembers} from '@/hooks/useRooms';
import {useRoute} from '@/contexts/RouteContext';
import {getRoomIDFromRoute} from '@/helpers/routeHelpers';

export default function ChatRoomHeader() {
    const {route} = useRoute();
    const currentRoomID = getRoomIDFromRoute(route);
    const {data: rooms, isLoading, isError} = useRooms();
    const {data: members, isLoading: isMembersLoading} = useRoomMembers(
        currentRoomID!,
    );

    const currentRoom = rooms?.find(room => room.id === currentRoomID);

    const renderRoomHeader = () => {
        if (isLoading || isError) {
            return <></>;
        } else {
            const currentRoom = rooms?.find(room => room.id === currentRoomID);
            return (
                <MiniProfile
                    title={currentRoom?.title || ''}
                    status="online"
                    statusBorder="border-secondary"
                />
            );
        }
    };

    return (
        <>
            <div className="flex flex-row gap-2 items-center h-16">
                {renderRoomHeader()}
            </div>
            <div className="flex flex-row items-center gap-5">
                <div className="flex flex-row items-center gap-3 text-xl text-primary">
                    <MenuIcons
                        Icon={PiPhoneCallFill}
                        tooltipMessage="Start a Voice Call"
                    />
                    <MenuIcons
                        Icon={FaVideo}
                        tooltipMessage="Start a Video Call"
                    />
                    <Sheet>
                        <SheetTrigger>
                            <MenuIcons
                                Icon={BiSolidUserRectangle}
                                tooltipMessage="Show Members"
                            />
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>
                                    {`Members of ${currentRoom?.title || ''}`}
                                </SheetTitle>
                            </SheetHeader>
                            <section className="flex flex-col gap-2">
                                {isMembersLoading || !members ? (
                                    <></>
                                ) : (
                                    members.map(member => (
                                        <li className="flex flex-row gap-2 items-center h-16">
                                            <MiniProfile
                                                title={member.username}
                                                status="online"
                                            />
                                        </li>
                                    ))
                                )}
                            </section>
                        </SheetContent>
                    </Sheet>
                </div>
                <Input className="bg-background" placeholder="Search" />
            </div>
        </>
    );
}
