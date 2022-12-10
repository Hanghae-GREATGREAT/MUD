import { Socket } from 'socket.io';
import env from '../config.env';
import { fetchPost } from '../common';
import { SocketInput, CommandRouter } from '../interfaces/socket';
import { socketIds } from '../socket.routes';


const FRONT_URL = `http://${env.HOST}:${env.FRONT_PORT}`;

export default {
    noneController: (socket: Socket, { line, userInfo }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().toUpperCase().split(' ');

        if (!line || !userInfo || CMD1 !== 'LOAD') {
            const result = { field: 'none', script: 'ERROR', userInfo: {} };
            socket.emit('print', result);
            return;
        }
        const cmdRoute: CommandRouter = {
            LOAD: 'loadHome',
        };
        const URL = `${FRONT_URL}/front/${cmdRoute[CMD1]}`;
        fetchPost({ URL, socketId: socket.id, CMD: line, userInfo });
    },

    frontController: async (socket: Socket, { line, userInfo }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().toUpperCase().split(' ');

        console.log('frontController Activated');

        const cmdRoute: CommandRouter = {
            IN: 'signinUsername',
            UP: 'signupUsername',
            OUT: 'signout',
            D: 'toDungeon',
            DUNGEON: 'toDungeon',
            V: 'toVillage',
            VILLAGE: 'toVillage',
            DELETE: 'deleteAccount',
        };

        if (!cmdRoute[CMD1]) {
            const URL = `${FRONT_URL}/front/emptyCommand`;
            fetchPost({ URL, socketId: socket.id, CMD: CMD2, userInfo });
            return;
        }

        const URL = `${FRONT_URL}/front/${cmdRoute[CMD1]}`;
        fetchPost({ URL, socketId: socket.id, CMD: line, userInfo });

        socketIds.set(userInfo.userId, socket.id)
        console.log(`front socketId save : ${socketIds.get(userInfo.userId)}`)
    },

    signController: async (socket: Socket, { line, userInfo, option }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');

        const cmdRoute: CommandRouter = {
            '10': 'signupPassword',
            '11': 'createUser',
            '12': 'createCharacter',
            '20': 'signinPassword',
            '21': 'signinCheck',
            EMPTY: 'emptyCommand',
        };

        if (!CMD1 || !option) {
            const URL = `${FRONT_URL}/front/emptyCommand`;
            fetchPost({ URL, socketId: socket.id, CMD: CMD1, userInfo });
            return;
        }

        const URL = `${FRONT_URL}/front/${cmdRoute[option]}`;
        fetchPost({ URL, socketId: socket.id, CMD: CMD1, userInfo });
    },
};
