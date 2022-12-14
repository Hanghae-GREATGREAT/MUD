import { NextFunction, Request, Response } from 'express';
import { FRONT } from '../redis';
import { PostBody } from '../interfaces/common';
import { UserService, CharacterService } from '../services';
import { signinScript, signupScript } from '../scripts';
import { redis, redisChat } from '../db/cache';

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

            FRONT.to(socketId).emit('pwCoveringOff');
            FRONT.to(socketId).emit('print', { field, script, userInfo });
            return;
        }

        const userId = result.userId;
        const character = await CharacterService.findOneByUserId(userId);

        if (!character) {
            const script = signupScript.create;
            const field = 'sign:12';
            const userCreated = await UserService.signin({ username, password });
            userInfo.userId = userCreated!.getDataValue('userId');
            FRONT.to(socketId).emit('pwCoveringOff');
            FRONT.to(socketId).emit('print', { field, script, userInfo });
            return res.status(200).end();
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
        const [chatId, chatSize, chatLimit] = await redisChat.joinChat(socketId)
        const chatJoinScript = `(${chatSize}/${chatLimit})`;
        console.log(socketId, userInfo, chatId, chatJoinScript);
        FRONT.in(socketId).socketsJoin(`${chatId}`);
        FRONT.to(`${chatId}`).emit('joinChat', userInfo?.name, chatJoinScript);

        FRONT.to(socketId).emit('printBattle', { field, script, userInfo, userStatus });
        FRONT.to(socketId).emit('pwCoveringOff');

        // sesstion create
        // console.log(`login session create`);
        redis.set(userInfo.characterId, socketId, { EX : 60*60*24 })

        res.status(200).end();
    },
};
