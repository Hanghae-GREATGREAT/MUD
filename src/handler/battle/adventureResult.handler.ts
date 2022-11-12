import { UserSession } from '../../interfaces/user';
import { BattleService } from '../../services';
import redis from '../../db/redis/config';
import { Monsters } from '../../db/models';

export default {
    adventureload: (CMD: string | undefined, user: UserSession) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        tempScript += '\n---YOU DIE---\n\n';
        tempScript += '당신은 죽었습니다.\n';
        tempScript += '[마을] - 마을로 돌아가기\n\n';

        const script = tempLine + tempScript;
        const field = 'adventureResult';
        return { script, user, field };
    },

    adventureHelp: (CMD: string | undefined, user: UserSession) => {
        let tempScript: string = '';

        tempScript += '명령어 : \n';
        // tempScript += '[확인] - 이번 모험의 결과를 확인 합니다.\n';
        tempScript += '[마을] - 마을로 돌아갑니다.\n';

        const script = tempScript;
        const field = 'adventureResult';
        return { script, user, field };
    },

    getDetail: async (CMD: string | undefined, user: UserSession) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        const script = tempLine + tempScript;
        const field = 'adventureResult';
        return { script, user, field };
    },

    returnVillage: async (CMD: string | undefined, user: UserSession) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        tempScript += '미구현 - 일단 던전으로 이동됨\n';
        tempScript += '[목록] - 던전 목록 불러오기\n';

        const script = tempLine + tempScript;
        const field = 'dungeon';
        return { script, user, field };
    },

    adventureWrongCommand: (CMD: string | undefined, user: UserSession) => {
        let tempScript: string = '';

        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;

        const script = 'Error : \n' + tempScript;
        const field = 'encounter';
        return { script, user, field };
    },
};
