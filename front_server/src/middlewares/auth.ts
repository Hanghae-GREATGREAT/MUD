import { Request, Response, NextFunction } from 'express';
import { redis } from '../db/cache';
import { frontController } from '../controllers';
import { UserInfo, UserStatus } from '../interfaces/user';
import env from '../env';

/**
 *
 * 공통 미들웨어
 * 비로그인 > locals.user = null > 홈 리다이렉션
 * 로그인 > locals.user = sessionData > next
 *
 */
interface PostBody {
    socketId: string;
    CMD?: string;
    userInfo?: UserInfo;
    userStatus?: UserStatus;
    option?: string;
}

export default {
    loginValidation: async (req: Request, res: Response, next: NextFunction) => {
        try {
            //console.log('session authmiddleware validation');
            const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;
            const sessionData = await redis.get(userInfo?.characterId!);
            //console.log(sessionData);
            if (!sessionData) {
                req.app.locals.user = null;
                frontController.loadHome(req, res, next);
                return;
            }
            req.app.locals.user = { userInfo };
            next();
        } catch (err) {
            next(err);
        }
    },
    loginUserValidation: async (req: Request, res: Response, next: NextFunction) => {
        try {
            //console.log('session login user validation');
            const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;
            const sessionData = await redis.get(userInfo?.characterId!);
            //console.log(sessionData);
            if (sessionData) {
                frontController.emptyCommand(req, res, next);
                return;
            }
            next();
        } catch (err) {
            next(err);
        }
    },
};
