const roomRe = /^room\/(?<room>\d+)$/;

export const getRoomIDFromRoute = (route: string): number => {
    return parseInt(route.match(roomRe)?.groups?.room || '0');
};

export const routeIsRoom = (route: string): boolean => {
    return roomRe.test(route);
};
