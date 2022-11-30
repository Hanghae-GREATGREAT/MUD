import { Socket } from 'socket.io';
import { io } from '../../app';
import { pvpBattle } from '..';
import { UserInfo, UserStatus } from '../../interfaces/user';

import { publicRooms } from '../npc/pvp.handler';

interface PvpPlayer {
    socketId:string;
    userStatus: UserStatus;
    target?: string|undefined; // username
    selectSkill?: string|undefined; // skillname
}

export const rooms: Map<string, Map<string, PvpPlayer>> = new Map<string, Map<string, PvpPlayer>>();

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

    createRoom: (socket: Socket, CMD: string | undefined, userInfo: UserInfo, userStatus: UserStatus) => {
        const roomName = `pvpRoom ${CMD!.trim()}`;

        // 방 이름이 숫자일때
        if(Number(CMD)) return pvpBattle.pvpListWrongCommand(socket, '방 이름은 한글 또는 영문자만 가능합니다.', userInfo)

        // 이미 존재하는 방 생성시도시
        if (publicRooms.has(roomName)) return pvpBattle.pvpListWrongCommand(socket, '이미 존재하는 방 입니다.', userInfo)
        
        userStatus.pvpRoom = roomName;
        rooms.set(roomName, new Map())
        rooms.get(roomName)!.set(userInfo.username,{socketId:socket.id, userStatus})

        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n\n';

        tempScript += `${userStatus.name}님이 입장하셨습니다.\n\n`

        const script = tempLine + tempScript;
        const field = 'pvpBattle';

        socket.join(roomName)
        socket.emit('printBattle',{userStatus})
        io.to(roomName).emit('fieldScriptPrint', { script, field });
    },

    joinRoom: (socket: Socket, CMD: string | undefined, userInfo: UserInfo, userStatus: UserStatus) => {
        const roomName = `pvpRoom ${CMD!.trim()}`;

        // 채팅룸 입장 시도시
        if(Number(CMD)) return pvpBattle.pvpListWrongCommand(socket, '방 이름은 한글 또는 영문자만 가능합니다.', userInfo)

        // 존재하지 않는 방 입장시도시
        if(!publicRooms.has(roomName)) return pvpBattle.pvpListWrongCommand(socket, '존재하지 않는 방이름 입니다.', userInfo)
        
        // 입장 초과시 입장불가
        // if (rooms.get(roomName)!.size > 4) return pvpBattle.pvpListWrongCommand(socket, '4명 정원초과입니다.', userInfo)

        userStatus.pvpRoom = roomName;
        rooms.get(roomName)!.set(userInfo.username,{socketId:socket.id, userStatus})

        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n\n';

        tempScript += `${userStatus.name}님이 입장하셨습니다.\n\n`

        const script = tempLine + tempScript;
        const field = 'pvpBattle';

        socket.join(roomName);
        socket.emit('printBattle',{userStatus});
        io.to(roomName).emit('fieldScriptPrint', { script, field });

        if (rooms.get(roomName)!.size === 4) return pvpBattle.pvpStart(socket, CMD, userInfo, userStatus)
        else if (rooms.get(roomName)!.size > 4) {
            rooms.get(roomName)!.get(userInfo.username)!.target = 'none';
            rooms.get(roomName)!.get(userInfo.username)!.selectSkill = 'none';
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