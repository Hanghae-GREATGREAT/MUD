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

interface BattleCacheInterface {
    dungeonLevel?: number;
    monsterId?: number;
    autoAttackTimer?: NodeJS.Timer;
    skillAttackTimer?: NodeJS.Timer;
    isMonsterDeadTimer?: NodeJS.Timer;
    quit?: boolean;
    dead?: string;
}

export { 
    InputForm, 
    dungeonInfoForm,
    BattleCacheInterface
};
