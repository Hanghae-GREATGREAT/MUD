import { Worker } from 'worker_threads';
import { EventEmitter } from 'events';
import { join } from 'path';
import env from '../env'
import { UserStatus } from '../interfaces/user';
import { errorReport } from '../common';
import { PvpUsersWorkerData, pvpUsersWorkerResult } from '../interfaces/worker';


class PvpUserskWorker extends EventEmitter {

    private threads: Map<string, Worker> = new Map();
    private waitList: string[] = [];

    constructor(
        private readonly threadCount: number
    ) { super() }

    start = (userStatus: UserStatus) => {
        const { pvpRoom } = userStatus;

        const workerData: PvpUsersWorkerData = {
            userStatus,
            path: './pvpUsers.worker.ts',
        }

        if (this.threads.size > this.threadCount) {

            this.waitList.push(pvpRoom!);
            this.once(`${pvpRoom}`, async(next) => {

                
                this.create(workerData).then().catch((error) => {
                    //console.log('pvpUsers.ts: worker rejected', pvpRoom);
                    errorReport(error);
                });
            });
            return;
        }

        this.create(workerData).then().catch((error) => {
            //console.log('pvpUsers.ts: worker rejected', pvpRoom);
            errorReport(error);
        });
    }

    create = (workerData: PvpUsersWorkerData): Promise<pvpUsersWorkerResult> => {
        const { pvpRoom } = workerData.userStatus;

        return new Promise((resolve, reject) => {
            const worker = new Worker(
                join(env.SRC_PATH, 'workers', 'pvpUsers.worker.js'),
                { workerData }
            );
            this.threads.set(pvpRoom!, worker);
            worker.postMessage(workerData.userStatus);

            worker.on('message', (result: pvpUsersWorkerResult) => {
                resolve(result);
                worker.terminate()
            });

            worker.on('messageerror', reject);
            worker.on('error', reject);

            worker.on('exit', (code) => {
                this.threads.delete(pvpRoom!);

                const next = this.waitList.shift();
                if (next) this.emit(`${next}`, next);
            });
        });
    }

    get = (pvpRoom: string) => {
        return this.threads.get(pvpRoom);
    }

    terminate = (pvpRoom: string) => {
        const worker = this.threads.get(pvpRoom);
        worker?.terminate().catch(errorReport);
    }

    all = () => {
        return Object.fromEntries(this.threads);
    }
}


export default new PvpUserskWorker(20);