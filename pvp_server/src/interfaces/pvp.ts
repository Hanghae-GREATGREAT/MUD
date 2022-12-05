import { UserStatus } from "./user";


interface PvpPlayer {
    socketId:string;
    userStatus?: UserStatus;
    target?: string; // username
    selectSkill?: string; // skillname
}

interface pvpResult {
    userNames: string[];
    target: string[];
    realDamage: number[];
    roomName?: string;
}

export {
    PvpPlayer,
    pvpResult,
}