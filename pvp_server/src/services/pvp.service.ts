import { Request, Response, NextFunction } from "express";
import { pvpController } from "../controllers";
import { maxUsers, pvpRoomList } from "../controllers/pvp.controller";
import { PostBody } from "../interfaces/common";
import { PvpPlayer, pvpResult } from '../interfaces/pvp'
import { UserStatus } from "../interfaces/user";
import PVP from "../redis";
import { pvpScript } from "../scripts";

export const rooms: Map<string, Map<string, PvpPlayer>> = new Map<string, Map<string, PvpPlayer>>();

class PvpService {

    hitStrength(damage: number) {
        const hitStrength = Math.floor(Math.random() * 40) + 80;
        return Math.floor((damage * hitStrength) / 100);
    }

    createRoomValidation(req: Request, res: Response, next: NextFunction, roomName: string) {
        console.log('createRoomValidation');
        const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;
        if (CMD === undefined) {
            const request = { body: { socketId, CMD: '방이름을 입력해주세요.', userInfo, userStatus, option: 'pvpList'}};
            pvpController.wrongCommand(request as Request, res, next)
            return 'wrongCommand';
        }

        if (rooms.get(roomName)) {
            const request = { body: { socketId, CMD: '이미 존재하는 방 입니다.', userInfo, userStatus, option: 'pvpList' }};
            pvpController.wrongCommand(request as Request, res, next)
            return 'wrongCommand';
        }
    }

    joinRoomValidation(req: Request, res: Response, next: NextFunction, roomName: string) {
        console.log('joinRoomValidation');
        const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;
        if (!CMD) {
            const request = { body: { socketId, CMD: '방이름을 입력해주세요.', userInfo, userStatus, option: 'pvpList'}};
            pvpController.wrongCommand(request as Request, res, next)
            return 'wrongCommand'
        }

        if (!rooms.get(roomName)) {
            const request = { body: { socketId, CMD: '존재하지 않는 방이름 입니다.', userInfo, userStatus, option: 'pvpList' }};
            pvpController.wrongCommand(request as Request, res, next)
            return 'wrongCommand'
        }
    }

    createRoom({ socketId, CMD, userInfo, userStatus }: PostBody) {
        console.log('createRoom');
        const roomName = `pvpRoom ${CMD}`;

        userStatus!.pvpRoom = roomName;          
        rooms.set(roomName, new Map().set(userInfo!.name, { socketId, userStatus }))

        pvpRoomList.push(roomName.split(' ').pop()!)

        const newUserStatus = rooms.get(roomName)!.get(userInfo!.name)!.userStatus
        newUserStatus!.hp = newUserStatus!.maxhp;

        return newUserStatus;
    }

    joinRoom({ socketId, CMD, userInfo, userStatus }: PostBody) {
        console.log('joinRoom');
        const roomName = `pvpRoom ${CMD}`;

        userStatus!.pvpRoom = roomName;

        rooms.get(roomName)!.set(userInfo!.name, { socketId, userStatus })

        const newUserStatus = rooms.get(roomName)!.get(userInfo!.name)!.userStatus
        newUserStatus!.hp = newUserStatus!.maxhp;

        return newUserStatus;
    }

    startValidation(req: Request, res: Response, next: NextFunction, roomName: string) {
        console.log('startValidation');
        const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;

        const pvpRoom = rooms.get(roomName)!

        if (pvpRoom!.size === maxUsers) {
            const script = pvpScript.pvpRoomJoin(userInfo!.name) + '잠시 후 대전이 시작됩니다.\n'
            const field = 'pvpBattle';
            PVP.to(socketId).emit('printBattle', { field, userInfo, userStatus });
            PVP.to(roomName).emit('fieldScriptPrint', { script, field});
            setTimeout(() => {
                const request = { body: { socketId, userInfo, userStatus } };
                pvpController.pvpStart(request as Request, res, next);
            }, 5000);
            return undefined;
        } else if (pvpRoom!.size > maxUsers) {
            pvpRoom!.get(userInfo!.name)!.target = 'none';
            pvpRoom!.get(userInfo!.name)!.selectSkill = 'none';
            PVP.to(socketId).emit('printBattle', { script: `${CMD}에 입장하셨습니다.`, field: 'pvpBattle', userInfo, userStatus });
            return undefined;
        }
        return 'done';
    }

