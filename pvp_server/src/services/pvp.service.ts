import { Request, Response, NextFunction } from "express";
import fetchPost from "../common/fetch";
import { pvpController } from "../controllers";
import { redis, redisCloud } from "../db/cache";
import { FRONT_URL, maxUsers, pvpRoomList } from "../controllers/pvp.controller";
import { PostBody } from "../interfaces/common";
import { PvpUser } from '../interfaces/pvp'
import { UserInfo, UserStatus } from "../interfaces/user";
import PVP from "../redis";
import { pvpScript } from "../scripts";

export const isEnd: Map<string, NodeJS.Timer> = new Map<string, NodeJS.Timer>();

class PvpService {
    hitStrength(damage: number, defense: number) {
        const hitStrength = Math.floor(Math.random() * 40) + 80;
        const realDamage = Math.floor((damage * hitStrength) / 100) - defense
        return realDamage <= 0 ? 0 : realDamage
    }

    async pvpRoomListScript() {
        const pvpRooms = [...pvpRoomList];
        let script: string = pvpScript.welcomePvp + `===== Users ======= State ==== RoomName ==\n`;
        if (pvpRoomList.size === 0) script += pvpScript.defaultList;
        else {
            for (const room of pvpRooms) {
                const isState = room[1] === true ? '전투중' : '대기중';
                const getUsers = await this.getUsers(`${room[0]}`)
                const watchers = await this.getUsers(`watch ${room[0]}`)
                script += `# [${getUsers}/${maxUsers}] # [${watchers}/${10-maxUsers}] # [ ${isState} ] # [ ${room[0].split(' ').pop()!} ]\n`
            }
        }
        
        script += `==========================================`
        script += pvpScript.pvpJoin;
    
        return script;
    }

    async createRoomValidation(req: Request, res: Response, next: NextFunction, roomName: string): Promise<string | undefined> {
        console.log('createRoomValidation');
        const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;
        if (CMD === undefined) {
            const request = { body: { socketId, CMD: '방이름을 입력해주세요.', userStatus, option: 'pvpList'}};
            pvpController.wrongCommand(request as Request, res, next)
            return 'wrongCommand';
        }

        if (pvpRoomList.has(roomName)) {
            const request = { body: { socketId, CMD: '이미 존재하는 방 입니다.', userStatus, option: 'pvpList' }};
            pvpController.wrongCommand(request as Request, res, next)
            return 'wrongCommand';
        }
    }

    async joinRoomValidation(req: Request, res: Response, next: NextFunction, roomName: string) {
        console.log('joinRoomValidation');
        const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;
        if (!CMD) {
            const request = { body: { socketId, CMD: '방이름을 입력해주세요.', userStatus, option: 'pvpList'}};
            pvpController.wrongCommand(request as Request, res, next)
            return 'wrongCommand'
        }

        if (!pvpRoomList.has(roomName)) {
            const request = { body: { socketId, CMD: '존재하지 않는 방이름 입니다.', userStatus, option: 'pvpList' }};
            pvpController.wrongCommand(request as Request, res, next)
            return 'wrongCommand'
        }

        // 관전자도 redis에 저장하고 총 인원 체크..
        // 10명 채워지면 입장 불가
        const watchers = await this.getUsers(`watch ${roomName}`)
        if (watchers === 10 - maxUsers){
            const request = { body: { socketId, CMD: '정원초과 입니다.', userStatus, option: 'pvpList' }};
            pvpController.wrongCommand(request as Request, res, next)
            return 'wrongCommand'
        }
    }

    async createRoom({ socketId, CMD, userInfo, userStatus, option: frontId }: PostBody) {
        console.log('createRoom');
        const roomName = `pvpRoom ${CMD}`;

        userStatus.pvpRoom = roomName;
        

        userStatus.hp = userStatus!.maxhp;
        userStatus.damage = 0;
        userStatus.isTeam = 'A TEAM';
        userStatus.frontId = frontId;

        const inputPlayer:PvpUser = { [userStatus.name]: { socketId, userStatus }}
        await redis.hSetPvpUser(roomName, inputPlayer)

        pvpRoomList.set(roomName, false)

        return userStatus;
    }

