import { BattleCache } from "../../interfaces/dungeon";


class BattleMap {

    private battleMap: Map<string, BattleCache>;

    constructor() {
        this.battleMap =  new Map<string, BattleCache>();
    }

    private empty = {
        dungeonLevel: 0,
        monsterId: 0,
        loopId: '',
        quit: false,
        dead: '',
    }    

    // set = (key: string, data: BattleCache): void => {
    //     this.battleMap.set(key, data);
    // }
    set = (key: string|number, data: BattleCache): void => {
        const oldCache = this.get(key);
        const newCache = {...oldCache, ...data};
        this.battleMap.set(key.toString(), newCache);
    }

    get = (key: string|number): BattleCache => {
        return this.battleMap.get(key.toString()) || this.empty;
    }

    getAll = () => {
        return Object.fromEntries(this.battleMap);
    }

    delete = (key: string|number): boolean => {
        return this.battleMap.delete(key.toString());
    }

}

export default new BattleMap();