import { Request, Response, NextFunction } from 'express';
import { fetchPost } from '../common';
import env from '../config.env';
import { redis } from '../db/cache';
import { UserInfo, UserStatus } from '../interfaces/user';

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

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        //console.log('session authmiddleware validation')
        const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;
        const sessionData = await redis.get(userInfo?.userId!);
        //console.log(sessionData);
        if (!sessionData) {
            req.app.locals.user = null;
            const URL = `http://${env.HOST}:${env.FRONT_PORT}/front/loadHome`;
            fetchPost({ URL, socketId, CMD, userInfo });
            return;
        }
        req.app.locals.user = { userInfo };
        next();
    } catch (err) {
        next(err);
    }
};
