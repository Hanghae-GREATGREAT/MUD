"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BattleCache {
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
            const oldCache = this.getOld(+key) || {};
            const newCache = Object.assign(Object.assign({}, oldCache), data);
            this.battleMap.set(+key, newCache);
        };
        this.get = (key) => {
            // return this.battleMap.get(+key)!;
            return this.battleMap.get(+key) || this.empty;
        };
        this.getAll = () => {
            return Object.fromEntries(this.battleMap);
        };
        this.getOld = (key) => {
            return this.battleMap.get(+key);
        };
        this.delete = (key) => {
            return this.battleMap.delete(+key);
        };
        this.getAsync = (key) => {
            return new Promise((resolve, reject) => {
                resolve(this.battleMap.get(+key) || this.empty);
            });
        };
        this.battleMap = new Map();
    }
}
exports.default = new BattleCache();
