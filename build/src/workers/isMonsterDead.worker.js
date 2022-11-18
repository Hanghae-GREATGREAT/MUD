"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
console.log('isMonsterDead.worker.ts: 4 >> 사망 확인 모듈 동작', worker_threads_1.workerData);
const { characterId } = worker_threads_1.workerData;
worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.once('message', (receiver) => {
    isMonsterDead(characterId, receiver);
});
function isMonsterDead(characterId, { autoToDeadReceive, skillToDeadReceive }) {
    console.log('isMonsterDead.worker.ts: 11 >> isMonsterDead() 시작');
    const cache = (0, worker_threads_1.getEnvironmentData)(characterId);
    const { monsterId, dungeonLevel } = JSON.parse(cache.toString());
    autoToDeadReceive.on('message', (isDead) => {
        console.log(`AUTO DEAD: ${isDead} ${monsterId} ${dungeonLevel}`);
        worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage(isDead);
        worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.close();
    });
    skillToDeadReceive.on('message', (isDead) => {
        console.log(`SKILL DEAD: ${isDead} ${monsterId} ${dungeonLevel}`);
        worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage(isDead);
        worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.close();
    });
}
