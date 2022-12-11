import { UserStatus } from "./user";

interface PvpPlayer {
    socketId: string;
    userStatus: UserStatus;
}

// key에 User의 name
interface PvpUser {
    [key: string]: PvpPlayer;
}

interface PvpRooms {
    [key: string]: string | boolean;
}

export {
    PvpPlayer,
    PvpUser,
    PvpRooms,
}