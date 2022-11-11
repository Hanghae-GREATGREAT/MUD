import { UserSession } from "../../interfaces/user";
import { UserService, CharacterService } from "../../services";
import { dungeonList } from "../../dungeon/dungeonHandler";
import { homeScript } from "../../scripts";
import { Characters } from "../../db/models";

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
        const character = await Characters.findByPk(userId);
        
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
}

