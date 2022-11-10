import { Socket } from 'socket.io';
import { LineInput, CommandRouter, ReturnScript, ChatInput, ChatOutput } from './interfaces/socket';
import redis from './db/redis/config';


import front from './front';


const onConnection = (socket: Socket) => {
    console.log('SOCKET CONNECTED');

    socket.on('none', ({ line, user }: LineInput) => {
        const [ CMD1, CMD2 ]: string[] = line.trim().toUpperCase().split(' ');
        console.log(line, user);

        const commandRouter: CommandRouter = {
            'LOAD': front.loadHome
        }
        const result = commandRouter[CMD1](CMD2, user);

        socket.emit('print', result);
    });

    socket.on('front', async({ line, user }: LineInput) => {
        const [ CMD1, CMD2 ]: string[] = line.trim().toUpperCase().split(' ');
        console.log('front', CMD1, CMD2);

        // 예시
        const commandRouter: CommandRouter = {
            'IN': front.test,
            'UP': front.signupUsername,
            'OUT': front.signout,
            'EMPTY': front.emptyCommand,
            // STORE: storeHandler,
        };
        if (!commandRouter[CMD1]) {  
            const result = await commandRouter['EMPTY'](line, user)
            return socket.emit('print', result);
        }

        const result = await commandRouter[CMD1](CMD2, user)

        if (result.field === 'signout') {
            socket.emit('signout', result);
        } else {
            socket.emit('print', result);
        }
        
    });

    socket.on('signup', async({ line, user, option }: LineInput) => {
        const [ CMD1, CMD2 ]: string[] = line.trim().split(' ');
        console.log(line, user);

        const commandRouter: CommandRouter = {
            10: front.signupPassword,
            11: front.createUser,
            12: front.createCharacter,
            'EMPTY': front.emptyCommand,
        }
        if (!CMD1 || !option) {  
            const result = commandRouter['EMPTY'](line, user)
            return socket.emit('print', result);
        }

        const result = await commandRouter[option](CMD1, user, socket.id);
        socket.emit('print', result);
    });


    // socket.on('info', ({ name }: UserSession)=>{
    //     CharacterService.findOneByName(name).then((character)=>{
    //         if (character === null) throw new Error();

    //         const script = `${character.Field.name} 채팅방에 입장하였습니다.\n`
    //         socket.emit('print', { script });
    //     });
    //     redis.set(socket.id, name, { EX: 60*5 });
    // });

    // socket.on('submit', ({ name, message }: ChatInput) => {
    //     console.log(message);
    //     redis.set(socket.id, name, { EX: 60*5 });
        
    //     const script = `${name}: ${message}\n`
    //     socket.broadcast.emit('print', { script });
    //     socket.emit('print', { script });
    // });

    socket.on('disconnect', () => {
        redis.del(socket.id);
        console.log(socket.id, 'SOCKET DISCONNECTED');
    });
}


export default onConnection;