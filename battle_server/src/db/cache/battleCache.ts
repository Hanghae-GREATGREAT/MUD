import { BattleCacheInterface } from "../../interfaces/battle";


class BattleCache {

    private battleMap: Map<number, BattleCacheInterface>;
    private autoLoop: Map<number, NodeJS.Timer>;

    constructor() {
        this.battleMap =  new Map<number, BattleCacheInterface>();
        this.autoLoop = new Map<number, NodeJS.Timer>();
    }

    private empty = {
        dungeonLevel: 0,
        monsterId: 0,
        loopId: '',
        quit: false,
        dead: '',
    }

    set = (key: string|number, data: BattleCacheInterface): void => {
        const oldCache = this.getOld(+key) || {};
        const newCache = {...oldCache, ...data};
        this.battleMap.set(+key, newCache);
    }

    get = (key: string|number): BattleCacheInterface => {
        return this.battleMap.get(+key) || this.empty;
    }

    getAll = () => {
        return Object.fromEntries(this.battleMap);
    }

    private getOld = (key: string|number): BattleCacheInterface | undefined => {
        return this.battleMap.get(+key);
    }

    delete = (key: string|number): boolean => {
        return this.battleMap.delete(+key);
    }

    getAsync = (key: string|number): Promise<BattleCacheInterface> => {
        return new Promise((resolve, reject) => {
            resolve(this.battleMap.get(+key) || this.empty);
        });
    }

    setTimer = (key: string|number, timer: NodeJS.Timer) => {
        this.autoLoop.set(+key, timer);
    }

    getTimer = (key: string|number) => {
        return this.autoLoop.get(+key);
    }

    delTimer = (key: string|number) => {
        this.autoLoop.delete(+key);
    }

}

export default new BattleCache();