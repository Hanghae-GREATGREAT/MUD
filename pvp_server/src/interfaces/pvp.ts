import { UserStatus } from "./user";


interface PvpPlayer {
    socketId:string;
    userStatus?: UserStatus;
    target?: string|undefined; // username
    selectSkill?: string; // skillname
}

interface Arranging {
    multiples: number[];
    attacks: number[];
    target: string[];
    userNames: string[];
    roomName?: string;
}

interface pvpResult {
    teamA: number[];
    teamB: number[];
    target: string[];
    userNames: string[];
    realDamage: number[];
    roomName?: string;
}

export {
    PvpPlayer,
    Arranging,
    pvpResult,
}