import { Socket } from 'socket.io';
import { dungeon, front, village } from '../handler';
import { SocketInput, CommandHandler } from '../interfaces/socket';

// dungeon, village
export default {
    dungeonController: async (socket: Socket, { line, userInfo }: SocketInput) => {
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
            dungeon.wrongCommand(socket, CMD1, userInfo);
            return;
        }
        commandHandler[CMD1](socket, CMD2, userInfo, socket.id);
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
            'OUT': front.signout
        }
        if (!commandHandler[CMD1]) {
            village.villageWrongCommand(socket, CMD1, userInfo);
            return;
        }

        commandHandler[CMD1](socket, CMD2, userInfo, socket.id);
    },
};
