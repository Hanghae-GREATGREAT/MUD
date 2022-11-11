import { InferAttributes } from "sequelize";
import { Items, Skills } from "../db/models";


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
    levelup?: boolean;
    maxhp: number;
    maxmp: number;
    hp: number;
    mp: number;
    exp: number;
    questId: number;
    item: InferAttributes<Items, { omit: never; }>[];
    skill: InferAttributes<Skills, { omit: never; }>[];
}


export {
    SignupForm,
    UserSession,
}