import { Worker } from 'worker_threads';
import { EventEmitter } from 'events';
import { join } from 'path';
import env from '../env'
import { AutoWorkerData, AutoWorkerResult } from '../interfaces/worker';
import { UserStatus } from '../interfaces/user';
import { battleError, errorReport } from '../common';
import { deadReport } from '../handlers';
import { AutoBattleResult } from '../interfaces/battle';


class AutoBattleWorker extends EventEmitter {

    private threads: Map<number, Worker> = new Map();
    private waitList: number[] = [];

    constructor(
        private readonly threadCount: number
    ) { super() }

    start = (socketId: string, userStatus: UserStatus) => {
        const { characterId } = userStatus;
        console.log('autoBattle.ts: start(), ', characterId);

        const workerData: AutoWorkerData = {
            userStatus,
            path: './autoBattle.worker.ts',
            socketId,
        }

        if (this.threads.size > this.threadCount) {

            this.waitList.push(characterId);
            this.on(`${characterId}`, () => {
                this.create(workerData).then((result) => {
                    this.result(socketId, characterId, result);
                }).catch(errorReport);
            });
            return;
        }

        this.create(workerData).then((result) => {
            this.result(socketId, characterId, result);
        }).catch(errorReport);
    }

    create = (workerData: AutoWorkerData): Promise<AutoWorkerResult> => {
        const { characterId } = workerData.userStatus;

        return new Promise((resolve, reject) => {
            const worker = new Worker(
                join(env.SRC_PATH, 'workers', 'autoBattle.worker.js'),
                { workerData }
            );
            this.threads.set(characterId, worker);
            console.log('autoBattle.ts: worker created', worker.threadId, characterId);

            worker.on('message', (result: AutoWorkerResult) => {
                console.log('autoBattle.ts: worker message received', characterId);

                resolve(result);
                worker.terminate().catch(errorReport);
            });

            worker.on('messageerror', reject);
            worker.on('error', reject);

            worker.on('exit', (code) => {
                console.log(`autoBattle ${worker.threadId} exitCode: ${code}`, characterId);
                this.threads.delete(characterId);

                const next = this.waitList.shift();
                if (next) this.emit(`${next}`);
            });
        });
    }

    result = (socketId: string, characterId: number, result: AutoWorkerResult) => {
        const { status, script } = result;
        if (status === 'error') {
            console.log('autoBattle.ts: result error', characterId);
            battleError(socketId);
            return;
        }

        const battleResult: AutoBattleResult = {
            monster: deadReport.autoMonster,
            player: deadReport.autoPlayer,
        }
        battleResult[status](socketId, characterId, script)
            .then().catch(errorReport);
    }

    get = (characterId: number) => {
        return this.threads.get(characterId);
    }

    terminate = (characterId: number) => {
        // redis.battleSet(characterId, { LOOP: 'off' });
        const worker = this.threads.get(characterId);
        worker?.terminate().catch(errorReport);
    }

    all = () => {
        return Object.fromEntries(this.threads);
    }

}


export default new AutoBattleWorker(10);