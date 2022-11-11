import { Socket } from 'socket.io';
import {
    LineInput,
    CommandRouter,
    ReturnScript,
    ChatInput,
    ChatOutput,
    BattleLoop,
} from './interfaces/socket';
const battleLoops: BattleLoop = {};
import redis from './db/redis/config';

import front from './front';

import dungeon from './dungeon/dungeonHandler';
import battle from './battle';

const onConnection = (socket: Socket) => {
    console.log('SOCKET CONNECTED');

    /************************************************************************
                                    홈                                      
     ************************************************************************/
    socket.on('none', ({ line, user }: LineInput) => {
        const [CMD1, CMD2]: string[] = line.trim().toUpperCase().split(' ');

        const commandRouter: CommandRouter = {
            LOAD: front.loadHome,
        };
        const result = commandRouter[CMD1](CMD2, user);
        socket.emit('print', result);
        socket.emit('enterChat', 'none');
    });

    socket.on('front', async ({ line, user }: LineInput) => {
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
            EMPTY: front.emptyCommand,
        };
        if (!commandRouter[CMD1]) {
            const result = commandRouter['EMPTY'](line, user);
            return socket.emit('print', result);
        }

        const result = await commandRouter[CMD1](CMD2, user, socket.id);
        if (result.chat) socket.emit('enterChat', result.field);
        if (result.field === 'signout') {
            socket.emit('signout', result);
        } else {
            socket.emit('print', result);
        }
    });

    socket.on('sign', async ({ line, user, option }: LineInput) => {
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
            return socket.emit('print', result);
        }

        const result = await commandRouter[option](CMD1, user, socket.id);
        if (result.chat) socket.emit('enterChat', result.field);
        socket.emit('print', result);
    });

    socket.on('signup', async ({ line, user, option }: LineInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');

        const commandRouter: CommandRouter = {
            10: front.signupPassword,
            11: front.createUser,
            12: front.createCharacter,
            EMPTY: front.emptyCommand,
        };
        if (!CMD1 || !option) {
            const result = commandRouter['EMPTY'](line, user);
            return socket.emit('print', result);
        }
        // if (!commandRouter[CMD1]) {
        //     const result = await commandRouter['EMPTY'](line, user)
        //     return socket.emit('print', result);
        // }

        const result = await commandRouter[option](CMD1, user, socket.id);
        socket.emit('print', result);
    });

    /************************************************************************
                                    필드                                      
     ************************************************************************/

    socket.on('dungeon', async ({ line, user }: LineInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
        console.log('inputCommand : ', CMD1, CMD2);

        const commandRouter: CommandRouter = {
            load: dungeon.getDungeonList,
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
            return socket.emit('print', result);
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
            공격: battle.manualLogic,
            도망: battle.run,
        };

        console.log(`encounter CMD : ${CMD1}`);
        console.log('공격 T/F : ', commandRouter[CMD1] === battle.manualLogic);
        console.log('도망 T/F : ', commandRouter[CMD1] === battle.run);

        let result;
        if (commandRouter[CMD1] === battle.manualLogic) {
            result = await battle.manualLogic(CMD2, user);
            if (result.field === 'encounter') {
                console.log('next field : encounter');
                clearInterval(battleLoops[user.characterId]);
                result = await battle.encounter(CMD2, user);
            }
            if (result.field === 'dungeon') {
                console.log('next field : dungeon');
                clearInterval(battleLoops[user.characterId]);
                result = dungeon.getDungeonList(CMD2, user);
            }

            socket.emit('print', result);
            const basicFight = setInterval(async () => {}, 2000);

            battleLoops[user.characterId] = basicFight;
            socket.emit('print', result);
        } else if (!commandRouter[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = battle.ewrongCommand(CMD1, user);
            return socket.emit('print', result);
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
            스킬1: battle.ehelp,
            스킬2: battle.ehelp,
            스킬3: battle.ehelp,
            스킬4: battle.ehelp,
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

    // socket.on('info', ({ name }: UserSession)=>{
    //     CharacterService.findOneByName(name).then((character)=>{
    //         if (character === null) throw new Error();

    //         const script = `${character.Field.name} 채팅방에 입장하였습니다.\n`
    //         socket.emit('print', { script });
    //     });
    //     redis.set(socket.id, name, { EX: 60*5 });
    // });

    socket.on('submit', ({ name, message, field }: ChatInput) => {
        redis.set(socket.id, name, { EX: 60 * 5 });

        const script = `${name}: ${message}\n`;
        socket.broadcast.emit('chat', { script, field });
        socket.emit('chat', { script, field });
    });

    socket.on('disconnect', () => {
        redis.del(socket.id);
        console.log(socket.id, 'SOCKET DISCONNECTED');
    });
};

export default onConnection;