    pvpStart(roomName: string) {
        let script: string = `=======================================================================\n\n`;
        const users: UserStatus[] = [];
        const pvpRoom = rooms.get(roomName!);
        const iterator = pvpRoom!.values();
        for (let i = 0; i < maxUsers; i++) {
            users.push(iterator.next().value.userStatus)
        }

        script += `샤크스 경 : \n공격할 유저를 선택하게나 !\n\n`

        // 캐릭터별 이름, 레벨, 체력, 공격력, 방어력 표시
        for (let i = 0; i < maxUsers; i++) {
            if (users[i]!.hp === 0) {
                script += `${i+1}. Lv${users[i]!.level} ${users[i].name} - 사망한 유저입니다.\n`;
                continue;
            } 
            script += `${i+1}. Lv${users[i]!.level} ${users[i].name} - hp: ${users[i]!.hp}/${users[i]!.maxhp}, attack: ${users[i]!.attack}, defense: ${users[i]!.defense}\n`;
        }
        return script;
    }

    destroyRoom(roomName: string) {
        rooms.delete(roomName!)
        const item = pvpRoomList.splice(pvpRoomList.findIndex(index => index === roomName!.split(' ').pop()), 1);
        console.log(`현재 방 추출 : ${item}`)
        pvpRoomList.splice(0, 0, item[0]);
        pvpRoomList.shift();
        console.log(`추출 완료 : ${pvpRoomList}`)
    }

    targetValidation(req: Request, res: Response, next: NextFunction) {
        console.log('targetValidation')
        const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;
        const num = Number(CMD)
        const roomName = userStatus!.pvpRoom;
        const users: UserStatus[] = [];
        const pvpRoom = rooms.get(roomName!);
        const myTarget = pvpRoom!.get(userInfo!.name)!.target;

        // 사망한 유저인지 확인
        if (myTarget === 'dead' || myTarget === 'none') {
            const request = { body: { socketId, CMD: '관전 중에는 입력하지 못합니다.', userInfo, userStatus, option: 'enemyChoice' }};
            pvpController.wrongCommand(request as Request, res, next);
            return 'wrong';
        }

        // 관전하는 유저는 선택할 수 없다.
        if (num > maxUsers) {
            const request = { body: { socketId, CMD: '선택할 수 없는 유저입니다.', userInfo, userStatus, option: 'enemyChoice' }};
            pvpController.wrongCommand(request as Request, res, next);
            return 'wrong';
        }

        // 본인 선택시 예외처리로직 시작
        const iterator = pvpRoom!.values();
        for (let i = 0; i < pvpRoom!.size; i++) {
            users.push(iterator.next().value.userStatus);
        }
        
        // 이미 사망한 유저는 선택하지 못한다.
        if (users[num-1].hp === 0) {
            const request = { body: { socketId, CMD, userInfo, userStatus, option: 'enemyChoice' }};
            pvpController.targetWrong(request as Request, res, next);
            return 'wrong';
        }
        
        // 본인의 index를 확인
        const indexNames = users.map(x=>x.name)
        const myIndex: number = indexNames.findIndex((e) => e === userStatus!.name);
        
        // 유저가 속한 팀이아닌 상대팀만을 선택
        if (myIndex < maxUsers/2 && num-1 < maxUsers/2) {
            const request = { body: { socketId, CMD, userInfo, userStatus, option: 'enemyChoice' }};
            pvpController.targetWrong(request as Request, res, next);
            return 'wrong';
        } else if (myIndex >= maxUsers/2 && num-1 >= maxUsers/2) {
            const request = { body: { socketId, CMD, userInfo, userStatus, option: 'enemyChoice' }};
            pvpController.targetWrong(request as Request, res, next);
            return 'wrong';
        }
        pvpRoom!.get(userInfo!.name)!.target = indexNames[num-1];

        const targets: string[] = [];
        const targetIterator = pvpRoom!.values();
        for (let i = 0; i < maxUsers; i++) {
            targets.push(targetIterator.next().value.target)
        }

        // undefined인 값 제거
        const targetNames = targets.filter(names => names !== undefined)

        // 공격할 유저 모두 선택시 다음 로직으로 보내준다.
        if(targetNames.length === maxUsers) {
            const script = pvpScript.target;
            const field = 'enemyChoice';
            PVP.to(socketId).emit('printBattle', { field, script, userInfo, userStatus });
            setTimeout(() => {
                const request = { body: { socketId, userInfo, userStatus } };
                pvpController.restultTarget(request as Request, res, next)
            }, 2000);
            return 'wrong';
        }
    }

    resultTarget(userStatus: UserStatus) {
        const roomName = userStatus!.pvpRoom;
        const pvpRoom = rooms.get(roomName!)
        const user = [...pvpRoom!]

        const tempLine =
            '=======================================================================\n\n';

        let targetScript = '샤크스 경 :\n';

        // 선택한 유저목록을 보여준다.
        for (let i = 0; i < maxUsers; i++) {
            if (user[i][1].target === 'dead') continue;
            targetScript += `${user[i][1].userStatus!.name}가 ${user[i][1].target}를 지목 했다네 !\n`;
        } 
        PVP.to(roomName!).emit('fieldScriptPrint', { script: tempLine + targetScript, field: 'attackChoice' });
    }

