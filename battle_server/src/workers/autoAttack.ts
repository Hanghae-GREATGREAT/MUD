import { Worker, MessagePort } from 'worker_threads';
import { join } from 'path';
import env from '../env'
import { AutoWorkerData } from '../interfaces/worker';
import { UserStatus } from '../interfaces/user';
import { errorReport } from '../common';


class AutoAttackWorker {

    private threads: Map<number, Worker> = new Map();

    start = (socketId: string, userStatus: UserStatus, autoToDead: MessagePort): Promise<void> => {
        const { characterId } = userStatus;
        console.log('autoAttack.ts: 기본공격반복 start() 시작, ', characterId);
        const workerData: AutoWorkerData = {
            userStatus,
            path: './autoAttack.worker.ts',
            socketId,
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
        worker?.terminate().catch(errorReport);
    }

    all = () => {
        return Object.fromEntries(this.threads);
    }

}


export default new AutoAttackWorker();