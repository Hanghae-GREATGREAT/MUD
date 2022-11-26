import { Socket } from 'socket.io';
import { UserInfo } from '../../interfaces/user';
import { NpcService } from '../../services';
import { io } from '../../app';

export default {
    pvpHelp: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        tempScript += '명령어 : \n';
        tempScript += '1 - 샤크스 경과 대화합니다.\n';
        tempScript += '2 - 시련의 장으로 입장합니다.\n';
        tempScript += '3 - 이전 단계로 돌아갑니다.\n';

        const script = tempLine + tempScript;
        const field = 'pvp';

        socket.emit('print', { script, userInfo, field });
    },

    pvpTalk: async (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        const tempLine =
            '=======================================================================\n';

        const NpcScript: string = NpcService.pvpTalkScript(userInfo.name);

        const script = tempLine + NpcScript;
        const field = 'pvp';

        socket.emit('print', { script, userInfo, field });
    },

    pvp: async (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        // 여기서 pvp 입장하는 코드
        let tempScript: string = '';

        const tempLine =
            '=======================================================================\n\n';

        tempScript += '샤크스 경 : \n\n';
        tempScript += '3 : 3 전투가 이루어지는 전장에 어서오시게 ! \n\n';

        // pvpRoom 목록을 보여준다.
        const { sids, rooms } = io.sockets.adapter;
        const publicRooms:string[] = [];
        rooms.forEach((_, key) => {
            if (sids.get(key) === undefined) publicRooms.push(key);
        });

        if (!publicRooms[0]) tempScript += '생성된 방이 존재하지 않습니다.'

        publicRooms.map((roomName)=>{
            tempScript += `${roomName}, `
        })

        tempScript += '\n\n1. 방생성 - >1 방이름< 으로 입력하게나 ! \n';
        tempScript += '2. 방입장 - >2 방이름< 으로 입력하게나 !\n';

        const script = tempLine + tempScript;
        const field = 'pvpList';

        socket.emit('print', { script, userInfo, field });
    },

    pvpWrongCommand: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';

        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;

        const script = 'Error : \n' + tempScript;
        const field = 'pvp';
        socket.emit('print', { script, userInfo, field });
    },
};
