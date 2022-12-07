import { Request, Response, NextFunction } from 'express';
import PVP from '../redis';
import { pvpScript } from '../scripts';
import { HttpException } from '../common';
import { PostBody } from '../interfaces/common';
import { pvpHandler } from '../handler'
import pvpService from '../services/pvp.service';
import redis from '../db/cache/redis';

export const maxUsers: number = 4;
export const pvpRoomList: Set<string> = new Set<string>();
export default {
    createRoom: async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('createRoom');
            const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;
            const roomName = `pvpRoom ${CMD}`;

            if (!userInfo) new HttpException('userInfo missing', 400);
            if (!userStatus) new HttpException('userStatus missing', 400);

            // 방 생성 시 중복된 이름 또는 입력하지 않았는지 체크
            const validation = await pvpService.createRoomValidation(req, res, next, roomName)
            if (validation === 'wrongCommand') return;

            // rooms 갱신 및 수정된 유저정보 갱신 후 새로운 userStatus를 return 받아온다.
            const newUserStatus = await pvpService.createRoom({ socketId, CMD, userInfo, userStatus });

            const script = pvpScript.pvpRoomJoin(userInfo!.name);
            const field = 'pvpJoin';

            PVP.in(socketId).socketsJoin(roomName);

            PVP.to(roomName).emit('fieldScriptPrint', { script, field });
            PVP.to(socketId).emit('printBattle', { field, userInfo, userStatus: newUserStatus });

            res.status(200).end();
        } catch (err) {
            next(err);
        }
    },

    joinRoom: async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('joinRoom');
            const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;
            const roomName = `pvpRoom ${CMD}`;

            if (!userInfo) new HttpException('userInfo missing', 400);
            if (!userStatus) new HttpException('userStatus missing', 400);

            const validation = await pvpService.joinRoomValidation(req, res, next, roomName)
            if (validation === 'wrongCommand') return;

            const newUserStatus = await pvpService.joinRoom({ socketId, CMD, userInfo, userStatus })

            const startValidation = await pvpService.startValidation(req, res, next, roomName)
            if (startValidation === undefined) return;

            const script = pvpScript.pvpRoomJoin(userInfo!.name);
            const field = 'pvpJoin';


            PVP.to(roomName).emit('fieldScriptPrint', { script, field });
            PVP.to(socketId).emit('printBattle', { field, userInfo, userStatus: newUserStatus });

            res.status(200).end();
        } catch (err) {
            next(err);
        }
    },

    getUsers:async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('getUsers')
            const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;

            if (!userInfo) new HttpException('userInfo missing', 400);
            if (!userStatus) new HttpException('userStatus missing', 400);

            const getUsers = await pvpService.getUsers(userStatus!.pvpRoom!);

            const script = `현재 인원은 ${getUsers}명 입니다.\n`
            const field = 'pvpJoin';

            PVP.to(socketId).emit('printBattle', { script, userInfo, field, userStatus });

            res.status(200).end();
        } catch (err) {
            next(err);
        }},

    leaveRoom:async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('leaveRoom')
            const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;

            if (!userInfo) new HttpException('userInfo missing', 400);
            if (!userStatus) new HttpException('userStatus missing', 400);

            await pvpService.leaveRoom(userStatus)

            const script = pvpScript.village;
            const field = 'village';

            PVP.to(socketId).socketsLeave(userStatus.pvpRoom!);
            PVP.to(socketId).emit('printBattle', { script, userInfo, field, userStatus });

            res.status(200).end();
        } catch (err) {
            next(err);
        }},

    pvpDisconnect:async (req: Request, res: Response, next: NextFunction) => {
        const { socketId, option }: PostBody = req.body;
        if (!option) return;
        const [ name, roomName ] = option.split(',');
        await redis.hDel(roomName, name);

        res.status(200).end();
    },

    pvpStart:async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('pvpStart')
            const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;

            if (!userInfo) new HttpException('userInfo missing', 400);
            if (!userStatus) new HttpException('userStatus missing', 400);

            const roomName = userStatus.pvpRoom;

            const script = await pvpService.pvpStart(userStatus);
            const field = 'pvpBattle';

            PVP.to(roomName!).emit('fieldScriptPrint', { script, field });

            await pvpService.getSkills(userStatus)

            res.status(200).end();
        } catch (err) {
            next(err);
        }
    },

    pvpBattle: async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('pvpbattle')
            const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;
            const [ CMD1, CMD2 ] = CMD.trim().split(' ');
            const roomName = userStatus.pvpRoom;

            if (!userInfo) new HttpException('userInfo missing', 400);
            if (!userStatus) new HttpException('userStatus missing', 400);

            const battleValidation = pvpService.battleValidation({ socketId, CMD, userInfo, userStatus });
            if (battleValidation === undefined) return;

            const targetValidation = await pvpService.targetValidation({ socketId, CMD, userInfo, userStatus });
            if (targetValidation === undefined) return;

            const battleStart = await pvpService.battleStart({ socketId, CMD, userInfo, userStatus });
            if (battleStart === undefined) return;

            const script = battleStart;
            const field = 'pvpBattle';

            PVP.to(roomName!).emit('fieldScriptPrint', { script, field });

            await pvpService.pvpResultValidation({ socketId, CMD, userInfo, userStatus });

            res.status(200).end();
        } catch (err) {
            next(err);
        }
    },

    battleUsers: async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('battleUsers')
            const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;

            const script = await pvpService.pvpStart(userStatus);
            const field = `pvpBattle`;

            PVP.to(socketId).emit('printBattle', { script, userInfo, field, userStatus });

            res.status(200).end();
        } catch (err) {
            next(err);
        }
    },

    wrongCommand: (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('pvpWrongCommand')
            const { socketId, CMD, userInfo, userStatus, option }: PostBody = req.body;

            const script = pvpScript.wrongCommand(CMD);
            const field = `${option}`;

            PVP.to(socketId).emit('printBattle', { script, userInfo, field, userStatus });

            res.status(200).end();
        } catch (err) {
            next(err);
        }
    },

    help: (req: Request, res: Response, next: NextFunction) => {
        try {
            const { socketId, CMD, userInfo, userStatus, option }: PostBody = req.body;
            console.log(`${option}`)

            if (!userInfo) new HttpException('userInfo missing', 400);
            if (!userStatus) new HttpException('userStatus missing', 400);

            const script = pvpHandler.pvpHelp(option!)
            const field = `${option}`;

            PVP.to(socketId).emit('printBattle', { script, userInfo, field, userStatus });

            res.status(200).end();
        } catch (err) {
            next(err);
        }
    },
};
