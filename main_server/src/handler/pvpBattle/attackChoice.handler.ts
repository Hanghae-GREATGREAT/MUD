import { Socket } from 'socket.io';
import { pvpBattle } from '..';
import { rooms } from './pvpList.handler';
import { UserInfo, UserStatus } from '../../interfaces/user';

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

    // 상대 유저를 고를때 마다 대기 메세지 출력
    // 모두 선택시 다음로직으로 보내준다.
    selectSkills: (socket: Socket, CMD: string | undefined, userInfo: UserInfo, userStatus: UserStatus) => {
        const roomName = userStatus.pvpRoom;
        const selectSkills: string[] = [];
        const pvpRoom = rooms.get(roomName!)
        pvpRoom!.get(userInfo.username)!.selectSkill = CMD!.trim();
        const user = [...pvpRoom!]

        // 선택한 스킬 push
        for (let i = 0; i < 4; i++) {
            selectSkills.push(user[i][1].selectSkill!)
        }

        // undefined인 값 제거
        const skills = selectSkills.filter(names => names !== undefined)

        // 모두 선택시 다음로직으로 보내준다.
        if (skills.length === 4) {
            return pvpBattle.enemyAttack(socket, CMD, userInfo, userStatus);
        }

        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n\n';

        tempScript += '사용할 스킬을 모두가 고를때까지 기다려주세요.\n';

        const script = tempLine + tempScript;
        const field = 'attackChoice';

        socket.emit('printBattle', { field, script, userInfo, userStatus });
    },

    // 스킬명을 잘못 입력하였거나 유저가 가진 스킬이 아닐시
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
