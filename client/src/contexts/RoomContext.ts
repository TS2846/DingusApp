import {createContext, useContext} from 'react';

const RoomContext = createContext<
    null | [string, React.Dispatch<React.SetStateAction<string>>]
>(null);

export const useCurrentRoom = (): [
    string,
    React.Dispatch<React.SetStateAction<string>>,
] => {
    const value = useContext(RoomContext);

    if (value === null) {
        throw new Error('useRoom must be used inside a RoomContext');
    }

    return value;
};

export default RoomContext;
