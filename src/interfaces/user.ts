import { InferAttributes } from "sequelize";
import { Characters, Fields, Items, Skills, Titles, Users } from "../db/models";


interface SignupForm {
    username: string;
    password: string;
    confirm?: string;
}

interface UserSession {
    userId: number;
    username: string;
    characterId: number;
    name: string;
    level: number;
    maxhp: number;
    maxmp: number;
    hp: number;
    mp: number;
    exp: number;
    questId: number;
    // item: InferAttributes<Items, { omit: never; }>[] | string;
    // skill: InferAttributes<Skills, { omit: never; }>[] | string;
    levelup?: boolean;
    isDead?: string;
}


export {
    SignupForm,
    UserSession,
}