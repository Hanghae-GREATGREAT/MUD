import { UserCache } from '../../interfaces/user';
import { UserService, CharacterService } from '../../services';
import { dungeonList } from '..';
import { homeScript } from '../../scripts';
import { NpcList } from '../village.handler';

export default {
    loadHome: (CMD: string | undefined, userCache: UserCache) => {
        console.log('LOAD HOME');

        const script = homeScript.loadHome;
        const field = 'front';
        return { script, userCache, field };
    },

    checkUser: async (userCache: UserCache) => {
        console.log('CHECK USER');
        const { userId, characterId, name } = userCache;
        const character = await CharacterService.findOneByUserId(userId);

        // userSession으로 들어온 정보와 일치하는 캐릭터가 없을 때
        return (
            !character ||
            character.characterId !== characterId ||
            character.name !== name
        );
    },

    signout: (CMD: string | undefined, userCache: UserCache, id: string) => {
        console.log('SIGN OUT');

        UserService.signout(userCache.userId, id);
        const script = homeScript.signout + homeScript.loadHome;
        const field = 'front';
        return { script, userCache, field };
    },

    toVillage: (CMD: string | undefined, userCache: UserCache) => {
        console.log('TO VILLAGE');

        const script = NpcList(userCache.name); // 마을 스크립트
        const field = 'village';
        return { script, userCache, field, chat: true };
    },

    toDungeon: (CMD: string | undefined, userCache: UserCache) => {
        console.log('TO DUNGEON');

        const script = dungeonList(userCache.name);
        const field = 'dungeon';
        return { script, userCache, field, chat: true };
    },

    emptyCommand: (CMD: string | undefined, userCache: UserCache) => {
        console.log('EMPTY COMMAND');

        const script = homeScript.wrongCommand;
        const field = 'front';
        return { script, userCache, field };
    },

    deleteAccount: async (CMD: string | undefined, userCache: UserCache) => {
        console.log('EMPTY COMMAND');

        const { userId, characterId } = userCache;
        const result = await UserService.deleteUser(userId, characterId);

        const script =
            result === 1
                ? homeScript.delete + homeScript.loadHome
                : homeScript.deleteFail;
        const field = 'front';
        return { script, userCache: emptySession, field };
    },
};

const emptySession: UserCache = {
    userId: 0,
    username: '',
    characterId: 0,
    name: '',
    level: 0,
    attack: 0,
    defense: 0,
    maxhp: 0,
    maxmp: 0,
    hp: 0,
    mp: 0,
    exp: 0,
    questId: 0,
};
