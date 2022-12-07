// import { Worker, MessagePort } from 'worker_threads';
// import { join } from 'path';
// import env from '../env'
// import { AutoWorkerData } from '../interfaces/worker';
// import { UserStatus } from '../interfaces/user';


// interface AutoWorkerData {
//     [key: string]: MessagePort|number|string|UserStatus;
//     userStatus: UserStatus;
//     path: string;
//     socketId: string;
// }

// class AutoAttackWorker {

//     private threads: Map<number, Worker> = new Map();

//     start = (userStatus: UserStatus, autoToDead: MessagePort): Promise<void> => {

//         // roomname? roomId? 룸 식별자
//         const { characterId } = userStatus;


//         console.log('autoAttack.ts: 기본공격반복 start() 시작, ', characterId);
//         const workerData: AutoWorkerData = {
//             userStatus: '전투 시작할때 방에 있는 사람들 정보 { {socketId, userStatus} }',
//             path: './autoAttack.worker.ts',
//         }

//         return new Promise((resolve, reject) => {
//             const worker = new Worker(
//                 join(env.SRC_PATH, 'workers', 'autoAttack.worker.js'),
//                 { workerData }
//             );
//             // threads.set(room, worker)
//             this.threads.set(characterId, worker);
//             console.log('autoAttack.ts: start() Promise', worker.threadId, characterId);

//             worker.on('message', (result) => {
//                 worker.terminate();
//                 resolve(result);
//             });
//             // worker.on('online', () => {});
//             worker.on('messageerror', reject);
//             worker.on('error', reject);
//             worker.on('exit', (code) => {
//                 console.log(`autoAttack ${characterId} exitCode: ${code}`, characterId);
//                 this.threads.delete(characterId);
//             });
//         });
//     }

//     get = (characterId: number) => {
//         return this.threads.get(characterId);
//     }

//     terminate = (characterId: number) => {
//         const worker = this.threads.get(characterId);
//         worker?.terminate();
//     }

// }


// export default new AutoAttackWorker();