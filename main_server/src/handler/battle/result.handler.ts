import { Socket } from 'socket.io';
import { battleCache } from '../../db/cache';
import { Monsters } from '../../db/models';
import { CharacterService, MonsterService } from '../../services';
import { battle, dungeon, village } from '..';
import { UserInfo, UserStatus } from '../../interfaces/user';


export default {
    
    adventureload: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        tempScript += '\n---YOU DIE---\n\n';
        tempScript += '당신은 죽었습니다.\n';
        tempScript += '[마을] - 마을로 돌아가기\n\n';

        const script = tempLine + tempScript;
        const field = 'adventureResult';

        socket.emit('print', { field, script, userInfo });
    },

    adventureHelp: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';

        tempScript += '명령어 : \n';
        // tempScript += '[확인] - 이번 모험의 결과를 확인 합니다.\n';
        tempScript += '[마을] - 마을로 돌아갑니다.\n';

        const script = tempScript;
        const field = 'adventureResult';
        
        socket.emit('print', { field, script, userInfo });
    },
    
    autoResultMonsterDead: async(socket: Socket, userStatus: UserStatus, script: string) => {
        const { characterId } = userStatus;
        //console.log('battleCache, after DEAD', battleCache.get(characterId), characterId)
        const { monsterId, dungeonLevel } = battleCache.get(characterId);
        const monster = await MonsterService.findByPk(monsterId!);
        if (!monster) {
            throw new Error('battle.handler.ts >> autoResultMonsterDead() >> 몬스터 데이터X');
        }

        const { name, exp } = monster;
        const newStatus = await CharacterService.addExp(characterId, exp);
        script += `\n${name} 은(는) 쓰러졌다 ! => Exp + ${exp}\n`;

        if (newStatus.levelup) {
            //console.log('result.handler.ts: autoResultMonsterDead() >> levelup!!', characterId);
            script += `\n==!! LEVEL UP !! 레벨이 ${newStatus.level - 1} => ${
                newStatus.level
            } 올랐습니다 !! LEVEL UP !!==\n\n`;
        }

        const result = { script, userStatus: newStatus, field: 'autoBattle' };
        socket.emit('printBattle', result);

        battleCache.delete(characterId);
        await MonsterService.destroyMonster(monsterId!, characterId);
        battleCache.set(characterId, { dungeonLevel });

        battle.autoBattle(socket, '', newStatus)
        return;
    },

    autoResultPlayerDead: async(socket: Socket, userStatus: UserStatus, script: string) => {

        socket.emit('printBattle', { field: 'dungeon', script, userStatus });
        village.healInfo(socket);
        // field: dungeon , chat: true

        const { characterId } = userStatus;
        const { monsterId } = battleCache.get(characterId);
        battleCache.delete(characterId);
        await MonsterService.destroyMonster(monsterId!, characterId);
        return;
    },

    resultMonsterDead: async(monster: Monsters, script: string) => {
        const { characterId, name: monsterName, exp: monsterExp } = monster;
        const userStatus = await CharacterService.addExp(characterId, monsterExp!);
        const field = 'encounter';
        script += `\n${monsterName} 은(는) 쓰러졌다 ! => <span style="color:yellow">Exp + ${monsterExp}</span>\n`;

        if (userStatus.levelup) {
            script += `\n==!! LEVEL UP !! 레벨이 ${userStatus.level - 1} => ${
                userStatus.level
            } 올랐습니다 !! LEVEL UP !!==\n\n`;
        }

        return { field, script, userStatus};
    },

    resultPlayerDead: async(socket: Socket, userInfo: UserInfo, script: string) => {

        socket.emit('print', { field: 'dungeon', script, userInfo });
        dungeon.getDungeonList(socket, '', userInfo);
        // field: dungeon , chat: true

        battleCache.delete(userInfo.characterId);
        return;
    },

    getDetail: async (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        const script = tempLine + tempScript;
        const field = 'adventureResult';
        
        socket.emit('print', { field, script, userInfo });
    },

    returnVillage: async (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        tempScript += '미구현 - 일단 던전으로 이동됨\n';
        tempScript += '[목록] - 던전 목록 불러오기\n';

        const script = tempLine + tempScript;
        const field = 'dungeon';
        
        socket.emit('print', { field, script, userInfo });
    },

    adventureWrongCommand: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';

        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;

        const script = 'Error : \n' + tempScript;
        const field = 'encounter';
        socket.emit('print', { script, userInfo, field });
    },
};
