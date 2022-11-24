import { Socket } from 'socket.io';
import { battleCache } from '../../db/cache';
import { CharacterService, MonsterService } from '../../services';
import { UserInfo } from '../../interfaces/user';


export default {
    ehelp: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';

        tempScript += '명령어 : \n';
        tempScript += '[공격] 하기 - 전투를 진행합니다.\n';
        tempScript += '[도망] 가기 - 전투를 포기하고 도망갑니다.\n';
        tempScript += '---전투 중 명령어---\n';
        tempScript +=
            '[스킬] [num] 사용 - 1번 슬롯에 장착된 스킬을 사용합니다.\n';

        const script = tempScript;
        const field = 'encounter';
        socket.emit('print', { script, userInfo, field });
    },

    encounter: async (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        // 던전 진행상황 불러오기
        const { characterId } = userInfo;
        const { dungeonLevel } = battleCache.get(characterId);

        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        // 적 생성
        const { name, monsterId } = await MonsterService.createNewMonster(dungeonLevel!, characterId);
        tempScript += `너머에 ${name}의 그림자가 보인다\n\n`;
        tempScript += `[공격] 하기\n`;
        tempScript += `[도망] 가기\n`;

        // 던전 진행상황 업데이트
        battleCache.set(characterId, { monsterId })

        const script = tempLine + tempScript;
        const field = 'encounter';

        socket.emit('printBattle', { script, userInfo, field });
    },

    reEncounter: async (socket: Socket, CMD: string, userInfo: UserInfo) => {
        // 던전 진행상황 불러오기
        const { characterId } = userInfo;
        const { dungeonLevel } = battleCache.get(characterId);

        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        // 적 생성
        const { name, monsterId } = await MonsterService.createNewMonster(dungeonLevel!, characterId);
        tempScript += `너머에 ${name}의 그림자가 보인다\n\n`;
        tempScript += `[공격] 하기\n`;
        tempScript += `[도망] 가기\n`;

        // 던전 진행상황 업데이트
        battleCache.set(characterId, { monsterId });

        const script = tempLine + tempScript;
        const field = 'encounter';
        const userStatus = await CharacterService.addExp(characterId, 0);

        socket.emit('printBattle', { field, script, userInfo, userStatus });
    },

    ewrongCommand: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';

        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;

        const script = 'Error : \n' + tempScript;
        const field = 'encounter';
        socket.emit('print', { script, userInfo, field });
    },

};
