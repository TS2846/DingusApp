import {createContext, useContext} from 'react';

interface RouteStateType {
    route: string;
    isAuthenticated: boolean;
    setRoute: (route: string) => void;
    setAuthenticated: (value: boolean) => void;
}

const RouteContext = createContext<null | RouteStateType>(null);

export const useRoute = (): RouteStateType => {
    const value = useContext(RouteContext);

    if (value === null) {
        throw new Error('useRoute must be used inside a RouteContext');
    }

    return value;
};

export default RouteContext;
