import { Socket } from 'socket.io';
import env from '../config.env';
import { fetchPost } from '../common';
import { front, village } from '../handler';
import { SocketInput, CommandHandler, CommandRouter } from '../interfaces/socket';
import { socketIds } from '../socket.routes';


const BATTLE_URL = `${env.HTTP}://${env.WAS_LB}/battle`;

// dungeon, village
export default {
    dungeonController: async (socket: Socket, { line, userInfo }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().toUpperCase().split(' ');

        const cmdRoute: CommandRouter = {
            'LOAD': 'load',
            '목록': 'dungeonList',
            '도움말': 'help',
            '입장': 'dungeonInfo',
            // 'OUT': 'signout',
        }
        if (!cmdRoute[CMD1]) {
            const URL = `${BATTLE_URL}/dungeon/wrongCommand`;
            fetchPost({ URL, socketId: socket.id, CMD: line, userInfo });
            return;
        }
        const URL = `${BATTLE_URL}/dungeon/${cmdRoute[CMD1]}`
        fetchPost({ URL, socketId: socket.id, CMD: CMD2, userInfo });
    },

    villageController: async (socket: Socket, { line, userInfo }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().toUpperCase().split(' ');
        console.log('inputCommand : ', CMD1, CMD2);

        const commandHandler: CommandHandler = {
            'LOAD': village.NpcList,
            '목록': village.NpcList,
            '도움말': village.villagehelp,
            '1': village.storyInfo,
            '2': village.healInfo,
            '3': village.enhanceInfo,
            '4': village.gambleInfo,
            '5': village.pvpInfo,
            'OUT': front.signout
        }
        if (!commandHandler[CMD1]) {
            village.villageWrongCommand(socket, CMD1, userInfo);
            return;
        }

        commandHandler[CMD1](socket, CMD2, userInfo, socket.id);
    },
};
