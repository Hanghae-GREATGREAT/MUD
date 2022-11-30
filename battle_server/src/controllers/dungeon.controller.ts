import { Request, Response, NextFunction } from 'express';
import BATTLE from '../redis';
import { HttpException } from '../common';
import { dungeonHandler } from '../handlers';
import { PostBody } from '../interfaces/common';
import { dungeonScript } from '../scripts'


export default {

    help: (req: Request, res: Response, next: NextFunction) => {
        const { socketId, userInfo }: PostBody = req.body;
        if (!userInfo) {
            const error = new HttpException('MISSING PARAMS', 400);
            return next(error);
        }

        const script = dungeonScript.help;
        const field = 'dungeon';

        BATTLE.to(socketId).emit('print', { script, userInfo, field });

        res.status(200).end();
    },
    wrongCommand: (req: Request, res: Response, next: NextFunction) => {
        const { socketId, CMD, userInfo }: PostBody = req.body;
        if (!userInfo || !CMD) {
            const error = new HttpException('MISSING PARAMS', 400);
            return next(error);
        }

        const script = dungeonScript.wrong(CMD);
        const field = 'dungeon';

        BATTLE.to(socketId).emit('print', { script, userInfo, field });

        res.status(200).end();
    },

    dungeonList: async(req: Request, res: Response, next: NextFunction) => {
        const { socketId, userInfo }: PostBody = req.body;
        if (!userInfo) {
            const error = new HttpException('MISSING PARAMS', 400);
            return next(error);
        }

        dungeonHandler.dungeonList(socketId, userInfo).then(() => {
            res.status(200).end();
        }).catch(error => next(error));
    },
    dungeonInfo: (req: Request, res: Response, next: NextFunction) => {
        const { socketId, CMD, userInfo }: PostBody = req.body;
        if (!userInfo || !CMD) {
            const error = new HttpException('MISSING PARAMS', 400);
            return next(error);
        }

        dungeonHandler.dungeonInfo(socketId, CMD, userInfo);

        res.status(200).end();
    },
}