import FriendLayout from '@/layout/FriendLayout';
import FriendHeader from '@/components/FriendHeader';
import FriendWindow from '@/components/FriendWindow';

export default function Friends() {
    return (
        <FriendLayout
            FriendHeader={<FriendHeader />}
            FriendWindow={<FriendWindow />}
        />
    );
}
