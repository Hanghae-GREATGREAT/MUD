import { BattleCacheInterface } from "../../interfaces/dungeon";


class BattleCache {

    private battleMap: Map<number, BattleCacheInterface>;

    constructor() {
        this.battleMap =  new Map<number, BattleCacheInterface>();
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

}

export default new BattleCache();