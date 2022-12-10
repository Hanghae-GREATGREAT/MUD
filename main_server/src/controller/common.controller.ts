import { Socket } from 'socket.io';
import env from '../config.env';
import { CharacterService } from '../services';
import { fetchPost } from '../common';
import { CommandRouter, SocketInput } from '../interfaces/socket';
import { socketIds } from '../socket.routes';


const FRONT_URL = `${env.HTTP}://${env.WAS_LB}/front`;
const PVP_URL = `${env.HTTP}://${env.WAS_LB}/pvp`;

export default {
    globalController: (socket: Socket, { line, userInfo, option }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().toUpperCase().split(' ');

        const cmdRoute: CommandRouter = {
            'HOME': 'toHome',
            'OUT': 'signout',
            'HELP': 'globalHelp',
            '도움말': 'globalHelp',
        }
        if (!cmdRoute[CMD2]) {
            const URL = `${FRONT_URL}/front/globalHelp`;
            fetchPost({ URL, socketId: socket.id, CMD: line, userInfo, option });
            return;
        }
        const URL = `${FRONT_URL}/front/${cmdRoute[CMD2]}`
        fetchPost({ URL, socketId: socket.id, CMD: CMD2, userInfo, option });
    },

    requestStatus: async (characterId: number, callback: any) => {
        const userStatus = await CharacterService.getUserStatus(characterId);

        callback({
            status: 200,
            userStatus,
        });
    },

    disconnect: (socket: Socket) => {
        // const URL = `${FRONT_URL}/front/disconnect`;
        // fetchPost({ URL, socketId: socket.id });

        // console.log(socket.id, 'SOCKET DISCONNECTED');
    },

    chatLeave: (socket: Socket) => {
        console.log(socket.id, 'SOCKET DISCONNECTED');
        const URL = `${FRONT_URL}/chat/chatLeave`;
        fetchPost({ URL, socketId: socket.id });
    },

    pvpRoomLeave: (socket: Socket) => {
        console.log('pvpRoomDisconnect');
        const URL = `${PVP_URL}/pvp/pvpDisconnect`;
        const option = socket.data;
        fetchPost({ URL, socketId: socket.id, option: option.pvpUser });

        if (!option.pvpUser) return;

        const FRONTURL = `${FRONT_URL}/chat/pvpChatLeave`;
        const { userId } = option.pvpUser.split(' ').pop();
        fetchPost({ URL: FRONTURL, socketId: socketIds.get(userId)! });
        return;
    }
};
