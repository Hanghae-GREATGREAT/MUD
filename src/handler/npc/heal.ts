import { socket } from '../../socket.routes';
import { UserSession } from '../../interfaces/user';
import { NpcService } from '../../services';
import { CommandRouter, ReturnScript } from '../../interfaces/socket';

export default {
    healHelp: (CMD: string | undefined, user: UserSession) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        tempScript += '명령어 : \n';
        tempScript += '1 - 아그네스와 대화합니다.\n';
        tempScript += '2 - 치료를 받습니다.\n';
        tempScript += '3 - 이전 단계로 돌아갑니다.\n';

        const script = tempLine + tempScript;
        const field = 'heal';

        return { script, user, field };
    },

    healTalk: async (CMD: string | undefined, user: UserSession) => {
        const tempLine =
            '=======================================================================\n';

        const NpcScript: string = NpcService.healTalkScript(user.username);

        const script = tempLine + NpcScript;
        const field = 'heal';

        return { script, user, field };
    },

    heal: async (CMD: string | undefined, user: UserSession) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n\n';

        // db에서 Character HP/MP 수정
        const actionScript: string = await NpcService.healing(
            Number(user.characterId),
        );

        tempScript += actionScript;
        tempScript += '1 - 아그네스와 대화합니다.\n';
        tempScript += '2 - 치료를 받습니다.\n';
        tempScript += '3 - 이전 단계로 돌아갑니다.\n';

        // 유저 스테이터스 업데이트
        user.hp = user.maxhp;
        user.mp = user.maxmp;

        const script = tempLine + tempScript;
        const field = 'heal';

        return { script, user, field };
    },

    healWrongCommand: (CMD: string | undefined, user: UserSession) => {
        let tempScript: string = '';

        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;

        const script = 'Error : \n' + tempScript;
        const field = 'heal';
        return { script, user, field };
    },
};
