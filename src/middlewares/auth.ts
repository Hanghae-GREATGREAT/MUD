import { Request, Response, NextFunction } from 'express';
import redis from '../db/redis/config';
import { HttpException, HttpStatus } from '../common';



/**
 * 
 * 공통 미들웨어
 * 비로그인 > locals.user = null > 홈 리다이렉션
 * 로그인 > locals.user = sessionData > next
 * 
 */

export default {
    authMiddleware: async(req: Request, res: Response, next: NextFunction)=>{
        const ip = req.socket.remoteAddress;
        if (!ip) {
            throw new HttpException('잘못된 접근입니다', HttpStatus.BAD_REQUEST);
        }
console.log(ip);
        const sessionData = await redis.get(ip);
        if (!sessionData) {
            req.app.locals.user = null;
            return res.redirect('/');
        }
        req.app.locals.user = JSON.parse(sessionData);
        next();
    }
}