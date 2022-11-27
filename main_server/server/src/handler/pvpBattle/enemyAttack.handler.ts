import { Socket } from 'socket.io';
import { io } from '../../app';
import { BattleService } from '../../services';
import { pvpBattle } from '..';
import { UserInfo, UserStatus } from '../../interfaces/user';
import { pvpUsers, roomName, rooms } from './pvpList.handler'; 
import { Characters, Skills } from '../../db/models';
import { enemyChoice } from '../../controller/pvpBattle.controller';
import { selectSkills } from './attackChoice.handler';

export default {
    enemyAttackhelp: (socket: Socket, CMD: string | undefined, userInfo: UserInfo, userStatus: UserStatus) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        tempScript += '명령어 : \n';
        tempScript += '공격할 유저의 번호를 선택하세요.\n';
        tempScript += '[돌]아가기 - 이전 단계로 돌아갑니다.\n';

        const script = tempLine + tempScript;
        const field = 'enemyAttack';

        socket.emit('printBattle', { field, script, userInfo, userStatus });
    },

    enemyAttack: async (socket: Socket, CMD: string | undefined, userInfo: UserInfo, userStatus: UserStatus) => {
        const userNames = [...pvpUsers];
        const multiples:number[] = [];
        const attacks:number[] = [];

        for (let i = 0; i < selectSkills.size; i++) {
           const characters = await Characters.findOne({where:{name:userNames[i]!}});
           attacks.push(characters!.attack);
           let skill = await Skills.findOne({where:{name:selectSkills.get(userNames[i])}});
           !skill ? multiples.push(100) : multiples.push(skill!.multiple);
        //    if (!skill) multiples.push(1)
        //    else multiples.push(skill!.multiple);
        }

        // 여기서 미리 해야할 것.
        // 타겟캐릭터 체력과 적용될 스킬과 데미지가 이루어져야 한다.
        // 스킬 데미지 계산
        const playerSkillDamage: number[] = [];
        for (let i = 0; i < userNames.length; i++) playerSkillDamage.push(Math.floor((attacks[i]! * multiples[i]!) / 100));

        const realDamage: number[] = [];
        for (let i = 0; i < userNames.length; i++) realDamage.push(BattleService.hitStrength(playerSkillDamage[i]));

        for (let i = 0; i < userNames.length; i++) await Characters.increment({hp:-realDamage[i]},{where:{name:enemyChoice.get(userNames[i]!)}})
        
        // 1. 사망한 유저 처리
        // for (let i = 0; i < userNames.length; i++) {
        //     if (rooms.get(roomName)[i].userStatus.hp <= 0) {
        //         let tempScript: string = '';
        //         const tempLine =
        //             '=======================================================================\n\n';
        //         const script = tempLine + tempScript;
        //         const field = 'enemyChoice';
        //         io.to(roomName!).emit('fieldScriptPrint', { field, script });
        //         return pvpBattle.userLeave(socket, '', userInfo)
        //     }
        // }

        // 2. 종료 후 모든유저 maxHp까지 회복

        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n\n';
        
        // 타겟으로 지정한 대상 + 적용될 스킬과 데미지 출력
        for (let i = 0; i < userNames.length; i++){
            tempScript += `${userNames[i]}가 ${enemyChoice.get(userNames[i])}에게 ${realDamage[i]}의 데미지를 입혔다 ! \n`;
        }

        const script = tempLine + tempScript;
        const field = 'enemyChoice';

        io.to(roomName!).emit('fieldScriptPrint', { field, script });

        for (let i = 0; i < pvpUsers.size; i++) {
            enemyChoice.delete(userNames[i])
            selectSkills.delete(userNames[i])
        }
        pvpBattle.pvpStart(socket, CMD, userInfo)
    },
}
