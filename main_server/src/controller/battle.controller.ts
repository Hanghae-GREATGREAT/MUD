import { Socket } from 'socket.io';
import env from '../config.env';
import { battle } from '../handler';
import { fetchPost } from '../common';
import { SocketInput, CommandHandler, CommandRouter } from '../interfaces/socket';

const BATTLE_URL = `${env.HTTP}://${env.WAS_LB}/battle`;

export default {
    battleController: async (socket: Socket, { line, userInfo, userStatus }: SocketInput) => {
        //console.log('battle.controller.ts: battleController', userStatus.name);
        const [CMD1, CMD2] = line.trim().toUpperCase().split(' ');

        const cmdRoute: CommandRouter = {
            도움말: 'help',
            HELP: 'help',
            H: 'help',
            수동: 'normal',
            NORMAL: 'normal',
            N: 'normal',
            자동: 'autoW',
            AUTO: 'autoW',
            A: 'autoW',
            자동단일: 'auto',
            AUTODEV: 'auto',
            돌: 'dungeonInfo',
            BACK: 'dungeonInfo',
            B: 'dungeonInfo',
            // 'OUT': 'signout',
        };
        if (!cmdRoute[CMD1]) {
            const URL = `${BATTLE_URL}/dungeon/wrongCommand`;
            fetchPost({ URL, socketId: socket.id, CMD: line, userInfo });
            return;
        }
        const URL = `${BATTLE_URL}/battle/${cmdRoute[CMD1]}`;
        fetchPost({ URL, socketId: socket.id, CMD: CMD2, userInfo, userStatus });
    },

    encounterController: async (socket: Socket, { line, userInfo, userStatus }: SocketInput) => {
        const [CMD1, CMD2] = line.trim().toUpperCase().split(' ');

        const cmdRoute: CommandRouter = {
            도움말: 'ecthelp',
            HELP: 'ecthelp',
            H: 'ecthelp',
            공격: 'attack',
            ATTACK: 'attack',
            A: 'attack',
            도망: 'quit',
            RUN: 'quit',
            R: 'quit',
        };
        if (!cmdRoute[CMD1]) {
            const URL = `${BATTLE_URL}/dungeon/ectWrongCommand`;
            fetchPost({ URL, socketId: socket.id, CMD: line, userInfo });
            return;
        }
        const URL = `${BATTLE_URL}/battle/${cmdRoute[CMD1]}`;
        fetchPost({ URL, socketId: socket.id, CMD: CMD2, userInfo, userStatus });
    },

    actionController: async (socket: Socket, { line, userInfo, userStatus, option }: SocketInput) => {
        const [CMD1, CMD2] = line.trim().toUpperCase().split(' ');

        const URL = `${BATTLE_URL}/battle/action`;
        fetchPost({ URL, socketId: socket.id, CMD: CMD1, userInfo, userStatus });
    },

    autoBattleController: async (socket: Socket, { line, userInfo, userStatus }: SocketInput) => {
        const [CMD1, CMD2] = line.trim().toUpperCase().split(' ');

        const cmdRoute: CommandRouter = {
            도움말: 'autoHelp',
            HELP: 'autoHelp',
            H: 'autoHelp',
            중단: 'autoQuit',
            STOP: 'autoQuit',
            S: 'autoQuit',
            QUIT: 'autoQuit',
            Q: 'autoQuit',
        };
        if (!cmdRoute[CMD1]) {
            const URL = `${BATTLE_URL}/dungeon/wrongCommand`;
            fetchPost({ URL, socketId: socket.id, CMD: line, userInfo });
            return;
        }
        const URL = `${BATTLE_URL}/battle/${cmdRoute[CMD1]}`;
        fetchPost({ URL, socketId: socket.id, CMD: CMD1, userInfo, userStatus });
    },

    autoBattleSController: async (socket: Socket, { line, userInfo, userStatus }: SocketInput) => {
        const [CMD1, CMD2] = line.trim().toUpperCase().split(' ');

        const cmdRoute: CommandRouter = {
            HELP: 'autoHelpS',
            H: 'autoHelpS',
            STOP: 'autoQuitS',
            S: 'autoQuitS',
            중단: 'autoQuitS',
            QUIT: 'autoQuit',
            Q: 'autoQuit',
        };
        if (!cmdRoute[CMD1]) {
            const URL = `${BATTLE_URL}/dungeon/wrongCommand`;
            fetchPost({ URL, socketId: socket.id, CMD: line, userInfo });
            return;
        }
        const URL = `${BATTLE_URL}/battle/${cmdRoute[CMD1]}`;
        fetchPost({ URL, socketId: socket.id, CMD: CMD1, userInfo, userStatus });
    },

    // 미구현...
    resultController: async (socket: Socket, { line, userInfo }: SocketInput) => {
        const [CMD1, CMD2] = line.trim().toUpperCase().split(' ');

        const commandHandler: CommandHandler = {
            LOAD: battle.adventureload,
            확인: battle.getDetail,
            마을: battle.returnVillage,
        };

        if (!commandHandler[CMD1]) {
            battle.adventureWrongCommand(socket, CMD1, userInfo);
            return;
        }
        commandHandler[CMD1](socket, CMD2, userInfo);
    },
};
