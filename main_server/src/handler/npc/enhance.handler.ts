import { Socket } from 'socket.io';
import { NpcService } from '../../services';
import { UserInfo, UserStatus } from '../../interfaces/user';

export default {
    enhanceHelp: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';
        const tempLine = '=======================================================================\n';

        tempScript += '명령어 : \n';
        tempScript += '1 - 퍼거스와 대화합니다.\n';
        tempScript += '2 - 장비를 강화 합니다.\n';
        tempScript += '3 - 이전 단계로 돌아갑니다.\n';

        const script = tempLine + tempScript;
        const field = 'enhance';

        socket.emit('print', { script, userInfo, field });
    },

    enhanceTalk: async (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        const tempLine = '=======================================================================\n';

        const NpcScript: string = NpcService.enhanceTalkScript(userInfo.name);

        const script = tempLine + NpcScript;
        const field = 'enhance';

        socket.emit('print', { script, userInfo, field });
    },

    enhance: async (socket: Socket, CMD: string | undefined, userInfo: UserInfo, userStatus: UserStatus) => {
        let tempScript: string = '';
        const tempLine = '=======================================================================\n';

        const result = await NpcService.enhance(userStatus);

        tempScript += result.tempScript;
        tempScript += '1 - 퍼거스와 대화합니다.\n';
        tempScript += '2 - 장비를 강화 합니다.\n';
        tempScript += '3 - 이전 단계로 돌아갑니다.\n';

        const script = tempLine + tempScript;
        const field = 'enhance';

        socket.emit('printBattle', { field, script, userInfo, userStatus: result.userStatus });
    },

    enhanceWrongCommand: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';

        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `[H]elp : 도움말\n`;

        const script = 'Error : \n' + tempScript;
        const field = 'enhance';

        socket.emit('print', { script, userInfo, field });
    },
};
