import { Request, Response, NextFunction } from "express";
import fetchPost from "../common/fetch";
import { pvpController } from "../controllers";
import { redis, redisCloud } from "../db/cache";
import { FRONT_URL, maxUsers } from "../controllers/pvp.controller";
import { PostBody } from "../interfaces/common";
import { PvpUser } from '../interfaces/pvp'
import { UserInfo, UserStatus } from "../interfaces/user";
import PVP from "../redis";
import { pvpScript } from "../scripts";

export const isEnd: Map<string, NodeJS.Timer> = new Map<string, NodeJS.Timer>();

class PvpService {
    /**
     * 실제 적용될 데미지를 계산한다.
     * @param damage 적용될 데미지
     * @param defense 상대 유저의 방어력
     * @returns 실제 적용될 데미지 또는 0
     */
    hitStrength(damage: number, defense: number) {
        const hitStrength = Math.floor(Math.random() * 40) + 80;
        const realDamage = Math.floor((damage * hitStrength) / 100) - defense
        return realDamage <= 0 ? 0 : realDamage
    }

    /**
     * 시련의 장 방 목록 조회
     */
    async pvpRoomListScript() {
        let script: string = pvpScript.welcomePvp + `===== Users ======= State ==== RoomName ==\n`;

        const getAllRooms = await redisCloud.getRooms();
        if (JSON.stringify(getAllRooms) === '{}') script += pvpScript.defaultList;
        else {
            const pvpRooms = Object.entries(getAllRooms).filter(name=>!name[0].includes('watch'))
            for (const room of pvpRooms) {
                const roomName = room[0];
                const roomState = room[1];

                const isState = roomState === true ? '전투중' : '대기중';
                
                const getUsers = await this.getUsers(`${roomName}`)
                const watchers = await this.watchGetUsers(`watch ${roomName}`)

                script += `# [${getUsers}/${maxUsers}] # [${watchers}/${10-maxUsers}] # [ ${isState} ] # [ ${roomName.split(' ').pop()!} ]\n`
            }
        }
        
        script += `==========================================`
        script += pvpScript.pvpJoin;
    
        return script;
    }

    async createRoomValidation(req: Request, res: Response, next: NextFunction, roomName: string): Promise<string | undefined> {
        const { socketId, CMD, userStatus }: PostBody = req.body;

        if (CMD === undefined) {
            const request = { body: { socketId, CMD: '방이름을 입력해주세요.', userStatus, option: 'pvpList'}};
            pvpController.wrongCommand(request as Request, res, next)
            return 'wrongCommand';
        }
        
        // 생성하려는 방 이름이 존재할경우
        const existRoom = await redis.hGetPvpRoom(roomName);
        if (JSON.stringify(existRoom) !== '{}') {
            const request = { body: { socketId, CMD: '이미 존재하는 방 입니다.', userStatus, option: 'pvpList' }};
            pvpController.wrongCommand(request as Request, res, next)
            return 'wrongCommand';
        }
    }

    async joinRoomValidation(req: Request, res: Response, next: NextFunction, roomName: string) {
        const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;

        if (!CMD) {
            const request = { body: { socketId, CMD: '방이름을 입력해주세요.', userStatus, option: 'pvpList'}};
            pvpController.wrongCommand(request as Request, res, next)
            return 'wrongCommand'
        }

        // 입장하려는 방 이름이 존재하지 않을 경우
        const existRoom = await redis.hGetPvpRoom(roomName);
        if (JSON.stringify(existRoom) === '{}') {
            const request = { body: { socketId, CMD: '존재하지 않는 방이름 입니다.', userStatus, option: 'pvpList' }};
            pvpController.wrongCommand(request as Request, res, next)
            return 'wrongCommand'
        }

        // 관전자도 redis에 저장하고 총 인원 체크..
        // 10명 채워지면 입장 불가
        const watchers = await this.watchGetUsers(`watch ${roomName}`)
        if (watchers === 10 - maxUsers){
            const request = { body: { socketId, CMD: '정원초과 입니다.', userStatus, option: 'pvpList' }};
            pvpController.wrongCommand(request as Request, res, next)
            return 'wrongCommand'
        }
    }

