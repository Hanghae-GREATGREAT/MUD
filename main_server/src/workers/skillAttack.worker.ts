import { parentPort, workerData, getEnvironmentData, MessagePort } from 'worker_threads'
import associate from '../db/config/associate';
import { CharacterService, MonsterService, BattleService } from '../services'
import { battleCache } from '../db/cache';
import { Skills } from '../db/models';
import { AutoWorkerData, AutoWorkerResult } from '../interfaces/worker';
import { UserStatus } from '../interfaces/user';
import { InferAttributes } from 'sequelize';


//console.log('skillAttack.worker.ts: 11 >> 스킬공격 워커 모듈 동작')
associate();
parentPort?.once('message', ({ skillToDead }) => {
    skillAttackWorker(workerData, skillToDead);
});


function skillAttackWorker({ userStatus }: AutoWorkerData, skillToDead: MessagePort) {
    
    const { characterId } = userStatus;
    //console.log('skillAttack.worker.ts: 20 >> skillAttackWorker start', characterId);

    const cache = getEnvironmentData(characterId);
    battleCache.set(characterId, JSON.parse(cache.toString()));

    const skillAttackTimer = setInterval(async () => {
        //console.log('skillAttack.worker.ts: START INTERVAL', Date.now())
        battleCache.set(characterId, { skillAttackTimer });

        const chance = Math.random();
        if (chance < 0.5) return //console.log('STOP');
        //console.log('GO')

        autoBattleSkill(userStatus).then(({ status, script }: AutoWorkerResult) => {
            //console.log('skillAttack.worker.ts: autoBattleSkill resolved', status);

            const statusHandler = {
                continue: continueWorker,
                monster: resultWorker,
                player: resultWorker,
                terminate: terminateWorker,
            }
            statusHandler[status]({ status, script }, characterId, skillToDead);
    
            return;
        });

    }, 800);
}


async function autoBattleSkill(userStatus: UserStatus): Promise<AutoWorkerResult> {
    //console.log('skillAttack.worker.ts >> autoBattleSkill(): 시작')
    const { characterId, mp, attack, skill } = userStatus
    let field = 'autoBattle';
    let tempScript = '';

    // 스킬 정보 가져오기 & 사용할 스킬 선택 (cost 반비례 확률)
    const selectedSkill = skillSelector(skill);
    const { name: skillName, cost: skillCost, multiple } = selectedSkill;

    // 몬스터 정보 가져오기
    // const { monsterId } = await redis.hGetAll(characterId);
    const { monsterId } = battleCache.get(characterId);
    if (!monsterId) return { status: 'terminate', script: '몬스터 정보 에러' };
    const monster = await MonsterService.findByPk(monsterId);
    if (!monster) return { status: 'terminate', script: '몬스터 정보 에러' };
    const { name: monsterName, hp: monsterHp, exp: monsterExp } = monster;

    // 마나 잔여량 확인
    if (mp - skillCost < 0) {
        tempScript += `??? : 비전력이 부조카당.\n`;
        const script = tempScript;
        //console.log('skillAttack.worker.ts: 마나 부족')
        return { status: 'continue', script: '' };
    }

    // 스킬 데미지 계산 & 마나 cost 소모
    const playerSkillDamage: number = Math.floor(
        (attack * multiple) / 100,
    );
    const realDamage: number = BattleService.hitStrength(playerSkillDamage);
    userStatus = await CharacterService.refreshStatus(characterId, 0, skillCost, monsterId);

    // 몬스터에게 스킬 데미지 적중
    const isDead = await MonsterService.refreshStatus(monsterId, realDamage, characterId);
    if (!isDead) return { status: 'terminate', script: '몬스터 정보 에러' };
    tempScript += `\n당신의 ${skillName} 스킬이 ${monsterName}에게 적중! => ${realDamage}의 데미지!\n`;
    //console.log(tempScript);

    if (isDead === 'dead') {
        //console.log('몬스터 사망 by SKILL ATTACK');
        battleCache.set(characterId, { dead: 'monster' });
        // await redis.hSet(characterId, { dead: 'monster' });

        const script = `\n${monsterName}에게 ${skillName} 마무리 일격!! => ${realDamage}의 데미지!`;
        return { status: 'monster', script };
    }

    // isDead === 'alive'
    const script = tempScript;
    //console.log('스킬로 안쥬금ㅇㅇㅇㅇ')
    return { status: 'continue', script: '' };
}

function skillSelector(skill: InferAttributes<Skills, { omit: never; }>[]) {
    const skillCounts = skill.length;
    const skillCosts = skill.map((s)=>s.cost);        
    const costSum = skillCosts.reduce((a: number, b: number)=>a+b, 0);
    const chanceSum = skillCosts.reduce((a: number, b: number) => {
        return a + costSum/b
    }, 0);

    const chance = Math.random();
    let skillIndex = 0;
    let cumChance =  0;
    for (let i=0; i<skillCounts; i++) {
        const singleChance = (costSum / skillCosts[i]) / chanceSum
        cumChance += singleChance;
        //console.log(chance, cumChance)
        if (chance <= cumChance) {
            skillIndex = i;
            break;
        }
    }

    return skill[skillIndex];
}

function continueWorker({ status, script }: AutoWorkerResult, characterId: number, skillToDead: MessagePort) {
    //console.log('continue skillAttack');
}

function resultWorker({ status, script }: AutoWorkerResult, characterId: number, skillToDead: MessagePort) {
    const { skillAttackTimer } = battleCache.get(characterId);
    clearInterval(skillAttackTimer);
    skillToDead.postMessage({ status, script });
    parentPort?.postMessage('자동스킬 종료');
}

function terminateWorker({ status, script }: AutoWorkerResult, characterId: number, skillToDead: MessagePort) {
    const { skillAttackTimer } = battleCache.get(characterId);
    clearInterval(skillAttackTimer);
    skillToDead.postMessage({ status, script });
    parentPort?.postMessage('자동스킬 종료');
}