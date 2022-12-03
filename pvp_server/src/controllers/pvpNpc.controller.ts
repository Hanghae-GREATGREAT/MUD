import { Request, Response, NextFunction } from 'express';
import PVP from '../redis';
import { PvpService } from '../services';
import { pvpScript } from '../scripts';
import { HttpException, HttpStatus } from '../common';
import { PostBody } from '../interfaces/common';
import { pvpHandler } from '../handler';
import { pvpController } from '.';
import { rooms } from '../services/pvp.service';
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

    pvpGo: (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('pvpGo')
            const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;

            let script: string = '';
            script += pvpScript.welcomePvp;

            pvpRoomList.map(list => script += `${list}, `)

            if (pvpRoomList.length === 0) script += pvpScript.defaultList;

            script += pvpScript.pvpJoin;

            const field = 'pvpList';

            PVP.to(socketId).emit('printBattle', { script, userInfo, field, userStatus });

            res.status(200).end();
        } catch (err) {
            next(err);
        }
    },
};
