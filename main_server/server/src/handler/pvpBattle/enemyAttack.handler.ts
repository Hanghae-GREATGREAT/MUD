import { Socket } from 'socket.io';
import { CommandHandler } from '../../interfaces/socket';
import { pvpBattleService, CharacterService } from '../../services';
import { pvpBattle } from '..';
import { UserInfo, UserStatus } from '../../interfaces/user';
import { pvpUsers, roomName } from './pvpList.handler'; 

import { enemyChoice } from '../../controller/pvpBattle.controller';
import { io } from '../../app';

import { rooms } from './pvpList.handler';

import { selectSkills } from './attackChoice.handler';

export default {
    enemyAttackhelp: (socket: Socket, CMD: string | undefined, userInfo: UserInfo, userStatus: UserStatus) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        tempScript += '명령어 : \n';
        tempScript += '공격할 유저의 번호를 선택하세요.\n';
        tempScript += '[돌]아가기 - 이전 단계로 돌아갑니다.\n';

        const script = tempLine + tempScript;
        const field = 'enemyAttack';

        socket.emit('printBattle', { field, script, userInfo, userStatus });
    },

    enemyAttack: (socket: Socket, CMD: string | undefined, userInfo: UserInfo, userStatus: UserStatus) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n\n';

        tempScript += '사용할 스킬을 모두가 고를때까지 기다려주세요.\n';

        const script = tempLine + tempScript;
        const field = 'enemyAttack';

        socket.emit('printBattle', { field, script, userInfo, userStatus });
    },
}