    /**
     * 방 생성시 rooms 갱신 및 수정된 userStatus를 세팅한다.
     * @param PostBody ...PostBody, option: frontId
     * @returns newUserStatus
     */
    async createRoom({ socketId, CMD, userStatus, option: frontId }: PostBody) {
        const roomName = `pvpRoom ${CMD}`;

        // Fight User Setting
        const newUserStatus: UserStatus = {
            ...userStatus,
            pvpRoom: roomName,
            hp: userStatus.maxhp,
            damage: 0,
            frontId
        }

        // 방 생성시 local redis에 저장되는 data
        const inputPlayer:PvpUser = { [userStatus.name]: { socketId, userStatus: newUserStatus }}
        await redis.hSetPvpUser(roomName, inputPlayer)

        // 방 생성시 Global redis에 저장되는 data
        // { roomName: boolean } 이며, true면 전투중, false면 대기중을 뜻한다.
        const room = { [roomName]: 'false' }
        await redisCloud.hSet('rooms', room)

        return newUserStatus;
    }

    /**
     * 방 입장시 rooms 갱신 및 수정된 userStatus를 세팅한다.
     * @param PostBody ...PostBody, option: frontId
     * @returns newUserStatus
     */
    async joinRoom({ socketId, CMD, userInfo, userStatus, option: frontId }: PostBody) {
        const roomName = `pvpRoom ${CMD}`;
        const getUsers = await this.getUsers(roomName);
        const roomState = await redisCloud.hGetOne(roomName);

        PVP.in(socketId).socketsJoin(roomName);

        const newUserStatus: UserStatus = {
            ...userStatus,
            pvpRoom: roomName,
            hp: userStatus.maxhp,
            damage: 0,
            frontId
        }

        // 현재 입장한 인원이 최대 인원 이거나, 입장하려는 방이 전투중이면 관전으로 참여한다.
        if (getUsers === maxUsers || roomState[roomName] === true) {
            const watchUserStatus: UserStatus = { ... newUserStatus, damage: -1 }
            const inputPlayer:PvpUser = { [userStatus.name]: { socketId, userStatus: watchUserStatus }}

            await redisCloud.hSetPvpUser(`watch ${roomName}`, inputPlayer)

            PVP.to(socketId).emit('printBattle', { script: `${CMD}에 입장하셨습니다.\n`, field: 'pvpBattle', userStatus: watchUserStatus });

            const URL = `${FRONT_URL}/chat/pvpChatStart`
            fetchPost({ URL, socketId: frontId!, userInfo, option: roomName });
            return undefined;
        }

        const inputPlayer:PvpUser = { [userStatus.name]: { socketId, userStatus: newUserStatus }}
        await redis.hSetPvpUser(roomName, inputPlayer)

        return newUserStatus;
    }

    /**
     * 현재 전투에 참여중인 인원 수 리턴
     * @param roomName 방 이름
     * @returns 전투 참여 인원 수
     */
    async getUsers(roomName: string): Promise<number> {
        const getUsers = Object.entries(await redis.hGetPvpRoom(roomName));
        return getUsers.length
    }

    /**
     * 현재 관전하는 유저의 수 리턴
     * @param roomName 방 이름
     * @returns 관전 참여 인원 수
     */
    async watchGetUsers(roomName: string): Promise<number> {
        const getUsers = Object.entries(await redisCloud.hGetPvpRoom(roomName));
        return getUsers.length
    }

    /**
     * 유저가 전투에 참여할때 마다 현재 유저 수를 
     * 체크해서 충족하면 전투가 시작된다.
     * @param roomName 방 이름
     * @returns 충족하면 undefined, 그렇지 않으면 'done'을 return
     */
    async startValidation(req: Request, res: Response, next: NextFunction, userStatus: UserStatus) {
        const { socketId, CMD, userInfo }: PostBody = req.body;
        const roomName = userStatus.pvpRoom!
        const getUsers = await this.getUsers(roomName);
        const roomState = await redisCloud.hGetOne(roomName);

        if (getUsers === maxUsers && roomState[roomName] === false) {
            const pvpRoom = await redis.hGetPvpRoom(roomName!);
            const users = Object.entries(pvpRoom)
            
            const URL = `${FRONT_URL}/chat/pvpChatStart`
            fetchPost({ URL, socketId: userStatus.frontId!, userInfo, option: roomName });

            for (let i = 0; i < maxUsers; i++){
                const user = users[i][1].userStatus
                i < maxUsers / 2 ? user.isTeam = 'B TEAM' : user.isTeam = 'A TEAM'

                const inputPlayer:PvpUser = { [users[i][0]]: { socketId: users[i][1].socketId, userStatus: user }}
                await redis.hSetPvpUser(roomName, inputPlayer)
            }

            const room = { [roomName]: 'true' }
            await redisCloud.hSet('rooms', room)

            const script = pvpScript.pvpRoomJoin(userStatus!.name) + '잠시 후 대전이 시작됩니다.\n'
            const field = 'pvpList';

            PVP.to(roomName).emit('fieldScriptPrint', { script, field });
            PVP.to(socketId).emit('printBattle', { field, userStatus });


            setTimeout(() => {
                const request = { body: { socketId, userStatus } };
                pvpController.pvpStart(request as Request, res, next);
            }, 5000);
            return undefined;
        }
        return 'done';
    }

