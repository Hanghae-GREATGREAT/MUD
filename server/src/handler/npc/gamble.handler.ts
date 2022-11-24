import { Socket } from 'socket.io';
import { NpcService } from '../../services';
import { UserInfo } from '../../interfaces/user';


export default {
    
    gambleHelp: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        tempScript += '명령어 : \n';
        tempScript += '1 - 에트나와 대화합니다.\n';
        tempScript += '2 - 에트나와 제비뽑기를 진행합니다.\n';
        tempScript += '3 - 이전 단계로 돌아갑니다.\n';

        const script = tempLine + tempScript;
        const field = 'gamble';

        socket.emit('print', { script, userInfo, field });
    },

    gambleTalk: async (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        const tempLine =
            '=======================================================================\n';

        const NpcScript: string = NpcService.gambleTalkScript(userInfo.name);

        const script = tempLine + NpcScript;
        const field = 'gamble';

        socket.emit('print', { script, userInfo, field });
    },

    gamble: async (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        const actionScript: string = await NpcService.gamble(
            Number(userInfo.characterId),
        );
        tempScript += actionScript;
        tempScript += '1 - 에트나와 대화합니다.\n';
        tempScript += '2 - 에트나와 제비뽑기를 진행합니다.\n';
        tempScript += '3 - 이전 단계로 돌아갑니다.\n';

        const script = tempLine + tempScript;
        const field = 'gamble';

        socket.emit('print', { script, userInfo, field });
    },

    gambleWrongCommand: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';

        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;

        const script = 'Error : \n' + tempScript;
        const field = 'gamble';
        socket.emit('print', { script, userInfo, field });
    },
};
