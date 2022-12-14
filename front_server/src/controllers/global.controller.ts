import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../common';
import { redisChat } from '../db/cache';
import { PostBody } from '../interfaces/common';
import { FRONT } from '../redis';
import { globalScript } from '../scripts';


export default {

    toHome: (req: Request, res: Response, next: NextFunction) => {
        const { socketId, userInfo }: PostBody = req.body;
        if (!userInfo) {
            const error = new HttpException('MISSING PARAMS', 400);
            return next(error);
        }

        const script = globalScript.title;
        const field = 'front';

        FRONT.to(socketId).emit('print', { field, script, userInfo });

        res.status(200).end();
    },

    help: (req: Request, res: Response, next: NextFunction) => {
        const { socketId, userInfo, option }: PostBody = req.body;
        if (!userInfo) {
            const error = new HttpException('MISSING PARAMS', 400);
            return next(error);
        }

        const script = globalScript.help;
        const field = option;

        FRONT.to(socketId).emit('print', { field, script, userInfo });

        res.status(200).end();
    },

    disconnect: (req: Request, res: Response, next: NextFunction) => {
        const { socketId }: PostBody = req.body;

        redisChat.leaveChat(socketId);

        res.status(200).end();
    },
}