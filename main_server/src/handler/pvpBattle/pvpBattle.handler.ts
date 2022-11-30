import { Socket } from 'socket.io';
import { UserInfo, UserStatus } from '../../interfaces/user';
import { io } from '../../app';
import { Characters } from '../../db/models';
import { rooms } from './pvpList.handler';

export default {
    pvpBattleHelp: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        tempScript += '명령어 : \n';
        tempScript += '[현]재인원 - 입장한 인원의 수를 확인합니다.\n';
        tempScript += '[돌]아가기 - 이전 단계로 돌아갑니다.\n';

        const script = tempLine + tempScript;
        const field = 'pvpBattle';

        socket.emit('print', { script, userInfo, field });
    },

    // 입장한 방의 현재인원 확인
    getUsers:(socket: Socket, CMD: string | undefined, userInfo: UserInfo, userStatus: UserStatus) => {
        let users = rooms.get(userStatus.pvpRoom!)!.size;

        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n\n';

        tempScript += `현재 인원은 ${users}명 입니다.\n`;

        const script = tempLine + tempScript;
        const field = 'pvpBattle';

        socket.emit('printBattle', { script, userInfo, field });
    },

    // 6명이 되면 게임시작
    pvpStart: async (socket: Socket, CMD: string | undefined, userInfo: UserInfo, userStatus:UserStatus) => {
        const roomName = userStatus.pvpRoom;

        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n\n';

        const names:string[] = [];

        const pvpRoom = rooms.get(roomName!)
        const iterator = pvpRoom!.values()
        for (let i = 0; i < 4; i++) {
            names.push(iterator.next().value.userStatus.name)
        }

        // 캐릭터별 이름, 레벨, 체력, 공격력, 방어력 표시
        const userInfos = [];
        for (let i = 0; i< names.length; i++) {
           userInfos.push(await Characters.findOne({where:{name:names[i]!}}))
        }

        tempScript += `샤크스 경 : \n`;
        tempScript += `공격할 유저를 선택하게나 !\n\n`;

        for (let i = 0; i < 4; i++) {
            if (userInfos[i]!.hp === 0) continue;
            tempScript += `${i+1}. Lv${userInfos[i]!.level} ${names[i]} - hp: ${userInfos[i]!.hp}/${userInfos[i]!.maxhp}, attack: ${userInfos[i]!.attack}, defense: ${userInfos[i]!.defense}\n`;
        }

        const script = tempLine + tempScript;
        const field = 'enemyChoice'

        io.to(userStatus.pvpRoom!).emit('fieldScriptPrint', { script, field });
    },

    // 방에서 나가기
    userLeave:(socket: Socket, CMD: string | undefined, userInfo: UserInfo, userStatus: UserStatus) => {
        let tempScript: string = '';

        const tempLine =
        '=======================================================================\n\n';

        tempScript += `${userInfo.username}은(는) 멀리 보이는 굴뚝 연기를 향해 발걸음을 내딛습니다.\n\n`;
        tempScript += `방문할 NPC의 번호를 입력해주세요.\n\n`;
        tempScript += `1. 프라데이리 - 모험의 서\n\n`;
        tempScript += `2. 아그네스 - 힐러의 집\n\n`;
        tempScript += `3. 퍼거스 - 대장장이\n\n`;
        tempScript += `4. 에트나 - ???\n\n`;
        tempScript += `5. 샤크스 경 - 시련의 장 관리인\n\n`

        const script = tempLine + tempScript;
        const field = 'village';

        rooms.get(userStatus.pvpRoom!)!.delete(userInfo.username);
        userStatus.pvpRoom = undefined;
        
        socket.leave(userStatus.pvpRoom!)
        socket.emit('print', { script, userInfo, field });
    },

    pvpBattleWrongCommand: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';

        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;

        const script = 'Error : \n' + tempScript;
        const field = 'pvpBattle';
        socket.emit('print', { script, userInfo, field });
    },
}