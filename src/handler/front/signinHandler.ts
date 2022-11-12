import { UserSession } from '../../interfaces/user';
import { CharacterService, UserService, DungeonService } from '../../services';
import { Characters } from '../../db/models';
import redis from '../../db/redis/config'
import { signinScript } from '../../scripts';
import userService from '../../services/user.service';


export default {

    signinUsername: (CMD: string | undefined, user: UserSession) => {
        const script = signinScript.username;
        const field = 'sign:20';
        
        return { script, user, field };
    },

    signinPassword: async(CMD: string | undefined, user: UserSession) => {
        user.username = CMD!;
        const script = signinScript.password;
        const field = 'sign:21'

        return { script, user, field };
    },

    signinCheck: async(CMD: string | undefined, user: UserSession, id: string) => {
        const username = user.username;
        const password = CMD;
        const result = await UserService.signin({ username, password });

        const userId = result?.userId || 0;
        const character = await CharacterService.findOneByUserId(userId);

        const userSession = {
            userId,
            characterId: character?.characterId,
        }
        // await redis.hSet(id, userSession);
        const data = JSON.stringify(userSession);
        await redis.set(id, data, { EX: 60*5 });

        if (character) {
            const characterSession = await Characters.getSessionData(character)
            user = Object.assign(user, characterSession);
        }
        const script = result ? signinScript.title: signinScript.incorrect;
        const field = result ? 'front' : 'sign:21';

        return { script, user, field };
    },
}
