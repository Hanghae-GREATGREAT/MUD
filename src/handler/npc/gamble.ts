import { socket } from '../../socket.routes';
import { UserSession } from '../../interfaces/user';
import { NpcService } from '../../services';
import { CommandRouter, ReturnScript } from '../../interfaces/socket';

export default {
    gambleHelp: (CMD: string | undefined, user: UserSession) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        tempScript += '명령어 : \n';
        tempScript += '1 - 에트나와 대화합니다.\n';
        tempScript += '2 - 에트나와 제비뽑기를 진행합니다.\n';
        tempScript += '3 - 이전 단계로 돌아갑니다.\n';

        const script = tempLine + tempScript;
        const field = 'gamble';

        return { script, user, field };
    },

    gambleTalk: async (CMD: string | undefined, user: UserSession) => {
        const tempLine =
            '=======================================================================\n';

        const NpcScript: string = NpcService.gambleTalkScript(user.name);

        const script = tempLine + NpcScript;
        const field = 'gamble';

        return { script, user, field };
    },

    gamble: async (CMD: string | undefined, user: UserSession) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        const actionScript: string = await NpcService.gamble(
            Number(user.characterId),
        );
        tempScript += actionScript;
        tempScript += '1 - 에트나와 대화합니다.\n';
        tempScript += '2 - 에트나와 제비뽑기를 진행합니다.\n';
        tempScript += '3 - 이전 단계로 돌아갑니다.\n';

        const script = tempLine + tempScript;
        const field = 'gamble';

        return { script, user, field };
    },

    gambleWrongCommand: (CMD: string | undefined, user: UserSession) => {
        let tempScript: string = '';

        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;

        const script = 'Error : \n' + tempScript;
        const field = 'gamble';
        return { script, user, field };
    },
};
