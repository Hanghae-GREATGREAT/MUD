import { Socket } from 'socket.io';
import {
    LineInput,
    CommandRouter,
    BattleLoop,
    ReturnScript,
} from './interfaces/socket';
export const battleLoops: BattleLoop = {};
import redis from './db/redis/config';

import { chat, home } from './controller';


import dungeon from './dungeon/dungeonHandler';
import battle from './battle';

export let socket: Socket;
const onConnection = (server: Socket) => {
    console.log('SOCKET CONNECTED');
    socket = server;

    /************************************************************************
                                    홈                                      
     ************************************************************************/

    socket.on('none', home.noneController);

    socket.on('front', home.frontController);

    socket.on('sign', home.signController);


    /************************************************************************
                                    필드                                      
     ************************************************************************/

    server.on('dungeon', async ({ line, user }: LineInput) => {
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
            return server.emit('print', result);
        }
        const result = await commandRouter[CMD1](CMD2, user);
        if (result.chat) server.emit('enterChat', result.field);
        server.emit('print', result);
    });

    /************************************************************************
                                    전투                                      
     ************************************************************************/


    socket.on('battle', async ({ line, user }: LineInput) => {

        const [CMD1, CMD2]: string[] = line.trim().split(' ');
        console.log('socketon battle');

        const commandRouter: CommandRouter = {
            도움말: battle.help,
            수동: battle.encounter,
            자동: battle.auto,
            돌: dungeon.getDungeonList,
        };

        if (!commandRouter[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = battle.wrongCommand(CMD1, user);
            return server.emit('print', result);
        }

        const result = await commandRouter[CMD1](CMD2, user);
        socket.emit('print', result);
    });

    socket.on('encounter', async ({ line, user }: LineInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
        console.log('socketon enccounter');

        const commandRouter: CommandRouter = {
            load: battle.encounter,
            도움말: battle.ehelp,
            도망: battle.run,
        };

        const newScript: CommandRouter = {
            monster: battle.encounter,
            player: dungeon.getDungeonList,
        };

        let result;
        if (CMD1 === '공격') {
            const basicFight = setInterval(async () => {
                result = await battle.manualLogic(CMD2, user);
                socket.emit('printBattle', result);
                if (result.dead.match(/player|monster/)) {
                    clearInterval(battleLoops[user.characterId]);
                    result = await newScript[result.dead](CMD2, user)
                    socket.emit('print', result);
                }
            }, 1500);
            battleLoops[user.characterId] = basicFight;
        } else if (CMD1 === '스킬') {
            result = await battle.skill(CMD2, user);

            if (result.dead.match(/player|monster/)) {
                socket.emit('print', result);
                clearInterval(battleLoops[user.characterId]);
                result = await newScript[result.dead](CMD2, user);
            }
        } else if (!commandRouter[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            result = battle.ewrongCommand(CMD1, user);
        } else {
            result = await commandRouter[CMD1](CMD2, user);
        }
        socket.emit('print', result);
    });

    socket.on('fight', async ({ line, user }: LineInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
        console.log('socketon fight');

        const commandRouter: CommandRouter = {
            stop: battle.fhelp,
            스킬: battle.skill,
        };

        if (!commandRouter[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = battle.fwrongCommand(CMD1, user);
            return socket.emit('print', result);
        }

        const result = await commandRouter[CMD1](CMD2, user);
        socket.emit('print', result);

    });

    /************************************************************************
                                   모험 종료                                      
     ************************************************************************/

    socket.on('adventureResult', async ({ line, user }: LineInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');

        const commandRouter: CommandRouter = {
            확인: battle.fhelp,
            마을: battle.skill,
        };

        if (!commandRouter[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = battle.fwrongCommand(CMD1, user);
            return socket.emit('print', result);
        }

        const result = await commandRouter[CMD1](CMD2, user);
        socket.emit('print', result);
    });

    /************************************************************************
                                    채팅박스                                      
     ************************************************************************/

    socket.on('submit', chat.chatController);

    server.on('disconnect', () => {
        redis.del(server.id);
        console.log(server.id, 'SOCKET DISCONNECTED');
    });
};

export default onConnection;
