import { Request, Response, NextFunction } from "express";
import { pvpController } from "../controllers";
import { maxUsers, pvpRoomList } from "../controllers/pvp.controller";
import { Characters, Skills } from "../db/models";
import { PostBody } from "../interfaces/common";
import { Arranging, PvpPlayer, pvpResult } from '../interfaces/pvp'
import { UserStatus } from "../interfaces/user";

export const rooms: Map<string, Map<string, PvpPlayer>> = new Map<string, Map<string, PvpPlayer>>();

class PvpService {

    hitStrength(damage: number): number {
        const hitStrength = Math.floor(Math.random() * 40) + 80;
        return Math.floor((damage * hitStrength) / 100);
    }

    existRoom(CMD: string) {
        const roomName: string = `pvpRoom ${CMD}`;

        if (rooms.get(roomName)) return 'Exist Room'
        return undefined;
    }

    createRoom(CMD: string) {
        const roomName: string = `pvpRoom ${CMD}`;

        return rooms.set(roomName, new Map());
    }

    async pvpStart(roomName: string) {
        let script: string = `=======================================================================\n\n`;
        const names: string[] = [];
        const pvpRoom = rooms.get(roomName!);
        const iterator = pvpRoom!.values();
        for (let i = 0; i < maxUsers; i++) {
            names.push(iterator.next().value.userStatus.name)
        }

        // 캐릭터별 이름, 레벨, 체력, 공격력, 방어력 표시
        const userInfos: Characters[] = await Characters.findAll({ where: {name: names}})

        script += `샤크스 경 : \n공격할 유저를 선택하게나 !\n\n`

        for (let i = 0; i < maxUsers; i++) {
            if (userInfos[i]!.hp === 0) continue;
            script += `${i+1}. Lv${userInfos[i]!.level} ${names[i]} - hp: ${userInfos[i]!.hp}/${userInfos[i]!.maxhp}, attack: ${userInfos[i]!.attack}, defense: ${userInfos[i]!.defense}\n`;
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

    async targetValidation(req: Request, res: Response, next: NextFunction): Promise<string|undefined> {
        console.log('targetValidation')
        const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;
        const roomName = userStatus!.pvpRoom;
        const userNames: string[] = [];
        const pvpRoom = rooms.get(roomName!);
        const isDead = pvpRoom!.get(userInfo!.username)!.target;

        // 사망한 유저인지 확인
        if (isDead === 'none' || isDead === 'dead') {
            const request = { body: { socketId, CMD: '관전 중에는 입력하지 못합니다.', userInfo, userStatus, option: 'enemyChoice' }};
            pvpController.wrongCommand(request as Request, res, next);
            return undefined;
        } 

        // 본인 선택시 예외처리로직 시작
        const iterator = pvpRoom!.values();
        for (let i = 0; i < maxUsers; i++) {
            userNames.push(iterator.next().value.userStatus.name);
        }
        
        // 본인의 index를 확인
        const myIndex = userNames.findIndex((e)=>e===userStatus!.name);
        
        // 유저가 속한 팀이아닌 상대팀만을 선택
        if (myIndex < 2 && Number(CMD)-1 < 2) {
            const request = { body: { socketId, CMD, userInfo, userStatus, option: 'enemyChoice' }};
            pvpController.targetWrong(request as Request, res, next);
            return undefined;
        } else if (myIndex >= 2 && Number(CMD)-1 >= 2) {
            const request = { body: { socketId, CMD, userInfo, userStatus, option: 'enemyChoice' }};
            pvpController.targetWrong(request as Request, res, next);
            return undefined;
        } else if (Number(CMD) > maxUsers) {
            const request = { body: { socketId, CMD, userInfo, userStatus, option: 'enemyChoice' }};
            pvpController.targetWrong(request as Request, res, next);
            return undefined;
        }
        
        // 이미 사망한 유저를 선택하지 못한다.
        const dontSelect = await Characters.findOne({ where: { name: userNames[Number(CMD)-1] }})
        if (dontSelect!.hp === 0) {
            const request = { body: { socketId, CMD, userInfo, userStatus, option: 'enemyChoice' }};
            pvpController.targetWrong(request as Request, res, next);
            return undefined;
        }
        return pvpRoom!.get(userInfo!.username)!.target = userNames[Number(CMD)-1];
    }

    // resultTarget(req: Request, res: Response, next: NextFunction):string {
    //     console.log('resultTargetScript')
    //     const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;
    //     const roomName = userStatus!.pvpRoom;

    //     const users: string[] = []
    //     const targets: string[] = []
    //     const pvpRoom = rooms.get(roomName!)
    //     const user = [...pvpRoom!]

    //     for (let i = 0; i < maxUsers; i++) {
    //         users.push(user[i][1].userStatus!.name)
    //         targets.push(user[i][1].target!)
    //     }

    //     let tempScript: string = '';
    //     const tempLine =
    //         '=======================================================================\n\n';

    //     tempScript += '샤크스 경 :\n';

    //     // 선택한 유저목록을 보여준다.
    //     for (let i = 0; i < maxUsers; i++){
    //         if (targets[i] === 'none' || targets[i] === 'dead') continue;
    //         tempScript += `${users[i]}가 ${targets[i]}를 지목 했다네 !\n`;
    //     }

    //     // 사망하지 않은 유저에게만 스킬 목록출력
    //     const isDead = pvpRoom!.get(userInfo!.username)!.selectSkill
    //         tempScript += '\n 어떤 공격을 할텐가 ?\n';
    //         tempScript += '\n 중간 공백을 포함해서 입력해주게 !\n';

    //         tempScript += `1 기본공격\n`;

    //         let skillScript: string = '';

    //         // 유저별로 선택할 수 있는 목록을 보여준다.
    //         for (let y=0; y < maxUsers; y++){
    //             for (let i = 0; i < user[y][1].userStatus!.skill.length; i++) {
    //                 if (isDead === 'none' || isDead === 'dead') {
    //                     tempScript = `관전 중에는 입력하지 못합니다.\n`;
    //                     continue;
    //                 } 
    //                 let skills = user[y][1].userStatus!.skill[i]
    //                     skillScript += `${i+2} ${skills.name}\n`
    //             }
    //         }
    //         return tempLine + tempScript + skillScript;
    // }

    pickSkillValidayion(req: Request, res: Response, next: NextFunction): string|undefined {
        const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;
        const [CMD1, CMD2]: string[] = CMD.trim().split(' ');

        const pvpRoom = rooms.get(userStatus!.pvpRoom!);
        const isDead = pvpRoom!.get(userInfo!.username)!.target

        if (isDead === 'none' || isDead === 'dead') {
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
            return pvpRoom!.get(userInfo!.username)!.selectSkill = CMD2;
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
        return pvpRoom!.get(userInfo!.username)!.selectSkill = CMD2;
    }

    pickSkill(req: Request, res: Response, next: NextFunction): void {
        const { socketId, CMD, userInfo, userStatus }: PostBody = req.body;
        const roomName = userStatus!.pvpRoom;
        const selectSkills: string[] = [];
        const pvpRoom = rooms.get(roomName!)
        const user = [...pvpRoom!]

        pvpRoom!.get(userStatus!.username)!.selectSkill = CMD!.trim();

        // 선택한 스킬 push
        for (let i = 0; i < 4; i++) {
            selectSkills.push(user[i][1].selectSkill!)
        }

        // undefined인 값 제거
        const skills = selectSkills.filter(names => names !== undefined)

        // 모두 선택시 다음로직으로 보내준다.
        if (skills.length === 4) {
            const request = { body: { socketId, CMD, userInfo, userStatus }};
            pvpController.pvpfight(request as Request, res, next);
        }
    }

    async arranging(req: Request, res: Response, next: NextFunction): Promise<Arranging> {
        const { socketId, CMD, userInfo, userStatus, option }: PostBody = req.body;

        const roomName = userStatus!.pvpRoom;
        const userNames: string[] = [];
        const target: string[] = [];
        const selectSkills: string[] = [];
        const pvpRoom = rooms.get(roomName!)
        const user = [...pvpRoom!]

        for (let i = 0; i < maxUsers; i++) {
            userNames.push(user[i][1].userStatus!.name)
            target.push(user[i][1].target!)
            selectSkills.push(user[i][1].selectSkill!)
        }

        const multiples:number[] = [];
        const attacks:number[] = [];

        for (let i = 0; i < maxUsers; i++) {
        const characters = await Characters.findOne({ where: { name:userNames[i]! }});
        attacks.push(characters!.attack);
        let skill = await Skills.findOne({ where: {name: selectSkills[i] }});
        !skill ? multiples.push(100) : multiples.push(skill!.multiple);
        //    if (!skill) multiples.push(100)
        //    else multiples.push(skill!.multiple);
        }

        return { multiples, attacks, target, userNames, roomName }
    }

    

    async playerSkillDamage({ multiples, attacks, target, userNames, roomName }: Arranging) {
        const pvpRoom = rooms.get(roomName!)
        const user = [...pvpRoom!]
        const playerSkillDamage: number[] = [];
        for (let i = 0; i < maxUsers; i++) playerSkillDamage.push(Math.floor((attacks[i]! * multiples[i]!) / 100));

        const realDamage: number[] = [];
        for (let i = 0; i < maxUsers; i++) realDamage.push(this.hitStrength(playerSkillDamage[i]));

        for (let i = 0; i < maxUsers; i++) await Characters.increment({ hp:-realDamage[i] }, { where: { name:target[i] }})
        
        const teamA: number[] = [];
        const teamB: number[] = [];
        for (let i = 0; i < maxUsers; i++) {
            const characters = await Characters.findOne({ where: { name: userNames[i]! }})
            
            // hp가 0이하일시 0으로 update
            if (characters!.hp <= 0) {
                characters!.update({ hp: 0 }, { where: { name: userNames[i]! }});
                user[i][1].selectSkill = 'dead';
                user[i][1].target = 'dead';
                console.log(`사망한 유저입니다 !!! ${user[i][0]} ${user[i][1].selectSkill}`)
                console.log(`사망한 유저입니다 !!! ${user[i][0]} ${user[i][1].target}`)
            } 
            if (i < 2) teamA.push(characters!.hp)
            else teamB.push(characters!.hp)
        }

        return { teamA, teamB, target, userNames, realDamage }
    }

    async pvpResult({ teamA, teamB, target, userNames, realDamage, roomName }: pvpResult) {
        const pvpRoom = rooms.get(roomName!)
        const user = [...pvpRoom!]
        // 팀 전멸 여부 확인
        const isDifA = teamA.reduce((a: number, b: number) => a + b, 0) === 0
        const isDifB = teamB.reduce((a: number, b: number) => a + b, 0) === 0

        let tempScript: string = '';

        // 타겟으로 지정한 대상 + 적용될 스킬과 데미지 출력
        for (let i = 0; i < maxUsers; i++){
            if (target[i] === 'dead') continue;
            tempScript += `${userNames[i]}가 ${target[i]}에게 ${realDamage[i]}의 데미지를 입혔다 ! \n`;
        }
        const tempLine =
            '=======================================================================\n\n';

        // 한 쪽팀 전멸시 로직 실행
        if (isDifA || isDifB) {
            let isWinner: string = '';
            if (isDifB) isWinner += 'A팀'
            else if (isDifA) isWinner += 'B팀'
            tempScript += `\n${isWinner}이(가) 승리했다네 !\n\n`;
            tempScript += '=======================================================================\n\n';
            tempScript += `방문할 NPC의 번호를 입력해주세요.\n\n`;
            tempScript += `1. 프라데이리 - 모험의 서\n\n`;
            tempScript += `2. 아그네스 - 힐러의 집\n\n`;
            tempScript += `3. 퍼거스 - 대장장이\n\n`;
            tempScript += `4. 에트나 - ???\n\n`;
            tempScript += `5. 샤크스 경 - 시련의 장 관리인\n\n`

        const script = tempLine + tempScript;
        const field = 'village';

        // 종료 후 모든유저 maxHp까지 회복
        for (let y = 0; y < maxUsers; y++){
            const characterHp = await Characters.findOne({ where: { name: userNames[y]! }})

            // hp를 max로 채워주고 userStatus에 저장된값 초기화.
            // 사망한 유저는 고른 스킬과 고른 유저가 dead이 된다.
            characterHp!.update({ hp: characterHp!.maxhp },{ where: {name: userNames[y]! }})
            user[y][1].selectSkill = undefined;
            user[y][1].target = undefined;
        }
        // socket room 나가기 및 방목록 삭제
        rooms.delete(roomName!)
        this.destroyRoom(roomName!)
        return { where: 'exit', script, field }
        }

        const script = tempLine + tempScript;
        const field = 'enemyChoice';


        // userStatus에 저장된값 초기화 후 공격할 유저 선택하는 로직실행.
        for (let i = 0; i < maxUsers; i++) {
            // 사망또는 관전유저 그대로
            if (user[i][1].selectSkill === 'none' || user[i][1].target === 'none') continue;
            if (user[i][1].selectSkill === 'dead' || user[i][1].target === 'dead') continue;
            
            // 사망하지 않은 유저에 대해서만 초기화 진행
            user[i][1].selectSkill = undefined;
            user[i][1].target = undefined;
        }
        return { where: 'continue', script, field }
    }
}

export default new PvpService();