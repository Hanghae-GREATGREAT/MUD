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
console.log('autoAttack.worker.ts: 9 >> 자동공격 워커 모듈 동작, ', worker_threads_1.workerData.userCache.characterId);
(0, associate_1.default)();
worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.once('message', ({ autoToDead }) => {
    autoAttackWorker(worker_threads_1.workerData, autoToDead);
});
function autoAttackWorker({ userCache }, autoToDead) {
    const { characterId } = userCache;
    console.log('autoAttack.worker.ts: 18 >> autoAttackWorker() 시작', characterId);
    const cache = (0, worker_threads_1.getEnvironmentData)(characterId);
    cache_1.battleCache.set(characterId, JSON.parse(cache.toString()));
    console.log(cache_1.battleCache.getAll());
    const autoAttackTimer = setInterval(() => __awaiter(this, void 0, void 0, function* () {
        console.log('autoAttack.worker.ts: START INTERVAL', Date.now(), characterId);
        cache_1.battleCache.set(characterId, { autoAttackTimer });
        autoAttack(userCache).then(({ status, script }) => {
            console.log('autoAttack.worker.ts: 38 >> autoAttack result: ', status, characterId);
            const statusHandler = {
                continue: continueWorker,
                monster: resultWorker,
                player: resultWorker,
                terminate: terminateWorker,
            };
            statusHandler[status]({ status, script }, characterId, autoToDead);
            return;
        });
    }), 1000);
    return;
}
function autoAttack(userCache) {
    return __awaiter(this, void 0, void 0, function* () {
        const { characterId, attack } = userCache;
        console.log('autoAttack.worker.ts: 50 >> autoAttack() 시작', characterId);
        let tempScript = '';
        const { autoAttackTimer, monsterId } = cache_1.battleCache.get(characterId);
        if (!autoAttackTimer || !monsterId) {
            return { status: 'terminate', script: '몬스터 정보 에러' };
        }
        // 유저&몬스터 정보 불러오기
        console.log('autoAttack.worker.ts: 유저&몬스터 정보, ', characterId);
        const { hp: playerHP, attack: playerDamage } = yield services_1.CharacterService.findByPk(characterId);
        const monster = yield services_1.MonsterService.findByPk(monsterId);
        if (!monster)
            return { status: 'terminate', script: '몬스터 정보 에러' };
        const { name: monsterName, hp: monsterHP, attack: monsterDamage, exp: monsterExp } = monster;
        // 유저 턴
        console.log('autoAttack.worker.ts: 66 >> 플레이어 턴, ', characterId);
        const playerHit = services_1.BattleService.hitStrength(playerDamage);
        const playerAdjective = services_1.BattleService.dmageAdjective(playerHit, playerDamage);
        tempScript += `\n당신의 ${playerAdjective} 공격이 ${monsterName}에게 적중했다. => ${playerHit}의 데미지!\n`;
        console.log(tempScript);
        const isDead = yield services_1.MonsterService.refreshStatus(monsterId, playerHit, characterId);
        if (!isDead)
            return { status: 'terminate', script: '몬스터 정보 에러' };
        if (isDead === 'dead') {
            console.log('autoAttack.worker.ts: 몬스터 사망, ', characterId);
            cache_1.battleCache.set(characterId, { dead: 'monster' });
            const script = `\n당신의 ${playerAdjective} 공격에 ${monsterName}이 쓰러졌다. => ${playerHit}의 데미지!`;
            return { status: 'monster', script };
        }
        if (!monster)
            return { status: 'terminate', script: '몬스터 정보 에러' };
        // 몬스터 턴
        console.log('autoAttack.worker.ts: 몬스터 턴, ', characterId);
        const monsterHit = services_1.BattleService.hitStrength(monsterDamage);
        const monsterAdjective = services_1.BattleService.dmageAdjective(monsterHit, monsterDamage);
        tempScript += `${monsterName} 이(가) 당신에게 ${monsterAdjective} 공격! => ${monsterHit}의 데미지!\n`;
        console.log(tempScript);
        const refreshUser = yield services_1.CharacterService.refreshStatus(characterId, monsterHit, 0, monsterId);
        if (refreshUser.isDead === 'dead') {
            console.log('autoAttack.worker.ts: 플레이어 사망, ', characterId);
            tempScript += '\n!! 치명상 !!\n';
            tempScript += `당신은 ${monsterName}의 공격을 버티지 못했습니다.. \n`;
            const script = `${monsterName} 의 ${monsterAdjective} 공격이 치명상으로 적중! => ${monsterHit}의 데미지!
        마을로 돌아갑니다...!!\n`;
            return { status: 'player', script };
        }
        const result = { script: tempScript, field: 'action', user: refreshUser };
        console.log('autoAttack.worker.ts: ', result.script, characterId);
        return { status: 'continue', script: '' };
    });
}
function continueWorker({ status, script }, characterId, autoToDead) {
    console.log('continue autoAttack, ', characterId);
}
function resultWorker({ status, script }, characterId, autoToDead) {
    const { autoAttackTimer } = cache_1.battleCache.get(characterId);
    clearInterval(autoAttackTimer);
    autoToDead.postMessage({ status, script });
    worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage('자동공격 종료');
}
function terminateWorker({ status, script }, characterId, autoToDead) {
    const { autoAttackTimer } = cache_1.battleCache.get(characterId);
    clearInterval(autoAttackTimer);
    autoToDead.postMessage({ status, script });
    worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage('자동공격 종료');
}
// const autoAttackWorkerPath = __filename;
// export { autoAttackWorkerPath }
