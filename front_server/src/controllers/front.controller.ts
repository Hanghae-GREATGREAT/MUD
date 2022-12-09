import { NextFunction, Request, Response } from 'express';
import { FRONT } from '../redis';
import { chatCache, redis } from '../db/cache';
import { CharacterService, UserService } from '../services';
import { homeScript, placeScript } from '../scripts';
import { PostBody } from '../interfaces/common';

export default {
    loadHome: (req: Request, res: Response, next: NextFunction) => {
        const { socketId, userInfo }: PostBody = req.body;

        console.log('loadHome activated!');
        console.log(`socket: ${socketId}`);

        const script = homeScript.loadHome;
        const field = 'front';

        FRONT.to(socketId).emit('print', { field, script, userInfo });

        res.status(200).end();
    },

    checkUser: async (req: Request, res: Response, next: NextFunction) => {
        const { socketId, userInfo }: PostBody = req.body;

        if (!userInfo) {
            const error = new Error('checkUser : Can not find userInfo');
            return next(error);
        }

        const { userId, characterId, name } = userInfo;
        const character = await CharacterService.findOneByUserId(userId);

        // userSession으로 들어온 정보와 일치하는 캐릭터가 없을 때
        return !character || character.characterId !== characterId || character.name !== name;
    },

    signout: (req: Request, res: Response, next: NextFunction) => {
        const { socketId, userInfo }: PostBody = req.body;

        if (!userInfo) {
            const error = new Error('signout : Can not find userInfo');
            return next(error);
        }

        // 채팅방 나가기
        chatCache.leaveChat(socketId);

        // 유저 세션 삭제
        // redis.del(userInfo.userId)

        const script = homeScript.signout;
        const field = 'front';

        FRONT.to(socketId).emit('leaveChat');
        FRONT.to(socketId).emit('print', { field, script, userInfo });

        setTimeout(() => {
            const script = homeScript.reload;
            FRONT.to(socketId).emit('print', { field, script, userInfo });
        }, 2000);
    },

    toVillage: (req: Request, res: Response, next: NextFunction) => {
        const { socketId, userInfo }: PostBody = req.body;

        if (!userInfo) {
            const error = new Error('toVillage : Can not find userInfo');
            return next(error);
        }

        const script = placeScript.village;
        const field = 'village';

        FRONT.to(socketId).emit('print', { field, script, userInfo });
    },

    toDungeon: (req: Request, res: Response, next: NextFunction) => {
        const { socketId, userInfo }: PostBody = req.body;

        if (!userInfo) {
            const error = new Error('toDungeon : Can not find userInfo');
            return next(error);
        }

        const script = placeScript.dungeon;
        const field = 'dungeon';

        FRONT.to(socketId).emit('print', { field, script, userInfo });
    },

    emptyCommand: (req: Request, res: Response, next: NextFunction) => {
        const { socketId, userInfo }: PostBody = req.body;

        const script = homeScript.wrongCommand;
        const field = 'front';

        FRONT.to(socketId).emit('print', { field, script, userInfo });
    },

    deleteAccount: async (req: Request, res: Response, next: NextFunction) => {
        const { socketId, userInfo }: PostBody = req.body;

        if (!userInfo) {
            const error = new Error('deleteAccount : Can not find userInfo');
            return next(error);
        }

        const { userId, characterId } = userInfo;
        const result = await UserService.deleteUser(userId, characterId);

        const script = result === 1 ? homeScript.delete + homeScript.loadHome : homeScript.deleteFail;
        const field = 'front';

        FRONT.to(socketId).emit('print', { field, script, userInfo });
    },
};
