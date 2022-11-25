import { socket } from '../../socket.routes';
import { CommandHandler } from '../../interfaces/socket';
import { pvpBattleService, CharacterService } from '../../services';
import { pvpBattle } from '..';
import { UserInfo, UserStatus } from '../../interfaces/user';
import { pvpUsers } from './pvpBattle.handler';

import { enemyChoice } from '../../controller/pvpBattle.controller';

export default {
    help: (CMD: string | undefined, userInfo: UserInfo, userStatus: UserStatus) => {
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
    selecting: (CMD: string | undefined, userInfo: UserInfo, userStatus: UserStatus) => {
        if(enemyChoice.size === 2) {
            return pvpBattle.selectUserResult(CMD, userInfo, userStatus)
        }
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n\n';

        tempScript += '공격할 상대를 모두가 고를때까지 기다려주세요.\n';

        const script = tempLine + tempScript;
        const field = 'enemyChoice';

        socket.emit('printBattle', { field, script, userInfo, userStatus });
    },

    selectUserResult: (CMD: string | undefined, userInfo: UserInfo, userStatus: UserStatus) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n\n';

        const selectUser = [...enemyChoice]

        tempScript += '샤크스 경 :\n';

        // 배열 안에 배열이 6개 있을때, 
        for (let i = 0; i < selectUser.length; i++){
            tempScript += `${selectUser[i][0]}가 ${selectUser[i][1]}를 지목 했다네 !\n`
        }

        tempScript += '\n 어떤 공격을 할텐가 ?\n'

        for(let i = 0; i < userStatus.skill.length; i++) {
            tempScript += `${i+1}. ${userStatus.skill[i].name}\n`
        }

        const script = tempLine + tempScript;
        const field = 'attackChoice';

        socket.emit('printBattle', { field, script, userInfo, userStatus });
    },

    wrongCommand: (CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';

        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;

        const script = 'Error : \n' + tempScript;
        const field = 'pvpBattle';
        socket.emit('print', { script, userInfo, field });
    },
}
