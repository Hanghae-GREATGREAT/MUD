import { UserCache } from "../../interfaces/user"
import { redis } from '../../db/cache';
import { CharacterService, UserService } from "../../services";
import { Characters } from "../../db/models";
import { signupScript } from "../../scripts";


export default {

    signupUsername: (CMD: string | undefined, userCache: UserCache) => {
        const script = signupScript.username;
        const field = 'sign:10';
        return { script, userCache, field };
    },

    signupPassword: async(CMD: string | undefined, userCache: UserCache, id: string) => {
        const username = CMD!;
        const result = await UserService.dupCheck(username);

        userCache.username = username;
        const script = !result ? signupScript.password : signupScript.dupUser;
        const field = !result ? 'sign:11' : 'sign:10';

        return { script, userCache, field };
    },

    createUser: async (CMD: string | undefined, userCache: UserCache, id: string) => {
        console.log('CREATE USER');
        const userCreated = await UserService.signup({ username: userCache.username, password: CMD });
        
        userCache.userId = userCreated.getDataValue('userId');    
        const script = signupScript.create;
        const field = 'sign:12';
        return { script, userCache, field };
    },

    createCharacter: async (CMD: string | undefined, userCache: UserCache, id: string) => {
        console.log('CREATE CHARACTER');
        const name = CMD!;
        const userId = userCache.userId;
        const character = await CharacterService.createNewCharacter({ name, userId });

        const userSession = {
            userId,
            characterId: character?.characterId,
        }
        // await redis.hSet(id, userSession);
        const data = JSON.stringify(userSession);
        await redis.set(id, data, { EX: 60*5 });

        const newCharacter = await Characters.getSessionData(character)
        userCache = Object.assign(userCache, newCharacter);
        const script = signupScript.title;
        const field = 'front';
        return { script, userCache, field };
    },

}