    skillList(userStatus: UserStatus) {
        const pvpRoom = rooms.get(userStatus.pvpRoom!)
        const user = [...pvpRoom!]

        let tempScript: string = '';

        // 사망하지 않은 유저에게만 스킬 목록출력
        const isDead = pvpRoom!.get(userStatus.name)!.selectSkill;
        if (isDead !== 'dead') {
            tempScript += '\n 어떤 공격을 할텐가 ?\n';
            tempScript += '\n 중간 공백을 포함해서 입력해주게 !\n';

            tempScript += `1 기본공격\n`;

            let skillScript: string = '';

            // 유저별로 선택할 수 있는 목록을 보여준다.
            setTimeout(() => {
                for (let y=0; y < maxUsers; y++){
                for (let i = 0; i < user[y][1].userStatus!.skill.length; i++) {
                    if (isDead === 'dead') {
                        tempScript = `관전 중에는 입력하지 못합니다.\n`;
                        continue;
                    }
                    let skills = user[y][1].userStatus!.skill[i]
                        skillScript += `${i+2} ${skills.name}\n`
                }

                const script = tempScript + skillScript;
                const field = 'attackChoice';
                PVP.to(user[y][1].socketId).emit('fieldScriptPrint', { field, script });
                skillScript = '';
                }
            }, 1500);
            
        }
    }

    pickSkillValidayion(req: Request, res: Response, next: NextFunction) {
        const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;
        const [CMD1, CMD2]: string[] = CMD.trim().split(' ');

        const pvpRoom = rooms.get(userStatus!.pvpRoom!);
        const myStatus = pvpRoom!.get(userInfo!.name)

        if (myStatus!.target === 'none' || myStatus!.target === 'dead') {
            const request = { body: { socketId, CMD: '관전 중에는 입력하지 못합니다.', userInfo, userStatus, option: 'attackChoice' }};
            pvpController.wrongCommand(request as Request, res, next);
            return undefined;
        }
        if (!CMD2) {
            const request = { body: { socketId, CMD, userInfo, userStatus, option: 'attackChoice' }};
            pvpController.wrongCommand(request as Request, res, next);
            return undefined;
        }
        if (CMD1==='1' && CMD2 !== '기본공격') {
            const request = { body: { socketId, CMD: CMD2, userInfo, userStatus, option: 'attackChoice' }};
            pvpController.wrongCommand(request as Request, res, next);
            return undefined;
        }
        if (CMD1==='1' && CMD2 === '기본공격') {
            return pvpRoom!.get(userInfo!.name)!.selectSkill = CMD2;
        }
        if (!userStatus!.skill[Number(CMD1)-2]) {
            const request = { body: { socketId, CMD: CMD2, userInfo, userStatus, option: 'attackChoice' }};
            pvpController.wrongPickSkills(request as Request, res, next);
            return undefined;
        }
        if (userStatus!.skill[Number(CMD1)-2].name !== CMD2) {
            const request = { body: { socketId, CMD: CMD2, userInfo, userStatus, option: 'attackChoice' }};
            pvpController.wrongPickSkills(request as Request, res, next);
            return undefined;
        }
        return myStatus!.selectSkill = CMD2;
    }

    pickSkill(req: Request, res: Response, next: NextFunction) {
        const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;
        const pvpRoom = rooms.get(userStatus!.pvpRoom!)
        const user = [...pvpRoom!]

        pvpRoom!.get(userStatus!.name)!.selectSkill = CMD!.trim().split(' ').pop();

        // 선택한 스킬 push
        const selectSkills: string[] = [];
        for (let i = 0; i < maxUsers; i++) {
            selectSkills.push(user[i][1].selectSkill!)
        }

        // undefined인 값 제거
        const skills = selectSkills.filter(names => names !== undefined)

        // 모두 선택시 다음로직으로 보내준다.
        if (skills.length === maxUsers) {
            const request = { body: { socketId, CMD, userInfo, userStatus }};
            pvpController.pvpFight(request as Request, res, next);
        }
    }

