import { setEnvironmentData } from 'worker_threads';
import { InferAttributes } from 'sequelize';
import { autoBattleHandler, deadReport } from '.';
import { battleError, errorReport, HttpException } from '../common';
import { battleCache, redis } from '../db/cache';
import { Skills } from '../db/models';
import { AutoBattleResult, DeadReport } from '../interfaces/battle';
import { UserInfo, UserStatus } from '../interfaces/user';
import BATTLE from '../redis';
import { MonsterService, BattleService, CharacterService } from '../services';
import autoBattle from '../workers/autoBattle';
// import { autoAttackWorker, isMonsterDeadWorker, skillAttackWorker } from '../workers';


export default {

    // DEPRECATED
    // 비교용 싱글스레드 전투
    autoBattle: (socketId: string, userInfo: UserInfo, userStatus: UserStatus): Promise<void> => {
        return new Promise(async(resolve, reject) => {
            let field = 'autoBattleS';
            const { characterId } = userStatus;
            const { dungeonLevel } = await redis.battleGet(characterId);
            redis.battleSet(characterId, { LOOP: 'on' });
            // console.log('auto.handler.ts: check cache ', dungeonLevel, characterId)

            if (!dungeonLevel) {
                console.log('autoBattle cache error: dungeonLevel missing', userInfo.characterId);
                redis.battleSet(characterId, { LOOP: 'off' });
                battleError(socketId);
                return resolve();
            }
    
            // 몬스터 생성
            const { monsterId, name } = await MonsterService.createNewMonster(dungeonLevel, characterId);
            const monsterCreatedScript = `\n${name}이(가) 등장했습니다.\n\n`;
            battleCache.set(characterId, { dungeonLevel, monsterId, userStatus });
    
            BATTLE.to(socketId).emit('printBattle', { script: monsterCreatedScript, field, userStatus })
    
            // 자동공격 사이클
            const autoAttackTimer = setInterval(async() => {

                const { LOOP } = await redis.battleGet(characterId);
                const { userStatus } = battleCache.get(characterId);
                if (LOOP === 'off' || !dungeonLevel || !userStatus) {
                    // console.log('autoAttack LOOP error', userInfo.characterId);
                    clearInterval(autoAttackTimer);
                    battleError(socketId);
                    return;
                }
                battleCache.set(characterId, { autoAttackTimer });

                // 기본공격
                autoAttack(socketId, userStatus).then((result) => {
                    if (!result) {
                        redis.battleSet(characterId, { LOOP: 'off' });
                        clearInterval(autoAttackTimer);
                        BATTLE.to(socketId).emit('void');
                        return;
                    }
    
                    const { field, script, userStatus } = result;
                    const data = { 
                        field: field !== 'heal' ? 'autoBattleS' : 'heal', 
                        script, userInfo, userStatus
                    }    
                    BATTLE.to(socketId).emit('printBattle', data);
    
                    // dead = 'moster'|'player'|undefined
                    const { dead } = battleCache.get(characterId);
                    if (dead) {
                        clearInterval(autoAttackTimer);
                        redis.battleSet(characterId, { LOOP: 'off' });
                        battleCache.delete(characterId);
                      
                        switch (dead) {
                            case 'player':
                                return;
                            case 'monster':
                                autoBattleHandler.autoBattle(socketId, userInfo, userStatus)
                                return;
                        }
                    }
    
                    // 스킬공격
                    const chance = Math.random();
                    if (chance < 0.5) {
                        BATTLE.to(socketId).emit('void');
                        return;
                    }
    
                    autoBattleSkill(socketId, userStatus).then((result) => {
                        if (!result) {
                            clearInterval(autoAttackTimer);
                            redis.battleSet(characterId, { LOOP: 'off' });
                            // BATTLE.to(socketId).emit('void');
                            return
                        }
    
                        const { field, script, userStatus } = result    
                        const data = { field: 'autoBattleS', script, userInfo, userStatus }
                        BATTLE.to(socketId).emit('printBattle', data);
    
                        const { dead } = battleCache.get(characterId);
                        if (dead) {
                            clearInterval(autoAttackTimer);
                            redis.battleSet(characterId, { LOOP: 'off' });
                            battleCache.delete(characterId);
    
                            switch (dead) {
                                case 'player':
                                    return;
                                case 'monster':
                                    autoBattleHandler.autoBattle(socketId, userInfo, userStatus)
                                    return;
                            }
                        }
                    }).catch(reject);
                }).catch(reject);
            }, 1500)
    
            BATTLE.to(socketId).emit('print', { script: '', userInfo, field });
            resolve();
        });
    },

    autoBattleWorker: (socketId: string, userStatus: UserStatus): Promise<void> => {
        return new Promise(async(resolve, reject) => {
            const { characterId } = userStatus;
            redis.battleSet(characterId, { LOOP: 'on', SKILL: 'on', status: 'continue' });
            
            // console.log('battle.handler.ts: 자동전투 핸들러 시작, ', characterId);
            const { dungeonLevel } = await redis.battleGet(characterId);
            if (!dungeonLevel) {
                console.log('autoBattleWorker cache error: dungeonLevel missing', characterId);
                battleError(socketId);
                return resolve();
            }

            // 몬스터 생성
            const { monsterId, name } = await MonsterService.createNewMonster(dungeonLevel, characterId);
            const monsterCreatedScript = `\n${name}이(가) 등장!! 전투시작.\n`;
            battleCache.set(characterId, { dungeonLevel, monsterId });
            // console.log('battle.handler.ts: ', monsterCreatedScript)

            const data = { field: 'autoBattle', script: monsterCreatedScript, userStatus }
            BATTLE.to(socketId).emit('printBattle', data);

            setEnvironmentData(characterId, JSON.stringify({ monsterId, dungeonLevel }));
            autoBattle.start(socketId, userStatus);
            resolve();
        });
    }
}


