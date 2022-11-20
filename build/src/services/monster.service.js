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
class MonsterService {
    static createNewMonster(dungeonLevel, characterId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('monster.service.ts >> createNewMonster() 몬스터 생성');
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
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`monster.service.ts: 45 >> 몬스터 삭제, ${monsterId}`);
            yield models_1.Monsters.destroy({ where: { monsterId: Number(monsterId) } });
            // redis.hDel(String(characterId), 'monsterId');
            // 여기서 지우나?
            // battleCache.delete(characterId);
        });
    }
}
_a = MonsterService;
/***************************************************************
    전투 턴이 종료되고 hp, mp 상태 갱신
    몬스터 사망
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
        // this.destroyMonster(monsterId, characterId)
        return 'dead';
    }
});
exports.default = MonsterService;
