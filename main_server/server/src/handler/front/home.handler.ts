import { Socket } from 'socket.io';
import { UserService, CharacterService } from '../../services';
import { dungeonList } from '..';
import { NpcList } from '../village.handler';
import { homeScript } from '../../scripts';
import { UserInfo } from '../../interfaces/user';


export default {
    
    loadHome: (socket: Socket, userInfo: UserInfo) => {
        const script = homeScript.loadHome;
        const field = 'front';

        socket.emit('print', { field, script, userInfo });
    },

    checkUser: async (userInfo: UserInfo) => {
        const { userId, characterId, name } = userInfo;
        const character = await CharacterService.findOneByUserId(userId);

        // userSession으로 들어온 정보와 일치하는 캐릭터가 없을 때
        return (
            !character ||
            character.characterId !== characterId ||
            character.name !== name
        );
    },

    signout: (socket: Socket, CMD: string|undefined, userInfo: UserInfo, id: string) => {
        UserService.signout(userInfo.userId, id);
        const script = homeScript.signout;
        const field = 'front';

        socket.emit('signout', { script, userInfo: {}, field });
    },

    toVillage: (socket: Socket, CMD: string|undefined, userInfo: UserInfo) => {
        const script = NpcList(userInfo.name); // 마을 스크립트
        const field = 'village';

        socket.emit('print', { script, userInfo, field, chat: true });
    },

    toDungeon: (socket: Socket, CMD: string|undefined, userInfo: UserInfo) => {
        const script = dungeonList(userInfo.name);
        const field = 'dungeon';

        socket.emit('print', { script, userInfo, field, chat: true });
    },

    emptyCommand: (socket: Socket, CMD: string|undefined, userInfo: UserInfo) => {
        const script = homeScript.wrongCommand;
        const field = 'front';

        socket.emit('print', { script, userInfo, field });
    },

    deleteAccount: async (socket: Socket, CMD: string|undefined, userInfo: UserInfo) => {
        const { userId, characterId } = userInfo;
        const result = await UserService.deleteUser(userId, characterId);

        const script =
            result === 1
                ? homeScript.delete + homeScript.loadHome
                : homeScript.deleteFail;
        const field = 'front';
        
        socket.emit('print', { script, userInfo: {}, field });
    },
};
