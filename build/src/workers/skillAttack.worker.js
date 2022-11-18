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
const cache_1 = require("../db/cache");
const associate_1 = __importDefault(require("../db/config/associate"));
console.log('skillAttack.worker.ts: 9 >> 스킬공격 워커 모듈 동작', worker_threads_1.workerData);
(0, associate_1.default)();
worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.once('message', ({ skillToDead }) => {
    skillAttackWorker(worker_threads_1.workerData, skillToDead);
});
function skillAttackWorker({ characterId }, skillToDead) {
    console.log('skillAttack.worker.ts: 18 >> 스킬공격 워커 함수 시작', characterId);
    const cache = (0, worker_threads_1.getEnvironmentData)(characterId);
    cache_1.battleCache.set(characterId, JSON.parse(cache.toString()));
    const tempTime = Date.now();
    const skillAttackTimer = setInterval(() => __awaiter(this, void 0, void 0, function* () {
        console.log('skillAttack.worker.ts: 25');
        cache_1.battleCache.set(characterId, { skillAttackTimer });
        if (Date.now() > tempTime + 5000) {
            clearInterval(skillAttackTimer);
            cache_1.battleCache.delete(characterId);
            skillToDead.postMessage('monster');
            worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage('CLEAR SKILL ATTACK');
            worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.close();
        }
    }), 1500);
}
