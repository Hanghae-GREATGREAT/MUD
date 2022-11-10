import { UserSession } from '../interfaces/user';
import BattleService from '../services/battle.service';

export default {
    // help: (CMD: string | undefined, user: UserSession) => {}
    help: (CMD: string | undefined, user: UserSession) => {
        let tempScript: string = '';

        tempScript += '명령어 : \n';
        tempScript += '수동 - 수동 전투를 진행합니다.\n';
        tempScript += '자동 - 자동 전투를 진행합니다.\n';
        tempScript += '돌아가기 - 이전 단계로 돌아갑니다.\n';

        const script = tempScript;
        const field = 'battle';
        return { script, user, field };
    },

    wrongCommand: (CMD: string | undefined, user: UserSession) => {
        let tempScript: string = '';

        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;

        const script = 'Error : \n' + tempScript;
        const field = 'dungeon';
        return { script, user, field };
    },
};
