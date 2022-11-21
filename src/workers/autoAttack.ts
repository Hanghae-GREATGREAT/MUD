import { Worker, MessagePort } from 'worker_threads';
import { join } from 'path';
import env from '../config.env'
import { AutoWorkerData } from '../interfaces/worker';
import { UserCache } from '../interfaces/user';


class AutoAttackWorker {

    private threads: Map<number, Worker> = new Map();

    start = (userCache: UserCache, autoToDead: MessagePort): Promise<void> => {
        const { characterId } = userCache;
        console.log('autoAttack.ts: 기본공격반복 start() 시작, ', characterId);
        const workerData: AutoWorkerData = {
            userCache,
            path: './autoAttack.worker.ts',
        }

        return new Promise((resolve, reject) => {
            const worker = new Worker(
                join(env.SRC_PATH, 'workers', 'autoAttack.worker.js'),
                { workerData }
            );
            worker.postMessage({ autoToDead }, [ autoToDead ]);
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
    }

    get = (characterId: number) => {
        return this.threads.get(characterId);
    }

    terminate = (characterId: number) => {
        const worker = this.threads.get(characterId);
        worker?.terminate();
    }

}


export default new AutoAttackWorker();