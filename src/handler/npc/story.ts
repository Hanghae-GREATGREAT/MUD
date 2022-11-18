import { socket } from '../../socket.routes';
import { UserSession } from '../../interfaces/user';
import { NpcService } from '../../services';
import { CommandRouter, ReturnScript } from '../../interfaces/socket';

export default {
    // help: (CMD: string | undefined, user: UserSession) => {}
    storyHelp: (CMD: string | undefined, user: UserSession) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        tempScript += '명령어 : \n';
        tempScript += '1 - 프라데이리와 대화합니다.\n';
        tempScript += '2 - 모험의 서를 통해 지금까지의 모험록을 확인합니다.\n';
        tempScript += '3 - 이전 단계로 돌아갑니다.\n';

        const script = tempLine + tempScript;
        const field = 'story';

        return { script, user, field };
    },
    storyTalk: async (CMD: string | undefined, user: UserSession) => {
        const tempLine =
            '=======================================================================\n';

        const NpcScript: string = NpcService.storyTalkScript(user.name);

        const script = tempLine + NpcScript;
        const field = 'story';

        return { script, user, field };
    },

    diary: async (CMD: string | undefined, user: UserSession) => {
        // 임시 스크립트 선언
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        // 모험록 스크립트 작성
        const storyScript: string = NpcService.story(user.name, user.level);
        tempScript += storyScript;
        tempScript += '1 - 프라데이리와 대화합니다.\n';
        tempScript += '2 - 모험의 서를 통해 지금까지의 모험록을 확인합니다.\n';
        tempScript += '3 - 이전 단계로 돌아갑니다.\n';

        const script = tempLine + tempScript;
        const field = 'story';

        return { script, user, field };
    },

    storyWrongCommand: (CMD: string | undefined, user: UserSession) => {
        let tempScript: string = '';

        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;

        const script = 'Error : \n' + tempScript;
        const field = 'story';
        return { script, user, field };
    },
};
