import { Socket } from 'socket.io';
// import CharacterService from '../character/character.service';
import { ChatInput, ChatOutput } from './interfaces/socket';
import { UserSession } from './interfaces/user';
import redis from './db/redis/config';


interface LineInput {
    line: string;
    user: UserSession;
}

interface returnScript {
    script: string;
    user: UserSession;
    field: string;
}

type commandHandler = (CMD: string, user: UserSession) => returnScript;

interface CommandRouter {
    [key: string]: commandHandler;
}

// RUNCommand(CMD) {
//     switch (CMD) {
//         case 'test':
//         case 'tutorial':
//     }
// }

import { questHandler } from './village/questHandler';
import { example1Handler } from './battle/example';
import { example2Handler } from './dungeon/example';

const onConnection = (socket: Socket) => {
    console.log('SOCKET CONNECTED');


    socket.on('village', ({ line, user }: LineInput)=>{
        const [ CMD1, CMD2 ]: string[] = line.trim().split(' ');
        console.log('village', CMD1, CMD2);

        // 예시
        const commandRouter: CommandRouter = {
            QUEST: questHandler,
            // STORE: storeHandler,
        };

        const result: returnScript = commandRouter[CMD1](CMD2, user)

        socket.emit('print', result)
    });

    socket.on('dungeon', ({ line, user }: LineInput)=>{
        const [ CMD1, CMD2 ]: string[] = line.trim().split(' ');
        console.log('dungeon', CMD1, CMD2);

        // 예시
        const commandRouter: CommandRouter = {
            COMMAND: example2Handler
            // STORE: storeHandler,
        };

        const result: returnScript = commandRouter[CMD1](CMD2, user)

        socket.emit('print', result)
    });

    socket.on('battle', ({ line, user }: LineInput)=>{
        const [ CMD1, CMD2 ]: string[] = line.trim().split(' ');
        console.log('battle', CMD1, CMD2);

        // 예시
        const commandRouter: CommandRouter = {
            COMMAND: example1Handler,
            // STORE: storeHandler,
        };

        const result: returnScript = commandRouter[CMD1](CMD2, user)

        socket.emit('print', result)
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