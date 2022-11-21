import { workerData, parentPort, MessagePort, getEnvironmentData } from 'worker_threads';
import { AutoWorkerResult, IsDeadReceiver } from '../interfaces/worker';
import autoAttack from './autoAttack';
import skillAttack from './skillAttack';


const { userCache } = workerData;
parentPort?.once('message', (receiver: IsDeadReceiver) => {
    const { characterId } = userCache;
    console.log('isMonsterDead.worker.ts: 사망 확인 모듈 동작, ', characterId);
    isMonsterDead(characterId, receiver);
});

function isMonsterDead(characterId: number, { autoToDeadReceive, skillToDeadReceive }: IsDeadReceiver) {
    console.log('isMonsterDead.worker.ts: isMonsterDead() 시작, ', characterId);

    const cache = getEnvironmentData(characterId);
    const { monsterId, dungeonLevel } = JSON.parse(cache.toString());

    autoToDeadReceive.on('message', ({ status, script }: AutoWorkerResult) => {
        console.log(`AUTO DEAD: ${status} ${monsterId} ${dungeonLevel}`, characterId);

        skillAttack.terminate(characterId);
        parentPort?.postMessage({ status, script });
        parentPort?.close();
    });
    skillToDeadReceive.on('message', ({ status, script }: AutoWorkerResult) => {
        console.log(`SKILL DEAD: ${status} ${monsterId} ${dungeonLevel}`, characterId);
        
        autoAttack.terminate(characterId);
        parentPort?.postMessage({ status, script });
        parentPort?.close();
    });
}

