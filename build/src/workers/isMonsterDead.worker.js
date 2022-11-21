"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const autoAttack_1 = __importDefault(require("./autoAttack"));
const skillAttack_1 = __importDefault(require("./skillAttack"));
const { userCache } = worker_threads_1.workerData;
worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.once('message', (receiver) => {
    const { characterId } = userCache;
    console.log('isMonsterDead.worker.ts: 사망 확인 모듈 동작, ', characterId);
    isMonsterDead(characterId, receiver);
});
function isMonsterDead(characterId, { autoToDeadReceive, skillToDeadReceive }) {
    console.log('isMonsterDead.worker.ts: isMonsterDead() 시작, ', characterId);
    const cache = (0, worker_threads_1.getEnvironmentData)(characterId);
    const { monsterId, dungeonLevel } = JSON.parse(cache.toString());
    autoToDeadReceive.on('message', ({ status, script }) => {
        console.log(`AUTO DEAD: ${status} ${monsterId} ${dungeonLevel}`, characterId);
        skillAttack_1.default.terminate(characterId);
        worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage({ status, script });
        worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.close();
    });
    skillToDeadReceive.on('message', ({ status, script }) => {
        console.log(`SKILL DEAD: ${status} ${monsterId} ${dungeonLevel}`, characterId);
        autoAttack_1.default.terminate(characterId);
        worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage({ status, script });
        worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.close();
    });
}
