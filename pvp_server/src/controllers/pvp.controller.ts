import { Request, Response, NextFunction } from 'express';
import PVP from '../redis';
import { pvpScript } from '../scripts';
import { HttpException } from '../common';
import { PostBody } from '../interfaces/common';
import { pvpHandler } from '../handler'
import pvpService, { isEnd } from '../services/pvp.service';
import pvpUsers from '../workers/pvpUsers';
import fetchPost from '../common/fetch';
import env from '../env';
// import test from '../workers/test';

export const FRONT_URL = `${env.HTTP}://${env.WAS_LB}/front`;

export const maxUsers: number = 6;

export default {
    createRoom: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { socketId, CMD, userInfo, userStatus, option }: PostBody = req.body;

            if (!userInfo) new HttpException('userInfo missing', 400);
            if (!userStatus) new HttpException('userStatus missing', 400);
            
            const roomName = `pvp_${CMD}`;

            // 방 생성 시 중복된 이름 또는 입력하지 않았는지 체크
            const validation = await pvpService.createRoomValidation(req, res, next, roomName)
            if (validation === 'wrongCommand') return next();

            // rooms 갱신 및 수정된 유저정보 갱신 후 새로운 userStatus를 return 받아온다.
            const newUserStatus = await pvpService.createRoom({ socketId, CMD, userInfo, userStatus, option });

            const script = pvpScript.pvpRoomJoin(userInfo!.name);
            const field = 'pvpJoin';

            PVP.in(socketId).socketsJoin(roomName);

            PVP.to(roomName).emit('fieldScriptPrint', { script, field });
            PVP.to(socketId).emit('printBattle', { field, userInfo, userStatus: newUserStatus });

            // Global Chat leave, PVP Chat Join
            const URL = `${FRONT_URL}/chat/pvpChatStart`
            fetchPost({ URL, socketId: option!, userInfo, option: roomName });

            res.status(200).end();
        } catch (err) {
            next(err);
        }
    },

    joinRoom: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { socketId, CMD, userInfo, userStatus, option }: PostBody = req.body;

            if (!userInfo) new HttpException('userInfo missing', 400);
            if (!userStatus) new HttpException('userStatus missing', 400);

            const roomName = `pvp_${CMD}`;

            // 방 입장 시 존재하는 방인지 체크
            const validation = await pvpService.joinRoomValidation(req, res, next, roomName)
            if (validation === 'wrongCommand') return next();

            // rooms 갱신 및 수정된 유저정보 갱신 후 새로운 userStatus를 return 받아온다.
            const newUserStatus = await pvpService.joinRoom({ socketId, CMD, userInfo, userStatus, option })
            if (newUserStatus === undefined) return next();

            // 전투 시작 요건이 되는지 체크한다.
            const startValidation = await pvpService.startValidation(req, res, next, newUserStatus)
            if (startValidation === undefined) return next();

            const script = pvpScript.pvpRoomJoin(userInfo!.name);
            const field = 'pvpJoin';


            PVP.to(roomName).emit('fieldScriptPrint', { script, field });
            PVP.to(socketId).emit('printBattle', { field, userInfo, userStatus: newUserStatus });

            const URL = `${FRONT_URL}/chat/pvpChatStart`
            fetchPost({ URL, socketId: option!, userInfo, option: roomName });

            res.status(200).end();
        } catch (err) {
            next(err);
        }
    },

    getUsers:async (req: Request, res: Response, next: NextFunction) => {
        try {
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
            const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;

            if (!userInfo) new HttpException('userInfo missing', 400);
            if (!userStatus) new HttpException('userStatus missing', 400);

            await pvpService.leaveRoom(userStatus)
            userStatus!.pvpRoom = undefined;

            const script = pvpScript.village;
            const field = 'village';

            PVP.to(socketId).emit('printBattle', { script, userInfo, field, userStatus });
            PVP.in(socketId).socketsLeave(userStatus.pvpRoom!);

            const URL = `${FRONT_URL}/chat/pvpChatLeave`
            fetchPost({ URL, socketId: userStatus.frontId!, userInfo });

            res.status(200).end();
        } catch (err) {
            next(err);
        }
    },

    pvpDisconnect:async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { socketId, option }: PostBody = req.body;

            if (!option) return next();

            const [ name, roomName ] = option.split(',');
            await pvpService.pvpDisconnect(name, roomName, socketId)

            res.status(200).end();
        } catch (err) {
            next(err)
        }
    },

    pvpStart:async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;

            if (!userInfo) new HttpException('userInfo missing', 400);
            if (!userStatus) new HttpException('userStatus missing', 400);

            // worker threads 할당
            await pvpUsers.start(userStatus)

            res.status(200).end();
        } catch (err) {
            next(err);
        }
    },

    pvpBattle: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;
            const { pvpRoom } = userStatus;

            if (!userInfo) new HttpException('userInfo missing', 400);
            if (!userStatus) new HttpException('userStatus missing', 400);

            const battleValidation = pvpService.battleValidation({ socketId, CMD, userInfo, userStatus });
            if (battleValidation === undefined) return next();

            const targetValidation = await pvpService.targetValidation({ socketId, CMD, userInfo, userStatus });
            if (targetValidation === undefined) return next();

            const battleStart = await pvpService.battleStart({ socketId, CMD, userInfo, userStatus });
            if (battleStart === undefined) return next();

            const script = battleStart;
            const field = 'pvpBattle';

            PVP.to(pvpRoom!).emit('fieldScriptPrint', { script, field });

            await pvpService.pvpResultValidation({ socketId, CMD, userInfo, userStatus });

            res.status(200).end();
        } catch (err) {
            next(err);
        }
    },

    battleUsers: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;

            const script = await pvpService.pvpStart(userStatus, '');
            const field = `pvpBattle`;

            PVP.to(socketId).emit('printBattle', { script, userInfo, field, userStatus });

            res.status(200).end();
        } catch (err) {
            next(err);
        }
    },

    wrongCommand: (req: Request, res: Response, next: NextFunction) => {
        try {
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
