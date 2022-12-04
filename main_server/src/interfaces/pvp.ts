import { UserStatus } from "./user";


interface PvpPlayer {
    socketId:string;
    userStatus: UserStatus;
    target?: string|undefined; // username
    selectSkill?: string|undefined; // skillname
}

export {
    PvpPlayer
}