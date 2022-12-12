import { NextFunction, Request, Response } from 'express';
import { FRONT } from '../redis';
import { PostBody } from '../interfaces/common';
import { chatCache } from '../db/cache';

export default {
    submit: (req: Request, res: Response, next: NextFunction) => {
        const { socketId, option }: PostBody = req.body;

        const script = option;
        const joinedRoom = chatCache.getJoinedRoom(socketId);

        FRONT.to(joinedRoom).emit('chat', script);

        res.status(200).end();
    },

    pvpSubmit: (req: Request, res: Response, next: NextFunction) => {
        const { socketId, option }: PostBody = req.body;
        console.log(`시련의장 입장 socketId check : ${socketId}`)

        const script = option;
        const joinedRoom = chatCache.pvpGetJoinedRoom(socketId);

        FRONT.to(joinedRoom).emit('pvpChat', script);

        res.status(200).end();
    },

    pvpChatStart: (req: Request, res: Response, next: NextFunction) => {
        console.log('pvpChatStart')
        const { socketId, userInfo, option: pvpRoom }: PostBody = req.body;
        console.log(`메인서버 시련의장 네임스페이스에서 보낸 socketId : ${socketId}`, pvpRoom)

        const joinedRoom = chatCache.getJoinedRoom(socketId);
        const joinerScript = chatCache.leaveChat(socketId);
        if (joinerScript.length > 0) {
            FRONT.to(joinedRoom).emit('leaveChat', joinerScript);
        }
        FRONT.in(socketId).socketsLeave(joinedRoom)

        // 채팅방 참가
        const chatData: Array<number> = chatCache.pvpJoinChat(socketId, pvpRoom!);
        const joinerCntScript = `(${chatData[0]}/${chatData[1]})`;
        FRONT.in(socketId).socketsJoin(pvpRoom!);
        FRONT.to(pvpRoom!).emit('joinChat', userInfo!.name, joinerCntScript);


        res.status(200).end();
    },

    chatLeave: (req: Request, res: Response, next: NextFunction) => {
        const { socketId }: PostBody = req.body;

        const joinedRoom = chatCache.getJoinedRoom(socketId);
        const joinerScript = chatCache.leaveChat(socketId);
        if (joinerScript.length > 0) {
            FRONT.to(joinedRoom).emit('leaveChat', joinerScript);
        }
        FRONT.in(socketId).socketsLeave(joinedRoom)

        res.status(200).end();
    },

    pvpChatLeave: (req: Request, res: Response, next: NextFunction) => {
        const { socketId, userInfo }: PostBody = req.body;

        const joinedRoom = chatCache.pvpGetJoinedRoom(socketId);
        const joinerScript = chatCache.pvpLeaveChat(socketId);
        if (joinerScript.length > 0) {
            FRONT.to(joinedRoom).emit('leaveChat', joinerScript);
        }
        FRONT.in(socketId).socketsLeave(joinedRoom)

        if (!userInfo) {
            res.status(200).end();
            return;
        }

        // 채팅방 참가
        const chatData: Array<number> = chatCache.joinChat(socketId);
        const enteredRoom = chatData[0];
        const joinerCntScript = `(${chatData[1]}/${chatData[2]})`;
        FRONT.in(socketId).socketsJoin(`${enteredRoom}`);
        FRONT.to(`${enteredRoom}`).emit('joinChat', userInfo!.name, joinerCntScript);

        res.status(200).end();
    },
};