// DEPRECATED
// (구)자동전투용으로 완전 대체 이후 삭제
// (구)일반/(구)자동 기본공격에서 사용 중
// { field, script, userStatus } || Error
export const autoAttack = async (socketId: string, userStatus: UserStatus): Promise<void|DeadReport> => {
    let tempScript: string = '';
    const { characterId, attack: playerDamage } = userStatus;

    const { autoAttackTimer, monsterId } = battleCache.get(characterId);
    if (!autoAttackTimer || !monsterId) return;

    // 유저&몬스터 정보 불러오기
    const monster = await MonsterService.findByPk(monsterId);
    if (!monster) {
        console.log('autoAttack cache Error: monster missing', characterId);
        return battleError(socketId);
    }
    const { name: monsterName, attack: monsterDamage } = monster;

    // 플레이어 턴
    const playerHit = BattleService.hitStrength(playerDamage);
    const playerAdjective = BattleService.dmageAdjective(playerHit, playerDamage);
    tempScript += 
    `\n당신의 <span style="color:blue">${playerAdjective} 공격</span>이 ${monsterName}에게 적중했다. => <span style="color:blue">${playerHit}</span>의 데미지!\n`;

    const isDead = await MonsterService.refreshStatus(monsterId, playerHit, characterId);
    if (!isDead) {
        console.log('autoAttack monster refresh Error: monster missing', characterId);
        return battleError(socketId);
    }

    // 몬스터 사망
    if (isDead === 'dead') {
        battleCache.set(characterId, { dead: 'monster' });
        const report = await deadReport.monster(monster, tempScript, userStatus);
        if (report instanceof Error) {
            console.log('autoAttack monster isDead error', characterId);
            return battleError(socketId);
        }
        return report; // { field, script, userStatus }
    }

    // 몬스터 턴
    const monsterHit = BattleService.hitStrength(monsterDamage);
    const monsterAdjective = BattleService.dmageAdjective(
        monsterHit,
        monsterDamage,
    );
    tempScript += `${monsterName} 이(가) 당신에게 <span style="color:red">${monsterAdjective} 공격</span>! => <span style="color:red">${monsterHit}</span>의 데미지!\n`;
    userStatus = await CharacterService.refreshStatus(userStatus, monsterHit, 0, monsterId);
    battleCache.set(characterId, { userStatus });

    // 플레이어 사망
    if (userStatus.isDead === 'dead') {
        battleCache.set(characterId, { dead: 'player' });
        const report = deadReport.player(monster, userStatus);
        return report;
    }

    const field = 'autoBattleS';
    const script = tempScript;
    return { field, script, userStatus };
}


const autoBattleSkill = async(socketId: string, 
    userStatus: UserStatus): Promise<DeadReport|void> => {

    const { characterId, mp, attack, skill } = userStatus
    let field = 'autoBattle';
    let tempScript = '';

    // 스킬 정보 가져오기 & 사용할 스킬 선택 (cost 반비례 확률)
    const selectedSkill = skillSelector(skill);
    const { name: skillName, cost: skillCost, multiple } = selectedSkill;

    // 몬스터 정보 가져오기
    const { monsterId } = battleCache.get(characterId);
    if (!monsterId) {
        console.log('autoBattleSkill get monster error: monsterId missing', characterId);
        return battleError(socketId);
    }
    const monster = await MonsterService.findByPk(monsterId);
    if (!monster) {
        console.log('autoBattleSkill get monster error: monster missing', characterId);
        return battleError(socketId);
    }
    const { name: monsterName } = monster;

    // 마나 잔여량 확인
    if (mp - skillCost < 0) {
        tempScript += `<span style="color:yellow">??? : 비전력이 부조카당.</span>\n`;
        const script = tempScript;
        return { field, script, userStatus };
    }

    // 스킬 데미지 계산 & 마나 cost 소모
    const playerSkillDamage = ((attack * multiple) / 100)|0;
    const realDamage = BattleService.hitStrength(playerSkillDamage);
    userStatus = await CharacterService.refreshStatus(userStatus, 0, skillCost, monsterId);

    // 몬스터에게 스킬 데미지 적중
    const isDead = await MonsterService.refreshStatus(monsterId, realDamage, characterId);
    if (!isDead) {
        console.log('autoBattleSkill monster refresh error: monster missing', characterId);
        return battleError(socketId);
    }
    tempScript += `\n당신의 <span style="color:blue">${skillName}</span> ${monsterName}에게 적중! => <span style="color:blue">${realDamage}</span>의 데미지!\n`;

    if (isDead === 'dead') {
        battleCache.set(characterId, { dead: 'monster' });
        const report = await deadReport.monster(monster, tempScript, userStatus);
        if (report instanceof Error) {
            console.log('autoBattleSkill monster isDead error', characterId);
            return battleError(socketId);
        }
        return report; // { field, script, userStatus }
    }

    // isDead === 'alive'
    const script = tempScript;
    return { field, script, userStatus };
}

const skillSelector = (skill: InferAttributes<Skills, { omit: never; }>[]) => {
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


