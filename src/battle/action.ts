import { Characters, Monsters } from "../db/models";
import { UserSession } from "../interfaces/user";
import { CharacterService, BattleService } from "../services";
import redis from '../db/redis/config';
import { battleLoops } from './encounter.Handler';
import battle from '../battle'


interface SkillForm {
    name: string;
    multiple: number;
    cost: number;
}

class BattleAction {
    actionSkill = async(CMD: string, user: UserSession) => {
        let tempScript = '';
        let dead = '';
        let field = 'action';

        const { attack, mp, skill } = await Characters.findByPk(user.characterId);
        if (skill[Number(CMD)-1] === undefined) {
            const result = battle.wrongCommand(CMD, user);
            return {
                script: result.script,
                user: result.user,
                field: result.field,
                error: true
            }
        }
        const { name: skillName, cost, multiple } = skill[Number(CMD)-1];
        
        const { monsterId } = await redis.hGetAll(String(user.characterId));
        const { name: monsterName, hp: monsterHp, exp: monsterExp } = await Monsters.findByPk(monsterId) || {};


        if (mp - cost < 0) {
            tempScript += `??? : 비전력이 부조카당.\n`;

            const script = tempScript;
            return { script, user, field };
        }

        // 스킬 데미지 계산
        const playerSkillDamage: number = Math.floor(
            (attack * multiple) / 100,
        );
        const realDamage: number =
            BattleService.hitStrength(playerSkillDamage);

        // 스킬 Cost 적용
        user = await Characters.refreshStatus(+user.characterId, 0, cost) || user;

        tempScript += `\n당신의 ${skillName} 스킬이 ${monsterName}에게 적중! => ${realDamage}의 데미지!\n`;

        // 몬스터 데미지 적용
        if (+monsterHp! - realDamage > 0) {
            console.log('몬스터 체력 감소 반영');
            await Monsters.changeMonsterStatus(+monsterId, realDamage);
        } else {
            console.log('몬스터 사망');
            await Monsters.destroyMonster(+monsterId);
            await redis.hDel(String(user.characterId), 'monsterId');
            tempScript += `\n${monsterName} 은(는) 쓰러졌다 ! => Exp + ${monsterExp}\n`;
            clearInterval(battleLoops[user.characterId]);
console.log('LOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOP CLEARED')

            field = 'encounter';
            dead = 'monster';
            user = await Characters.addExp(user.characterId, monsterExp!) || user;
            // 레벨 업 이벤트 발생
            if (user.levelup) {
                tempScript += `\n==!! LEVEL UP !! 레벨이 ${
                    user.level - 1
                } => ${user.level} 올랐습니다 !! LEVEL UP !!==\n\n`;

                // const { script, user: reUser, field } = await battle.reEncounter('', user);

                // tempScript += script;
                return { script: tempScript, user, field };
            }
        }

        const script = tempScript;
        return { script, user, field, dead };

    }
}


export default new BattleAction();