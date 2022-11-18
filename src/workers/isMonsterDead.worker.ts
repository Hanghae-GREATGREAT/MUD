import { workerData, parentPort, MessagePort, getEnvironmentData } from 'worker_threads';
import { IsDeadReceiver } from '../interfaces/worker';

console.log('isMonsterDead.worker.ts: 4 >> 사망 확인 모듈 동작', workerData);
const { characterId } = workerData;
parentPort?.once('message', (receiver: IsDeadReceiver) => {
    isMonsterDead(characterId, receiver);
});

function isMonsterDead(characterId: number, { autoToDeadReceive, skillToDeadReceive }: IsDeadReceiver) {
    console.log('isMonsterDead.worker.ts: 11 >> isMonsterDead() 시작');

    const cache = getEnvironmentData(characterId);
    const { monsterId, dungeonLevel } = JSON.parse(cache.toString());

    autoToDeadReceive.on('message', (isDead) => {
        console.log(`AUTO DEAD: ${isDead} ${monsterId} ${dungeonLevel}`);
        parentPort?.postMessage(isDead);
        parentPort?.close();
    });
    skillToDeadReceive.on('message', (isDead) => {
        console.log(`SKILL DEAD: ${isDead} ${monsterId} ${dungeonLevel}`);
        parentPort?.postMessage(isDead);
        parentPort?.close();
    });
}

