import { CharacterService } from '../services'
import { Socket } from 'socket.io'
import { redis } from '../db/cache';


export default {
    requestStatus: async(characterId: number, callback: any) => {
        const userStatus = await CharacterService.getUserStatus(characterId);

        callback({
            status: 200,
            userStatus
        });
    },

    disconnect: (socket: Socket) => {
        redis.del(socket.id);
        // console.log(socket.id, 'SOCKET DISCONNECTED');
    }
}
