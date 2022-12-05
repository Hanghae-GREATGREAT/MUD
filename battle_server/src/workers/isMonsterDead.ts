import { Worker, MessagePort } from 'worker_threads';
import { join } from 'path';
import env from '../env'
import { AutoWorkerData, AutoWorkerResult, IsDeadReceiver } from '../interfaces/worker';
import { UserStatus } from '../interfaces/user';
import { HttpException } from '../common';


class isMonsterDead {

    private threads: Map<number, Worker> = new Map();

    check = (socketId: string, userStatus: UserStatus, { autoToDeadReceive, skillToDeadReceive }: IsDeadReceiver): Promise<AutoWorkerResult> => {
        const { characterId } = userStatus;
        console.log('isMonsterDead.ts: 사망확인 check() 시작, ', characterId);
        const workerData: AutoWorkerData = { 
            userStatus,
            path: './isMonsterDead.worker.ts',
            socketId,
        };

        return new Promise((resolve, reject) => {
            const worker = new Worker(
                join(env.SRC_PATH, 'workers', 'isMonsterDead.worker.js'),
                { workerData }
            );
            worker.postMessage({ autoToDeadReceive, skillToDeadReceive }, [ autoToDeadReceive, skillToDeadReceive ]);
            this.threads.set(characterId, worker);
            console.log('isMonsterDead.ts: check() Promise', worker.threadId, characterId);

            worker.on('message', (result: AutoWorkerResult) => {
                worker.terminate().catch((err) => {
                    const error = new HttpException(
                        `isMonsterDead terminate error: ${err.message}`,
                        500, socketId
                    );
                    reject(error);
                }).finally(() => {
                    resolve(result);
                });
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

    terminate = (characterId: number) => {
        const worker = this.threads.get(characterId);
        worker?.terminate();
    }

}


export default new isMonsterDead();

