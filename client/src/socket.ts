import {io, Socket} from 'socket.io-client';

import config from '@/config';

let socket: Socket | null = null;

const getSocket = () => {
    if (!socket) {
        socket = io(config.SERVER_URI, {
            autoConnect: false,
            extraHeaders: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'x-refresh-token': localStorage.getItem('refreshToken') || '',
            },
        });
    }

    return socket;
};

export default getSocket;
