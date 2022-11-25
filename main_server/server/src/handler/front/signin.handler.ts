import { Socket } from 'socket.io';
import { CharacterService, UserService } from '../../services';
import { redis } from '../../db/cache'
import { signinScript } from '../../scripts';
import { UserInfo } from '../../interfaces/user';


export default {

    signinUsername: (socket: Socket, CMD: string|undefined, userInfo: UserInfo) => {
        const script = signinScript.username;
        const field = 'sign:20';

        socket.emit('print', { script, userInfo, field });
    },

    signinPassword: async(socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        userInfo.username = CMD!;
        const script = signinScript.password;
        const field = 'sign:21'

        socket.emit('print', { script, userInfo, field });
    },

    signinCheck: async(
        socket: Socket, CMD: string | undefined, 
        userInfo: UserInfo, id: string
    ) => {
        
        const username = userInfo.username;
        const password = CMD;
        const result = await UserService.signin({ username, password });

        const userId = result?.userId || 0;
        const character = await CharacterService.findOneByUserId(userId);

        const userSession = {
            userId,
            characterId: character?.characterId,
        }
        const data = JSON.stringify(userSession);
        await redis.set(id, data, { EX: 60*5 });

        if (character) {
            const userStatus = await CharacterService.getUserStatus(character.characterId);
            userInfo = {
                userId,
                username: userStatus!.username,
                characterId: userStatus!.characterId,
                name: userStatus!.name,
            }

            const script = result ? signinScript.title: signinScript.incorrect;
            const field = result ? 'front' : 'sign:21';

            socket.emit('printBattle', { field, script, userInfo, userStatus });
        }
    },
}
