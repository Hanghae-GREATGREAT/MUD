import { Socket } from 'socket.io';
import { redis } from '../../db/cache';
import { CharacterService, UserService } from "../../services";
import { signupScript } from "../../scripts";
import { UserInfo } from "../../interfaces/user"


export default {

    signupUsername: (socket: Socket, CMD: string|undefined, userInfo: UserInfo) => {
        const script = signupScript.username;
        const field = 'sign:10';

        socket.emit('print', { script, userInfo, field });
    },

    signupPassword: async(socket: Socket, CMD: string | undefined, userInfo: UserInfo, id: string) => {
        const username = CMD!;
        const result = await UserService.dupCheck(username);

        userInfo.username = username;
        const script = !result ? signupScript.password : signupScript.dupUser;
        const field = !result ? 'sign:11' : 'sign:10';

        socket.emit('print', { script, userInfo, field });
    },

    createUser: async (socket: Socket, CMD: string | undefined, userInfo: UserInfo, id: string) => {
        //console.log('CREATE USER');
        const userCreated = await UserService.signup({ username: userInfo.username, password: CMD });

        userInfo.userId = userCreated.getDataValue('userId');    
        const script = signupScript.create;
        const field = 'sign:12';

        socket.emit('print', { script, userInfo, field });
    },

    createCharacter: async (
        socket: Socket, CMD: string | undefined, 
        userInfo: UserInfo, id: string
    ) => {
        
        //console.log('CREATE CHARACTER');
        const name = CMD!;
        const userId = userInfo.userId;
        const character = await CharacterService.createNewCharacter({ name, userId });

        const userSession = {
            userId,
            characterId: character?.characterId,
        }
        const data = JSON.stringify(userSession);
        await redis.set(id, data, { EX: 60*5 });

        const userStatus = await CharacterService.getUserStatus(character.characterId);
        userInfo = {
            userId,
            username: userStatus!.username,
            characterId: userStatus!.characterId,
            name: userStatus!.name,
        }
        const script = signupScript.title;
        const field = 'front';
        
        socket.emit('printBattle', { field, script, userInfo, userStatus });
    },

}


