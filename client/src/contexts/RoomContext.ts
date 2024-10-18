import {createContext, useContext} from 'react';

import {RoomAPI} from '@/interfaces/apiInterfaces';

const RoomContext = createContext<RoomAPI | undefined>(undefined);

export default RoomContext;

export function useRoomContext() {
    return useContext(RoomContext);
}
