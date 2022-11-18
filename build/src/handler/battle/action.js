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
Object.defineProperty(exports, "__esModule", { value: true });
const socket_routes_1 = require("../../socket.routes");
const services_1 = require("../../services");
const cache_1 = require("../../db/cache");
const handler_1 = require("../../handler");
class BattleAction {
    constructor() {
        // attack = async(CMD: string | undefined, user: UserSession) => {
        //     const whoIsDead: CommandRouter = {
        //         // back to dungeon list when player died
        //         player: dungeon.getDungeonList,
        //         // back to encounter phase when monster died
        //         monster: battle.reEncounter,
        //     }
        //     const { characterId } = user;
        //     console.log('ATTAAAAAAAAAAAAAAAAACK', battleCache.get(characterId));
        //     const cache = battleCache.get(characterId);
        //     setEnvironmentData(characterId, JSON.stringify(cache));
        //     autoAttack.start(characterId, socket).then((result) => {
        //         console.log('AUTO ATTACK RUNNING', result);
        //         socket.to(socket.id).emit('printBattle', result);
        //     }).catch((error) => console.error(error));
        //     // const autoAttackTimer = setInterval(async () => {
        //     //     battleCache.set(characterId, { autoAttackTimer });
        //     //     const { script, field, user: newUser, error } = await battle.autoAttack(CMD, user);
        //     //     if (error) return;
        //     //     socket.to(socket.id).emit('printBattle', { script, field, user: newUser });
        //     //     // const { dead } = battleCache.get(characterId);
        //     //     const { dead } = await redis.hGetAll(characterId);
        //     //     // dead = 'moster'|'player'|undefined
        //     //     if (dead) {
        //     //         redis.hDelResetCache(characterId);
        //     //         const { autoAttackTimer } = battleCache.get(characterId)
        //     //         clearInterval(autoAttackTimer);
        //     //         battleCache.delete(characterId);
        //     //         const result = await whoIsDead[dead]('', newUser);
        //     //         socket.to(socket.id).emit('print', result);
        //     //         return;
        //     //     }
        //     // }, 1500);
        //     return { script: '일반전투', user, field: 'action', cooldown: Date.now()-2000 }
        // }
        this.attack = (CMD, user) => __awaiter(this, void 0, void 0, function* () {
            const whoIsDead = {
                // back to dungeon list when player died
                player: handler_1.dungeon.getDungeonList,
                // back to encounter phase when monster died
                monster: handler_1.battle.reEncounter,
            };
            const { characterId } = user;
            const autoAttackTimer = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                cache_1.battleCache.set(characterId, { autoAttackTimer });
                const { script, field, user: newUser, error } = yield handler_1.battle.autoAttack(CMD, user);
                if (error)
                    return;
                socket_routes_1.socket.to(socket_routes_1.socket.id).emit('printBattle', { script, field, user: newUser });
                const { dead } = cache_1.battleCache.get(characterId);
                // const { dead } = await redis.hGetAll(characterId);
                // dead = 'moster'|'player'|undefined
                if (dead) {
                    // redis.hDelResetCache(characterId);
                    const { autoAttackTimer, dungeonLevel } = cache_1.battleCache.get(characterId);
                    clearInterval(autoAttackTimer);
                    cache_1.battleCache.delete(characterId);
                    cache_1.battleCache.set(characterId, { dungeonLevel });
                    const result = yield whoIsDead[dead]('', newUser);
                    socket_routes_1.socket.to(socket_routes_1.socket.id).emit('print', result);
                    return;
                }
            }), 1500);
            return { script: '', user, field: 'action', cooldown: Date.now() - 2000 };
        });
        this.actionSkill = (CMD, user) => __awaiter(this, void 0, void 0, function* () {
            let tempScript = '';
            let field = 'action';
            const { characterId } = user;
            // 스킬 정보 가져오기
            const { attack, mp, skill } = yield services_1.CharacterService.findByPk(characterId);
            if (skill[Number(CMD) - 1] === undefined) {
                const result = handler_1.battle.battleHelp(CMD, user);
                return {
                    script: result.script,
                    user: result.user,
                    field: result.field,
                    error: true
                };
            }
            const { name: skillName, cost, multiple } = skill[Number(CMD) - 1];
            // 몬스터 정보 가져오기
            // const { monsterId } = await redis.hGetAll(characterId);
            const { monsterId } = cache_1.battleCache.get(characterId);
            const monster = yield services_1.MonsterService.findByPk(monsterId);
            if (!monster || !monsterId)
                throw new Error('몬스터 정보가 없습니다.');
            /**
             * 몬스터 정보 없을시 에러가 아닌 일반 공격에 의한 사망으로 간주
             * 혹은 버그/사망 판별 가능?
             */
            const { name: monsterName, hp: monsterHp, exp: monsterExp } = monster;
            // 마나 잔여량 확인
            if (mp - cost < 0) {
                tempScript += `??? : 비전력이 부조카당.\n`;
                const script = tempScript;
                return { script, user, field };
            }
            // 스킬 데미지 계산
            const playerSkillDamage = Math.floor((attack * multiple) / 100);
            const realDamage = services_1.BattleService.hitStrength(playerSkillDamage);
            // 스킬 Cost 적용
            user = yield services_1.CharacterService.refreshStatus(characterId, 0, cost, monsterId);
            tempScript += `\n당신의 ${skillName} 스킬이 ${monsterName}에게 적중! => ${realDamage}의 데미지!\n`;
            // 몬스터에게 스킬 데미지 적용 
            const isDead = yield services_1.MonsterService.refreshStatus(monsterId, realDamage, characterId);
            if (!isDead)
                throw new Error('몬스터 정보를 찾을 수 없습니다');
            if (isDead === 'dead') {
                console.log('몬스터 사망');
                cache_1.battleCache.set(characterId, { dead: 'monster' });
                // await redis.hSet(characterId, { dead: 'monster' });
                return yield handler_1.battle.resultMonsterDead(monster, tempScript);
            }
            // isDead === 'alive'
            const script = tempScript;
            return { script, user, field };
        });
        this.autoBattleSkill = (user) => __awaiter(this, void 0, void 0, function* () {
            console.log('autoBattleSkill');
            const { characterId, mp } = user;
            let field = 'autoBattle';
            let tempScript = '';
            // 스킬 정보 가져오기 & 사용할 스킬 선택 (cost 반비례 확률)
            const { attack, skill } = yield services_1.CharacterService.findByPk(characterId);
            const selectedSkill = handler_1.battle.skillSelector(skill);
            const { name: skillName, cost: skillCost, multiple } = selectedSkill;
            // 몬스터 정보 가져오기
            // const { monsterId } = await redis.hGetAll(characterId);
            const { monsterId } = cache_1.battleCache.get(characterId);
            if (!monsterId)
                throw new Error('몬스터 정보가 없습니다.');
            const monster = yield services_1.MonsterService.findByPk(monsterId);
            if (!monster)
                throw new Error('몬스터 정보가 없습니다.');
            const { name: monsterName, hp: monsterHp, exp: monsterExp } = monster;
            // 마나 잔여량 확인
            if (mp - skillCost < 0) {
                tempScript += `??? : 비전력이 부조카당.\n`;
                const script = tempScript;
                return { script, user, field };
            }
            // 스킬 데미지 계산 & 마나 cost 소모
            const playerSkillDamage = Math.floor((attack * multiple) / 100);
            const realDamage = services_1.BattleService.hitStrength(playerSkillDamage);
            user = yield services_1.CharacterService.refreshStatus(characterId, 0, skillCost, monsterId);
            // 몬스터에게 스킬 데미지 적중
            const isDead = yield services_1.MonsterService.refreshStatus(monsterId, realDamage, characterId);
            if (!isDead)
                throw new Error('몬스터 정보를 찾을 수 없습니다');
            tempScript += `\n당신의 ${skillName} 스킬이 ${monsterName}에게 적중! => ${realDamage}의 데미지!\n`;
            if (isDead === 'dead') {
                console.log('몬스터 사망');
                cache_1.battleCache.set(characterId, { dead: 'monster' });
                // await redis.hSet(characterId, { dead: 'monster' });
                return yield handler_1.battle.resultMonsterDead(monster, tempScript);
            }
            // isDead === 'alive'
            const script = tempScript;
            return { script, user, field };
        });
        this.skillSelector = (skill) => {
            const skillCounts = skill.length;
            const skillCosts = skill.map((s) => s.cost);
            const costSum = skillCosts.reduce((a, b) => a + b, 0);
            const chanceSum = skillCosts.reduce((a, b) => {
                return a + costSum / b;
            }, 0);
            const chance = Math.random();
            let skillIndex = 0;
            let cumChance = 0;
            for (let i = 0; i < skillCounts; i++) {
                const singleChance = (costSum / skillCosts[i]) / chanceSum;
                cumChance += singleChance;
                console.log(chance, cumChance);
                if (chance <= cumChance) {
                    skillIndex = i;
                    break;
                }
            }
            return skill[skillIndex];
        };
        this.run = (CMD, user) => __awaiter(this, void 0, void 0, function* () {
            console.log('도망 실행');
            const characterId = user.characterId.toString();
            let tempScript = '';
            const tempLine = '=======================================================================\n';
            tempScript += `... 몬스터와 눈이 마주친 순간,\n`;
            tempScript += `당신은 던전 입구를 향해 필사적으로 뒷걸음질쳤습니다.\n\n`;
            tempScript += `??? : 하남자특. 도망감.\n\n`;
            tempScript += `목록 - 던전 목록을 불러옵니다.\n`;
            tempScript += `입장 [number] - 선택한 번호의 던전에 입장합니다.\n\n`;
            // 몬스터 삭제
            // await MonsterService.destroyMonster(Number(dungeonSession.monsterId));
            cache_1.redis.hDelBattleCache(characterId);
            cache_1.battleCache.delete(characterId);
            const script = tempLine + tempScript;
            const field = 'dungeon';
            return { script, user, field };
        });
    }
}
exports.default = new BattleAction();
