import { Worker, MessagePort } from 'node:worker_threads';
import { join } from 'path';
import env from '../config.env';
import { AutoWorkerData } from '../interfaces/worker';


class SkillAttackWorker {

    private threads: Map<number, Worker> = new Map();

    start = (characterId: number, skillToDead: MessagePort): Promise<void> => {
        console.log('skillAttack.ts: 12 >> 스킬반복 start() 시작');
        const workerData: AutoWorkerData = {
            characterId,
            path: './skillAttack.worker.ts',
        }

        return new Promise((resolve, reject) => {
            const worker = new Worker(
                join(env.SRC_PATH, 'workers', 'skillAttack.worker.js'),
                { workerData }
            );
            worker.postMessage({ skillToDead }, [ skillToDead ]);
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
    }

    get = (characterId: number) => {
        return this.threads.get(characterId);
    }

    terminate = (characterId: number) => {
        const worker = this.threads.get(characterId);
        worker?.terminate();
    }

}


export default new SkillAttackWorker();