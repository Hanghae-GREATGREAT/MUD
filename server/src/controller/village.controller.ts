import { socket } from '../socket.routes';
import { village, npc } from '../handler';
import { SocketInput, CommandHandler } from '../interfaces/socket';

export default {
    storyController: async ({ line, userInfo }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');

        const commandHandler: CommandHandler = {
            '도움말': npc.storyHelp,
            '1': npc.storyTalk,
            '2': npc.diary,
            '3': village.NpcList,
        };

        if (!commandHandler[CMD1]) {
            npc.storyWrongCommand(CMD1, userInfo);
            return;
        }

        const result = await commandHandler[CMD1](CMD2, userInfo);
        socket.emit('print', result);
    },

    healController: async ({ line, userInfo, userStatus }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');

        const commandHandler: CommandHandler = {
            '도움말': npc.healHelp,
            '1': npc.healTalk,
            '2': npc.heal,
            '3': village.NpcList,
        };

        if (!commandHandler[CMD1]) {
            npc.healWrongCommand(CMD1, userInfo);
            return;
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
            npc.enhanceWrongCommand(CMD1, userInfo);
            return;
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
            npc.gambleWrongCommand(CMD1, userInfo);
            return;
        }

        commandHandler[CMD1](CMD2, userInfo);
    },
};
