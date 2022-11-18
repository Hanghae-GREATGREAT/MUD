import { Worker, MessagePort } from 'worker_threads';
import { join } from 'path';
import env from '../config.env'
import { AutoWorkerData, IsDeadReceiver } from '../interfaces/worker';


class isMonsterDead {

    private threads: Map<number, Worker> = new Map();

    check = (characterId: number, { autoToDeadReceive, skillToDeadReceive }: IsDeadReceiver): Promise<string> => {
        console.log('isMonsterDead.ts: 12 >> 사망확인 check() 시작');
        const workerData: AutoWorkerData = { 
            characterId,
            path: './isMonsterDead.worker.ts',
        };

        return new Promise((resolve, reject) => {
            const worker = new Worker(
                join(env.ROOT_PATH, 'src', 'workers', 'isMonsterDead.worker.js'),
                { workerData }
            );
            worker.postMessage({ autoToDeadReceive, skillToDeadReceive }, [ autoToDeadReceive, skillToDeadReceive ]);
            this.threads.set(characterId, worker);
            console.log('isMonsterDead.ts: 25 >> check() Promise', worker.threadId);

            worker.on('message', (result) => {
                worker.terminate();
                resolve(result);
            });
            // worker.on('online', () => {});
            // worker.on('messageerror', reject);
            worker.on('error', reject);
            worker.on('exit', (code) => {
                console.log(`isMonsterDead ${characterId} exitCode: ${code}`);
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


// const { dead } = await redis.hGetAll(characterId);
//         // dead = 'moster'|'player'|undefined
//         if (dead) {
//             redis.hDelResetCache(characterId);
//             const { autoAttackId } = battleCache.get(characterId)
//             clearInterval(autoAttackId);
//             battleCache.delete(characterId);
    
//             const result = await whoIsDead[dead]('', newUser);
//             socket.to(socket.id).emit('print', result);
    
//             return;
//         }


