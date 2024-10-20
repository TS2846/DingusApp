import '@/App.css';

import ChatApp from '@/components/pages/ChatApp';
import UserEntry from './components/pages/UserEntry';

export default function App() {
    return (
        <UserEntry>
            <ChatApp />
        </UserEntry>
    );
}
