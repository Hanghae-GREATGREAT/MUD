import { NextFunction, Request, Response } from 'express';
import { FRONT } from '../redis';
import { PostBody } from '../interfaces/common';
import { chatCache, redisChat } from '../db/cache';

export default {
    submit: (req: Request, res: Response, next: NextFunction) => {
        const { socketId, option }: PostBody = req.body;

        const script = option;
        // const joinedRoom = chatCache.getJoinedRoom(socketId);
        redisChat.findChatJoiner(socketId).then((joinedRoom) => {
            FRONT.to(`${joinedRoom}`).emit('chat', script);

            res.status(200).end();
        });
    },

    pvpSubmit: (req: Request, res: Response, next: NextFunction) => {
        const { socketId, option }: PostBody = req.body;
        console.log(`시련의장 입장 socketId check : ${socketId}`)

        const script = option;
        // const joinedRoom = chatCache.pvpGetJoinedRoom(socketId);
        redisChat.findPvpJoiner(socketId).then((joinedRoom) => {
            if (!joinedRoom) return res.status(500).end();

            FRONT.to(joinedRoom).emit('pvpChat', script);    
            res.status(200).end();
        });

    },

    pvpChatStart: (req: Request, res: Response, next: NextFunction) => {
        console.log('pvpChatStart')
        const { socketId, userInfo, option: pvpRoom }: PostBody = req.body;
        console.log(`메인서버 시련의장 네임스페이스에서 보낸 socketId : ${socketId}`, pvpRoom);
        if (!pvpRoom || !userInfo) return res.status(500).end();

        // const joinedRoom = chatCache.getJoinedRoom(socketId);
        // const joinerScript = chatCache.leaveChat(socketId);
        redisChat.findChatJoiner(socketId).then(async(joinedRoom) => {
            const script = await redisChat.leaveChat(socketId);

            if (script.length > 0) {
                FRONT.to(`${joinedRoom}`).emit('leaveChat', script);
            }
            FRONT.in(socketId).socketsLeave(`${joinedRoom}`);

            // 채팅방 참가
            redisChat.joinPvp(socketId, pvpRoom).then(([chatSize, chatLimit]) => {
                const script = `(${chatSize}/${chatLimit})`;
                FRONT.in(socketId).socketsJoin(pvpRoom);
                FRONT.to(pvpRoom).emit('joinChat', userInfo.name, script);
            })
    
            res.status(200).end();
        });

    },

    chatLeave: (req: Request, res: Response, next: NextFunction) => {
        const { socketId }: PostBody = req.body;

        // const joinedRoom = chatCache.getJoinedRoom(socketId);
        redisChat.findChatJoiner(socketId).then(async(joinedRoom) => {
            const script = await redisChat.leaveChat(socketId);

            if (script.length > 0) {
                FRONT.to(`${joinedRoom}`).emit('leaveChat', script);
            }
            FRONT.in(socketId).socketsLeave(`${joinedRoom}`);
        });
    },

    pvpChatLeave: (req: Request, res: Response, next: NextFunction) => {
        const { socketId, userInfo }: PostBody = req.body;
        if (!userInfo) return res.status(400).end();

        // const joinedRoom = chatCache.pvpGetJoinedRoom(socketId);
        redisChat.findPvpJoiner(socketId).then(async(joinedRoom) => {
            if (!joinedRoom) return res.status(500).end();
            const script = await redisChat.leavePvp(socketId);

            if (script.length > 0) {
                FRONT.to(joinedRoom).emit('leaveChat', script);
            }
            FRONT.in(socketId).socketsLeave(`${joinedRoom}`);
            
            // 채팅방 참가
            redisChat.joinChat(socketId).then(([chatId, chatSize, chatLimit]) => {
                const script = `(${chatSize}/${chatLimit})`;
                FRONT.in(socketId).socketsJoin(`${chatId}`);
                FRONT.to(`${chatId}`).emit('joinChat', userInfo.name, script);
    
                res.status(200).end();
            });
        });

    },
};
