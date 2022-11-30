import { UserStatus } from "./user";


export interface DeadReport {
    field: string;
    script: string;
    userStatus: UserStatus;
}


export interface BattleCacheInterface {
    dungeonLevel?: number;
    monsterId?: number;
    autoAttackTimer?: NodeJS.Timer;
    skillAttackTimer?: NodeJS.Timer;
    isMonsterDeadTimer?: NodeJS.Timer;
    quit?: boolean;
    dead?: string;
}