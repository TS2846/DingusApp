import {ScrollArea, ScrollBar} from '@/components/ui/scroll-area.tsx';

export default function FriendWindow() {
    return (
        <ScrollArea className="h-full overflow-y-auto bg-primary-foreground">
            <div className="mx-5 h-96 my-2">
                THIS IS THE FUCKING FRIEND WINDOW YOU
                RETARD:1993_0_0::1993_1_0::1993_2_0::1993_3_0::1993_4_0::1993_5_0::1993_6_0:
                :1993_0_1::1993_1_1::1993_2_1::1993_3_1::1993_4_1::1993_5_1::1993_6_1:
            </div>
            <ScrollBar />
        </ScrollArea>
    );
}
