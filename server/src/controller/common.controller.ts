import { CharacterService } from '../services'
import {  } from 'socket.io'



export default {
    requestStatus: async(characterId: number, callback: any) => {
        const userStatus = await CharacterService.getUserStatus(characterId);

        callback({
            status: 200,
            userStatus
        });
    }
}
