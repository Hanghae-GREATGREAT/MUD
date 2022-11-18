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

    const autoAttackTimer = setInterval(async () => {
        console.log('autoAttack.worker.ts: 27')
        battleCache.set(characterId, { autoAttackTimer });

        autoAttack(characterId, autoToDead).then((status) => {
            console.log('autoAttack.worker.ts: 38 >> autoAttack result: ', status);

            const statusHandler = {
                continue: continueWorker,
                monster: resultWorker,
                player: resultWorker,
                terminate: terminateWorker,
            }
            statusHandler[status](status, characterId, autoToDead);


            // if (result instanceof Error) {
            //     console.log('autoAttack.worker.ts: 33 >> 자동공격 에러', result.message);
            //     clearInterval(autoAttackTimer);
            //     battleCache.delete(characterId);
            //     parentPort?.close();
            //     return;
            // }

            // parentPort?.postMessage('AUTOATTACK SUCCESS');
            return;
        });
    
    }, 1000);

    // return `SUCCESS ${characterId}`
}


async function autoAttack(characterId: number, autoToDead: MessagePort) {
    console.log('autoAttack.worker.ts: 57 >> autoAttack() 시작', characterId);
    let tempScript: string = '';
    const { autoAttackTimer, monsterId } = battleCache.get(characterId);
    if (!autoAttackTimer! || !monsterId) {
        return 'terminate';
    }

    // 유저&몬스터 정보 불러오기
    console.log('autoAttack.worker.ts: 65 >> 유저&몬스터 정보');
    const { hp: playerHP, attack: playerDamage } = await CharacterService.findByPk(characterId);
    const monster = await MonsterService.findByPk(monsterId);
    
    if (!monster) return 'terminate';
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
    if (!isDead) return 'terminate';

    if (isDead === 'dead') {
        console.log('autoAttack.worker.ts: 90 >> 몬스터 사망');
        battleCache.set(characterId, { dead: 'monster' });
        // autoToDead.postMessage('monster');
        return 'monster';
    }

    if (!monster) return 'terminate';
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

        // autoToDead.postMessage('player');
        // battle.resultPlayerDead(tempScript, refreshUser);
        return 'player';
    }

    const result = { script: tempScript, field: 'action', user: refreshUser };
    console.log('autoAttack.worker.ts: 118', result.script);
    // socket.emit('printBattle', result);
    return 'continue';
}


function continueWorker(status: string, characterId: number, autoToDead: MessagePort) {
    console.log('continue autoAttack');
}

function resultWorker(status: string, characterId: number, autoToDead: MessagePort) {
    const { autoAttackTimer } = battleCache.get(characterId);
    clearInterval(autoAttackTimer);
    autoToDead.postMessage(status);
    parentPort?.postMessage('자동공격 종료');
}

function terminateWorker(status: string, characterId: number, autoToDead: MessagePort) {
    const { autoAttackTimer } = battleCache.get(characterId);
    clearInterval(autoAttackTimer);
    parentPort?.postMessage('자동공격 종료');
    autoToDead.postMessage('terminate');
}

// const autoAttackWorkerPath = __filename;
// export { autoAttackWorkerPath }