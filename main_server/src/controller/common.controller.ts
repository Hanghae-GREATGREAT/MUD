import { Socket } from 'socket.io';
import env from '../config.env';
import { CharacterService } from '../services';
import { redis } from '../db/cache';
import { fetchPost } from '../common';
import { roomList, chatJoiner } from '../handler/front/home.handler';
import { front, global } from '../handler';
import { CommandHandler, SocketInput } from '../interfaces/socket';


const FRONT_URL = `http://${env.HOST}:${env.FRONT_PORT}`;
const PVP_URL = `http://${env.HOST}:${env.PVP_PORT}`;

export default {
    globalController: (socket: Socket, { line, userInfo, option }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().toUpperCase().split(' ');

        const commandHandler: CommandHandler = {
            HOME: global.backToHome,
            OUT: front.signout,
            HELP: global.help,
            도움말: global.help,
        };
        if (!commandHandler[CMD2] || CMD2.match(/HELP|도움말/)) {
            console.log('exception');
            commandHandler['HELP'](socket, line, userInfo, option);
            return;
        }

        commandHandler[CMD2](socket, CMD2, userInfo, socket.id);
    },

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

    chatLeave: (socket: Socket) => {
        console.log('disconnect');
        const URL = `${FRONT_URL}/chat/chatLeave`;
        fetchPost({ URL, socketId: socket.id });
    },

    pvpRoomLeave: (socket: Socket) => {
        console.log('pvpRoomDisconnect');
        const URL = `${PVP_URL}/pvp/pvpDisconnect`;
        const option = socket.data;
        fetchPost({ URL, socketId: socket.id, option: option.pvpUser });
        return;
    }
};
