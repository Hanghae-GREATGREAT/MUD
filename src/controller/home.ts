import { socket } from "../socket.routes";
import { LineInput, CommandRouter } from "../interfaces/socket";
import { front } from "../handler";


export default {
    noneController: ({ line, user }: LineInput) => {
        const [ CMD1, CMD2 ]: string[] = line.trim().toUpperCase().split(' ');
    
        const commandRouter: CommandRouter = {
            'LOAD': front.loadHome
        }
        const result = commandRouter[CMD1](CMD2, user);
        socket.to(socket.id).emit('print', result);
        socket.to(socket.id).emit('enterChat', 'none');
    },
    
    frontController: async ({ line, user }: LineInput) => {
        const [CMD1, CMD2]: string[] = line.trim().toUpperCase().split(' ');
        console.log('front', CMD1, CMD2);
    
        const commandRouter: CommandRouter = {
            IN: front.signinUsername,
            UP: front.signupUsername,
            OUT: front.signout,
            D: front.toDungeon,
            DUNGEON: front.toDungeon,
            V: front.toVillage,
            VILLAGE: front.toVillage,
            DELETE: front.deleteAccount,
            EMPTY: front.emptyCommand,
        };
        if (!commandRouter[CMD1]) {
            const result = commandRouter['EMPTY'](line, user);
            return socket.to(socket.id).emit('print', result);
        }
    
        const result = await commandRouter[CMD1](CMD2, user, socket.id);
        if (result.chat) socket.to(socket.id).emit('enterChat', result.field);
        if (result.field === 'signout') {
            socket.to(socket.id).emit('signout', result);
        } else {
            socket.to(socket.id).emit('print', result);
        }
    },
    
    
    signController: async ({ line, user, option }: LineInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
    
        const commandRouter: CommandRouter = {
            10: front.signupPassword,
            11: front.createUser,
            12: front.createCharacter,
            20: front.signinPassword,
            21: front.signinCheck,
            EMPTY: front.emptyCommand,
        };
        if (!CMD1 || !option) {
            const result = commandRouter['EMPTY'](line, user);
            return socket.to(socket.id).emit('print', result);
        }
    
        const result = await commandRouter[option](CMD1, user, socket.id);
        if (result.chat) socket.to(socket.id).emit('enterChat', result.field);
        socket.to(socket.id).emit('print', result);
    }

}
