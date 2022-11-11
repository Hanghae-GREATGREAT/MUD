import { UserSession } from "../interfaces/user";
import { UserService, CharacterService } from "../services";
import { dungeonList } from "../dungeon/dungeonHandler";

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

export const homeScript = {
    loadHome: `환영합니다.
    [HELP] 대괄호 안의 명령어를 사용할 수 있으며, 대소문자 구분을 하지 않아도 됩니다.
    이미 아이디가 있다면 [IN]을,
    회원가입을 해야한다면 [UP]을 입력해주세요. \n`,
    wrongCommand: `잘못 입력하였습니다. \n`,
    signout: `정상적으로 로그아웃하였습니다. 
    =====================================================\n\n\n`,
    dungeon: `\n\n명령어 : 
    목록 - 던전 목록을 불러옵니다.
    입장 (번호) - 던전에 들어갑니다.
    돌아가기 - 이전 단계로 돌아갑니다.\n`,
}