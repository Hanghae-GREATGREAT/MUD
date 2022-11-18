import { Worker, MessagePort } from 'worker_threads';
import { join } from 'path';
import env from '../config.env'
import { AutoWorkerData } from '../interfaces/worker';


class AutoAttackWorker {

    private threads: Map<number, Worker> = new Map();

    start = (characterId: number, autoToDead: MessagePort): Promise<void> => {
        console.log('autoAttack.ts: 12 >> 기본공격반복 start() 시작');
        const workerData: AutoWorkerData = {
            characterId,
            path: './autoAttack.worker.ts',
        }

        return new Promise((resolve, reject) => {
            const worker = new Worker(
                join(env.SRC_PATH, 'workers', 'autoAttack.worker.js'),
                { workerData }
            );
            worker.postMessage({ autoToDead }, [ autoToDead ]);
            this.threads.set(characterId, worker);
            console.log('autoAttack.ts: 25 >> start() Promise', worker.threadId);

            worker.on('message', (result) => {
                worker.terminate();
                resolve(result);
            });
            // worker.on('online', () => {});
            worker.on('messageerror', reject);
            worker.on('error', reject);
            worker.on('exit', (code) => {
                console.log(`autoAttack ${characterId} exitCode: ${code}`);
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