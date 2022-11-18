import { parentPort, workerData, getEnvironmentData, MessagePort } from 'worker_threads'
import { battleCache } from '../db/cache';
import { battle, dungeon } from '../handler';
import { AutoWorkerData } from '../interfaces/worker';
import { CharacterService, MonsterService, BattleService } from '../services'
import associate from '../db/config/associate';


console.log('autoAttack.worker.ts: 9 >> 자동공격 워커 모듈 동작', workerData)
associate();
parentPort?.once('message', ({ autoToDead }) => {
    autoAttackWorker(workerData, autoToDead);
});


function autoAttackWorker({ characterId }: AutoWorkerData, autoToDead: MessagePort) {    

    console.log('autoAttack.worker.ts: 18 >> autoAttackWorker() 시작', characterId);

    const cache = getEnvironmentData(characterId);
    battleCache.set(characterId, JSON.parse(cache.toString()));

    console.log(battleCache.getAll());

    const tempTime = Date.now();
    const autoAttackTimer = setInterval(async () => {
        console.log('autoAttack.worker.ts: 27')
        battleCache.set(characterId, { autoAttackTimer });

        autoAttack(characterId, autoToDead).then((result) => {

            if (result instanceof Error) {
                console.log('autoAttack.worker.ts: 33 >> 자동공격 에러', result.message);
                clearInterval(autoAttackTimer);
                battleCache.delete(characterId);
                parentPort?.close();
                return;
            }

            console.log('autoAttack.worker.ts: 38 >> autoAttack result', result?.script);
            // parentPort?.postMessage('AUTOATTACK SUCCESS');
            return;
        });
    
        
        if (Date.now() > tempTime + 5000) {
            clearInterval(autoAttackTimer);
            autoToDead.postMessage('monster');
            parentPort?.postMessage('CLEAR AUTO ATTACK');
            parentPort?.close();
        }
    }, 1000);

    // return `SUCCESS ${characterId}`
}


async function autoAttack(characterId: number, autoToDead: MessagePort) {
    console.log('autoAttack.worker.ts: 57 >> autoAttack() 시작', characterId);
    let tempScript: string = '';
    const { autoAttackTimer, monsterId } = battleCache.get(characterId);
    if (!autoAttackTimer! || !monsterId) {
        return new Error('autoAttck: 전투캐시 데이터 누락');
    }

    // 유저&몬스터 정보 불러오기
    console.log('autoAttack.worker.ts: 65 >> 유저&몬스터 정보');
    const { hp: playerHP, attack: playerDamage } = await CharacterService.findByPk(characterId);
    const monster = await MonsterService.findByPk(monsterId);
    if (!monster) {
        return new Error('autoAttck: 몬스터 데이터 누락');
    }
    const { name: monsterName, hp: monsterHP, attack: monsterDamage, exp: monsterExp } = monster;

    // 유저 턴
    console.log('autoAttack.worker.ts: 74 >> 플레이어 턴');
    const playerHit = BattleService.hitStrength(playerDamage);
    const playerAdjective = BattleService.dmageAdjective(
        playerHit,
        playerDamage,
    );
    tempScript += `\n당신의 ${playerAdjective} 공격이 ${monsterName}에게 적중했다. => ${playerHit}의 데미지!\n`;

    const isDead = await MonsterService.refreshStatus(monsterId, playerHit, characterId);
    if (!isDead) {
        return new Error('autoAttck: 몬스터 데이터 누락(refreshStatus)');
    }

    if (isDead === 'dead') {
        console.log('autoAttack.worker.ts: 90 >> 몬스터 사망');
        battleCache.set(characterId, { dead: 'monster' });
        autoToDead.postMessage('monster');
        return;
    }

    // 몬스터 턴
    console.log('autoAttack.worker.ts: 97 >> 몬스터 턴');
    const monsterHit = BattleService.hitStrength(monsterDamage);
    const monsterAdjective = BattleService.dmageAdjective(
        monsterHit,
        monsterDamage,
    );
    tempScript += `${monsterName} 이(가) 당신에게 ${monsterAdjective} 공격! => ${monsterHit}의 데미지!\n`;

    const refreshUser = await CharacterService.refreshStatus(characterId, monsterHit, 0, monsterId);
    if (refreshUser.isDead === 'dead') {
        console.log('autoAttack.worker.ts: 107 >> 플레이어 사망');

        tempScript += '\n!! 치명상 !!\n';
        tempScript += `당신은 ${monsterName}의 공격을 버티지 못했습니다.. \n`;

        autoToDead.postMessage('player');
        // battle.resultPlayerDead(tempScript, refreshUser);
        return;
    }

    const result = { script: tempScript, field: 'action', user: refreshUser };
    console.log('autoAttack.worker.ts: 118', result.script);
    // socket.emit('printBattle', result);
    return result;
}


// const autoAttackWorkerPath = __filename;
// export { autoAttackWorkerPath }