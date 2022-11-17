"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../db/models");
const cache_1 = require("../db/cache");
class MonsterService {
    static createNewMonster(dungeonLevel, characterId) {
        return __awaiter(this, void 0, void 0, function* () {
            const newMonster = yield models_1.Monsters.createMonster(+dungeonLevel, +characterId);
            return newMonster;
        });
    }
    static findByPk(monsterId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield models_1.Monsters.findByPk(Number(monsterId));
        });
    }
    /***************************************************************
     * 전투 종료 후 몬스터 테이블 삭제
     ***************************************************************/
    static destroyMonster(monsterId, characterId) {
        models_1.Monsters.destroy({ where: { monsterId: Number(monsterId) } });
        cache_1.redis.hDel(String(characterId), 'monsterId');
    }
}
_a = MonsterService;
/***************************************************************
 * 전투 턴이 종료되고 hp, mp 상태 갱신
 ***************************************************************/
MonsterService.refreshStatus = (monsterId, damage, characterId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield models_1.Monsters.findByPk(Number(monsterId), {
        include: [models_1.Fields],
    });
    if (!result)
        return null;
    const { hp } = result.get();
    const newHp = hp - damage;
    if (newHp > 0) {
        result.update({ hp: newHp });
        return 'alive';
    }
    else {
        _a.destroyMonster(monsterId, characterId);
        return 'dead';
    }
});
exports.default = MonsterService;
