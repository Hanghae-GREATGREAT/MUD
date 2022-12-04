/**
몬스터/플레이어 사망 전투 결과처리
{ field, script, userStatus }
*/

import { Monsters } from '../db/models';
import { CharacterService, DungeonService, MonsterService } from '../services';
import { DeadReport } from '../interfaces/battle';
import { UserStatus } from '../interfaces/user';
import { battleCache } from '../db/cache';
import BATTLE from '../redis';
import { autoBattleHandler } from '.';
import { HttpException } from '../common';
import { battleScript } from '../scripts';


export default {
    autoMonster: async(socketId: string, characterId: number, script: string): Promise<HttpException|void> => {
        // console.log('battleCache, after DEAD', battleCache.get(characterId), characterId)
        const { monsterId, dungeonLevel } = battleCache.get(characterId);
        if (!monsterId) {
            return new HttpException(
                'deadReport.autoMonster cache error: monsterId missing', 
                500, socketId
            );
        }
        const monster = await MonsterService.findByPk(monsterId);
        if (!monster) {
            return new HttpException(
                'deadReport.autoMonster error: monster missing', 
                500, socketId
            );
        }

        const { name, exp } = monster;
        const userStatus = await CharacterService.addExp(characterId, exp);
        script += `\n${name} 은(는) 쓰러졌다 ! => Exp + ${exp}\n`;

        if (userStatus.levelup) {
            // console.log('result.handler.ts: autoResultMonsterDead() >> levelup!!', characterId);
            script += `\n==!! LEVEL UP !! 레벨이 ${userStatus.level - 1} => ${
                userStatus.level
            } 올랐습니다 !! LEVEL UP !!==\n\n`;
        }

        const result = { field: 'autoBattle', script, userStatus };
        BATTLE.to(socketId).emit('printBattle', result);

        battleCache.delete(characterId);
        await MonsterService.destroyMonster(monsterId!, characterId);
        battleCache.set(characterId, { dungeonLevel });

        autoBattleHandler.autoBattleWorker(socketId, userStatus);
        return;
    },
    autoPlayer: async(socketId: string, characterId: number, script: string) => {
        const userStatus = await CharacterService.addExp(characterId, 0);
        BATTLE.to(socketId).emit('printBattle', { field: 'dungeon', script, userStatus });

        const healScript = battleScript.heal;
        const data = { field: 'heal', script: healScript, userStatus };
        BATTLE.to(socketId).emit('printBattle', data);

        const { monsterId } = battleCache.get(characterId);
        if (!monsterId) {
            return new HttpException(
                'deadReport.autoPlayer cache error: monsterId missing', 
                500, socketId
            );
        }
        battleCache.delete(characterId);
        MonsterService.destroyMonster(monsterId, characterId);
        return;
    },
    monster: (monster: Monsters, script: string): Promise<DeadReport|Error> => {
        const { monsterId, characterId, name: monsterName, exp: monsterExp } = monster;
        MonsterService.destroyMonster(monsterId, characterId);

        return new Promise((resolve, reject) => {
            CharacterService.addExp(characterId, monsterExp!).then((userStatus) => {
                script += `\n${monsterName} 은(는) 쓰러졌다 ! => Exp + ${monsterExp}\n`;
    
                if (userStatus.levelup) {
                    script += `\n==!! LEVEL UP !! 레벨이 ${userStatus.level - 1} => ${
                        userStatus.level
                    } 올랐습니다 !! LEVEL UP !!==\n\n`;
                }
    
                const field = 'encounter';
                resolve({ field, script, userStatus });
            }).catch(error => reject(error));
        })
    },
    player: (monster: Monsters, userStatus: UserStatus): DeadReport => {
        const { monsterId, name, characterId } = monster;
        MonsterService.destroyMonster(monsterId, characterId);
        const dungeonList = DungeonService.getDungeonList();

        const script = `\n!! 치명상 !!
        당신은 ${name}의 공격을 버티지 못했습니다..\n`
        const healScript = battleScript.heal;
        const field = 'heal';
        return { field, script: script+healScript, userStatus };
    }
}


