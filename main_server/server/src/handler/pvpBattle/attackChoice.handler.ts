import { Socket } from 'socket.io';
import { pvpBattle } from '..';
import { UserInfo, UserStatus } from '../../interfaces/user';
import { enemyChoice } from '../../controller/pvpBattle.controller';

export const selectSkills = new Map();
export default {
    attackChoiceHelp: (socket: Socket, CMD: string | undefined, userInfo: UserInfo, userStatus: UserStatus) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        tempScript += '명령어 : \n';
        tempScript += '공격할 스킬을 선택하세요.\n';
        tempScript += '>1 기본공격< 형식으로 입력해주세요.\n';

        const script = tempLine + tempScript;
        const field = 'attackChoice';

        socket.emit('printBattle', { field, script, userInfo, userStatus });
    },

    // 상대 유저를 고를때 마다 메세지 출력
    selectSkills: (socket: Socket, CMD: string | undefined, userInfo: UserInfo, userStatus: UserStatus) => {
        // 유저가 고른 스킬을 이름으로 받아오고 스킬을 선택한 유저가 타겟팅한 상대 유저와 함께 .set 해준다.
        selectSkills.set(enemyChoice.get(userInfo.username), CMD!.trim())
        if (selectSkills.size === 2) {
            return pvpBattle.enemyAttack(socket, CMD, userInfo, userStatus)
        }

        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n\n';

        tempScript += '사용할 스킬을 모두가 고를때까지 기다려주세요.\n';

        const script = tempLine + tempScript;
        const field = 'attackChoice';

        socket.emit('printBattle', { field, script, userInfo, userStatus });
    },

    isSkills: (socket: Socket, CMD: string | undefined, userInfo: UserInfo, userStatus: UserStatus) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n\n';

        tempScript += '사용 가능한 스킬이 아닙니다.\n';
        tempScript += `입력한 스킬명 : ${CMD}\n`;

        const script = tempLine + tempScript;
        const field = 'attackChoice';

        socket.emit('printBattle', { field, script, userInfo, userStatus });
    },

    attackChoiceWrongCommand: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        if (!CMD) CMD = '입력하지 않으셨습니다.'

        let tempScript: string = '';

        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;

        const script = 'Error : \n' + tempScript;
        const field = 'attackChoice';
        socket.emit('print', { script, userInfo, field });
    },
}
