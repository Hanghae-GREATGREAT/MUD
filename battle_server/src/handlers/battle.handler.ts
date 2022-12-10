import { deadReport, dungeonHandler } from '.';
import { errorReport, HttpException } from '../common';
import { battleCache } from '../db/cache';
import { UserInfo, UserStatus } from '../interfaces/user';
import BATTLE from '../redis';
import { battleScript, dungeonScript } from '../scripts';
import { MonsterService, BattleService, CharacterService } from '../services';
import { autoAttackWorker, isMonsterDeadWorker, skillAttackWorker } from '../workers';
import { autoAttack } from './autobattle.handler';



export default {
    attack: (socketId: string, userInfo: UserInfo, userStatus: UserStatus): Promise<void> => {
        return new Promise(async(resolve, reject) => {
            const { characterId } = userInfo;

            const autoAttackTimer = setInterval(async () => {
                battleCache.set(characterId, { autoAttackTimer });
    
                autoAttack(socketId, userStatus).then(async(result) => {
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
                        const { autoAttackTimer, dungeonLevel } = battleCache.get(characterId);
                        clearInterval(autoAttackTimer);
                        battleCache.delete(characterId);
                        battleCache.set(characterId, { dungeonLevel });
    
                        const data = { field, script, userInfo, userStatus };
                        BATTLE.to(socketId).emit('printBattle', data);
    
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
            return new HttpException(
                'quit battle cache error: monsterId missing', 
                500, socketId
            )
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
    
            // 스킬 정보 가져오기
            if (skill[Number(CMD)-1] === undefined) {
                const script = battleScript.battleHelp(CMD);
                const field = 'action';
                BATTLE.to(socketId).emit('printBattle', { field, script, userInfo, userStatus });
                return resolve();
            }
            const { name: skillName, cost, multiple } = skill[Number(CMD)-1];
            
            // 몬스터 정보 가져오기
            const { monsterId } = battleCache.get(characterId);
            if (!monsterId) {
                const error = new HttpException(
                    'skill select cache error: monsterId missing', 
                    500, socketId
                );
                return reject(error);
            }
            const monster = await MonsterService.findByPk(monsterId);
            if (!monster) {
                const error = new HttpException(
                    'skill select cache error: monster missing', 
                    500, socketId
                );
                return reject(error);
            }        
            const { name: monsterName } = monster;
    
            // 마나 잔여량 확인
            if (mp - cost < 0) {
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
                const error = new HttpException(
                    'skill monster refresh error: monster missing', 
                    500, socketId
                );
                return reject(error);
            }  
            tempScript += `\n당신의 ${skillName} 스킬이 ${monsterName}에게 적중! => ${realDamage}의 데미지!\n`;
    
            const {  autoAttackTimer, dungeonLevel, dead } = battleCache.get(characterId);
            if (isDead === 'dead' || dead === 'monster') {
                clearInterval(autoAttackTimer);
                const report = await deadReport.monster(monster, tempScript);
                if (report instanceof Error) return reject(report); // Error
    
                BATTLE.to(socketId).emit('printBattle', report); // { field, script, userStatus }
                battleCache.delete(characterId);
                battleCache.set(characterId, { dungeonLevel });
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
        // 이벤트 루프에 이미 들어가서 대기중인 타이머가 있을 수 있음
        const { autoAttackTimer } = battleCache.get(characterId);
        if (!autoAttackTimer) {
            console.log('autoAttackTimer Error', autoAttackTimer)
            return new HttpException(
                'stopAuto cache error: autoAttackTimer missing', 
                500, socketId
            );
        }
        clearInterval(autoAttackTimer);       
        if (autoAttackTimer === undefined) {
            setTimeout(() => {
                const { autoAttackTimer } = battleCache.get(characterId);
                clearInterval(autoAttackTimer);
            }, 300);
        }
        const { monsterId } = battleCache.get(characterId);
        battleCache.delete(characterId);
        if (monsterId) MonsterService.destroyMonster(monsterId, characterId);

        const script = `
        ========================================
        전투를 중단하고 마을로 돌아갑니다. \n\n`
        const field = 'dungeon';
        BATTLE.to(socketId).emit('print', { field, script, userInfo });
    },
    stopAutoWorker: (socketId: string, userInfo: UserInfo): HttpException|void => {
        const { characterId } = userInfo;

        try {
            autoAttackWorker.terminate(characterId);
            skillAttackWorker.terminate(characterId);
            isMonsterDeadWorker.terminate(characterId);
            const { monsterId } = battleCache.get(characterId);
            battleCache.delete(characterId);
            if (monsterId) MonsterService.destroyMonster(monsterId, characterId);
    
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
            const error = new HttpException(
                `stopAutoWorker Error: ${err?.message}`,
                500, socketId
            )
            errorReport(error);
        }
    },
    stopAutoS: (socketId: string, userInfo: UserInfo): HttpException|void => {
        try {
            const { characterId } = userInfo;
            const { autoAttackTimer } = battleCache.get(characterId);
            clearInterval(autoAttackTimer);        
            battleCache.delete(characterId);
    
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
            const error = new HttpException(
                `stopAutoS Error: no Timer, ${err.message}`,
                500, socketId
            );
            errorReport(error);
        }
    },
}