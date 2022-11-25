import { Socket } from "socket.io";
import { front } from "../handler";
import { CommandHandler, SocketInput } from "../interfaces/socket";


export default {

    noneController: (socket: Socket, { line, userInfo }: SocketInput) => {
        const [ CMD1, CMD2 ]: string[] = line.trim().toUpperCase().split(' ');

        if (!line || !userInfo || CMD1 !== 'LOAD') {
            const result = { field: 'none', script: 'ERROR', userInfo: {} }
            socket.emit('print', result);
            return;
        }
        const commandHandler = {
            'LOAD': front.loadHome
        }
        commandHandler[CMD1](socket, userInfo);
    },

    frontController: async (socket: Socket, { line, userInfo }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().toUpperCase().split(' ');
        
        const commandHandler: CommandHandler = {
            'IN': front.signinUsername,
            'UP': front.signupUsername,
            'OUT': front.signout,
            'D': front.toDungeon,
            'DUNGEON': front.toDungeon,
            'V': front.toVillage,
            'VILLAGE': front.toVillage,
            'DELETE': front.deleteAccount,
            'EMPTY': front.emptyCommand,
        }
        if (!commandHandler[CMD1]) {
            commandHandler['EMPTY'](socket, line, userInfo);
            return;
        }

        commandHandler[CMD1](socket, CMD2, userInfo, socket.id);
    },

    signController: async (socket: Socket, { line, userInfo, option }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');

        const commandHandler: CommandHandler = {
            '10': front.signupPassword,
            '11': front.createUser,
            '12': front.createCharacter,
            '20': front.signinPassword,
            '21': front.signinCheck,
            'EMPTY': front.emptyCommand
        }
        if (!CMD1 || !option) {
            commandHandler['EMPTY'](socket, line, userInfo);
            return;
        }
    
        commandHandler[option](socket, CMD1, userInfo, socket.id);
    },


}
