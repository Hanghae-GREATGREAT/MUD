import { Socket } from 'socket.io';
import { NpcService } from '../../services';
import { UserInfo, UserStatus } from '../../interfaces/user';

export default {
    healHelp: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';
        const tempLine = '=======================================================================\n';

        tempScript += '명령어 : \n';
        tempScript += '1 - 아그네스와 대화합니다.\n';
        tempScript += '2 - 치료를 받습니다.\n';
        tempScript += '3 - 이전 단계로 돌아갑니다.\n';

        const script = tempLine + tempScript;
        const field = 'heal';

        socket.emit('print', { script, userInfo, field });
    },

    healTalk: async (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        const tempLine = '=======================================================================\n';

        const NpcScript: string = NpcService.healTalkScript(userInfo.name);

        const script = tempLine + NpcScript;
        const field = 'heal';

        socket.emit('print', { script, userInfo, field });
    },

    heal: async (socket: Socket, CMD: string | undefined, userInfo: UserInfo, userStatus: UserStatus) => {
        let tempScript: string = '';
        const tempLine = '=======================================================================\n\n';

        // db에서 Character HP/MP 수정
        const actionScript: string = await NpcService.healing(Number(userInfo.characterId));

        tempScript += actionScript;
        tempScript += '1 - 아그네스와 대화합니다.\n';
        tempScript += '2 - 치료를 받습니다.\n';
        tempScript += '3 - 이전 단계로 돌아갑니다.\n';

        // 유저 스테이터스 업데이트
        userStatus.hp = userStatus.maxhp;
        userStatus.mp = userStatus.maxmp;

        const script = tempLine + tempScript;
        const field = 'heal';

        socket.emit('printBattle', { script, userInfo, userStatus, field });
    },

    healWrongCommand: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';

        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `[H]elp : 도움말\n`;

        const script = 'Error : \n' + tempScript;
        const field = 'heal';

        socket.emit('print', { script, userInfo, field });
    },
};
