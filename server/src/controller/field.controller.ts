import { socket } from '../socket.routes';
import { dungeon, front, village } from '../handler';
import { SocketInput, CommandRouter, CommandHandler } from '../interfaces/socket';

// dungeon, village
export default {
    dungeonController: async ({ line, userInfo }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().toUpperCase().split(' ');
        console.log('inputCommand : ', CMD1, CMD2);

        const commandHandler: CommandHandler = {
            'LOAD': dungeon.getDungeonList,
            '목록': dungeon.getDungeonList,
            '도움말': dungeon.help,
            '입장': dungeon.getDungeonInfo,
            'OUT': front.signout
        }
        if (!commandHandler[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = dungeon.wrongCommand(CMD1, userInfo);
            return socket.emit('print', result);
        }
        commandHandler[CMD1](CMD2, userInfo, socket.id);
    },

    villageController: async ({ line, userInfo }: SocketInput) => {
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
            console.log(`is wrong command : '${CMD1}'`);
            const result = village.villageWrongCommand(CMD1, userInfo);
            return socket.emit('print', result);
        }

        commandHandler[CMD1](CMD2, userInfo, socket.id);
    },
};
