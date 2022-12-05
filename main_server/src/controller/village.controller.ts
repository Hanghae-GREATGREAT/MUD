import { Socket } from 'socket.io';
import env from '../config.env';
import { village, npc } from '../handler';
import { fetchPost } from '../common';
import { SocketInput, CommandHandler, CommandRouter } from '../interfaces/socket';


const PVP_URL = `http://${env.HOST}:${env.PVP_PORT}`

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
        console.log('socketon battle');

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
        console.log('socketon battle');

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
        // console.log('socketon pvp');

        // const commandHandler: CommandHandler = {
        //     '도움말': npc.pvpHelp,
        //     '1': npc.pvpTalk,
        //     '2': npc.pvp,
        //     '3': village.NpcList,
        // };

        // if (!commandHandler[CMD1]) {
        //     console.log(`is wrong command : '${CMD1}'`);
        //     npc.pvpWrongCommand(socket, CMD1, userInfo);
        //     return;
        // }

        // commandHandler[CMD1](socket, CMD2, userInfo);

        if (CMD1 === '3') return village.NpcList(socket, CMD2, userInfo);

        if (CMD1 === '도움말') {
            const URL = `${PVP_URL}/pvp/help`
            fetchPost({ URL, socketId: socket.id, CMD: CMD1, userInfo, option: 'pvpNpc' })
            return;
        }

        const cmdRoute: CommandRouter = {
                '도움말': 'help',
                '1': 'pvpTalk',
                '2': 'pvpGo',
            };

        if (!cmdRoute[CMD1]) {
            const URL = `${PVP_URL}/pvp/wrongCommand`
            fetchPost({ URL, socketId: socket.id, CMD: CMD2, userInfo, option: 'pvpNpc' })
            return;
        }

        const URL = `${PVP_URL}/pvpNpc/${cmdRoute[CMD1]}`
        fetchPost({ URL, socketId: socket.id, CMD: CMD2, userInfo, userStatus })
    },
};
