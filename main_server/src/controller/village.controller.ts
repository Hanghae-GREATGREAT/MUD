import { Socket } from 'socket.io';
import env from '../config.env';
import { village, npc } from '../handler';
import { fetchPost } from '../common';
import { SocketInput, CommandHandler, CommandRouter } from '../interfaces/socket';


const PVP_URL = `${env.HTTP}://${env.WAS_LB}/pvp`;

export default {
    storyController: async (socket: Socket, { line, userInfo }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');

        const commandHandler: CommandHandler = {
            '도움말': npc.storyHelp,
            '1': npc.storyTalk,
            '2': npc.diary,
            '3': village.NpcList,
        };

        if (!commandHandler[CMD1]) {
            npc.storyWrongCommand(socket, CMD1, userInfo);
            return;
        }

        commandHandler[CMD1](socket, CMD2, userInfo);
    },

    healController: async (socket: Socket, { line, userInfo, userStatus }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');

        const commandHandler: CommandHandler = {
            '도움말': npc.healHelp,
            '1': npc.healTalk,
            '2': npc.heal,
            '3': village.NpcList,
        };

        if (!commandHandler[CMD1]) {
            npc.healWrongCommand(socket, CMD1, userInfo);
            return;
        }

        commandHandler[CMD1](socket, CMD2, userInfo, userStatus);
    },

    enhanceController: async (socket: Socket, { line, userInfo, userStatus }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');

        const commandHandler: CommandHandler = {
            '도움말': npc.enhanceHelp,
            '1': npc.enhanceTalk,
            '2': npc.enhance,
            '3': village.NpcList,
        };

        if (!commandHandler[CMD1]) {
            npc.enhanceWrongCommand(socket, CMD1, userInfo);
            return;
        }

        commandHandler[CMD1](socket, CMD2, userInfo, userStatus);
    },

    gambleController: async (socket: Socket, { line, userInfo }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');

        const commandHandler: CommandHandler = {
            '도움말': npc.gambleHelp,
            '1': npc.gambleTalk,
            '2': npc.gamble,
            '3': village.NpcList,
        };

        if (!commandHandler[CMD1]) {
            npc.gambleWrongCommand(socket, CMD1, userInfo);
            return;
        }

        commandHandler[CMD1](socket, CMD2, userInfo);
    },

    pvpController: async (socket: Socket, { line, userInfo, userStatus }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
        if (CMD1 === '3') return village.NpcList(socket, CMD2, userInfo);

        const cmdRoute: CommandRouter = {
                '도움말': 'help',
                '1': 'pvpTalk',
                '2': 'pvpGo',
            };

        if (!cmdRoute[CMD1]) {
            const URL = `${PVP_URL}/pvp/wrongCommand`
            fetchPost({ URL, socketId: socket.id, CMD: line, userInfo, option: 'pvpNpc' })
            return;
        }

        const URL = `${PVP_URL}/pvpNpc/${cmdRoute[CMD1]}`
        fetchPost({ URL, socketId: socket.id, CMD: CMD2, userInfo, userStatus, option: 'pvpNpc' })
    },
};
