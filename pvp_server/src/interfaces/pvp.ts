import { UserStatus } from "./user";

interface PvpPlayer {
    socketId:string;
    userStatus: UserStatus;
}

// key에 User의 name
interface PvpUser {
    [key: string]: PvpPlayer;
}

export {
    PvpPlayer,
    PvpUser,
}