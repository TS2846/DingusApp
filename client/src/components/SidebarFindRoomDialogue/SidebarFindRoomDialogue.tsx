import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog.tsx';
import {Button} from '@/components/ui/button.tsx';
import {Input} from '@/components/ui/input.tsx';
import {ScrollArea} from '@/components/ui/scroll-area.tsx';
import MiniProfile from '@/components/MiniProfile';
import {RoomAPI} from '@/interfaces/apiInterfaces.ts';

interface SidebarFindRoomDialogueProps {
    rooms: RoomAPI[];
}

export default function SidebarFindRoomDialogue({
    rooms,
}: SidebarFindRoomDialogueProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Find or start a conversation</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] h-full">
                <DialogHeader>
                    <DialogTitle>Search</DialogTitle>
                </DialogHeader>
                <Input
                    className="text-2xl p-2 h-16"
                    placeholder="Where would you like to go"
                />
                <ScrollArea>
                    <div className="pr-4">
                        {rooms.map((contact, i) => (
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
                        ))}
                    </div>
                </ScrollArea>
                <DialogFooter className="sm:justify-start">
                    <span className="text-sm">
                        <span className="text-green-500 font-bold">
                            Protip:
                        </span>{' '}
                        Start searches with{' '}
                        <span className="p-1 bg-gray-600 rounded font-mono">
                            @
                        </span>{' '}
                        ,{' '}
                        <span className="p-1 bg-gray-600 rounded font-mono">
                            #
                        </span>{' '}
                        ,{' '}
                        <span className="p-1 bg-gray-600 rounded font-mono">
                            !
                        </span>{' '}
                        to narrow results.
                    </span>
                </DialogFooter>
                <DialogDescription>
                    <span className="text-xs">
                        Search for chats and groups.
                    </span>
                </DialogDescription>
            </DialogContent>
        </Dialog>
    );
}
