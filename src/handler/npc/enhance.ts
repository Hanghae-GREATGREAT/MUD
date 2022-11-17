import { socket } from '../../socket.routes';
import { UserSession } from '../../interfaces/user';
import { NpcService } from '../../services';
import { CommandRouter, ReturnScript } from '../../interfaces/socket';

export default {
    enhanceHelp: (CMD: string | undefined, user: UserSession) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        tempScript += '명령어 : \n';
        tempScript += '1 - 퍼거스와 대화합니다.\n';
        tempScript += '2 - 장비를 강화 합니다.\n';
        tempScript += '3 - 이전 단계로 돌아갑니다.\n';

        const script = tempLine + tempScript;
        const field = 'enhance';

        return { script, user, field };
    },

    enhanceTalk: async (CMD: string | undefined, user: UserSession) => {
        const tempLine =
            '=======================================================================\n';

        const NpcScript: string = NpcService.enhanceTalkScript(user.name);

        const script = tempLine + NpcScript;
        const field = 'enhance';

        return { script, user, field };
    },

    enhance: async (CMD: string | undefined, user: UserSession) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        const actionScript: string = await NpcService.enhance(
            Number(user.characterId),
        );

        tempScript += actionScript;
        tempScript += '1 - 퍼거스와 대화합니다.\n';
        tempScript += '2 - 장비를 강화 합니다.\n';
        tempScript += '3 - 이전 단계로 돌아갑니다.\n';

        const script = tempLine + tempScript;
        const field = 'enhance';

        return { script, user, field };
    },

    enhanceWrongCommand: (CMD: string | undefined, user: UserSession) => {
        let tempScript: string = '';

        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;

        const script = 'Error : \n' + tempScript;
        const field = 'enhance';
        return { script, user, field };
    },
};
