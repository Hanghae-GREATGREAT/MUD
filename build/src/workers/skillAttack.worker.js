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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const associate_1 = __importDefault(require("../db/config/associate"));
const services_1 = require("../services");
const cache_1 = require("../db/cache");
console.log('skillAttack.worker.ts: 11 >> 스킬공격 워커 모듈 동작');
(0, associate_1.default)();
worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.once('message', ({ skillToDead }) => {
    skillAttackWorker(worker_threads_1.workerData, skillToDead);
});
function skillAttackWorker({ userCache }, skillToDead) {
    const { characterId } = userCache;
    console.log('skillAttack.worker.ts: 20 >> skillAttackWorker start', characterId);
    const cache = (0, worker_threads_1.getEnvironmentData)(characterId);
    cache_1.battleCache.set(characterId, JSON.parse(cache.toString()));
    const skillAttackTimer = setInterval(() => __awaiter(this, void 0, void 0, function* () {
        console.log('skillAttack.worker.ts: START INTERVAL', Date.now());
        cache_1.battleCache.set(characterId, { skillAttackTimer });
        const chance = Math.random();
        if (chance < 0.5)
            return console.log('STOP');
        console.log('GO');
        autoBattleSkill(userCache).then(({ status, script }) => {
            console.log('skillAttack.worker.ts: autoBattleSkill resolved', status);
            const statusHandler = {
                continue: continueWorker,
                monster: resultWorker,
                player: resultWorker,
                terminate: terminateWorker,
            };
            statusHandler[status]({ status, script }, characterId, skillToDead);
            return;
        });
    }), 1500);
}
function autoBattleSkill(userCache) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('skillAttack.worker.ts >> autoBattleSkill(): 시작');
        const { characterId, mp, attack } = userCache;
        let field = 'autoBattle';
        let tempScript = '';
        // 스킬 정보 가져오기 & 사용할 스킬 선택 (cost 반비례 확률)
        const { skill } = yield services_1.CharacterService.findByPk(characterId);
        const selectedSkill = skillSelector(skill);
        const { name: skillName, cost: skillCost, multiple } = selectedSkill;
        // 몬스터 정보 가져오기
        // const { monsterId } = await redis.hGetAll(characterId);
        const { monsterId } = cache_1.battleCache.get(characterId);
        if (!monsterId)
            return { status: 'terminate', script: '몬스터 정보 에러' };
        const monster = yield services_1.MonsterService.findByPk(monsterId);
        if (!monster)
            return { status: 'terminate', script: '몬스터 정보 에러' };
        const { name: monsterName, hp: monsterHp, exp: monsterExp } = monster;
        // 마나 잔여량 확인
        if (mp - skillCost < 0) {
            tempScript += `??? : 비전력이 부조카당.\n`;
            const script = tempScript;
            console.log('skillAttack.worker.ts: 마나 부족');
            return { status: 'continue', script: '' };
        }
        // 스킬 데미지 계산 & 마나 cost 소모
        const playerSkillDamage = Math.floor((attack * multiple) / 100);
        const realDamage = services_1.BattleService.hitStrength(playerSkillDamage);
        userCache = yield services_1.CharacterService.refreshStatus(characterId, 0, skillCost, monsterId);
        // 몬스터에게 스킬 데미지 적중
        const isDead = yield services_1.MonsterService.refreshStatus(monsterId, realDamage, characterId);
        if (!isDead)
            return { status: 'terminate', script: '몬스터 정보 에러' };
        tempScript += `\n당신의 ${skillName} 스킬이 ${monsterName}에게 적중! => ${realDamage}의 데미지!\n`;
        console.log(tempScript);
        if (isDead === 'dead') {
            console.log('몬스터 사망 by SKILL ATTACK');
            cache_1.battleCache.set(characterId, { dead: 'monster' });
            // await redis.hSet(characterId, { dead: 'monster' });
            const script = `\n${monsterName}에게 ${skillName} 마무리 일격!! => ${realDamage}의 데미지!`;
            return { status: 'monster', script };
        }
        // isDead === 'alive'
        const script = tempScript;
        console.log('스킬로 안쥬금ㅇㅇㅇㅇ');
        return { status: 'continue', script: '' };
    });
}
function skillSelector(skill) {
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
}
function continueWorker({ status, script }, characterId, skillToDead) {
    console.log('continue skillAttack');
}
function resultWorker({ status, script }, characterId, skillToDead) {
    const { skillAttackTimer } = cache_1.battleCache.get(characterId);
    clearInterval(skillAttackTimer);
    skillToDead.postMessage({ status, script });
    worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage('자동스킬 종료');
}
function terminateWorker({ status, script }, characterId, skillToDead) {
    const { skillAttackTimer } = cache_1.battleCache.get(characterId);
    clearInterval(skillAttackTimer);
    skillToDead.postMessage({ status, script });
    worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage('자동스킬 종료');
}
