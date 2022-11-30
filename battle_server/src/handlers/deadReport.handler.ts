/**
몬스터/플레이어 사망 전투 결과처리
{ field, script, userStatus }
*/

import { Monsters } from '../db/models';
import { CharacterService, DungeonService, MonsterService } from '../services';
import { DeadReport } from '../interfaces/battle';
import { UserStatus } from '../interfaces/user';


export default {
    autoMonster: '',
    autoPlayer: '',
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
        당신은 ${name}의 공격을 버티지 못했습니다..
        =======================================================================
        ${userStatus.name}은(는) 깊은 심연으로 발걸음을 내딛습니다.\n\n
        ${dungeonList}`;
        const field = 'dungeon';

        return { field, script, userStatus };
    }
}


