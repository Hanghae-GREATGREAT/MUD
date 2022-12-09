import { setEnvironmentData } from 'worker_threads';
import { InferAttributes } from 'sequelize';
import { autoBattleHandler, deadReport } from '.';
import { errorReport, HttpException } from '../common';
import { battleCache } from '../db/cache';
import { Skills } from '../db/models';
import { AutoBattleResult, DeadReport } from '../interfaces/battle';
import { UserInfo, UserStatus } from '../interfaces/user';
import BATTLE from '../redis';
import { MonsterService, BattleService, CharacterService } from '../services';
import { autoAttackWorker, isMonsterDeadWorker, skillAttackWorker } from '../workers';


export default {
    autoBattle: (socketId: string, userInfo: UserInfo, userStatus: UserStatus): Promise<void> => {
        return new Promise(async(resolve, reject) => {
            let tempScript = ''
            let field = 'autoBattleS';
            const { characterId } = userStatus;
            const { dungeonLevel } = battleCache.get(characterId);
            // console.log('auto.handler.ts: check cache ', dungeonLevel, characterId)
            if (!dungeonLevel) {
                const error = new HttpException(
                    'autoBattle cache error: dungeonLevel missing', 
                    500, socketId
                );
                return reject(error);
            }
    
            // 몬스터 생성
            const { monsterId, name } = await MonsterService.createNewMonster(dungeonLevel, characterId);
            const monsterCreatedScript = `\n${name}이(가) 등장했습니다.\n\n`;
            battleCache.set(characterId, { monsterId });
    
            BATTLE.to(socketId).emit('printBattle', { script: monsterCreatedScript, field, userStatus })
    
            // 자동공격 사이클
            const autoAttackTimer = setInterval(async () => {
                if (!battleCache.get(characterId)) return;
                battleCache.set(characterId, { autoAttackTimer });

                // 기본공격
                autoAttack(socketId, userStatus).then(async(result) => {
                    if (!result) {
                        BATTLE.to(socketId).emit('void');
                        return resolve();
                    }
    
                    const { field, script, userStatus } = result
                    const data = { 
                        field: field !== 'heal' ? 'autoBattleS' : 'heal', 
                        script, userInfo, userStatus }
    
                    BATTLE.to(socketId).emit('printBattle', data);
    
                    // dead = 'moster'|'player'|undefined
                    const { dead } = battleCache.get(characterId);
                    if (dead) {
                        clearInterval(autoAttackTimer);
                        battleCache.delete(characterId);
                      
                        switch (dead) {
                            case 'player':
                                return resolve();
                            case 'monster':
                                battleCache.set(characterId, { dungeonLevel });
                                autoBattleHandler.autoBattle(socketId, userInfo, userStatus)
                                return resolve();
                        }
                    }
    
                    // 스킬공격
                    const chance = Math.random();
                    if (chance < 0.5) {
                        BATTLE.to(socketId).emit('void');
                        return resolve();
                    }
    
                    autoBattleSkill(socketId, userStatus).then(async(result) => {
                        if (!result) {
                            BATTLE.to(socketId).emit('void');
                            return resolve();
                        }
    
                        const { field, script, userStatus } = result    
                        const data = { field: 'autoBattleS', script, userInfo, userStatus }
    
                        BATTLE.to(socketId).emit('printBattle', data);
    
                        const { dead } = battleCache.get(characterId);
                        if (dead) {
                            clearInterval(autoAttackTimer);
                            battleCache.delete(characterId);
    
                            switch (dead) {
                                case 'player':
                                    return resolve();
                                case 'monster':
                                    battleCache.set(characterId, { dungeonLevel });
                                    autoBattleHandler.autoBattle(socketId, userInfo, userStatus)
                                    return resolve();
                            }
                        }
                    }).catch(reject);
                }).catch(reject);
            }, 1500)
    
            BATTLE.to(socketId).emit('print', { script: tempScript, userInfo, field });
        });
    },

    autoBattleWorker: (socketId: string, userStatus: UserStatus): Promise<void> => {
        return new Promise(async(resolve, reject) => {
            const { characterId } = userStatus;
            // console.log('battle.handler.ts: 자동전투 핸들러 시작, ', characterId);
            const { dungeonLevel } = battleCache.get(characterId);
            if (!dungeonLevel) {
                const error = new HttpException(
                    'autoBattleWorker cache error: dungeonLevel missing', 
                    500, socketId
                );
                return reject(error);
            }

            // 몬스터 생성
            const { monsterId, name } = await MonsterService.createNewMonster(dungeonLevel, characterId);
            const monsterCreatedScript = `\n${name}이(가) 등장!! 전투시작.\n`;
            battleCache.set(characterId, { monsterId });
            // console.log('battle.handler.ts: ', monsterCreatedScript)

            const data = { field: 'autoBattle', script: monsterCreatedScript, userStatus }
            BATTLE.to(socketId).emit('printBattle', data);

            // const cache = battleCache.get(characterId);
            // NodeJS.Timer까지 있어서 JSON 불가
            // console.log('auto.handler.ts: get cache', cache)
            setEnvironmentData(characterId, JSON.stringify({ monsterId, dungeonLevel }));

            const { port1: autoToDead, port2: autoToDeadReceive } = new MessageChannel();
            const { port1: skillToDead, port2: skillToDeadReceive } = new MessageChannel();
            const receiver = { autoToDeadReceive, skillToDeadReceive };

            // 사망판정 워커 할당 >> 소켓 송신
            isMonsterDeadWorker.check(socketId, userStatus, receiver).then(({ status, script}) => {
                if (status === 'terminate') {
                    const error = new HttpException(
                        'deadworker resolved: terminated',
                        500, socketId
                    );
                    return reject(error);
                }

                const battleResult: AutoBattleResult = {
                    monster: deadReport.autoMonster,
                    player: deadReport.autoPlayer,
                }
                const error = battleResult[status](socketId, characterId, script);
                error ? reject(error) : resolve();
            }).catch(reject);

            // 자동공격 워커 할당
            autoAttackWorker.start(socketId, userStatus, autoToDead).then((result) => {
                console.log('battle.handler.ts: 자동 공격 resolved', result, characterId);
                resolve();
            }).catch(reject);

            // 스킬공격 워커 할당
            skillAttackWorker.start(socketId, userStatus, skillToDead).then((result) => {
                console.log('battle.handler.ts: 스킬 공격 resolved', result, characterId);
                resolve();
            }).catch(reject);
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
        const error = new HttpException(
            'autoAttack cache Error: monster missing', 
            500, socketId
        );
        return errorReport(error);
    }
    const { name: monsterName, attack: monsterDamage } = monster;

    // 플레이어 턴
    const playerHit = BattleService.hitStrength(playerDamage);
    const playerAdjective = BattleService.dmageAdjective(playerHit, playerDamage);
    tempScript += 
    `\n당신의 ${playerAdjective} 공격이 ${monsterName}에게 적중했다. => ${playerHit}의 데미지!\n`;

    const isDead = await MonsterService.refreshStatus(monsterId, playerHit, characterId);
    if (!isDead) {
        const error = new HttpException(
            'autoAttack monster refresh Error: monster missing', 
            500, socketId
        );
        return errorReport(error);
    }

    // 몬스터 사망
    if (isDead === 'dead') {
        battleCache.set(characterId, { dead: 'monster' });
        const report = await deadReport.monster(monster, tempScript);
        if (report instanceof Error) return errorReport(report); // Error
        return report; // { field, script, userStatus }
    }

    // 몬스터 턴
    const monsterHit = BattleService.hitStrength(monsterDamage);
    const monsterAdjective = BattleService.dmageAdjective(
        monsterHit,
        monsterDamage,
    );
    tempScript += `${monsterName} 이(가) 당신에게 ${monsterAdjective} 공격! => ${monsterHit}의 데미지!\n`;
    userStatus = await CharacterService.refreshStatus(characterId, monsterHit, 0, monsterId);

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
        const error = new HttpException(
            'autoBattleSkill get monster error: monsterId missing', 
            500, socketId
        )
        return errorReport(error);
    }
    const monster = await MonsterService.findByPk(monsterId);
    if (!monster) {
        const error = new HttpException(
            'autoBattleSkill get monster error: monster missing', 
            500, socketId
        )
        return errorReport(error);
    }
    const { name: monsterName } = monster;

    // 마나 잔여량 확인
    if (mp - skillCost < 0) {
        tempScript += `??? : 비전력이 부조카당.\n`;
        const script = tempScript;
        return { field, script, userStatus };
    }

    // 스킬 데미지 계산 & 마나 cost 소모
    const playerSkillDamage = ((attack * multiple) / 100)|0;
    const realDamage = BattleService.hitStrength(playerSkillDamage);
    userStatus = await CharacterService.refreshStatus(characterId, 0, skillCost, monsterId);

    // 몬스터에게 스킬 데미지 적중
    const isDead = await MonsterService.refreshStatus(monsterId, realDamage, characterId);
    if (!isDead) {
        const error = new HttpException(
            'autoBattleSkill monster refresh error: monster missing', 
            500, socketId
        )
        return errorReport(error);
    }
    tempScript += `\n당신의 ${skillName} 스킬이 ${monsterName}에게 적중! => ${realDamage}의 데미지!\n`;

    if (isDead === 'dead') {
        battleCache.set(characterId, { dead: 'monster' });
        const report = await deadReport.monster(monster, tempScript);
        if (report instanceof Error) return errorReport(report); // Error
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

