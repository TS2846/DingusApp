import {createContext, useContext} from 'react';

const RoomContext = createContext<
    | null
    | [
          number | bigint | null,
          React.Dispatch<React.SetStateAction<number | bigint | null>>,
      ]
>(null);

export const useCurrentRoom = (): [
    number | bigint | null,
    React.Dispatch<React.SetStateAction<number | bigint | null>>,
] => {
    const value = useContext(RoomContext);

    if (value === null) {
        throw new Error('useRoom must be used inside a RoomContext');
    }

    return value;
};

export default RoomContext;
