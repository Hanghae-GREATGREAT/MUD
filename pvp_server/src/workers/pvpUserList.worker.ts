// import { parentPort, workerData, getEnvironmentData, MessagePort } from 'worker_threads'
// import associate from '../db/config/associate';
// import { CharacterService, MonsterService, BattleService } from '../services'
// import { battleCache } from '../db/cache';
// import { AutoWorkerData, AutoWorkerResult } from '../interfaces/worker';
// import { UserStatus } from '../interfaces/user';


// console.log('autoAttack.worker.ts: 9 >> 자동공격 워커 모듈 동작, ', workerData.userStatus.characterId)


// interface AutoWorkerData {
//     [key: string]: MessagePort|number|string|UserStatus;
//     userStatus: UserStatus;
//     path: string;
//     socketId: string;
// }

// function autoAttackWorker({ UserStatus, path }: AutoWorkerData) {    

//     const { characterId } = userStatus;
//     console.log('autoAttack.worker.ts: 18 >> autoAttackWorker() 시작', characterId);

//     const cache = getEnvironmentData(characterId);
//     battleCache.set(characterId, JSON.parse(cache.toString()));

//     console.log(battleCache.getAll());

//     const autoAttackTimer = setInterval(async () => {
        
//         // redis 룸 데이터 가져오고

//         // 스크립트 만들고

//         // PVP.to().emit()
    
//     }, 5000);

//     return;
// }
