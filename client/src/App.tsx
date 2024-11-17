import '@/App.css';

import {QueryClientProvider, QueryClient} from '@tanstack/react-query';

import ThemeProvider from '@/components/ThemeProvider';
import UserEntry from '@/pages/UserEntry';

const client = new QueryClient();

export default function App() {
    return (
        <QueryClientProvider client={client}>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <UserEntry />
            </ThemeProvider>
        </QueryClientProvider>
    );
}
