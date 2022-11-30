import { Request, Response, NextFunction } from 'express';
import BATTLE from '../redis';
import { DungeonService, UserService } from '../services';
import { dungeonScript, homeScript } from '../scripts'
import { HttpException, HttpStatus } from '../common';
import { PostBody } from '../interfaces/common';
import { battleCache } from '../db/cache';


export default {

    help: (req: Request, res: Response, next: NextFunction) => {
        const { socketId, CMD, userInfo }: PostBody = req.body;
        if (!userInfo) {
            const error = new HttpException('userInfo missing', HttpStatus.BAD_REQUEST);
            return next(error);
        }

        const script = dungeonScript.help;
        const field = 'dungeon';

        BATTLE.to(socketId).emit('print', { script, userInfo, field });

        res.status(200).end();
    },
    wrongCommand: (req: Request, res: Response, next: NextFunction) => {
        const { socketId, CMD, userInfo }: PostBody = req.body;
        if (!userInfo) {
            const error = new HttpException('userInfo missing', HttpStatus.BAD_REQUEST);
            return next(error);
        }

        const script = `Error : 
        입력값을 확인해주세요.
        현재 입력 : '${CMD}
        사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n\n`
        const field = 'dungeon';

        BATTLE.to(socketId).emit('print', { script, userInfo, field });

        res.status(200).end();
    },

    dungeonList: async(req: Request, res: Response, next: NextFunction) => {
        const { socketId, CMD, userInfo }: PostBody = req.body;
        if (!userInfo) {
            const error = new HttpException('userInfo missing', HttpStatus.BAD_REQUEST);
            return next(error);
        }

        const result = await UserService.checkUser(userInfo)
        if (result) {
            const script = homeScript.loadHome;
            const field = 'front'
            BATTLE.to(socketId).emit('print', { script, userInfo, field });
        }
        // 던전 목록 불러오기
        const dungeonList = DungeonService.getDungeonList();

        const script = `=======================================================================
        ${userInfo?.name}은(는) 깊은 심연으로 발걸음을 내딛습니다.\n\n
        ${dungeonList}`;
        const field = 'dungeon';
        
        // 채팅 재참가
        // if (!chatJoiner[socketid]) {
        //     // 채팅 참가
        //     const resultArray = chatService.enterChat(socketid);
        //     const enterIndex = resultArray[0];

        //     chatJoiner[`${socketid}`] = `${enterIndex}`;

        //     socket.join(`${enterIndex}`);
        //     socket.emit('reEnterChat');
        //     io.to(`${enterIndex}`).emit(
        //         'enterChat',
        //         userInfo.username,
        //         roomList.get(enterIndex)!.size,
        //         resultArray[1],
        //     );
        // }

        BATTLE.to(socketId).emit('print', { field, script, userInfo, chat: true });

        res.status(200).end();
    },
    dungeonInfo: (req: Request, res: Response, next: NextFunction) => {
        const { socketId, CMD, userInfo }: PostBody = req.body;
        if (!userInfo) {
            console.log('dungeonInfo userInfo Missing')
            const error = new HttpException('userInfo missing', HttpStatus.BAD_REQUEST);
            return next(error);
        }
        console.log('dungeon.controller.ts: dungeonInfo', socketId, CMD, userInfo);
        const line =
            '=======================================================================\n';
        let tempScript = '';
        let field = '';

        // 던전 정보 불러오기
        const dungeonInfo = DungeonService.getDungeonInfo(Number(CMD));
        if (!dungeonInfo) {
            tempScript += `입력값을 확인해주세요.\n`;
            tempScript += `현재 입력 : 입장 '${CMD}'\n`;
            tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;
            field = 'dungeon';
        } else {
            tempScript += dungeonInfo;
            tempScript += `1. [수동] 전투 진행\n`;
            tempScript += `2. [자동] 전투 진행\n`;
            tempScript += `3. [돌]아가기\n`;

            const dungeonLevel = +CMD!;
            const { characterId } = userInfo;
            battleCache.set(characterId, { dungeonLevel });
            field = 'battle';
        }
console.log('emit back', field)
        const script = line + tempScript;
        BATTLE.to(socketId).emit('print', { field, script, userInfo });

        res.status(200).end();
    },
}