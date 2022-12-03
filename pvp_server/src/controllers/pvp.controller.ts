import { Request, Response, NextFunction } from 'express';
import PVP from '../redis';
import { PvpService } from '../services';
import { pvpScript } from '../scripts';
import { HttpException, HttpStatus } from '../common';
import { PostBody } from '../interfaces/common';
import { pvpHandler } from '../handler'
import { pvpController } from '.'
import pvpService, { rooms } from '../services/pvp.service';
import { Arranging, pvpResult } from '../interfaces/pvp';

export const maxUsers: number = 4;
export const pvpRoomList: string[] = [];
export default {
    createRoom: (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('createRoom');
            const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;

            if (!userInfo) new HttpException('userInfo missing', 400);
            if (!userStatus) new HttpException('userStatus missing', 400);

            if (CMD === undefined) {
                const request = { body: { socketId, CMD: '방이름을 입력해주세요.', userInfo, userStatus, option: 'pvpList'}};
                return pvpController.wrongCommand(request as Request, res, next)
            }

            const roomName: string = `pvpRoom ${CMD}`;
            userStatus!.pvpRoom = roomName;

            const existRoom = PvpService.existRoom(CMD!);
            if (existRoom === 'Exist Room') {
                const request = { body: { socketId, CMD: '이미 존재하는 방 입니다.', userInfo, userStatus, option: 'pvpList' }};
                return pvpController.wrongCommand(request as Request, res, next)
            }

            const rooms = PvpService.createRoom(CMD!)
            rooms.get(roomName)!.set(userInfo!.username, { socketId, userStatus })            

            const script = pvpScript.pvpRoomJoin(userInfo!.name);
            const field = 'pvpBattle';

            pvpRoomList.push(roomName.split(' ').pop()!)

            PVP.in(socketId).socketsJoin(roomName);

            PVP.to(socketId).emit('printBattle', { userInfo, userStatus });
            PVP.to(roomName).emit('fieldScriptPrint', { script, field });

            console.log(rooms)

            res.status(200).end();
        } catch (err) {
            next(err);
        }
    },

    joinRoom: (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('joinRoom');
            const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;

            if (!userInfo) new HttpException('userInfo missing', 400);
            if (!userStatus) new HttpException('userStatus missing', 400);

            if (!CMD) {
                const request = { body: { socketId, CMD: '방이름을 입력해주세요.', userInfo, userStatus, option: 'pvpList'}};
                return pvpController.wrongCommand(request as Request, res, next)
            }
            const roomName: string = `pvpRoom ${CMD}`;
            userStatus!.pvpRoom = roomName;

            const existRoom = PvpService.existRoom(CMD!);
            if (!existRoom) {
                const request = { body: { socketId, CMD: '존재하지 않는 방이름 입니다.', userInfo, userStatus, option: 'pvpList' }};
                return pvpController.wrongCommand(request as Request, res, next)
            }

            const pvpRoom = rooms.get(roomName)!.set(userInfo!.username, { socketId, userStatus })            

            const script = pvpScript.pvpRoomJoin(userInfo!.name);
            const field = 'pvpBattle';

            PVP.in(socketId).socketsJoin(roomName);

            PVP.to(socketId).emit('printBattle', { userInfo, userStatus });

            console.log(rooms)

            if (pvpRoom.size === maxUsers) {
                const request = { body: { socketId, userInfo, userStatus } };
                return pvpController.pvpStart(request as Request, res, next)
            } else if (pvpRoom.size > maxUsers) {
                pvpRoom!.get(userInfo!.name)!.target = 'none';
                pvpRoom!.get(userInfo!.name)!.selectSkill = 'none';
                return PVP.to(socketId).emit('printBattle', { script, field, userInfo, userStatus });
            }

            PVP.to(roomName).emit('fieldScriptPrint', { script, field });

            res.status(200).end();
        } catch (err) {
            next(err);
        }
    },

    getUsers: (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('getUsers')
            const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;

            if (!userInfo) new HttpException('userInfo missing', 400);
            if (!userStatus) new HttpException('userStatus missing', 400);

            console.log(userStatus)

            const roomName = userStatus!.pvpRoom

            const script = pvpScript.getUsers(roomName!);
            const field = 'pvpBattle';

            PVP.to(socketId).emit('printBattle', { script, userInfo, field, userStatus });

            res.status(200).end();
        } catch (err) {
            next(err);
        }},

    leaveRoom: (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('leaveRoom')
            const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;

            if (!userInfo) new HttpException('userInfo missing', 400);
            if (!userStatus) new HttpException('userStatus missing', 400);

            const roomName = userStatus!.pvpRoom

            const script = pvpScript.village(userStatus!.name);
            const field = 'village';

            rooms.get(roomName!)!.delete(userInfo!.username);
            userStatus!.pvpRoom = undefined;
            if (rooms.get(roomName!)!.size === 0) {
                pvpService.destroyRoom(roomName!);
            } 
            console.log(rooms.get(roomName!));

            PVP.socketsLeave(roomName!);
            PVP.to(socketId).emit('printBattle', { script, userInfo, field, userStatus });

            res.status(200).end();
        } catch (err) {
            next(err);
        }},

    pvpStart: async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('pvpStart')
            const { socketId, userInfo, userStatus }: PostBody = req.body;

            if (!userInfo) new HttpException('userInfo missing', 400);
            if (!userStatus) new HttpException('userStatus missing', 400);

            const roomName: string = userStatus!.pvpRoom!;

            const script = await pvpService.pvpStart(roomName);
            const field = 'enemyChoice';

            PVP.to(roomName).emit('fieldScriptPrint', { script, field });

            res.status(200).end();
        } catch (err) {
            next(err);
        }
    },

    target: async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('target')
            const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;

            if (!userInfo) new HttpException('userInfo missing', 400);
            if (!userStatus) new HttpException('userStatus missing', 400);

            const targets: string[] = [];
            const roomName = userStatus!.pvpRoom;

            const targetValidation: string|undefined = await pvpService.targetValidation(req, res, next);
            if (targetValidation === undefined) return;

            const pvpRoom = rooms.get(roomName!)
            const iterator = pvpRoom!.values()
            for (let i = 0; i < maxUsers; i++) {
                targets.push(iterator.next().value.target)
            }

            // undefined인 값 제거
            const users = targets.filter(names => names !== undefined)

            // 공격할 유저 모두 선택시 다음 로직으로 보내준다.
            if(users.length === maxUsers) {
                const request = { body: { socketId, userInfo, userStatus } };
                return pvpController.restultTarget(request as Request, res, next)
            }

            const script = pvpScript.target;
            const field = 'enemyChoice';

            PVP.to(socketId).emit('printBattle', { script, userInfo, field, userStatus });

            res.status(200).end();
        } catch (err) {
            next(err);
        }
    },

    targetWrong: (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('targetWrong')
            const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;

            const script = pvpScript.targetWrong;
            const field = 'enemyChoice';

            PVP.to(socketId).emit('printBattle', { script, userInfo, field, userStatus });

            res.status(200).end();
        } catch (err) {
            next(err);
        }
    },

    // 추후 service에서 script와 names를 array로 return받아 구조분해 할당 후 PVP.to(socketId)
    restultTarget: (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('restultTarget')
            const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;

            if (!userInfo) new HttpException('userInfo missing', 400);
            if (!userStatus) new HttpException('userStatus missing', 400);

            const roomName = userStatus!.pvpRoom;
            const users: string[] = []
            const targets: string[] = []
            const pvpRoom = rooms.get(roomName!)
            const user = [...pvpRoom!]
    
            for (let i = 0; i < maxUsers; i++) {
                users.push(user[i][1].userStatus!.name)
                targets.push(user[i][1].target!)
            }
    
            let tempScript: string = '';
            const tempLine =
                '=======================================================================\n\n';
    
            tempScript += '샤크스 경 :\n';
    
            // 선택한 유저목록을 보여준다.
            for (let i = 0; i < maxUsers; i++){
                if (targets[i] === 'none' || targets[i] === 'dead') continue;
                tempScript += `${users[i]}가 ${targets[i]}를 지목 했다네 !\n`;
            }
    
            // 사망하지 않은 유저에게만 스킬 목록출력
            const isDead = pvpRoom!.get(userInfo!.username)!.selectSkill
            // if (isDead !== 'none' || isDead !== 'dead') {
                tempScript += '\n 어떤 공격을 할텐가 ?\n';
                tempScript += '\n 중간 공백을 포함해서 입력해주게 !\n';
    
                tempScript += `1 기본공격\n`;
    
                let skillScript: string = '';
    
                // 유저별로 선택할 수 있는 목록을 보여준다.
                for (let y=0; y < maxUsers; y++){
                    for (let i = 0; i < user[y][1].userStatus!.skill.length; i++) {
                        if (isDead === 'none' || isDead === 'dead') {
                            tempScript = `관전 중에는 입력하지 못합니다.\n`;
                            continue;
                        } 
                        let skills = user[y][1].userStatus!.skill[i]
                            skillScript += `${i+2} ${skills.name}\n`
                    }
    
                const script = tempLine + tempScript + skillScript;
                const field = 'attackChoice';
                PVP.to(user[y][1].socketId).emit('fieldScriptPrint', { field, script });
                skillScript = '';
                }
            // }

            res.status(200).end();
        } catch (err) {
            next(err);
        }},

    pickSkill: (req: Request, res: Response, next: NextFunction) => {
        console.log('pickSkill')
        const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;

        if (!userInfo) new HttpException('userInfo missing', 400);
        if (!userStatus) new HttpException('userStatus missing', 400);

        const pickSkillValidayion: string|undefined = pvpService.pickSkillValidayion(req, res, next)
        if (pickSkillValidayion === undefined) return;

        pvpService.pickSkill(req, res, next)

        const script = pvpScript.pickSkill;
        const field = 'attackChoice';

        PVP.to(socketId).emit('printBattle', { script, userInfo, field, userStatus });

        res.status(200).end();
    },

    pvpfight: async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('pvpfight')
            const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;
            const roomName = userStatus!.pvpRoom
            const pvpRoom = rooms.get(roomName!)

            const arranging: Arranging = await pvpService.arranging(req, res, next);

            // 타겟캐릭터 체력과 적용될 스킬과 데미지가 이루어진다.
            // 스킬 데미지 계산
            const playerSkillDamage: pvpResult = await pvpService.playerSkillDamage(arranging);

            const { where, script, field } =  await pvpService.pvpResult({ ...playerSkillDamage, roomName });

            if (where === 'continue') {
                PVP.to(roomName!).emit('fieldScriptPrint', { field, script });
                const request = { body: { socketId, userInfo, userStatus } };
                return pvpController.pvpStart(request as Request, res, next)
            } else if (where === 'exit') {
                const socketIds: string[] = [];
                const iterator = pvpRoom!.values()
                for (let i = 0; i < maxUsers; i++) socketIds.push(iterator!.next().value.socketId);
                PVP.to(roomName!).emit('fieldScriptPrint', { field, script });
                PVP.in(socketIds).socketsLeave(roomName!)
            }

            res.status(200).end();
        } catch (err) {
            next(err);
        }},

    wrongCommand: (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('pvpWrongCommand')
            const { socketId, CMD, userInfo, userStatus, option }: PostBody = req.body;

            const script = pvpScript.wrongCommand(CMD);
            const field = `${option}`;

            PVP.to(socketId).emit('printBattle', { script, userInfo, field, userStatus });

            res.status(200).end();
        } catch (err) {
            next(err);
        }
    },

    help: (req: Request, res: Response, next: NextFunction) => {
        try {
            const { socketId, CMD, userInfo, userStatus, option }: PostBody = req.body;
            console.log(`${option}`)

            if (!userInfo) new HttpException('userInfo missing', 400);
            if (!userStatus) new HttpException('userStatus missing', 400);

            const script = pvpHandler.pvpHelp(option!)
            const field = `${option}`;

            PVP.to(socketId).emit('printBattle', { script, userInfo, field, userStatus });

            res.status(200).end();
        } catch (err) {
            next(err);
        }
    },

    wrongPickSkills: (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('wrongPickSkills')
            const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;

            const script = pvpScript.wrongPickSkills(CMD);
            const field = 'attackChoice';

            PVP.to(socketId).emit('printBattle', { script, userInfo, field, userStatus });

            res.status(200).end();
        } catch (err) {
            next(err);
        }
    },
};
