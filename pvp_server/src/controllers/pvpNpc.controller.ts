import { Request, Response, NextFunction } from 'express';
import PVP from '../redis';
import { pvpScript } from '../scripts';
import { HttpException, HttpStatus } from '../common';
import { PostBody } from '../interfaces/common';
import { pvpHandler } from '../handler';
import { pvpRoomList } from './pvp.controller';

export default {
    pvpTalk: (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('pvpTalk')
            const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;

            const script = pvpScript.pvpNpcTalk();
            const field = 'pvpNpc';

            PVP.to(socketId).emit('printBattle', { script, userInfo, field, userStatus });

            res.status(200).end();
        } catch (err) {
            next(err);
        }
    },

    pvpGo:async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('pvpGo')
            const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;

            let script: string = '';
            script += pvpScript.welcomePvp;

            const pvpRooms = pvpRoomList.values();
            for (const room of pvpRooms) script += `${room}, `

            if (pvpRoomList.size === 0) script += pvpScript.defaultList;

            script += pvpScript.pvpJoin;

            const field = 'pvpList';

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

            PVP.to(socketId).emit('print', { script, field, userInfo });

            res.status(200).end();
        } catch (err) {
            next(err);
        }
    },
};
