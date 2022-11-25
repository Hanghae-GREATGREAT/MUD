import { socket } from '../socket.routes';
import { village, npc, pvpBattle } from '../handler';
import { SocketInput, CommandHandler } from '../interfaces/socket';

export default {
    storyController: async ({ line, userInfo }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
        console.log('socketon battle');

        const commandHandler: CommandHandler = {
            '도움말': npc.storyHelp,
            '1': npc.storyTalk,
            '2': npc.diary,
            '3': village.NpcList,
        };

        if (!commandHandler[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = npc.storyWrongCommand(CMD1, userInfo);
            return socket.emit('print', result);
        }

        const result = await commandHandler[CMD1](CMD2, userInfo);
        socket.emit('print', result);
    },

    healController: async ({ line, userInfo, userStatus }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
        console.log('socketon battle');

        const commandHandler: CommandHandler = {
            '도움말': npc.healHelp,
            '1': npc.healTalk,
            '2': npc.heal,
            '3': village.NpcList,
        };

        if (!commandHandler[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = npc.healWrongCommand(CMD1, userInfo);
            return socket.emit('print', result);
        }

        commandHandler[CMD1](CMD2, userInfo, userStatus);
    },

    enhanceController: async ({ line, userInfo, userStatus }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
        console.log('socketon battle');

        const commandHandler: CommandHandler = {
            '도움말': npc.enhanceHelp,
            '1': npc.enhanceTalk,
            '2': npc.enhance,
            '3': village.NpcList,
        };

        if (!commandHandler[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = npc.enhanceWrongCommand(CMD1, userInfo);
            return socket.emit('print', result);
        }

        commandHandler[CMD1](CMD2, userInfo, userStatus);
    },

    gambleController: async ({ line, userInfo }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
        console.log('socketon battle');

        const commandHandler: CommandHandler = {
            '도움말': npc.gambleHelp,
            '1': npc.gambleTalk,
            '2': npc.gamble,
            '3': village.NpcList,
        };

        if (!commandHandler[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = npc.gambleWrongCommand(CMD1, userInfo);
            return socket.emit('print', result);
        }

        commandHandler[CMD1](CMD2, userInfo);
    },

    pvpController: async ({ line, userInfo }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
        console.log('socketon pvp');

        const commandRouter: CommandHandler = {
            '도움말': npc.pvpHelp,
            '1': npc.pvpTalk,
            '2': pvpBattle.welcomeUsers,
            '3': village.NpcList,
        };

        if (!commandRouter[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = npc.pvpWrongCommand(CMD1, userInfo);
            return socket.emit('print', result);
        }

        const result = await commandRouter[CMD1](CMD2, userInfo);
        socket.emit('print', result);
    },
};
