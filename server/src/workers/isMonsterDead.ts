import { Worker, MessagePort } from 'worker_threads';
import { join } from 'path';
import env from '../config.env'
import { AutoWorkerData, AutoWorkerResult, IsDeadReceiver } from '../interfaces/worker';
import { UserStatus } from '../interfaces/user';


class isMonsterDead {

    private threads: Map<number, Worker> = new Map();

    check = (userStatus: UserStatus, { autoToDeadReceive, skillToDeadReceive }: IsDeadReceiver): Promise<AutoWorkerResult> => {
        const { characterId } = userStatus;
        console.log('isMonsterDead.ts: 사망확인 check() 시작, ', characterId);
        const workerData: AutoWorkerData = { 
            userStatus,
            path: './isMonsterDead.worker.ts',
        };

        return new Promise((resolve, reject) => {
            const worker = new Worker(
                join(env.ROOT_PATH, 'src', 'workers', 'isMonsterDead.worker.js'),
                { workerData }
            );
            worker.postMessage({ autoToDeadReceive, skillToDeadReceive }, [ autoToDeadReceive, skillToDeadReceive ]);
            this.threads.set(characterId, worker);
            console.log('isMonsterDead.ts: check() Promise', worker.threadId, characterId);

            worker.on('message', (result: AutoWorkerResult) => {
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
    }

    getWorker = (characterId: number) => {
        return this.threads.get(characterId);
    }

    terminateWorker = (characterId: number) => {
        const worker = this.threads.get(characterId);
        worker?.terminate();
    }

}


export default new isMonsterDead();

