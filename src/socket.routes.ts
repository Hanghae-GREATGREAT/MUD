import { Socket } from 'socket.io';
// import CharacterService from '../character/character.service';
import { ChatInput, ChatOutput } from './interfaces/socket';
import { UserSession } from './interfaces/user';
import redis from './db/redis/config';

interface LineInput {
    line: string;
    user: UserSession;
}

interface ReturnScript {
    script: string;
    user: UserSession;
    field: string;
}

type commandHandler = (
    CMD: string,
    user: UserSession,
    ...args: any[]
) => ReturnScript | Promise<ReturnScript>;

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
import dungeon from './dungeon/dungeonHandler';
import battle from './battle/battle.Handler';

const onConnection = (socket: Socket) => {
    console.log('SOCKET CONNECTED');

    socket.on('village', ({ line, user }: LineInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
        console.log('village', CMD1, CMD2);

        // 예시
        const commandRouter: CommandRouter = {
            QUEST: questHandler,
            // STORE: storeHandler,
        };

        const result = commandRouter[CMD1](CMD2, user);

        socket.emit('print', result);
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
