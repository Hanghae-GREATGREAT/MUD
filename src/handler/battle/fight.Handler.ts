import { UserSession } from '../../interfaces/user';
import { BattleService, MonsterService } from '../../services';
import redis from '../../db/redis/config';
import { battleLoops } from './encounter.Handler';

export default {
    // help: (CMD: string | undefined, user: UserSession) => {}
    battleHelp: (CMD: string | undefined, user: UserSession) => {
        let tempScript: string = '';

        // tempScript += '\n명령어 : \n';
        // tempScript += '[공격] 하기 - 전투를 진행합니다.\n';
        // tempScript += '[도망] 가기 - 전투를 포기하고 도망갑니다.\n';
        tempScript += `\n잘못된 명령입니다.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += '---전투 중 명령어---\n';
        tempScript += '스킬[1] 사용 - 1번 슬롯에 장착된 스킬을 사용합니다.\n';
        tempScript += '스킬[2] 사용 - 2번 슬롯에 장착된 스킬을 사용합니다.\n';
        tempScript += '스킬[3] 사용 - 3번 슬롯에 장착된 스킬을 사용합니다.\n';

        const script = tempScript;
        const field = 'action';
        return { script, user, field };
    },

    autoBattleHelp: (CMD: string | undefined, user: UserSession) => {
        let tempScript: string = '';

        // tempScript += '\n명령어 : \n';
        // tempScript += '[공격] 하기 - 전투를 진행합니다.\n';
        tempScript += `\n잘못된 명령입니다.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += '---전투 중 명령어---\n';
        tempScript += '[중단] 하기 - 전투를 중단하고 마을로 돌아갑니다.\n';

        const script = tempScript;
        const field = 'action';
        return { script, user, field };
    },

    quitBattle: async (CMD: string | undefined, user: UserSession) => {
        const { characterId } = user;
        const { monsterId } = await redis.hGetAll(String(characterId));
        let tempScript: string = '';
        const tempLine = '========================================\n';

        tempScript += `당신은 도망쳤습니다. \n\n`;
        tempScript += `??? : 하남자특. 도망감.\n`;

        // 몬스터 삭제
        MonsterService.destroyMonster(+monsterId, characterId);

        const script = tempLine + tempScript;
        const field = 'dungeon';
        return { script, user, field };
    },

    quitAutoBattle: async (CMD: string | undefined, user: UserSession) => {
        const { characterId } = user;
        const { monsterId } = await redis.hGetAll(String(characterId));
        let tempScript: string = '';
        const tempLine = '========================================\n';

        tempScript += `전투를 중단하고 마을로 돌아갑니다. \n\n`;

        // 기본공격 중단 & 몬스터 삭제
        const autoAttackId = battleLoops.get(characterId);
        clearInterval(autoAttackId);
        battleLoops.delete(characterId);
        MonsterService.destroyMonster(+monsterId, characterId);

        const script = tempLine + tempScript;
        const field = 'dungeon';
        return { script, user, field };
    },

    fwrongCommand: (CMD: string | undefined, user: UserSession) => {
        let tempScript: string = '';

        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;

        const script = 'Error : \n' + tempScript;
        const field = 'encounter';
        return { script, user, field };
    },
};
