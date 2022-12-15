import { Worker } from 'worker_threads';
import { EventEmitter } from 'events';
import { join } from 'path';
import env from '../env'
import { AutoWorkerData, AutoWorkerResult } from '../interfaces/worker';
import { UserStatus } from '../interfaces/user';
import { battleError, errorReport } from '../common';
import { deadReport } from '../handlers';
import { AutoBattleResult } from '../interfaces/battle';
import { redis } from '../db/cache';


class AutoBattleWorker extends EventEmitter {

    private threads: Map<number, Worker> = new Map();
    private waitList: number[] = [];

    constructor(
        private readonly threadCount: number
    ) { super() }

    start = (socketId: string, userStatus: UserStatus) => {
        const { characterId } = userStatus;
        // console.log('autoBattle.ts: start(), ', characterId);

        const workerData: AutoWorkerData = {
            userStatus,
            path: './autoBattle.worker.ts',
            socketId,
        }

        if (this.threads.size > this.threadCount) {
            // console.log('POOL IS FULL', characterId)

            this.waitList.push(characterId);
            this.once(`${characterId}`, async(next) => {
                // console.log('POOL IS READY', next, characterId);

                const { status } = await redis.battleGet(characterId);
                if (status === 'terminate') return;
                
                this.create(workerData).then((result) => {
                    // console.log('autoBattle.ts: worker resolved', characterId);
                    this.result(socketId, result);
                }).catch((error) => {
                    console.log('autoBattle.ts: worker rejected', characterId);
                    errorReport(error);
                });
            });
            return;
        }

        this.create(workerData).then((result) => {
            // console.log('autoBattle.ts: worker resolved', characterId);
            this.result(socketId, result);
        }).catch((error) => {
            console.log('autoBattle.ts: worker rejected', characterId);
            errorReport(error);
        });
    }

    create = (workerData: AutoWorkerData): Promise<AutoWorkerResult> => {
        const { characterId } = workerData.userStatus;

        return new Promise((resolve, reject) => {
            const worker = new Worker(
                join(env.SRC_PATH, 'workers', 'autoBattle.worker.js'),
                { workerData }
            );
            const workerId = worker.threadId;
            this.threads.set(characterId, worker);
            // console.log('autoBattle.ts: worker created', workerId, this.threads.size, characterId);

            worker.on('message', (result: AutoWorkerResult) => {
                // console.log('autoBattle.ts: worker message received', result.status, characterId);

                resolve(result);
                worker.terminate().then(()=>{
                    // console.log('worker terminated', workerId, characterId);
                }).catch(errorReport);
            });

            worker.on('messageerror', reject);
            worker.on('error', reject);

            worker.on('exit', (code) => {
                // console.log(`autoBattle ${workerId} exitCode: ${code}`, characterId);
                this.threads.delete(characterId);

                const next = this.waitList.shift();
                if (next) this.emit(`${next}`, next);
            });
        });
    }

    result = (socketId: string, { status, script, userStatus } : AutoWorkerResult) => {
        const { characterId } = userStatus;
        // console.log('autoBattle.ts: result', status, characterId);
        if (status === 'error') {
            console.log('autoBattle.ts: result error', characterId);
            battleError(socketId);
            return;
        }
        if (status === 'terminate') {
            console.log('autoBattle.ts: terminated', characterId);
            return;
        }

        const battleResult: AutoBattleResult = {
            monster: deadReport.autoMonster,
            player: deadReport.autoPlayer,
        }
        battleResult[status](socketId, script, userStatus)
            .then(()=>{
                // console.log('autoBattle.ts: battleresult success', characterId);
            }).catch(errorReport);
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


export default new AutoBattleWorker(30);