import { Socket } from 'socket.io';
import { CommandHandler } from '../../interfaces/socket';
import { pvpBattleService, CharacterService } from '../../services';
import { pvpBattle } from '..';
import { UserInfo, UserStatus } from '../../interfaces/user';
import { pvpUsers, roomName } from './pvpList.handler'; 

import { enemyChoice } from '../../controller/pvpBattle.controller';
import { io } from '../../app';

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
        rooms.get(roomName).push({socketId:socket.id, userStatus});

        if(enemyChoice.size === 2) {
            return pvpBattle.selectUserResult(socket, CMD, userInfo)
        }
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n\n';

        tempScript += '공격할 상대를 모두가 고를때까지 기다려주세요.\n';

        const script = tempLine + tempScript;
        const field = 'enemyChoice';

        socket.emit('printBattle', { field, script, userInfo, userStatus });
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

    selectUserResult: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n\n';

        const selectUser = [...enemyChoice]

        const userInfos = [...rooms.get(roomName)]

        tempScript += '샤크스 경 :\n';

        // 배열 안에 배열이 6개 있을때, 
        for (let i = 0; i < selectUser.length; i++){
            tempScript += `${selectUser[i][0]}가 ${selectUser[i][1]}를 지목 했다네 !\n`
        }

        tempScript += '\n 어떤 공격을 할텐가 ?\n'
        tempScript += '\n 중간 공백을 포함해서 입력해주게 !\n'

        tempScript += `1 기본공격\n`

        let skillScript:string = ''

        for (let y=0; y < userInfos.length; y++){
            for (let i = 0; i < userInfos[y].userStatus.skill.length; i++) {
                let skills = userInfos[y].userStatus.skill
                skillScript += `${i+2} ${skills[i].name}\n`
        }

        const script = tempLine + tempScript + skillScript;
        const field = 'attackChoice';
        io.to(userInfos[y].socketId).emit('fieldScriptPrint', { field, script });
        skillScript = ''
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

    pvpListWrongCommand: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';

        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;

        const script = 'Error : \n' + tempScript;
        const field = 'pvpList';
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

    enemyChoiceWrongCommand: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';

        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;

        const script = 'Error : \n' + tempScript;
        const field = 'enemyChoice';
        socket.emit('print', { script, userInfo, field });
    },

    attackChoiceWrongCommand: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';

        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;

        const script = 'Error : \n' + tempScript;
        const field = 'attackChoice';
        socket.emit('print', { script, userInfo, field });
    },

    anemyAttackWrongCommand: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';

        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;

        const script = 'Error : \n' + tempScript;
        const field = 'anemyAttack';
        socket.emit('print', { script, userInfo, field });
    },
}