    arranging(userStatus: UserStatus): pvpResult {

        const roomName = userStatus!.pvpRoom;
        const pvpRoom = rooms.get(roomName!)
        const user = [...pvpRoom!]

        const userNames: string[] = [];
        const target: string[] = [];
        const selectSkills: string[] = [];
        const multiples:number[] = [];
        const attacks:number[] = [];

        for (let i = 0; i < maxUsers; i++) {
            userNames.push(user[i][1].userStatus!.name)
            target.push(user[i][1].target!)
            selectSkills.push(user[i][1].selectSkill!)
        }

        for (let i = 0; i < maxUsers; i++) {
            const characters = pvpRoom!.get(userNames[i])!.userStatus
            attacks.push(characters!.attack);
            for (let y = 0; y < characters!.skill.length; y++) {
                const skill = characters!.skill[y]
                if (selectSkills[i]==='기본공격') multiples.push(100)
                else if (skill.name === selectSkills[i]) multiples.push(skill.multiple)
            }
        }
        const realDamage = attacks.map((_, i)=> this.hitStrength(attacks[i] * multiples[i] / 100))
        for (let i = 0; i < maxUsers; i++) {
            if (target[i] === 'dead') continue;
            const characters = pvpRoom!.get(target[i])!.userStatus
            characters!.hp -= realDamage[i];
        } 

        return { realDamage, target, userNames, roomName }
    }

    pvpResult({ realDamage, target, userNames, roomName }: pvpResult) {
        const pvpRoom = rooms.get(roomName!)
        const user = [...pvpRoom!]

        const teamA: number[] = [];
        const teamB: number[] = [];
        for (let i = 0; i < maxUsers; i++) {
            const characters = pvpRoom!.get(userNames[i])!.userStatus
            
            // hp가 0이하일시 0으로 update
            if (characters!.hp < 0) {
                characters!.hp = 0;
                user[i][1].selectSkill = 'dead';
                user[i][1].target = 'dead';
            } 
            if (i < 2) teamA.push(characters!.hp)
            else teamB.push(characters!.hp)
        }
        
        // 팀 전멸 여부 확인
        const isDifA = teamA.reduce((a: number, b: number) => a + b, 0) === 0
        const isDifB = teamB.reduce((a: number, b: number) => a + b, 0) === 0

        // 타겟으로 지정한 대상 + 적용될 스킬과 데미지 출력
        setTimeout(() => {
            let damageScript: string = ``;
            for (let i = 0; i < maxUsers; i++) {
                // const characters = pvpRoom!.get(userNames[i])
                if (user[i][1].target === 'dead') {
                    PVP.to(user[i][1].socketId).emit('fieldScriptPrint', { field: 'attackChoice', script: '\n당신은 사망하였습니다.\n' });
                    PVP.to(user[i][1].socketId).emit('printBattle', { field: 'attackChoice', script: '', userStatus: user[i][1].userStatus });
                    continue;
                }
                damageScript += `${user[i][1].userStatus!.name}이(가) ${target[i]}에게 ${realDamage[i]}의 데미지를 입혔다 ! \n`;
                PVP.to(user[i][1].socketId).emit('printBattle', { field: 'attackChoice', script: '', userStatus: user[i][1].userStatus })
            }
            PVP.to(roomName!).emit('fieldScriptPrint', { field: 'attackChoice', script: damageScript})
        }, 1500)

        // 한 쪽팀 전멸시 로직 실행
        if (isDifA || isDifB) {
            setTimeout(() => {
                const tempLine = '=======================================================================\n\n';
                let tempScript: string = '';
                let isWinner: string = '';
                if (isDifB) isWinner = 'A팀'
                else if (isDifA) isWinner = 'B팀'
                tempScript += `\n${isWinner}이(가) 승리했다네 !\n\n`;

                const script = tempLine + tempScript + pvpScript.village;
                const field = 'village';

                // 종료 후 모든유저 maxHp까지 회복
                for (let i = 0; i < maxUsers; i++){
                    user[i][1].selectSkill = undefined;
                    user[i][1].target = undefined;
                    const newUserStatus = user[i][1].userStatus!;
                    newUserStatus.hp = newUserStatus.maxhp;
                    PVP.to(user[i][1]!.socketId).emit('printBattle', { field, script, userStatus: newUserStatus })
                }
                // socket room 나가기 및 방목록 삭제
                rooms.delete(roomName!)
                this.destroyRoom(roomName!)
            }, 3000);
            return { where: 'exit', script: '', field: '' }
        }

        const script = '';
        const field = 'enemyChoice';


        // userStatus에 저장된값 초기화 후 공격할 유저 선택하는 로직실행.
        for (let i = 0; i < maxUsers; i++) {
            // 사망또는 관전유저 그대로
            if (user[i][1].selectSkill === 'dead' || user[i][1].target === 'dead') continue;
            
            // 사망하지 않은 유저에 대해서만 초기화 진행
            user[i][1].selectSkill = undefined;
            user[i][1].target = undefined;
        }
        return { where: 'continue', script, field }        
    }
}

export default new PvpService();