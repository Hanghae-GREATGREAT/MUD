interface InputForm {
    input: number;
}

interface dungeonInfoForm {
    dungeonNo: number;
    name: string;
    recommendLevel: string;
    script: string;
}
[];

interface BattleCache {
    dungeonLevel?: number;
    monsterId?: number;
    autoAttackId?: NodeJS.Timer;
    quit?: boolean;
    dead?: string;
}


export { 
    InputForm, 
    dungeonInfoForm,
    BattleCache
};
