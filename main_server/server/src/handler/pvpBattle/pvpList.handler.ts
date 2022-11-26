import { Socket } from 'socket.io';
import { UserInfo } from '../../interfaces/user';
import { pvpBattle } from '..';
import { io } from '../../app';

export const pvpUsers = new Set();

export let roomName:string | undefined;

export const rooms = new Map();

export default {
    pvpListHelp: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        tempScript += '명령어 : \n';
        tempScript += '1 - 시련의 장 방생성을 합니다.\n';
        tempScript += '2 - 입장할 방 목록을 불러옵니다.\n';
        tempScript += '[돌]아가기 - 마을로 돌아갑니다.\n';

        const script = tempLine + tempScript;
        const field = 'pvpList';

        socket.emit('print', { script, userInfo, field });
    },

    createRoom: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        pvpUsers.add(userInfo.username)
        roomName = CMD!.trim();
        rooms.set(roomName, [])

        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n\n';

        tempScript += `${userInfo.username}님이 입장하셨습니다.\n\n`

        const script = tempLine + tempScript;
        const field = 'pvpBattle';

        socket.join(roomName)
        io.to(roomName).emit('fieldScriptPrint', { script, field });
    },

    joinRoom: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        pvpUsers.add(userInfo.username)
        roomName = CMD!.trim();

        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n\n';

        tempScript += `${userInfo.username}님이 입장하셨습니다.\n\n`

        const script = tempLine + tempScript;
        const field = 'pvpBattle';

        socket.join(roomName)
        io.to(roomName).emit('fieldScriptPrint', { script, field });

        if (pvpUsers.size === 2) {
           return pvpBattle.pvpStart(socket, CMD, userInfo)
        }
    },

    pvpListWrongCommand: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';

        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;

        const script = 'Error : \n' + tempScript;
        const field = 'pvpList';
        socket.emit('print', { script, userInfo, field });
    },
};
