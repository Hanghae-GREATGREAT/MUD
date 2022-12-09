import { NextFunction, request, Request, Response } from 'express';
import { FRONT } from '../redis';
import { PostBody } from '../interfaces/common';
import { CharacterService, UserService } from '../services';
import { signupScript } from '../scripts';
import { UserInfo } from '../interfaces/user';
import { chatCache, redis } from '../db/cache';

export default {
    signupUsername: (req: Request, res: Response, next: NextFunction) => {
        const { socketId, userInfo }: PostBody = req.body;

        const script = signupScript.username;
        const field = 'sign:10';

        FRONT.to(socketId).emit('print', { field, script, userInfo });
        res.status(200).end();
    },

    signupPassword: async (req: Request, res: Response, next: NextFunction) => {
        const { socketId, userInfo, CMD }: PostBody = req.body;

        if (!userInfo) {
            const error = new Error('signupPassword : Can not find userInfo');
            return next(error);
        }

        const username = CMD!;
        const result = await UserService.dupCheck(username);

        userInfo.username = username;
        const script = !result ? signupScript.password : signupScript.dupUser;
        const field = !result ? 'sign:11' : 'sign:10';

        FRONT.to(socketId).emit('print', { field, script, userInfo });
        res.status(200).end();
    },

    createUser: async (req: Request, res: Response, next: NextFunction) => {
        const { socketId, userInfo, CMD }: PostBody = req.body;

        if (!userInfo) {
            const error = new Error('createUser : Can not find userInfo');
            return next(error);
        }

        const userCreated = await UserService.signup({ username: userInfo.username, password: CMD });

        userInfo.userId = userCreated.getDataValue('userId');
        const script = signupScript.create;
        const field = 'sign:12';

        FRONT.to(socketId).emit('print', { field, script, userInfo });
        res.status(200).end();
    },

    createCharacter: async (req: Request, res: Response, next: NextFunction) => {
        let { socketId, userInfo, CMD }: PostBody = req.body;

        if (!userInfo) {
            const error = new Error('createCharacter : Can not find userInfo');
            return next(error);
        }

        const name = CMD!;
        const userId = userInfo.userId;
        const character = await CharacterService.createNewCharacter({ name, userId });

        // const userSession = {
        //     userId,
        //     characterId: character?.characterId,
        // }
        // const data = JSON.stringify(userSession);
        // await redis.set(id, data, { EX: 60*5 });

        const userStatus = await CharacterService.getUserStatus(character.characterId);

        userInfo = {
            userId,
            username: userStatus!.username,
            characterId: userStatus!.characterId,
            name: userStatus!.name,
        };

        const script = signupScript.title;
        const field = 'front';

        // 채팅방 참가
        const chatData: Array<number> = chatCache.joinChat(socketId);
        const enteredRoom = chatData[0];
        const joinerCntScript = `(${chatData[1]}/${chatData[2]})`;
        FRONT.in(socketId).socketsJoin(`${enteredRoom}`);
        FRONT.to(`${enteredRoom}`).emit('joinChat', userInfo.name, joinerCntScript);

        FRONT.to(socketId).emit('printBattle', { field, script, userInfo, userStatus });

        // sesstion create
        redis.set(userInfo.userId, socketId, { EX : 60*60*24 })
        console.log(`login session create`)

        res.status(200).end();
    },
};
