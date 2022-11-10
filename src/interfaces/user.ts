

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
}


export {
    SignupForm,
    UserSession,
}