import { HttpException } from "../common";
import { UserStatus } from "./user";


export interface DeadReport {
    field: string;
    script: string;
    userStatus: UserStatus;
}

export interface AutoBattleResult {
    [key: string]: (socketId: string, script: string, userStatus: UserStatus) => Promise<HttpException|void>
}


export interface BattleCacheInterface {
    dungeonLevel?: number;
    monsterId?: number;
    autoAttackTimer?: NodeJS.Timer;
    skillAttackTimer?: NodeJS.Timer;
    isMonsterDeadTimer?: NodeJS.Timer;
    quit?: boolean;
    dead?: string;
    userStatus?: UserStatus;
}