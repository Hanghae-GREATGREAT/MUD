import { Socket } from 'socket.io';
import { io } from '../../app';
import { pvpBattle } from '..';
import { UserInfo, UserStatus } from '../../interfaces/user';
import { rooms } from './pvpList.handler';

export default {
    enemyChoiceHelp: (socket: Socket, CMD: string | undefined, userInfo: UserInfo, userStatus: UserStatus) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        tempScript += '명령어 : \n';
        tempScript += '공격할 유저의 번호를 선택하세요.\n';
        tempScript += '[돌]아가기 - 이전 단계로 돌아갑니다.\n';

        const script = tempLine + tempScript;
        const field = 'enemyChoice';

        socket.emit('printBattle', { field, script, userInfo, userStatus });
    },

    // 상대 유저를 고를때 마다 메세지 출력
    selecting: (socket: Socket, CMD: string | undefined, userInfo: UserInfo, userStatus: UserStatus) => {
        const roomName = userStatus.pvpRoom;
        let targets: string[] = [];

        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n\n';

        tempScript += '공격할 상대를 모두가 고를때까지 기다려주세요.\n';

        const script = tempLine + tempScript;
        const field = 'enemyChoice';

        socket.emit('print', { field, script, userInfo, userStatus });

        const pvpRoom = rooms.get(roomName!)
        const iterator = pvpRoom!.values()
        for (let i = 0; i < pvpRoom!.size; i++) {
            targets.push(iterator.next().value.target)
        }

        // undefined인 값 제거
        const users = targets.filter(names=>names !== undefined)

        // 공격할 유저 모두 선택시 다음 로직으로 보내준다.
        if(users.length === 4) {
            return pvpBattle.selectUserResult(socket, CMD, userInfo, userStatus)
        }
    },

    selectWrong: (socket: Socket, CMD: string | undefined, userInfo: UserInfo, userStatus: UserStatus) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n\n';

        tempScript += '샤크스 경 :\n';
        tempScript += '자신 또는 본인이 속한 팀은 고를 수 없다네 !\n';

        const script = tempLine + tempScript;
        const field = 'enemyChoice';

        socket.emit('printBattle', { field, script, userInfo, userStatus });
    },

    selectUserResult: (socket: Socket, CMD: string | undefined, userInfo: UserInfo, userStatus: UserStatus) => {
        const roomName = userStatus.pvpRoom;
        const users: string[] = []
        const targets: string[] = []
        const pvpRoom = rooms.get(roomName!)
        const user = [...pvpRoom!]

        for (let i = 0; i < user.length; i++) {
            users.push(user[i][1].userStatus.username)
            targets.push(user[i][1].target!)
        }

        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n\n';

        tempScript += '샤크스 경 :\n';

        // 선택한 유저목록을 보여준다.
        for (let i = 0; i < rooms.get(roomName!)!.size; i++){
            tempScript += `${users[i]}가 ${targets[i]}를 지목 했다네 !\n`;
        }

        tempScript += '\n 어떤 공격을 할텐가 ?\n';
        tempScript += '\n 중간 공백을 포함해서 입력해주게 !\n';

        tempScript += `1 기본공격\n`;

        let skillScript: string = '';

        // 유저별로 선택할 수 있는 목록을 보여준다.
        for (let y=0; y < user.length; y++){
            for (let i = 0; i < user[y][1].userStatus.skill.length; i++) {
                let skills = user[y][1].userStatus.skill[i]
                    skillScript += `${i+2} ${skills.name}\n`
            }

        const script = tempLine + tempScript + skillScript;
        const field = 'attackChoice';
        io.to(user[y][1].socketId).emit('fieldScriptPrint', { field, script });
        skillScript = '';
        }
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

    enemyChoiceWrongCommand: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';

        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;

        const script = 'Error : \n' + tempScript;
        const field = 'enemyChoice';
        socket.emit('print', { script, userInfo, field });
    },
}
