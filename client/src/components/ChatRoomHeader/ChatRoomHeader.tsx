import {PiPhoneCallFill} from 'react-icons/pi';
import {FaVideo} from 'react-icons/fa6';
import {BiSolidUserRectangle} from 'react-icons/bi';

import {Input} from '@/components/ui/input';
import MiniProfile from '@/components/MiniProfile';
import MenuIcons from '@/components/MenuIcons';
import {useRoom} from '@/hooks/useRooms';
import {useCurrentRoom} from '@/contexts/RoomContext';

export default function ChatRoomHeader() {
    const currentRoomUUID = useCurrentRoom()[0];
    const {data: currentRoom} = useRoom(currentRoomUUID);

    return (
        <>
            <div className="flex flex-row gap-2 items-center h-16">
                <MiniProfile
                    title={currentRoom?.title || ''}
                    status="online"
                    statusBorder="border-secondary"
                />
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
                    <MenuIcons
                        Icon={BiSolidUserRectangle}
                        tooltipMessage="Show User Profile"
                    />
                </div>
                <Input className="bg-background" placeholder="Search" />
            </div>
        </>
    );
}
