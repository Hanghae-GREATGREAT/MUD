import { deadReport, dungeonHandler } from '.';
import { battleError, errorReport, HttpException } from '../common';
import { battleCache, redis } from '../db/cache';
import { UserInfo, UserStatus } from '../interfaces/user';
import BATTLE from '../redis';
import { battleScript, dungeonScript } from '../scripts';
import { MonsterService, BattleService, CharacterService } from '../services';
import autoBattle from '../workers/autoBattle';
import { autoAttack } from './autobattle.handler';



export default {
    attack: (socketId: string, userInfo: UserInfo, userStatus: UserStatus): Promise<void> => {
        return new Promise(async(resolve, reject) => {
            const { characterId } = userInfo;
            const { dungeonLevel, monsterId } = await redis.battleGet(characterId);
            redis.battleSet(characterId, { LOOP: 'on', terminate: 'continue' });

            const autoAttackTimer = setInterval(async() => {

                const cache = await redis.battleGet(characterId);
                if (cache.LOOP === 'off' || !dungeonLevel) {
                    console.log('battle handler autoAttack LOOP error', userInfo.characterId);
                    clearInterval(autoAttackTimer);
                    if (cache.status === 'continue') battleError(socketId);
                    return resolve();
                }
                battleCache.set(characterId, { dungeonLevel, monsterId, autoAttackTimer });
    
                autoAttack(socketId, userStatus).then((result) => {
                    if (!result) {
                        BATTLE.to(socketId).emit('void');
                        return resolve();
                    }

                    const { field, script, userStatus } = result;
                    const data = { field: 'action', script, userInfo, userStatus };

                    BATTLE.to(socketId).emit('printBattle', data);
    
                    // dead = 'moster'|'player'|undefined
                    const { dead } = battleCache.get(characterId);
                    if (dead) {
                        clearInterval(autoAttackTimer);
                        redis.battleSet(characterId, { LOOP: 'off' });
                        battleCache.delete(characterId);
    
                        // const data = { field, script, userInfo, userStatus };
                        // BATTLE.to(socketId).emit('printBattle', data);
    
                        switch(dead) {
                            case 'player': 
                                dungeonHandler.dungeonList(socketId, userInfo);
                                return resolve();
                            case 'monster': 
                                dungeonHandler.encounter(socketId, userInfo, userStatus);
                                return resolve();
                        }
                    }
                }).catch(reject);
    
            }, 1500);
    
            userStatus.cooldown = Date.now()-2000;
            const data = { field: 'action', script: '', userInfo, userStatus  };
            BATTLE.to(socketId).emit('printBattle', data);
        });
    },

    quit: (socketId: string, userInfo: UserInfo) => {
        const { characterId } = userInfo;
        const { monsterId } = battleCache.get(characterId);
        if (!monsterId) {
            console.log('quit battle cache error: monsterId missing', userInfo.characterId);
            return battleError(socketId);
        }

        // 몬스터 삭제
        MonsterService.destroyMonster(monsterId, characterId);

        const script = battleScript.quit;
        const field = 'dungeon';

        BATTLE.to(socketId).emit('print', { field, script, userInfo });
    },

    skill: (socketId: string, CMD: string, userInfo: UserInfo, userStatus: UserStatus): Promise<void> => {
        return new Promise(async(resolve, reject) => {
            let tempScript = '';
            let field = 'action';
            const { characterId, attack, mp, skill } = userStatus;
            // console.log('battle.handler.ts: action skill', characterId);
    
            // 스킬 정보 가져오기
            if (skill[Number(CMD)-1] === undefined) {
                console.log('battle.handler.ts: wrong skill number', characterId);
                const script = battleScript.battleHelp(CMD);
                const field = 'action';
                BATTLE.to(socketId).emit('printBattle', { field, script, userInfo, userStatus });
                return resolve();
            }
            const { name: skillName, cost, multiple } = skill[Number(CMD)-1];
            
            // 몬스터 정보 가져오기
            const { monsterId } = await redis.battleGet(characterId);
            if (!monsterId) {
                console.log('battle.handler.ts: skill monsterId missing', characterId);
                battleError(socketId);
                return resolve();
            }
            const monster = await MonsterService.findByPk(monsterId);
            if (!monster) {
                console.log('battle.handler.ts: skill monster missing', characterId);
                battleError(socketId);
                return resolve();
            }        
            const { name: monsterName } = monster;
    
            // 마나 잔여량 확인
            if (mp - cost < 0) {
                console.log('battle.handler.ts: skill empty mana', characterId);
                tempScript += `??? : 비전력이 부조카당.\n`;
                const script = tempScript;
                BATTLE.to(socketId).emit('printBattle', { field, script, userInfo, userStatus });
                return resolve();
            }
    
            // 스킬 데미지 계산 & 마나 cost 소모
            const playerSkillDamage = ((attack * multiple) / 100)|0;
            const realDamage = BattleService.hitStrength(playerSkillDamage);
            userStatus = await CharacterService.refreshStatus(characterId, 0, cost, monsterId);
    
            // 몬스터에게 스킬 데미지 적용 
            const isDead = await MonsterService.refreshStatus(monsterId, realDamage, characterId);
            if (!monster) {
                console.log('skill monster refresh error: monster missing', userInfo.characterId);
                battleError(socketId);
                return resolve();
            }  
            tempScript += `\n당신의 ${skillName} 스킬이 ${monsterName}에게 적중! => ${realDamage}의 데미지!\n`;
    
            const { autoAttackTimer, dead } = battleCache.get(characterId);
            if (isDead === 'dead' || dead === 'monster') {
                // console.log('battle.handler.ts: skill monster dead', characterId, isDead, dead);
                clearInterval(autoAttackTimer);
                redis.battleSet(characterId, { LOOP: 'off', status: 'terminate' });

                const report = await deadReport.monster(monster, tempScript);
                if (report instanceof Error) {
                    console.log('battle hadler skill error', report.message, userInfo.characterId);
                    battleError(socketId);
                    return resolve();
                }
    
                BATTLE.to(socketId).emit('printBattle', report); // { field, script, userStatus }
                battleCache.delete(characterId);
                dungeonHandler.encounter(socketId, userInfo, userStatus);
                return resolve();
            }
    
            // isDead === 'alive'
            const script = tempScript;
            userStatus.cooldown = Date.now();
            BATTLE.to(socketId).emit('printBattle', { field, script, userInfo, userStatus });
        });
    },

    stopAuto: (socketId: string, userInfo: UserInfo): HttpException|void => {
        const { characterId } = userInfo;

        // 기본공격 중단 & 몬스터 삭제
        redis.battleSet(characterId, { LOOP: 'off' });

        const cache = battleCache.get(characterId);
        if (cache) {
            const { autoAttackTimer } = cache;
            clearInterval(autoAttackTimer);
            battleCache.delete(characterId);
        }
        redis.battleGet(characterId).then(({ monsterId }) => {
            if (monsterId) MonsterService.destroyMonster(monsterId, characterId);
        });

        const script = `
        ========================================
        전투를 중단하고 마을로 돌아갑니다. \n\n`
        const field = 'dungeon';
        BATTLE.to(socketId).emit('print', { field, script, userInfo });

    },
    stopAutoWorker: (socketId: string, userInfo: UserInfo) => {
        const { characterId } = userInfo;

        try {
            if (autoBattle.get(characterId)) {
                console.log('battle.handler.ts: stopAutoWorker SAME', characterId);

                autoBattle.terminate(characterId);
                battleCache.delete(characterId);
            } else {
                console.log('battle.handler.ts: stopAutoWorker DIFFERENT', characterId);

                redis.battleSet(characterId, { LOOP: 'off', SKILL: 'off', status: 'terminate' });
            }

            redis.battleGet(characterId).then(({ monsterId }) => {
                if (monsterId) MonsterService.destroyMonster(monsterId, characterId);
            });
    
            const script = `
            ========================================
            전투를 중단하고 입구로 돌아갑니다. \n\n`
            const field = 'dungeon';
            BATTLE.to(socketId).emit('print', { field, script, userInfo });

            setTimeout(() => {
                const script = dungeonScript.entrance;
                BATTLE.to(socketId).emit('print', { field, script, userInfo });
            }, 1000);

        } catch (err: any) {
            console.log(`stopAutoWorker Error: ${err?.message}`, userInfo.characterId);
            return battleError(socketId);
        }
    },
    stopAutoS: (socketId: string, userInfo: UserInfo) => {
        try {
            const { characterId } = userInfo;

            redis.battleSet(characterId, { LOOP: 'off' });

            const cache = battleCache.get(characterId);
            if (cache) {
                const { autoAttackTimer } = cache;
                clearInterval(autoAttackTimer);
                battleCache.delete(characterId);
            }
            redis.battleGet(characterId).then(({ monsterId }) => {
                if (monsterId) MonsterService.destroyMonster(monsterId, characterId);
            });
    
            const script = `
            ========================================
            전투를 중단하고 입구로 돌아갑니다. \n\n`
            const field = 'dungeon';
            BATTLE.to(socketId).emit('print', { field, script, userInfo });
    
            setTimeout(() => {
                const script = dungeonScript.entrance;
                BATTLE.to(socketId).emit('print', { field, script, userInfo });
            }, 1000);
            
        } catch (err: any) {
            console.log(`stopAutoS Error: no Timer, ${err.message}`, userInfo.characterId);
            return battleError(socketId);
        }
    },
}