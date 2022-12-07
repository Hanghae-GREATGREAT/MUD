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

    chatLeave: (req: Request, res: Response, next: NextFunction) => {
        const { socketId }: PostBody = req.body;

        const joinedRoom = chatCache.getJoinedRoom(socketId);
        const joinerScript = chatCache.leaveChat(socketId);
        if (joinerScript.length > 0) {
            FRONT.to(joinedRoom).emit('leaveChat', joinerScript);
        }

        res.status(200).end();
    },
};
