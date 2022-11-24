import { socket } from "../socket.routes";
import { CommandHandler, SocketInput } from "../interfaces/socket";
import { front } from "../handler";


export default {
    noneController: ({ line, userInfo }: SocketInput) => {
        const [ CMD1, CMD2 ]: string[] = line.trim().toUpperCase().split(' ');
    
        if (!line || !userInfo || CMD1 !== 'LOAD') {
            const result = { field: 'none', script: 'ERROR', userInfo: {} }
            socket.emit('print', result);
            return;
        }
        const commandHandler = {
            'LOAD': front.loadHome
        }
        commandHandler[CMD1](userInfo);
    },

    frontController: async ({ line, userInfo }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().toUpperCase().split(' ');
        console.log('front', CMD1, CMD2);
    
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
            commandHandler['EMPTY'](line, userInfo);
            return;
        }

        commandHandler[CMD1](CMD2, userInfo);
    },

    signController: async ({ line, userInfo, option }: SocketInput) => {
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
            commandHandler['EMPTY'](line, userInfo);
            return;
        }
    
        commandHandler[option](CMD1, userInfo, socket.id);
    }

}