    async joinRoom({ socketId, CMD, userInfo, userStatus, option: frontId }: PostBody) {
        console.log('joinRoom');
        const roomName = `pvpRoom ${CMD}`;
        const getUsers = await this.getUsers(roomName);
        PVP.in(socketId).socketsJoin(roomName);
        userStatus.pvpRoom = roomName;
        const isFight = pvpRoomList.get(roomName)
        if (getUsers === maxUsers || isFight === true) {
            userStatus.damage = -1;
            userStatus.frontId = frontId;
            const inputPlayer:PvpUser = { [userStatus.name]: { socketId, userStatus }}
            await redis.hSetPvpUser(`watch ${roomName}`, inputPlayer)
            PVP.to(socketId).emit('printBattle', { script: `${CMD}에 입장하셨습니다.\n`, field: 'pvpBattle', userStatus });

            const URL = `${FRONT_URL}/chat/pvpChatStart`
            fetchPost({ URL, socketId: userStatus.frontId!, userInfo, option: roomName });

            return undefined;
        }

        userStatus.hp = userStatus.maxhp;
        userStatus.damage = 0;
        userStatus.isTeam = getUsers + 1 <= maxUsers / 2 ? 'A TEAM' : 'B TEAM';
        userStatus.frontId = frontId;

        const inputPlayer:PvpUser = { [userStatus.name]: { socketId, userStatus }}
        await redis.hSetPvpUser(roomName, inputPlayer)

        

        return userStatus;
    }

    async getUsers(roomName: string): Promise<number> {
        console.log('getUsers');
        const getUsers = Object.entries(await redis.hGetPvpRoom(roomName));
        return getUsers.length
    }

    async startValidation(req: Request, res: Response, next: NextFunction, roomName: string) {
        console.log('startValidation');
        const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;

        const getUsers = await this.getUsers(roomName);
        
        const isFight = pvpRoomList.get(roomName)
        if (getUsers === maxUsers && isFight === false) {
            pvpRoomList.set(roomName, true)
            const script = pvpScript.pvpRoomJoin(userStatus!.name) + '잠시 후 대전이 시작됩니다.\n'
            const field = 'pvpList';
            PVP.to(roomName).emit('fieldScriptPrint', { script, field });
            PVP.to(socketId).emit('printBattle', { field, userStatus });

            const URL = `${FRONT_URL}/chat/pvpChatStart`
            fetchPost({ URL, socketId: userStatus.frontId!, userInfo, option: roomName });

            setTimeout(() => {
                const request = { body: { socketId, userStatus } };
                pvpController.pvpStart(request as Request, res, next);
            }, 5000);
            return undefined;
        }
        return 'done';
    }

    async pvpStart(userStatus: UserStatus, result: string) {
        console.log('pvpStart')
        const roomName = userStatus.pvpRoom;
        let colorA:string = '';
        let colorB:string = '';

        if (result === 'A TEAM') colorA = 'color:#33FF66';
        else if (result === 'B TEAM') colorB = 'color:#33FF66'

        const firstLine = `= TEAM. =Lv. =========== Deamge ======== HP ================ Name======\n`;
        let ATeamScript: string = ``;
        let BTeamScript: string = ``;
        const pvpRoom = await redis.hGetPvpRoom(roomName!);
        const users = Object.entries(pvpRoom)

        // 캐릭터별 이름, 레벨, 체력, 공격력, 방어력 표시
        for (const user of users) {
            const userInfo = {
                isTeam: user[1].userStatus.isTeam!,
                level: String(user[1].userStatus.level).padEnd(4, `.`),
                damage: String(user[1].userStatus.damage!).padStart(17, `.`),
                hp: String(user[1].userStatus.hp).padStart(9, `.`),
                maxhp: String(user[1].userStatus.maxhp).padEnd(9, `.`),
                name: user[1].userStatus.name
            }
            if (userInfo.isTeam === 'A TEAM') ATeamScript += `<span style=${colorA}>#${userInfo.isTeam}  #${userInfo.level}#${userInfo.damage}#${userInfo.hp} / ${userInfo.maxhp}#  ${userInfo.name}</span>\n`;
            else if (userInfo.isTeam === 'B TEAM') BTeamScript += `<span style=${colorB}>#${userInfo.isTeam}  #${userInfo.level}#${userInfo.damage}#${userInfo.hp} / ${userInfo.maxhp}#  ${userInfo.name}</span>\n`;
        }
        return firstLine + ATeamScript + BTeamScript;
    }

