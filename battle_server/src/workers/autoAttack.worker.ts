import { parentPort, workerData, getEnvironmentData, MessagePort } from 'worker_threads'
import associate from '../db/config/associate';
import { CharacterService, MonsterService, BattleService } from '../services'
import { battleCache } from '../db/cache';
import { AutoWorkerData, AutoWorkerResult } from '../interfaces/worker';
import { UserStatus } from '../interfaces/user';
import BATTLE from '../redis';


// console.log('autoAttack.worker.ts: 9 >> 자동공격 워커 모듈 동작, ', workerData.userStatus.characterId)
associate();
parentPort?.once('message', ({ autoToDead }) => {
    autoAttackWorker(workerData, autoToDead);
});


function autoAttackWorker({ socketId, userStatus }: AutoWorkerData, autoToDead: MessagePort) {    

    const { characterId } = userStatus;
    // console.log('autoAttack.worker.ts: 18 >> autoAttackWorker() 시작', characterId);

    const cache = getEnvironmentData(characterId);
    battleCache.set(characterId, JSON.parse(cache.toString()));

    // console.log(battleCache.getAll());

    const autoAttackTimer = setInterval(async () => {
        // console.log('autoAttack.worker.ts: START INTERVAL', Date.now(), characterId);
        battleCache.set(characterId, { autoAttackTimer });

        autoAttack(socketId, userStatus).then(({ status, script }: AutoWorkerResult) => {
            // console.log('autoAttack.worker.ts: 38 >> autoAttack result: ', status, characterId);
            const statusHandler = {
                continue: continueWorker,
                monster: resultWorker,
                player: resultWorker,
                terminate: terminateWorker,
            }
            statusHandler[status]({ status, script }, characterId, autoToDead);

            return;
        });
    
    }, 500);

    return;
}


async function autoAttack(socketId: string, userStatus: UserStatus): Promise<AutoWorkerResult> {
    const { characterId, attack } = userStatus;
    // console.log('autoAttack.worker.ts: 50 >> autoAttack() 시작', characterId);

    let tempScript = '';
    const { autoAttackTimer, monsterId } = battleCache.get(characterId);
    if (!autoAttackTimer! || !monsterId) {
        return { status: 'terminate', script: '몬스터 정보 에러' };
    }

    // 유저&몬스터 정보 불러오기
    // console.log('autoAttack.worker.ts: 유저&몬스터 정보, ', characterId);
    const character = await CharacterService.findByPk(characterId);
    const { hp: playerHP, attack: playerDamage } = character!
    const monster = await MonsterService.findByPk(monsterId);
    
    if (!monster) return { status: 'terminate', script: '몬스터 정보 에러' };
    const { name: monsterName, hp: monsterHP, attack: monsterDamage, exp: monsterExp } = monster;

    // 유저 턴
    // console.log('autoAttack.worker.ts: 66 >> 플레이어 턴, ', characterId);
    const playerHit = BattleService.hitStrength(playerDamage);
    const playerAdjective = BattleService.dmageAdjective(
        playerHit,
        playerDamage,
    );
    tempScript += `\n당신의 ${playerAdjective} 공격이 ${monsterName}에게 적중했다. => ${playerHit}의 데미지!\n`;
    // console.log(tempScript);
    
    const isDead = await MonsterService.refreshStatus(monsterId, playerHit, characterId);
    if (!isDead) return { status: 'terminate', script: '몬스터 정보 에러' };
    
    if (isDead === 'dead') {
        battleCache.set(characterId, { dead: 'monster' });
        tempScript += `\n당신의 ${playerAdjective} 공격에 ${monsterName}이 쓰러졌다. => ${playerHit}의 데미지!`;

        // const data = { field: 'autoBattle', script: tempScript, userStatus };
        // BATTLE.to(socketId).emit('printBattle', data);

        return { status: 'monster', script: tempScript };
    }

    if (!monster) return { status: 'terminate', script: '몬스터 정보 에러' };
    // 몬스터 턴
    // console.log('autoAttack.worker.ts: 몬스터 턴, ', characterId);
    const monsterHit = BattleService.hitStrength(monsterDamage);
    const monsterAdjective = BattleService.dmageAdjective(
        monsterHit,
        monsterDamage,
    );
    tempScript += `${monsterName} 이(가) 당신에게 ${monsterAdjective} 공격! => ${monsterHit}의 데미지!\n`;
    // console.log(tempScript);
    
    const refreshUser = await CharacterService.refreshStatus(characterId, monsterHit, 0, monsterId);
    if (refreshUser.isDead === 'dead') {
        battleCache.set(characterId, { dead: 'player' });
        
        tempScript += '\n!! 치명상 !!\n';
        tempScript += `당신은 ${monsterName}의 공격을 버티지 못했습니다.. \n`;        
        tempScript += `${monsterName} 의 ${monsterAdjective} 공격이 치명상으로 적중! => ${monsterHit}의 데미지!
        마을로 돌아갑니다...!!\n`;

        // const data = { field: 'autoBattle', script: tempScript, userStatus: refreshUser };
        // BATTLE.to(socketId).emit('printBattle', data);

        return { status: 'player', script: tempScript };
    }

    const data = { field: 'autoBattle', script: tempScript, userStatus: refreshUser };
    BATTLE.to(socketId).emit('printBattle', data);

    return { status: 'continue', script: tempScript };
}


function continueWorker({ status, script }: AutoWorkerResult, characterId: number, autoToDead: MessagePort) {
    console.log('continue autoAttack, ', characterId);
}

function resultWorker({ status, script }: AutoWorkerResult, characterId: number, autoToDead: MessagePort) {
    const { autoAttackTimer } = battleCache.get(characterId);
    clearInterval(autoAttackTimer);
    autoToDead.postMessage({ status, script });
    parentPort?.postMessage('자동공격 종료');
}

function terminateWorker({ status, script }: AutoWorkerResult, characterId: number, autoToDead: MessagePort) {
    const { autoAttackTimer } = battleCache.get(characterId);
    clearInterval(autoAttackTimer);
    autoToDead.postMessage({ status, script });
    parentPort?.postMessage('자동공격 종료');
}

// const autoAttackWorkerPath = __filename;
// export { autoAttackWorkerPath }