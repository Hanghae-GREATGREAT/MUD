import { Socket } from 'socket.io';
import { UserInfo, UserStatus } from '../../interfaces/user';
export default {
    pvpListHelp: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        tempScript += '명령어 : \n';
        tempScript += '1 - 시련의 장 방생성을 합니다.\n';
        tempScript += '2 - 시련의 장 방이름을 입력하여 입장합니다.\n';
        tempScript += '[돌]아가기 - 마을로 돌아갑니다.\n';

        const script = tempLine + tempScript;
        const field = 'pvpList';

        socket.emit('print', { script, userInfo, field });
    },

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

    enemyChoiceHelp: (socket: Socket, CMD: string | undefined, userInfo: UserInfo, userStatus: UserStatus) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        tempScript += '명령어 : \n';
        tempScript += '공격할 유저의 번호를 선택하세요.\n';

        const script = tempLine + tempScript;
        const field = 'enemyChoice';

        socket.emit('printBattle', { field, script, userInfo, userStatus });
    },

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
}