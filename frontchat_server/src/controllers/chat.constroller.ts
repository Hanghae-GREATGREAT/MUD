import { NextFunction, Request, Response } from 'express';
import { FRONT } from '../redis';
import { PostBody } from '../interfaces/common';
import { chatCache } from '../db/cache';

export default {
    submit: (req: Request, res: Response, next: NextFunction) => {
        const { socketId, option }: PostBody = req.body;

        const script = option;
        const joinedRoom: string = chatCache.getJoinedRoom(socketId);

        FRONT.to(joinedRoom).emit('chat', script);

        res.status(200).end();
    },

    chatLeave: (req: Request, res: Response, next: NextFunction) => {
        const { socketId }: PostBody = req.body;

        chatCache.leaveChat(socketId);

        res.status(200).end();
    },
};
