import { CharacterService } from '../services'
import { Socket } from 'socket.io'
import { redis } from '../db/cache';
import { CommandHandler, SocketInput } from '../interfaces/socket';
import { front, global } from '../handler';


export default {

    globalController: (socket: Socket, { line, userInfo, option }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().toUpperCase().split(' ');
console.log(CMD1, CMD2, option);
        const commandHandler: CommandHandler = {
            'HOME': global.backToHome,
            'OUT': front.signout,
            'HELP': global.help,
            '도움말': global.help,
        }
        if (!commandHandler[CMD2] || CMD2.match(/HELP|도움말/)) {
            console.log('exception');
            commandHandler['HELP'](socket, line, userInfo, option);
            return;
        }

        commandHandler[CMD2](socket, CMD2, userInfo, socket.id);
    },

    requestStatus: async(characterId: number, callback: any) => {
        const userStatus = await CharacterService.getUserStatus(characterId);

        callback({
            status: 200,
            userStatus
        });
    },

    disconnect: (socket: Socket) => {
        redis.del(socket.id);
        // console.log(socket.id, 'SOCKET DISCONNECTED');
    }
}
