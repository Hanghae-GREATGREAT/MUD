import { NextFunction, Request, Response } from 'express';
import { FRONT } from '../redis';
import { PostBody } from '../interfaces/common';
import { UserService, CharacterService } from '../services';
import { signinScript } from '../scripts';
import { chatCache } from '../db/cache';

export default {
    signinUsername: (req: Request, res: Response, next: NextFunction) => {
        const { socketId, userInfo }: PostBody = req.body;

        const script = signinScript.username;
        const field = 'sign:20';

        FRONT.to(socketId).emit('print', { field, script, userInfo });
        res.status(200).end();
    },

    signinPassword: (req: Request, res: Response, next: NextFunction) => {
        const { socketId, userInfo, CMD }: PostBody = req.body;

        userInfo!.username = CMD!;
        const script = signinScript.password;
        const field = 'sign:21';

        FRONT.to(socketId).emit('print', { field, script, userInfo });
        FRONT.to(socketId).emit('pwCoveringOn');

        res.status(200).end();
    },

    signinCheck: async (req: Request, res: Response, next: NextFunction) => {
        let { socketId, userInfo, CMD }: PostBody = req.body;

        if (!userInfo || !userInfo.username) {
            const error = new Error('signinCheck : Can not find userInfo');
            return next(error);
        }

        const username = userInfo.username;
        const password = CMD;
        const result = await UserService.signin({ username, password });

        if (!result) {
            const script = signinScript.incorrect;
            const field = 'front';
            FRONT.to(socketId).emit('print', { field, script, userInfo: {} });
            return;
        }

        const userId = result.userId;
        const character = await CharacterService.findOneByUserId(userId);

        if (!character) {
            throw new Error('signinCheck: cannot find character');
        }

        const userStatus = await CharacterService.getUserStatus(character.characterId);

        userInfo = {
            userId,
            username: userStatus!.username,
            characterId: userStatus!.characterId,
            name: userStatus!.name,
        };

        const script = signinScript.title;
        const field = 'front';

        // 채팅방 참가
        const chatData: Array<number> = chatCache.joinChat(socketId);
        const enteredRoom = chatData[0];
        const joinerCntScript = `(${chatData[1]}/${chatData[2]})`;
        FRONT.in(socketId).socketsJoin(`${enteredRoom}`);
        FRONT.to(`${enteredRoom}`).emit('joinChat', userInfo.name, joinerCntScript);

        FRONT.to(socketId).emit('printBattle', { field, script, userInfo, userStatus });
        FRONT.to(socketId).emit('pwCoveringOff');

        res.status(200).end();
    },
};
