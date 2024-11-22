import '@/App.css';

import {QueryClientProvider, QueryClient} from '@tanstack/react-query';
import {useState} from 'react';

import ThemeProvider from '@/components/ThemeProvider';
import UserEntry from '@/pages/UserEntry';
import RouteContext from './contexts/RouteContext';

const client = new QueryClient();

export default function App() {
    const [route, setRoute] = useState<string>('login');
    const [isAuthenticated, setAuthenticated] = useState<boolean>(false);
    const routeState = {
        route: route,
        isAuthenticated: isAuthenticated,
        setRoute: (route: string): void => {
            if (['login', 'signup'].includes(route)) {
                setRoute(route);
            } else if (isAuthenticated) {
                setRoute(route);
            } else {
                setRoute('login');
            }
        },
        setAuthenticated: (value: boolean): void => {
            if (!value) {
                setAuthenticated(false);
                setRoute('login');
            } else {
                setAuthenticated(true);
                setRoute('friends');
            }
        },
    };

    return (
        <QueryClientProvider client={client}>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <RouteContext.Provider value={routeState}>
                    <UserEntry />
                </RouteContext.Provider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
