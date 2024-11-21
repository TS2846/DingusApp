import {ScrollArea, ScrollBar} from '@/components/ui/scroll-area.tsx';
import useContacts from '@/hooks/useContacts';
import {PiChatCircleDotsFill} from 'react-icons/pi';
import MiniProfile from '../MiniProfile';
import {useCurrentRoom} from '@/contexts/RoomContext';
import {usePageStatus} from '@/contexts/PageStatusContext';

export default function FriendWindow() {
    const {data} = useContacts();
    const setCurrentRoomID = useCurrentRoom()[1];
    const setPageStatus = usePageStatus()[1];
    return (
        <ScrollArea className="h-full overflow-y-auto bg-primary-foreground">
            <div className="flex flex-col gap-3 mt-2">
                {data?.map(friend => (
                    <div
                        className="flex flex-row p-3 rounded-md hover:bg-accent cursor-pointer justify-between"
                        onClick={() => {
                            setCurrentRoomID(friend.room_id);
                            setPageStatus('room');
                        }}
                    >
                        <div className="flex flex-row items-center justify-center gap-3">
                            <MiniProfile
                                title={friend.username}
                                status="online"
                            />
                        </div>
                        <div className="p-2 rounded-full bg-yellow-500 hover:bg-yellow-600">
                            <PiChatCircleDotsFill size={25} />
                        </div>
                    </div>
                ))}
            </div>
            <ScrollBar />
        </ScrollArea>
    );
}