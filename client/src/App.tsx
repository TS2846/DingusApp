import '@/App.css';

import {useState} from 'react';

import ChatApp from '@/components/pages/ChatApp';
import UserEntry from './components/pages/UserEntry';
import {QueryClientProvider, QueryClient} from '@tanstack/react-query';

export default function App() {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <UserEntry>
                <ChatApp />
            </UserEntry>
        </QueryClientProvider>
    );
}
