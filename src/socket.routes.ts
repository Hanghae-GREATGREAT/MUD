import { Socket } from 'socket.io';
import { LineInput, CommandRouter, ReturnScript, ChatInput, ChatOutput } from './interfaces/socket';
import redis from './db/redis/config';


import front from './front';

import dungeon from './dungeon/dungeonHandler';
import battle from './battle'

const onConnection = (socket: Socket) => {
    console.log('SOCKET CONNECTED');

    socket.on('none', ({ line, user }: LineInput) => {
        const [ CMD1, CMD2 ]: string[] = line.trim().toUpperCase().split(' ');

        const commandRouter: CommandRouter = {
            'LOAD': front.loadHome
        }
        const result = commandRouter[CMD1](CMD2, user);
        socket.emit('print', result);
    });

    socket.on('front', async({ line, user }: LineInput) => {
        const [ CMD1, CMD2 ]: string[] = line.trim().toUpperCase().split(' ');
        console.log('front', CMD1, CMD2);

        const commandRouter: CommandRouter = {
            'IN': front.test,
            'UP': front.signupUsername,
            'OUT': front.signout,
            'EMPTY': front.emptyCommand,
        }
        const result = await commandRouter[CMD1](CMD2, user);

        if (result.field === 'signout') {
            socket.emit('signout', result);
        } else {
            socket.emit('print', result);
        }
    });

    socket.on('dungeon', ({ line, user }: LineInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
        console.log('inputCommand : ', CMD1, CMD2);

        const commandRouter: CommandRouter = {
            도움말: dungeon.help,
            목록: dungeon.getDungeonList,
            입장: dungeon.getDungeonInfo,
        };
        if (!commandRouter[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = dungeon.wrongCommand(CMD1, user);
            return socket.emit('print', result);
        }
        
        const result = commandRouter[CMD1](CMD2, user);
        socket.emit('print', result);
    });


    socket.on('signup', async({ line, user, option }: LineInput) => {
        const [ CMD1, CMD2 ]: string[] = line.trim().split(' ');

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
        if (!commandRouter[CMD1]) {  
            const result = await commandRouter['EMPTY'](line, user)
            return socket.emit('print', result);
        }
        

        const result = await commandRouter[option](CMD1, user, socket.id);
        socket.emit('print', result);
    });

    socket.on('battle', ({ line, user }: LineInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
        console.log('inputCommand : ', CMD1, CMD2);

        const commandRouter: CommandRouter = {
            도움말: battle.help,
            수동: battle.fight,
            자동: battle.auto,
            돌: dungeon.getDungeonList,
        };

        if (!commandRouter[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = battle.wrongCommand(CMD1, user);
            return socket.emit('print', result);
        }

        const result = commandRouter[CMD1](CMD2, user);
        socket.emit('print', result);
    });

    socket.on('fight', ({ line, user }: LineInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
        console.log('inputCommand : ', CMD1, CMD2);

        const commandRouter: CommandRouter = {
            도움말: battle.help,
        };

        if (!commandRouter[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = battle.wrongCommand(CMD1, user);
            return socket.emit('print', result);
        }

        const result = commandRouter[CMD1](CMD2, user);

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
};

export default onConnection;