    /**
     * 전투 중 현재 참여 중인 유저 목록을 보여주거나,
     * 팀 전멸시 결과 Script를 return.
     * @param userStatus 
     * @param result 승리한 팀, 'A TEAM' or 'B TEAM'
     * @returns PVP 결과 Script
     */
    async pvpStart(userStatus: UserStatus, result: string) {
        const firstLine = `= TEAM. =Lv. =========== Deamge ======== HP ================ Name======\n`;
        const roomName = userStatus.pvpRoom;
        const pvpRoom = await redis.hGetPvpRoom(roomName!);
        const users = Object.entries(pvpRoom)
        let colorA:string = '';
        let colorB:string = '';
        let ATeamScript: string = ``;
        let BTeamScript: string = ``;

        if (result === 'A TEAM') colorA = 'color:#33FF66';
        else if (result === 'B TEAM') colorB = 'color:#33FF66'

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

    /**
     * 방 입장 후 돌아가기 선택 시 적용될 로직
     * @param userStatus 
     */
    async leaveRoom(userStatus: UserStatus) {
        const roomName = userStatus!.pvpRoom
        await redis.hDel(roomName!, userStatus.name)
        await redisCloud.hDel(`watch ${roomName}`, userStatus.name)

        const getUsers = await this.getUsers(roomName!);
        if (getUsers === 0) await redisCloud.pvpRoomDel(roomName!);
    }

    async pvpDisconnect(name: string, roomName: string, socketId: string) {
        PVP.in(socketId).socketsLeave(roomName);
        await redis.hDel(roomName, name);
        await redisCloud.hDel(`watch ${roomName}`, name);

        const getUsers = await this.getUsers(roomName);
        if (getUsers === 0) await redisCloud.pvpRoomDel(roomName);
    }

    battleValidation({ socketId, CMD, userInfo, userStatus }: PostBody) {
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

        // 3초 쿨타임 적용
        const coolTiemCheck = Date.now() - userStatus.cooldown!;
        if (coolTiemCheck < 3000) {
            const script = pvpScript.coolTimeWrong(coolTiemCheck)
            PVP.to(socketId).emit('fieldScriptPrint', { field, script })
            return undefined;
        }

        // 보유 중인 스킬인지 확인
        const skills: string[] = ['기본공격'];
        for (const skill of userStatus.skill) skills.push(skill.name);

        if (!skills.includes(CMD2)) {
            PVP.to(socketId).emit('fieldScriptPrint', { field, script: '잘못된 입력 또는 보유한 스킬이 아닙니다.\n' })
            return undefined;
        }

        return 'done'
    }

    async targetValidation({ socketId, CMD, userInfo, userStatus }: PostBody) {
        const [ CMD1, CMD2 ] = CMD.trim().split(' ');
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
        
        const field = 'pvpBattle'
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
        const [ CMD1, CMD2 ] = CMD.trim().split(' ');

        const roomName = userStatus.pvpRoom;
        const pvpRoom = await redis.hGetPvpRoom(roomName!);
        const users = Object.entries(pvpRoom);
        const user = users.filter(user=>user[0] === CMD1).pop()!;
        const enemy = user[1].userStatus;
        
        const field = 'pvpBattle'
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
        const roomName = userStatus.pvpRoom;
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
            const field = 'pvpBattle'
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
            const watchers = Object.entries(await redisCloud.hGetPvpRoom(`watch ${roomName}`));
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