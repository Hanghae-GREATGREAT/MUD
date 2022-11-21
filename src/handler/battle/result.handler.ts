import { UserCache } from '../../interfaces/user';
import { CharacterService, MonsterService } from '../../services';
import { battleCache } from '../../db/cache';
import { socket } from '../../socket.routes';
import { battle, dungeon, village } from '..';
import { Monsters } from '../../db/models';

export default {
    adventureload: (CMD: string | undefined, userCache: UserCache) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        tempScript += '\n---YOU DIE---\n\n';
        tempScript += '당신은 죽었습니다.\n';
        tempScript += '[마을] - 마을로 돌아가기\n\n';

        const script = tempLine + tempScript;
        const field = 'adventureResult';
        return { script, userCache, field };
    },

    adventureHelp: (CMD: string | undefined, userCache: UserCache) => {
        let tempScript: string = '';

        tempScript += '명령어 : \n';
        // tempScript += '[확인] - 이번 모험의 결과를 확인 합니다.\n';
        tempScript += '[마을] - 마을로 돌아갑니다.\n';

        const script = tempScript;
        const field = 'adventureResult';
        return { script, userCache, field };
    },
    
    autoResultMonsterDead: async(userCache: UserCache, script: string) => {
        const { characterId } = userCache;
        console.log('battleCache, after DEAD', battleCache.get(characterId), characterId)
        const { monsterId, dungeonLevel } = battleCache.get(characterId);
        const monster = await MonsterService.findByPk(monsterId!);
        if (!monster) {
            throw new Error('battle.handler.ts >> autoResultMonsterDead() >> 몬스터 데이터X');
        }

        const { name, exp } = monster;
        const newUser = await CharacterService.addExp(characterId, exp);
        script += `\n${name} 은(는) 쓰러졌다 ! => Exp + ${exp}\n`;

        if (userCache.levelup) {
            console.log('result.handler.ts: autoResultMonsterDead() >> levelup!!', characterId);
            script += `\n==!! LEVEL UP !! 레벨이 ${userCache.level - 1} => ${
                userCache.level
            } 올랐습니다 !! LEVEL UP !!==\n\n`;
        }

        const result = { script, userCache: newUser, field: 'autoBattle' };
        socket.emit('print', result);

        battleCache.delete(characterId);
        await MonsterService.destroyMonster(monsterId!, characterId);
        battleCache.set(characterId, { dungeonLevel });

        battle.autoBattle('', newUser)
        return;
    },

    autoResultPlayerDead: async(userCache: UserCache, script: string) => {

        const { script: newScript, field, userCache: newUser } = village.healInfo('', userCache);
        // field: dungeon , chat: true

        const result = { script: script + newScript, userCache: newUser, field };
        socket.emit('print', result);

        const { characterId } = userCache;
        const { monsterId } = battleCache.get(characterId);
        battleCache.delete(characterId);
        await MonsterService.destroyMonster(monsterId!, characterId);
        return;
    },

    resultMonsterDead: async(monster: Monsters, script: string) => {
        const { characterId, name: monsterName, exp: monsterExp } = monster;
        const userCache = await CharacterService.addExp(characterId, monsterExp!);
        const field = 'encounter';
        script += `\n${monsterName} 은(는) 쓰러졌다 ! => Exp + ${monsterExp}\n`;

        if (userCache.levelup) {
            script += `\n==!! LEVEL UP !! 레벨이 ${userCache.level - 1} => ${
                userCache.level
            } 올랐습니다 !! LEVEL UP !!==\n\n`;
        }

        // const result = { script, user, field };
        // socket.emit('print', result);

        // battleCache.delete(characterId);
        return { script, userCache, field }
    },

    resultPlayerDead: async(userCache: UserCache, script: string) => {

        const { script: newScript, field, userCache: newUser, chat } = await dungeon.getDungeonList('', userCache);
        // field: dungeon , chat: true

        const result = { script: script + newScript, userCache: newUser, field, chat };
        socket.emit('print', result);

        battleCache.delete(userCache.characterId);
        return;
    },

    getDetail: async (CMD: string | undefined, userCache: UserCache) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        const script = tempLine + tempScript;
        const field = 'adventureResult';
        return { script, userCache, field };
    },

    returnVillage: async (CMD: string | undefined, userCache: UserCache) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        tempScript += '미구현 - 일단 던전으로 이동됨\n';
        tempScript += '[목록] - 던전 목록 불러오기\n';

        const script = tempLine + tempScript;
        const field = 'dungeon';
        return { script, userCache, field };
    },

    adventureWrongCommand: (CMD: string | undefined, userCache: UserCache) => {
        let tempScript: string = '';

        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;

        const script = 'Error : \n' + tempScript;
        const field = 'encounter';
        return { script, userCache, field };
    },
};
