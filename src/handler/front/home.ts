import { UserSession } from "../../interfaces/user";
import { UserService, CharacterService } from "../../services";
import { dungeonList } from "../../handler";
import { homeScript } from "../../scripts";

export default {

    loadHome: (CMD: string | undefined, user: UserSession) => {
        console.log('LOAD HOME');
    
        const script = homeScript.loadHome;
        const field = 'front'
        return { script, user, field };
    },

    checkUser: async(user: UserSession) => {
        console.log('CHECK USER');
        const { userId, characterId, name } = user;
        const character = await CharacterService.findOneByUserId(userId);
        
        // userSession으로 들어온 정보와 일치하는 캐릭터가 없을 때
        return (!character || character.characterId !== characterId || character.name !== name);
    },

    signout: (CMD: string | undefined, user: UserSession, id: string) => {
        console.log('SIGN OUT');
    
        UserService.signout(user.userId, id);
        const script = homeScript.signout;
        const field = 'signout'
        return { script, user, field };
    },

    toVillage: (CMD: string | undefined, user: UserSession) => {
        console.log('TO VILLAGE');

        const script = homeScript.loadHome; // 마을 스크립트
        const field = 'front'
        return { script, user, field, chat:true };
    },

    toDungeon: (CMD: string | undefined, user: UserSession) => {
        console.log('TO DUNGEON');
    
        const script = dungeonList(user.name);
        const field = 'dungeon';
        return { script, user, field, chat:true };
    },

    emptyCommand: (CMD: string | undefined, user: UserSession) => {
        console.log('EMPTY COMMAND');
    
        const script = homeScript.wrongCommand;
        const field = 'front'
        return { script, user, field };
    },

    deleteAccount: async(CMD: string | undefined, user: UserSession) => {
        console.log('EMPTY COMMAND');

        const { userId, characterId } = user;
        const result = await UserService.deleteUser(userId, characterId);

        const script = result===1 ? homeScript.delete + homeScript.loadHome : homeScript.deleteFail;
        const field = 'front';
        return { script, user: emptySession, field };
    },
}

const emptySession: UserSession = {
    userId: 0,
    username: '',
    characterId: 0,
    name: '',
    level: 0,
    maxhp: 0,
    maxmp: 0,
    hp: 0,
    mp: 0,
    exp: 0,
    questId: 0,
}