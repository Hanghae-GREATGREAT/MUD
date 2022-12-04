import { Socket } from 'socket.io';
import { io } from '../../app';
import { pvpBattle } from '..';
import {  maxUsers, rooms } from './pvpList.handler'; 
import { BattleService } from '../../services';
import { publicRooms } from '../npc/pvp.handler';
import { Characters, Skills } from '../../db/models';
import { UserInfo, UserStatus } from '../../interfaces/user';

export default {
    // 선택된 유저와 선택된 스킬로 데미지 적용 및 전투로직 실행
    enemyAttack: async (socket: Socket, CMD: string | undefined, userInfo: UserInfo, userStatus: UserStatus) => {
        const roomName = userStatus.pvpRoom;
        const userNames: string[] = [];
        const target: string[] = [];
        const selectSkills: string[] = [];
        const pvpRoom = rooms.get(roomName!)
        const user = [...pvpRoom!]

        for (let i = 0; i < maxUsers; i++) {
            userNames.push(user[i][1].userStatus.name)
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

        // 타겟캐릭터 체력과 적용될 스킬과 데미지가 이루어진다.
        // 스킬 데미지 계산
        const playerSkillDamage: number[] = [];
        for (let i = 0; i < maxUsers; i++) playerSkillDamage.push(Math.floor((attacks[i]! * multiples[i]!) / 100));

        const realDamage: number[] = [];
        for (let i = 0; i < maxUsers; i++) realDamage.push(BattleService.hitStrength(playerSkillDamage[i]));

        for (let i = 0; i < maxUsers; i++) await Characters.increment({ hp:-realDamage[i] }, { where: { name:target[i] }})
        
        const teamA: number[] = [];
        const teamB: number[] = [];
        for (let i = 0; i < maxUsers; i++) {
            const characters = await Characters.findOne({ where: { name: userNames[i]! }})
            
            // hp가 0이하일시 0으로 update
            if (characters!.hp <= 0) {
                characters!.update({ hp: 0 }, { where: { name: userNames[i]! }});
                // const deadUser = pvpRoom!.get(userNames[i])
                user[i][1].selectSkill = 'dead';
                user[i][1].target = 'dead';
                console.log(`사망한 유저입니다 !!! ${user[i][0]} ${user[i][1].selectSkill}`)
                console.log(`사망한 유저입니다 !!! ${user[i][0]} ${user[i][1].target}`)
            } 
            if (i < 2) teamA.push(characters!.hp)
            else teamB.push(characters!.hp)
        }
        
        // 팀 전멸 여부 확인
        const isDifA = teamA.reduce((a, b) => a + b, 0) === 0
        const isDifB = teamB.reduce((a, b) => a + b, 0) === 0

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
        io.to(userStatus.pvpRoom!).emit('fieldScriptPrint', { field, script });

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
        rooms.delete(userStatus.pvpRoom!)
        publicRooms.delete(roomName!)
        io.socketsLeave(roomName!)
        return;
        }

        const script = tempLine + tempScript;
        const field = 'enemyChoice';

        io.to(userStatus.pvpRoom!).emit('fieldScriptPrint', { field, script });

        // userStatus에 저장된값 초기화 후 공격할 유저 선택하는 로직실행.
        for (let i = 0; i < maxUsers; i++) {
            // 사망또는 관전유저 그대로
            if (user[i][1].selectSkill === 'none' || user[i][1].target === 'none') continue;
            if (user[i][1].selectSkill === 'dead' || user[i][1].target === 'dead') continue;
            
            // 사망하지 않은 유저에 대해서만 초기화 진행
            user[i][1].selectSkill = undefined;
            user[i][1].target = undefined;
        }
        pvpBattle.pvpStart(socket, CMD, userInfo, userStatus)
    },
}
