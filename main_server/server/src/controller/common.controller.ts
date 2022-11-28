import { CharacterService } from '../services';
import { Socket } from 'socket.io';
import { redis } from '../db/cache';
import { roomList, chatJoiner } from '../handler/front/home.handler';

export default {
    requestStatus: async (characterId: number, callback: any) => {
        const userStatus = await CharacterService.getUserStatus(characterId);

        callback({
            status: 200,
            userStatus,
        });
    },

    disconnect: (socket: Socket) => {
        if (chatJoiner[socket.id]) {
            const joinedRoom = Number(chatJoiner[socket.id]);
            roomList.get(joinedRoom)!.delete(socket.id);
            delete chatJoiner[socket.id];
            console.log(`roomList: ${roomList}\nchatJoiner: ${chatJoiner}`);
        }
        redis.del(socket.id);
        console.log(socket.id, 'SOCKET DISCONNECTED');
    },
};
