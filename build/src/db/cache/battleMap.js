"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BattleMap {
    constructor() {
        this.empty = {
            dungeonLevel: 0,
            monsterId: 0,
            loopId: '',
            quit: false,
            dead: '',
        };
        // set = (key: string, data: BattleCache): void => {
        //     this.battleMap.set(key, data);
        // }
        this.set = (key, data) => {
            const oldCache = this.get(key);
            const newCache = Object.assign(Object.assign({}, oldCache), data);
            this.battleMap.set(key.toString(), newCache);
        };
        this.get = (key) => {
            return this.battleMap.get(key.toString()) || this.empty;
        };
        this.getAll = () => {
            return Object.fromEntries(this.battleMap);
        };
        this.delete = (key) => {
            return this.battleMap.delete(key.toString());
        };
        this.battleMap = new Map();
    }
}
exports.default = new BattleMap();