    async getSkills(userStatus: UserStatus) {
        console.log('getSkills')
        const roomName = userStatus.pvpRoom
        const pvpRoom = await redis.hGetPvpRoom(roomName!)
        const users = Object.entries(pvpRoom)

        const tempLine: string = `=======================================================================\n\n기본공격, `;

        let skillScript: string = '';

        // 유저별로 선택할 수 있는 목록을 보여준다.
        // setTimeout(() => {
            for (let y = 0; y < maxUsers; y++) {
                if (!users[y]) continue;
                const user = users[y][1].userStatus
                for (let i = 0; i < user!.skill.length; i++) {
                    let skills = user!.skill[i]
                        skillScript += `${skills.name}, `
                }
            
            const script = tempLine + skillScript;
            const field = 'pvpBattle';
            console.log('getSkills SocketId : ', users[y][1].socketId)
            PVP.to(users[y][1].socketId).emit('printBattle', { script: `${script}\n\n`, field, userStatus: user });
            skillScript = '';
            }
        // }, 5000);
    }

    async leaveRoom(userStatus: UserStatus) {
        console.log(`leaveRoom`)
        const roomName = userStatus!.pvpRoom
        await redis.hDel(roomName!, userStatus.name)
        await redis.hDel(`watch ${roomName}`, userStatus.name)

        const getUsers = await this.getUsers(roomName!);
        if (getUsers === 0) pvpRoomList.delete(roomName!.split(' ').pop()!);
    }

    async pvpDisconnect(name: string, roomName: string, socketId: string) {
        console.log('pvpDisconnect')
        PVP.in(socketId).socketsLeave(roomName)
        await redis.hDel(roomName, name);
        await redis.hDel(`watch ${roomName}`, name)
        const getUsers = await this.getUsers(roomName);
        if (getUsers === 0) pvpRoomList.delete(roomName.split(' ').pop()!);
    }

    battleValidation({ socketId, CMD, userInfo, userStatus }: PostBody) {
        console.log(`battleValidation`)
        const [ CMD1, CMD2 ] = CMD.trim().split(' ');
        const field = 'pvpBattle'

        if (userStatus.damage === -1) {
            PVP.to(socketId).emit('fieldScriptPrint', { field, script: '당신은 관전 중 입니다.\n'})
            return undefined;
        }
        if (userStatus.hp === 0) {
            PVP.to(socketId).emit('fieldScriptPrint', { field, script: '당신은 사망하셨습니다.\n'})
            return undefined;
        }

        const coolTiemCheck = Date.now() - userStatus.cooldown!;
        if (coolTiemCheck < 3000) {
            const script = pvpScript.coolTimeWrong(coolTiemCheck)
            PVP.to(socketId).emit('fieldScriptPrint', { field, script })
            return undefined;
        }
        const skills: string[] = ['기본공격'];
        for (const skill of userStatus.skill) skills.push(skill.name);
        if (!skills.includes(CMD2)) {
            PVP.to(socketId).emit('fieldScriptPrint', { field, script: '잘못된 입력 또는 보유한 스킬이 아닙니다.\n' })
            return undefined;
        }
        return 'done'
    }

    async targetValidation({ socketId, CMD, userInfo, userStatus }: PostBody) {
        console.log(`targetValidation`)
        const [ CMD1, CMD2 ] = CMD.trim().split(' ');
        const field = 'pvpBattle'
        const roomName = userStatus.pvpRoom;

        const pvpRoom = await redis.hGetPvpRoom(roomName!);
        const users = Object.entries(pvpRoom);
        const TeamA: string[] = [];
        const TeamB: string[] = [];

        for (let i = 0; i < maxUsers; i++) {
            if (!users[i]) continue;
            const user = users[i][1].userStatus.isTeam;
            if (user === 'A TEAM') TeamA.push(users[i][0]);
            else if (user === 'B TEAM') TeamB.push(users[i][0]);
        }
        
        if (!TeamA.concat(TeamB).includes(CMD1)) {
            PVP.to(socketId).emit('fieldScriptPrint', { field, script: '잘못된 입력 또는 없는 유저입니다.\n' })
            return undefined;
        }
        if (TeamA.includes(userStatus.name) && TeamA.includes(CMD1)) {
            PVP.to(socketId).emit('fieldScriptPrint', { field, script: '본인 또는 같은 팀은 공격하지 못합니다.\n' })
            return undefined;
        }
        if (TeamB.includes(userStatus.name) && TeamB.includes(CMD1)) {
            PVP.to(socketId).emit('fieldScriptPrint', { field, script: '본인 또는 같은 팀은 공격하지 못합니다.\n' })
            return undefined;
        }
        return users;
    }

