import {useState} from 'react';

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
import useSelf from '@/hooks/useSelf';
import useContacts from '@/hooks/useContacts';
import getSocket from '@/socket';

export default function AppSidebarDMPopover() {
    const socket = getSocket();
    const [search, setSearch] = useState<string>('');
    const [members, setMembers] = useState<(number | bigint)[]>([]);
    const {data: user, isLoading: isUserLoading} = useSelf();
    const {
        data: contacts,
        isLoading: isContactsLoading,
        isError: isContactsError,
    } = useContacts();

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
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <ScrollArea>
                    <div className="pr-4">
                        {isContactsLoading || isContactsError || !contacts ? (
                            <></>
                        ) : (
                            contacts
                                .filter(contact =>
                                    contact.username.startsWith(search),
                                )
                                .map(contact => (
                                    <div
                                        key={contact.id}
                                        className={`
                                    text-sm p-1 hover:bg-accent flex
                                    flex-row items-center gap-3 cursor-pointer
                                    ${members.includes(contact.id) ? 'bg-accent' : ''}`}
                                        onClick={() => {
                                            setMembers(prev => {
                                                if (prev.includes(contact.id)) {
                                                    return prev.filter(
                                                        id => id !== contact.id,
                                                    );
                                                } else {
                                                    return [
                                                        ...prev,
                                                        contact.id,
                                                    ];
                                                }
                                            });
                                        }}
                                    >
                                        <MiniProfile
                                            title={contact.username}
                                            status="online"
                                        />
                                    </div>
                                ))
                        )}
                    </div>
                </ScrollArea>
                <Button
                    className="w-full"
                    disabled={isUserLoading || !user}
                    onClick={() => {
                        if (!isUserLoading && user) {
                            if (!members) {
                                return;
                            }
                            console.log(
                                `Creating groups with ${[user.id, ...members]}`,
                            );
                            socket.emit('group:create', null, [
                                user.id,
                                ...members,
                            ]);
                            setMembers([]);
                        }
                    }}
                >
                    Create DM
                </Button>
            </PopoverContent>
        </Popover>
    );
}
