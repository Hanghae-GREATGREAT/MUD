import { Socket } from 'socket.io';
import env from '../config.env';
import { village } from '../handler';
import { fetchPost } from '../common';
import { SocketInput, CommandRouter } from '../interfaces/socket';


const PVP_URL = `http://${env.HOST}:${env.PVP_PORT}`

export default {

    // pvp룸 생성 및 입장
    pvpListController: async (socket: Socket, { line, userInfo, userStatus }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
        
        if (CMD1 === '새' || CMD1 === '새로고침') {
            const URL = `${PVP_URL}/pvpNpc/pvpGo`;
            fetchPost({ URL, socketId: socket.id, CMD: CMD1, userInfo, userStatus });
            return;
        }
        if (CMD1 === '돌'|| CMD1 === '돌아가기') return village.NpcList(socket, CMD2, userInfo);
        if (CMD1 === '도움말') {
            const URL = `${PVP_URL}/pvp/help`
            fetchPost({ URL, socketId: socket.id, CMD: CMD1, userInfo, option: 'pvpList' })
            return;
        }

        const cmdRoute: CommandRouter = {
            '1': 'createRoom',
            '2': 'joinRoom'
        };

        if (!cmdRoute[CMD1]) {
            const URL = `${PVP_URL}/pvp/wrongCommand`
            fetchPost({ URL, socketId: socket.id, CMD: CMD2, userInfo, userStatus, option: 'pvpList' })
            return;
        }
        const URL = `${PVP_URL}/pvp/${cmdRoute[CMD1]}`;
        socket.data.pvpUser = `${userStatus.name},pvpRoom ${CMD2}`
        fetchPost({ URL, socketId: socket.id, CMD: CMD2, userInfo, userStatus })
    },

    // pvp룸 입장 후 6명이 되기까지 기다리는중
    pvpJoinController: async (socket: Socket, { line, userInfo, userStatus }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');

        if (CMD1 === '도움말') {
            const URL = `${PVP_URL}/pvp/help`
            fetchPost({ URL, socketId: socket.id, CMD: CMD1, userInfo, option: 'pvpBattle' })
            return;
        }

        const cmdRoute: CommandRouter = {
            '현': 'getUsers',
            '돌': 'leaveRoom'
        };

        if (!cmdRoute[CMD1]) {
            const URL = `${PVP_URL}/pvp/wrongCommand`
            fetchPost({ URL, socketId: socket.id, CMD: CMD2, userInfo, userStatus, option: 'pvpBattle' })
            return;
        }
        const URL = `${PVP_URL}/pvp/${cmdRoute[CMD1]}`
        fetchPost({ URL, socketId: socket.id, CMD: CMD2, userInfo, userStatus });
    },

    pvpBattleController: async (socket: Socket, { line, userInfo, userStatus }: SocketInput) => {
        const CMD = line.trim();

        if (CMD === '도움말') {
            const URL = `${PVP_URL}/pvp/help`
            fetchPost({ URL, socketId: socket.id, CMD, userInfo, option: 'pvpBattle' })
            return;
        }

        if (CMD === '상' || CMD === '상태창') {
            const URL = `${PVP_URL}/pvp/users`
            fetchPost({ URL, socketId: socket.id, CMD, userInfo, userStatus })
            return;
        }

        if (!CMD) {
            const URL = `${PVP_URL}/pvp/wrongCommand`
            fetchPost({ URL, socketId: socket.id, CMD, userInfo, userStatus, option: 'pvpBattle' })
            return;
        }
        const URL = `${PVP_URL}/pvp/pvpBattle`
        fetchPost({ URL, socketId: socket.id, CMD, userInfo, userStatus });
    },

    pvpResultController: async (socket: Socket, { line, userInfo, userStatus }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');

        if (CMD1 === '도움말') {
            const URL = `${PVP_URL}/pvp/help`
            fetchPost({ URL, socketId: socket.id, CMD: CMD1, userInfo, option: 'pvpResult' })
            return;
        }

        const URL = `${PVP_URL}/pvp/pvpResult`
        fetchPost({ URL, socketId: socket.id, CMD: line, userInfo, userStatus });
    },
}