"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const path_1 = require("path");
const config_env_1 = __importDefault(require("../config.env"));
class AutoAttackWorker {
    constructor() {
        this.threads = new Map();
        this.start = (userCache, autoToDead) => {
            const { characterId } = userCache;
            console.log('autoAttack.ts: 기본공격반복 start() 시작, ', characterId);
            const workerData = {
                userCache,
                path: './autoAttack.worker.ts',
            };
            return new Promise((resolve, reject) => {
                const worker = new worker_threads_1.Worker((0, path_1.join)(config_env_1.default.SRC_PATH, 'workers', 'autoAttack.worker.js'), { workerData });
                worker.postMessage({ autoToDead }, [autoToDead]);
                this.threads.set(characterId, worker);
                console.log('autoAttack.ts: start() Promise', worker.threadId, characterId);
                worker.on('message', (result) => {
                    worker.terminate();
                    resolve(result);
                });
                // worker.on('online', () => {});
                worker.on('messageerror', reject);
                worker.on('error', reject);
                worker.on('exit', (code) => {
                    console.log(`autoAttack ${characterId} exitCode: ${code}`, characterId);
                    this.threads.delete(characterId);
                });
            });
        };
        this.get = (characterId) => {
            return this.threads.get(characterId);
        };
        this.terminate = (characterId) => {
            const worker = this.threads.get(characterId);
            worker === null || worker === void 0 ? void 0 : worker.terminate();
        };
    }
}
exports.default = new AutoAttackWorker();
