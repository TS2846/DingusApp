import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover.tsx';
import {FaPlus} from 'react-icons/fa6';
import {Input} from '@/components/ui/input.tsx';
import {ScrollArea} from '@/components/ui/scroll-area.tsx';
import MiniProfile from '@/components/MiniProfile';
import {Button} from '@/components/ui/button.tsx';
import {RoomAPI} from '@/interfaces/apiInterfaces.ts';

interface AppSidebarDMPopoverProps {
    contacts: RoomAPI[];
}

export default function AppSidebarDMPopover({
    contacts,
}: AppSidebarDMPopoverProps) {
    return (
        <Popover>
            <PopoverTrigger>
                <FaPlus className="cursor-pointer" />
            </PopoverTrigger>
            <PopoverContent className="w-80 flex flex-col gap-4 h-96">
                <div>
                    <div className="text-lg">Select Friends</div>
                    <div className="text-xs">You can add 9 more friends</div>
                </div>
                <Input
                    className="bg-background"
                    placeholder="Type the name of a friend"
                />
                <ScrollArea>
                    <div className="pr-4">
                        {contacts.map((contact, i) => (
                            <>
                                <div
                                    key={2 * i}
                                    className="
                                        text-sm p-1 hover:bg-accent flex
                                        flex-row items-center gap-3 cursor-pointer
                                        "
                                >
                                    <MiniProfile
                                        key={2 * i + 1}
                                        title={contact.title}
                                        status="online"
                                    />
                                </div>
                            </>
                        ))}
                    </div>
                </ScrollArea>
                <Button className="w-full">Create DM</Button>
            </PopoverContent>
        </Popover>
    );
}
