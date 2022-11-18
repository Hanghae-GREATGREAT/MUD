import { parentPort, workerData, getEnvironmentData, MessagePort } from 'worker_threads'
import { battleCache } from '../db/cache';
import { battle, dungeon } from '../handler';
import { AutoWorkerData } from '../interfaces/worker';
import { CharacterService, MonsterService, BattleService } from '../services'
import associate from '../db/config/associate';


console.log('skillAttack.worker.ts: 9 >> 스킬공격 워커 모듈 동작', workerData)
associate();
parentPort?.once('message', ({ skillToDead }) => {
    skillAttackWorker(workerData, skillToDead);
});


function skillAttackWorker({ characterId }: AutoWorkerData, skillToDead: MessagePort) {
    
    console.log('skillAttack.worker.ts: 18 >> 스킬공격 워커 함수 시작', characterId);

    const cache = getEnvironmentData(characterId);
    battleCache.set(characterId, JSON.parse(cache.toString()));

    const tempTime = Date.now();
    const skillAttackTimer = setInterval(async () => {
        console.log('skillAttack.worker.ts: 25')
        battleCache.set(characterId, { skillAttackTimer });
        
        if (Date.now() > tempTime + 5000) {
            clearInterval(skillAttackTimer);
            battleCache.delete(characterId);
            skillToDead.postMessage('monster')
            parentPort?.postMessage('CLEAR SKILL ATTACK');
            parentPort?.close();
        }
    }, 1500);
}