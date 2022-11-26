import { Socket } from 'socket.io';
import { CommandHandler } from '../../interfaces/socket';
import { pvpBattleService, CharacterService } from '../../services';
import { pvpBattle } from '..';
import { UserInfo, UserStatus } from '../../interfaces/user';
import { io } from '../../app';
import { roomName, pvpUsers } from './pvpList.handler';

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

    welcomeUsers: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n\n';

        tempScript += `${userInfo.username}님이 입장하셨습니다.\n\n`

        const script = tempLine + tempScript;
        let field = 'pvpBattle';

        socket.emit('print', { script, userInfo, field });
    },

    // 이건 프론트단에서 하는게 나을려나 ?
    getUsers:(socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {

        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n\n';

        tempScript += `현재 인원은 ${pvpUsers.size}명 입니다.\n`;

        const script = tempLine + tempScript;
        const field = 'pvpBattle';

        socket.emit('printBattle', { script, userInfo, field });
    },

    // 6명이 되면 게임시작
    pvpStart:(socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {

        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n\n';

        const selectUser = [...pvpUsers]
        tempScript += `샤크스 경 : 게임은 시작되었다네 !\n`;
        tempScript += `공격할 유저를 선택하게나.\n\n`;

        for (let i = 0; i < selectUser.length; i++) {
            tempScript += `${i+1}. ${selectUser[i]}\n`;
        }

        const script = tempLine + tempScript;
        const field = 'enemyChoice'

        io.to(roomName!).emit('fieldScriptPrint', { script, field });
    },

    // 마을로 보내는 로직 구현필요.
    userLeave:(socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';
        pvpUsers.delete(userInfo.username)

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

        socket.emit('print', { script, userInfo, field });
    },

    wrongCommand: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';

        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;

        const script = 'Error : \n' + tempScript;
        const field = 'pvpBattle';
        socket.emit('print', { script, userInfo, field });
    },
}

// export function pvpBattleList(name: string) {
//     // 던전 목록 불러오기
//     const pvpBattleList = pvpBattleService.getPvpList();
//     console.log(pvpBattleList);

//     // 임시 스크립트 선언
//     const tempLine =
//         '=======================================================================\n';
//     let tempScript: string = '';

//     tempScript += `${name}은(는) 깊은 심연으로 발걸음을 내딛습니다.\n\n`;
//     tempScript += `${pvpBattleList}`;

//     return tempLine + tempScript;
// }
