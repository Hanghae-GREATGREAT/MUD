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

        let script: string = '';
        let field: string = '';

        if (!userInfo) {
            const error = new Error('signupPassword : Can not find userInfo');
            return next(error);
        }

        const username = CMD!;

        // 아이디 중복체크
        const isDup = await UserService.dupCheck(username);
        if (!isDup) {
            script = signupScript.password;
            field = 'sign:11';
        } else {
            script = signupScript.dupUser;
            field = 'sign:10';
        }

        // 아이디 유효성 검사
        const regExp = /^[a-z]+[a-z0-9]{3,15}$/gi;
        const idCheck = regExp.test(username);
        if (!idCheck) {
            script = signupScript.invalidID;
            field = 'sign:10';
        }

        userInfo.username = username;

        FRONT.to(socketId).emit('print', { field, script, userInfo });
        FRONT.to(socketId).emit('pwCoveringOn');
        res.status(200).end();
    },

    createUser: async (req: Request, res: Response, next: NextFunction) => {
        const { socketId, userInfo, CMD }: PostBody = req.body;

        let script: string = '';
        let field: string = '';

        if (!userInfo || !CMD) {
            const error = new Error('createUser : Can not find userInfo or CMD(password)');
            return next(error);
        }

        // 비밀번호 유효성검사
        const regExp = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{6,12}$/;
        const pwCheck = regExp.test(CMD);
        if (!pwCheck) {
            script = signupScript.invalidPW;
            field = 'sign:11';
        } else {
            script = signupScript.create;
            field = 'sign:12';
            const userCreated = await UserService.signup({ username: userInfo.username, password: CMD });
            userInfo.userId = userCreated.getDataValue('userId');
            FRONT.to(socketId).emit('pwCoveringOff');
        }

        FRONT.to(socketId).emit('print', { field, script, userInfo });
        res.status(200).end();
    },

    createCharacter: async (req: Request, res: Response, next: NextFunction) => {
        let { socketId, userInfo, CMD }: PostBody = req.body;

        let script: string = '';
        let field: string = '';

        if (!userInfo) {
            console.log('Signup Error: Cannot find userInfo');
            const error = new Error('createCharacter : Can not find userInfo');
            return next(error);
        }

        const name = CMD!;

        // 닉네임 유효성 검사
        const regExpEn = /^[a-z]{1}[a-z0-9]{3,15}$/;
        const regExpKo = /^[가-힣]{1}[가-힣0-9]{3,8}$/;
        if (!regExpEn.test(name) && !regExpKo.test(name)) {
            script = signupScript.invalidName;
            field = 'sign:12';
            FRONT.to(socketId).emit('print', { field, script, userInfo });
            return;
        }
        script = signupScript.title;
        field = 'front';
        const userId = userInfo.userId;
        const character = await CharacterService.createNewCharacter({ name, userId });

        const userStatus = await CharacterService.getUserStatus(character.characterId);

        userInfo = {
            userId,
            username: userStatus!.username,
            characterId: userStatus!.characterId,
            name: userStatus!.name,
        };
        
        // sesstion create
        redis.set(userInfo.userId, socketId, { EX: 60 * 60 * 24 });
        console.log(`login session create`);
        FRONT.to(socketId).emit('printBattle', { field, script, userInfo, userStatus });

        // 채팅방 참가
        const chatData: Array<number> = chatCache.joinChat(socketId);
        const enteredRoom = chatData[0];
        const joinerCntScript = `(${chatData[1]}/${chatData[2]})`;
        FRONT.in(socketId).socketsJoin(`${enteredRoom}`);
        FRONT.to(`${enteredRoom}`).emit('joinChat', userInfo.name, joinerCntScript);

        res.status(200).end();
    },
};
