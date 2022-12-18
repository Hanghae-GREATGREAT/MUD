import { workerData, getEnvironmentData, parentPort } from 'worker_threads';
import { EventEmitter } from 'events';
import associate from '../db/config/associate';
import { AutoWorkerData, AutoWorkerResult } from '../interfaces/worker';
import { battleCache, redis } from '../db/cache';
import { battleError } from '../common';
import autoAttack from './autoAttack';
import skillAttack from './skillAttack';


const isDead = new EventEmitter();

const autoAttackLoop = ({ socketId, userStatus }: AutoWorkerData) => {
    const { characterId } = userStatus;
    // //console.log('autoBattle.worker.ts: autoAttack start', characterId);

    const autoAttackTimer = setInterval(async() => {
        // //console.log('autuBattle.worker.ts: autoAttack interval', characterId);

        const cache = await redis.battleGet(characterId);
        const { dungeonLevel, userStatus } = battleCache.get(characterId);
        if (cache.LOOP === 'off' || !dungeonLevel || !userStatus) {
            clearInterval(autoAttackTimer);
            redis.battleSet(characterId, { LOOP: 'on'});

            const status = cache.status === 'terminate' ? 'terminate' : 'error';
            const msg = `AUTOATTACK ERROR: ${cache.LOOP} ${dungeonLevel}, ${characterId}`;
            isDead.emit('dead', { status, msg });
            return;
        }
        battleCache.set(characterId, { autoAttackTimer });

        // //console.log('autoBattle.worker.ts: autoAttack calc', characterId)
        autoAttack(socketId, userStatus).then((result: AutoWorkerResult) => {
            // //console.log('autoBattle.worker.ts: autoAttack resolved', characterId);
            // result = { status, script, userStatus }
            // status = player | monster | terminate

            if (result.status !== 'continue') isDead.emit('dead', result);

        }).catch((error) => {
            //console.log(`autoBattle.worker.ts: autoAttack error, ${error?.message}`);
            return battleError(socketId);
        });
    }, 500);

    return;
}

const skillAttackLoop = ({ socketId, userStatus }: AutoWorkerData) => {
    const { characterId } = userStatus;
    // //console.log('autoBattle.worker.ts: skillAttack start', characterId);

    const skillAttackTimer = setInterval(async () => {
        // //console.log('skillAttack.worker.ts: START INTERVAL', Date.now())
        const cache = await redis.battleGet(characterId);
        const { dungeonLevel, userStatus } = battleCache.get(characterId);
        if (cache.SKILL === 'off' || !dungeonLevel || !userStatus) {
            clearInterval(skillAttackTimer);
            redis.battleSet(characterId, { SKILL: 'on'});
            
            const status = cache.status === 'terminate' ? 'terminate' : 'error';
            const msg = `AUTOATTACK ERROR: ${cache.SKILL}, ${dungeonLevel}, ${characterId}`;
            isDead.emit('dead', { status, msg });
            return;
        }
        battleCache.set(characterId, { skillAttackTimer });

        const chance = Math.random();
        if (chance < 0.5) return ////console.log('pass skill', characterId);

        // //console.log('autoBattle.worker.ts: skillAttack calc', characterId)
        skillAttack(socketId, userStatus).then((result: AutoWorkerResult) => {
            // //console.log('autoBattle.worker.ts: skillAttack resolved', characterId);
            // result = { status, script, userStatus }
            // status = player | monster | terminate

            if (result.status !== 'continue') isDead.emit('dead', result);
    
        }).catch((error) => {
            //console.log(`autoBattle.worker.ts: skillAttack error, ${error?.message}`);
            return battleError(socketId);
        });

    }, 800);
}

const main = () => {
    associate();

    const { userStatus } = workerData;
    const { characterId } = userStatus;
    
    const cache = getEnvironmentData(characterId);
    const { dungeonLevel, monsterId } = JSON.parse(cache.toString());
    battleCache.set(characterId, { dungeonLevel, monsterId, userStatus });

    isDead.on('dead', (result: AutoWorkerResult) => {
        const { autoAttackTimer, skillAttackTimer } = battleCache.get(characterId);
        clearInterval(autoAttackTimer);
        clearInterval(skillAttackTimer);
        redis.battleSet(characterId, { LOOP: 'off', SKILL: 'off' });

        // //console.log('autoBattle.worker.ts: isDead clear loops', characterId);

        parentPort?.postMessage(result);
    });
    autoAttackLoop(workerData);
    skillAttackLoop(workerData);
}


main();