"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_worker_threads_1 = require("node:worker_threads");
const path_1 = require("path");
const config_env_1 = __importDefault(require("../config.env"));
class SkillAttackWorker {
    constructor() {
        this.threads = new Map();
        this.start = (characterId, skillToDead) => {
            console.log('skillAttack.ts: 12 >> 스킬반복 start() 시작');
            const workerData = {
                characterId,
                path: './skillAttack.worker.ts',
            };
            return new Promise((resolve, reject) => {
                const worker = new node_worker_threads_1.Worker((0, path_1.join)(config_env_1.default.SRC_PATH, 'workers', 'skillAttack.worker.js'), { workerData });
                worker.postMessage({ skillToDead }, [skillToDead]);
                this.threads.set(characterId, worker);
                console.log('skillAttack.ts: 25 >> start() Promise', worker.threadId);
                worker.on('message', (result) => {
                    worker.terminate();
                    resolve(result);
                });
                // worker.on('online', () => {});
                worker.on('messageerror', reject);
                worker.on('error', reject);
                worker.on('exit', (code) => {
                    console.log(`skillAttack ${characterId} exitCode: ${code}`);
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
exports.default = new SkillAttackWorker();
