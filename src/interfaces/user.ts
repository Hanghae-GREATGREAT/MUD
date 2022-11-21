

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
    // item: InferAttributes<Items, { omit: never; }>[] | string;
    // skill: InferAttributes<Skills, { omit: never; }>[] | string;
    levelup?: boolean;
    isDead?: string;
}


export {
    SignupForm,
    UserCache,
}