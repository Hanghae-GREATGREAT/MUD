import { socket } from "../socket.routes";
import { dungeon, front } from "../handler";
import { LineInput, CommandRouter } from "../interfaces/socket";


// dungeon, village
export default {

    dungeonController: async ({ line, user }: LineInput) => {
        const [CMD1, CMD2]: string[] = line.trim().toUpperCase().split(' ');
        console.log('inputCommand : ', CMD1, CMD2);

        const commandRouter: CommandRouter = {
            LOAD: dungeon.getDungeonList,
            목록: dungeon.getDungeonList,
            도움말: dungeon.help,
            입장: dungeon.getDungeonInfo,
            OUT: front.signout,
        };
        if (!commandRouter[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = dungeon.wrongCommand(CMD1, user);
            return socket.emit('print', result);
        }
        const result = await commandRouter[CMD1](CMD2, user, socket.id);
        if (result.chat) socket.emit('enterChat', result.field);
        socket.emit('print', result);
    },

    villageController: async ({ line, user }: LineInput) => {
        const [CMD1, CMD2]: string[] = line.trim().toUpperCase().split(' ');
        console.log('inputCommand : ', CMD1, CMD2);

        const commandRouter: CommandRouter = {
            LOAD: dungeon.getDungeonList,
            목록: dungeon.getDungeonList,
            도움말: dungeon.help,
            입장: dungeon.getDungeonInfo,
        };
        if (!commandRouter[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = dungeon.wrongCommand(CMD1, user);
            return socket.emit('print', result);
        }
        
        const result = await commandRouter[CMD1](CMD2, user);
        if (result.chat) socket.emit('enterChat', result.field);
        socket.emit('print', result);
    },

}