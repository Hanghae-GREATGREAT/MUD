import { InferAttributes } from "sequelize";
import { battleCache } from "../db/cache";
import { Skills } from "../db/models";
import { UserStatus } from "../interfaces/user";
import { AutoWorkerResult } from "../interfaces/worker";
import { MonsterService, BattleService, CharacterService } from "../services";


async function skillAttack(socketId: string, userStatus: UserStatus): Promise<AutoWorkerResult> {
    // console.log('skillAttack.worker.ts >> autoBattleSkill(): 시작')
    const { characterId, mp, attack, skill } = userStatus
    let field = 'autoBattle';

    // 스킬 정보 가져오기 & 사용할 스킬 선택 (cost 반비례 확률)
    const selectedSkill = skillSelector(skill);
    const { name: skillName, cost: skillCost, multiple } = selectedSkill;

    // 몬스터 정보 가져오기
    // const { monsterId } = await redis.hGetAll(characterId);
    const { monsterId } = battleCache.get(characterId);
    if (!monsterId) return { status: 'error', script: '몬스터 정보 에러', userStatus };
    const monster = await MonsterService.findByPk(monsterId);
    if (!monster) return { status: 'error', script: '몬스터 정보 에러', userStatus };
    const { name: monsterName, hp: monsterHp, exp: monsterExp } = monster;

    // 마나 잔여량 확인
    if (mp - skillCost < 0) {
        const script = `<span style="color:yellow">??? : 비전력이 부조카당.</span>\n`;
        // console.log('skillAttack.worker.ts: 마나 부족')
        return { status: 'continue', script, userStatus };
    }

    // 스킬 데미지 계산 & 마나 cost 소모
    const playerSkillDamage = ( (attack * multiple) / 100 )|0;
    const realDamage: number = BattleService.hitStrength(playerSkillDamage);

    userStatus = await CharacterService.refreshStatus(userStatus, 0, skillCost, monsterId);
    battleCache.set(characterId, { userStatus });

    // 몬스터에게 스킬 데미지 적중
    const isDead = await MonsterService.refreshStatus(monsterId, realDamage, characterId);
    if (!isDead) return { status: 'error', script: '몬스터 정보 에러', userStatus };
    const script = `\n당신의 <span style="color:blue">${skillName}</span> ${monsterName}에게 적중! => <span style="color:blue">${realDamage}</span>의 데미지!\n`;
    // console.log(tempScript);

    if (isDead === 'dead') {
        // console.log('몬스터 사망 by SKILL ATTACK');
        battleCache.set(characterId, { dead: 'monster' });
        // await redis.hSet(characterId, { dead: 'monster' });

        const script = `\n${monsterName}에게 <span style="color:blue">${skillName}</span> 마무리 일격!! => <span style="color:blue">${realDamage}</span>의 데미지!`;
        return { status: 'monster', script, userStatus };
    }

    // isDead === 'alive'
    // console.log('스킬로 안쥬금ㅇㅇㅇㅇ')
    return { status: 'continue', script, userStatus };
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
        if (chance <= cumChance) {
            skillIndex = i;
            break;
        }
    }

    return skill[skillIndex];
}


export default skillAttack;