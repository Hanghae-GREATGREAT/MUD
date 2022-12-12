import { Socket } from 'socket.io';
import env from '../config.env';
import { battle } from '../handler';
import { fetchPost } from '../common';
import { SocketInput, CommandHandler, CommandRouter } from '../interfaces/socket';

const BATTLE_URL = `${env.HTTP}://${env.WAS_LB}/battle`;

export default {
    battleController: async (socket: Socket, { line, userInfo, userStatus }: SocketInput) => {
        console.log('battle.controller.ts: battleController', userStatus.name);
        const [CMD1, CMD2] = line.trim().toUpperCase().split(' ');

        const cmdRoute: CommandRouter = {
            HELP: 'help',
            H: 'help',
            NORMAL: 'normal',
            N: 'normal',
            AUTO: 'autoW',
            A: 'autoW',
            AUTODEV: 'auto',
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
            HELP: 'ecthelp',
            H: 'ecthelp',
            ATTACK: 'attack',
            A: 'attack',
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
            HELP: 'autoHelp',
            H: 'autoHelp',
            STOP: 'autoQuit',
            S: 'autoQuit',
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
