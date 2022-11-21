"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const path_1 = require("path");
const config_env_1 = __importDefault(require("../config.env"));
class isMonsterDead {
    constructor() {
        this.threads = new Map();
        this.check = (userCache, { autoToDeadReceive, skillToDeadReceive }) => {
            const { characterId } = userCache;
            console.log('isMonsterDead.ts: 사망확인 check() 시작, ', characterId);
            const workerData = {
                userCache,
                path: './isMonsterDead.worker.ts',
            };
            return new Promise((resolve, reject) => {
                const worker = new worker_threads_1.Worker((0, path_1.join)(config_env_1.default.ROOT_PATH, 'src', 'workers', 'isMonsterDead.worker.js'), { workerData });
                worker.postMessage({ autoToDeadReceive, skillToDeadReceive }, [autoToDeadReceive, skillToDeadReceive]);
                this.threads.set(characterId, worker);
                console.log('isMonsterDead.ts: check() Promise', worker.threadId, characterId);
                worker.on('message', (result) => {
                    worker.terminate();
                    resolve(result);
                });
                // worker.on('online', () => {});
                // worker.on('messageerror', reject);
                worker.on('error', reject);
                worker.on('exit', (code) => {
                    console.log(`isMonsterDead ${characterId} exitCode: ${code}`, characterId);
                    this.threads.delete(characterId);
                });
            });
        };
        this.getWorker = (characterId) => {
            return this.threads.get(characterId);
        };
        this.terminateWorker = (characterId) => {
            const worker = this.threads.get(characterId);
            worker === null || worker === void 0 ? void 0 : worker.terminate();
        };
    }
}
exports.default = new isMonsterDead();