    async battleStart({ socketId, CMD, userInfo, userStatus }: PostBody) {
        console.log('battleStart')
        const [ CMD1, CMD2 ] = CMD.trim().split(' ');
        const field = 'pvpBattle'
        const roomName = userStatus.pvpRoom;

        const pvpRoom = await redis.hGetPvpRoom(roomName!);
        const users = Object.entries(pvpRoom);
        
        const user = users.filter(user=>user[0] === CMD1).pop()!;
        const enemy = user[1].userStatus;

        if (enemy.hp === 0) {
            PVP.to(socketId).emit('fieldScriptPrint', { field, script: '이미 사망한 유저입니다.\n' })
            return undefined;
        }
        const attack = userStatus.attack;
        const multiple = CMD2 === '기본공격' ? 100 : userStatus.skill.filter(skill => skill.name === CMD2).pop()!.multiple;
        const realDamage = this.hitStrength(attack * multiple / 100, enemy.defense)

        enemy.hp -= realDamage;
        userStatus.damage! += realDamage;
        userStatus.cooldown = Date.now();

        if (enemy.hp < 0) enemy.hp = 0;

        const inputPlayer: PvpUser = {[userStatus.name]: { socketId, userStatus }}
        const inputEnemy: PvpUser = {[enemy.name]: user[1]}

        await redis.hSetPvpUser(roomName!, inputPlayer);
        await redis.hSetPvpUser(roomName!, inputEnemy)
        
        PVP.to(user[1].socketId).emit('printBattle', { field, userStatus: enemy });
        PVP.to(socketId).emit('printBattle', { field, userStatus })

        return `${userStatus.name}이(가) ${user[0]}에게 <span style='color:red'>${realDamage}</span>의 데미지를 입혔다 ! => <span style='color:red'>${user[0]} hp: ${enemy.hp}/${enemy.maxhp}</span>\n`
    }

    async pvpResultValidation({ socketId, CMD, userInfo, userStatus }: PostBody) {
        console.log('pvpResultValidation')
        const roomName = userStatus.pvpRoom;
        const field = 'pvpBattle'

        const pvpRoom = await redis.hGetPvpRoom(roomName!);
        const users = Object.entries(pvpRoom);
        let ATeamHp: number = 0;
        let BTeamHp: number = 0;

        for (let i = 0; i < maxUsers; i++) {
            if (!users[i]) continue;
            const user = users[i][1].userStatus;
            if (user.isTeam === 'A TEAM') ATeamHp += user.hp;
            else if (user.isTeam === 'B TEAM') BTeamHp += user.hp;
        }
        
        let result: string | undefined = undefined;
        if (ATeamHp === 0) result = 'B TEAM';
        else if (BTeamHp === 0) result = 'A TEAM';

        const tempLine = `=======================================================================\n`
        let script: string = ``;

        if (result) {
            clearInterval(isEnd.get(roomName!))
            isEnd.delete(roomName!)
            script += tempLine + `<span style='color:#33FF66'>${result}이 승리했다네 !</span>\n`;
            script += await this.pvpStart(userStatus, result)
            for (let i = 0; i < maxUsers; i++) {
                if (!users[i]) continue;
                const user = users[i][1].userStatus;
                user.hp = user.maxhp;
                PVP.to(users[i][1].socketId).emit('printBattle', { field, userStatus: user });
                await this.leaveRoom(user);

                const sendUser: UserInfo = {
                    userId: 0,
                    username: user.username,
                    characterId: user.characterId,
                    name: user.name
                }

                const URL = `${FRONT_URL}/chat/pvpChatLeave`
                fetchPost({ URL, socketId: user.frontId!, userInfo: sendUser });
            }
            const watchers = Object.entries(await redis.hGetPvpRoom(`watch ${roomName}`));
            for (const watcher of watchers) {
                const user = watcher[1].userStatus;
                const sendUser: UserInfo = {
                    userId: 0,
                    username: user.username,
                    characterId: user.characterId,
                    name: user.name
                }
                const URL = `${FRONT_URL}/chat/pvpChatLeave`
                fetchPost({ URL, socketId: user.frontId!, userInfo: sendUser });
            }
            setTimeout(() => {
                script += `5초 후 마을로 돌아갑니다..\n`;
                PVP.to(roomName!).emit('fieldScriptPrint', { script, field });
            }, 500);
            setTimeout(() => {
                PVP.to(roomName!).emit('fieldScriptPrint', { field: 'village', script: pvpScript.village });
                PVP.in(roomName!).socketsLeave(roomName!);
            }, 5000);
        }
    }
}

export default new PvpService();