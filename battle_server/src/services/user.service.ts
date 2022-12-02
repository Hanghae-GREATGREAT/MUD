import { CharacterService } from '.';
import { UserInfo } from '../interfaces/user';


class UserService {

    /**
     * 
     * @param userInfo 
     * @returns 일치하는 user가 없으면 true, 있으면 false
     */
    async checkUser(userInfo: UserInfo) {
        const { userId, characterId, name } = userInfo;
        const character = await CharacterService.findOneByUserId(userId);

        // userSession으로 들어온 정보와 일치하는 캐릭터가 없을 때
        return (
            !character ||
            character.characterId !== characterId ||
            character.name !== name
        );
    }
}


export default new UserService();