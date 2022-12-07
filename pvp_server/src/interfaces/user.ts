import { InferAttributes } from 'sequelize';
import { Items, Skills } from '../db/models';


interface SignupForm {
    username: string;
    password: string;
    confirm?: string;
}

interface UserCache {
    userId: number;
    username: string;
    characterId: number;
    name: string;
    level: number;
    attack: number;
    defense: number;
    maxhp: number;
    maxmp: number;
    hp: number;
    mp: number;
    exp: number;
    questId: number;
    levelup?: boolean;
    isDead?: string;
}

interface UserStatus {
    characterId: number;
    username: string;
    name: string;
    job: string;
    level: number;
    attack: number;
    defense: number;
    maxhp: number;
    maxmp: number;
    hp: number;
    mp: number;
    exp: number;
    item: string;
    // item: InferAttributes<Items, { omit: never; }>[] // | string;
    skill: InferAttributes<Skills, { omit: never; }>[] // | string;
    // item: Items[];
    // skill: Skills[];

    cooldown?: number;
    damage?: number;
    isDead?: string;
    levelup?: boolean;
    pvpRoom?: string;
    chatRoom?: number;
    isTeam?: string;
}

interface UserInfo {
    userId: number;
    username: string;
    characterId: number;
    name: string;
}


export {
    SignupForm,
    UserCache,
    UserStatus,
    UserInfo
}