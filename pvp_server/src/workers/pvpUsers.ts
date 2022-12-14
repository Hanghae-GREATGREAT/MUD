import { Worker, MessagePort } from 'worker_threads';
import { join } from 'path';
import env from '../env'
import { PvpUsersWorkerData } from '../interfaces/worker';
import { UserStatus } from '../interfaces/user';

class PvpUserskWorker {

    private threads: Map<string, Worker> = new Map();

    start = (userStatus: UserStatus): Promise<void> => {
        const { pvpRoom } = userStatus;

        const workerData: PvpUsersWorkerData = {
            userStatus,
            path: './pvpUsers.worker.ts',
        }

        return new Promise((resolve, reject) => {
            const worker = new Worker(
                join(env.SRC_PATH, 'workers', 'pvpUsers.worker.js'),
                { workerData }
            );
            worker.postMessage(userStatus);
            this.threads.set(pvpRoom!, worker);

            worker.on('message', (result) => {
                worker.terminate();
                resolve(result);
            });
            worker.on('messageerror', reject);
            worker.on('error', reject);
            worker.on('exit', (code) => {
                this.threads.delete(pvpRoom!);
            });
        });
    }

    get = (pvpRoom: string) => {
        return this.threads.get(pvpRoom);
    }

    terminate = (pvpRoom: string) => {
        const worker = this.threads.get(pvpRoom);
        worker?.terminate();
    }

}


export default new PvpUserskWorker();