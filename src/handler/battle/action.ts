import { Monsters } from "../../db/models";
import { UserSession } from "../../interfaces/user";
import { BattleService, CharacterService, MonsterService } from "../../services";
import redis from '../../db/redis/config';
import { battleLoops } from './encounter.Handler';
import battle from '../battle'
import { ReturnScript } from "../../interfaces/socket";


class BattleAction {
    actionSkill = async(CMD: string, user: UserSession): Promise<ReturnScript> => {
        let tempScript = '';
        let dead = undefined;
        let field = 'action';
        const { characterId } = user;

        // 스킬 정보 가져오기
        const { attack, mp, skill } = await CharacterService.findByPk(characterId);
        if (skill[Number(CMD)-1] === undefined) {
            const result = battle.battleHelp(CMD, user);
            return {
                script: result.script,
                user: result.user,
                field: result.field,
                error: true
            }
        }
        const { name: skillName, cost, multiple } = skill[Number(CMD)-1];
        
        // 몬스터 정보 가져오기
        const { monsterId } = await redis.hGetAll(String(characterId));
        const monster = await Monsters.findByPk(monsterId);
        if (!monster) throw new Error('몬스터 정보가 없습니다.');
        /**
         * 몬스터 정보 없을시 에러가 아닌 일반 공격에 의한 사망으로 간주
         * 혹은 버그/사망 판별 가능?
         */
        const { name: monsterName, hp: monsterHp, exp: monsterExp } = monster;

        // 마나 잔여량 확인
        if (mp - cost < 0) {
            tempScript += `??? : 비전력이 부조카당.\n`;
            const script = tempScript;
            return { script, user, field };
        }

        // 스킬 데미지 계산
        const playerSkillDamage: number = Math.floor(
            (attack * multiple) / 100,
        );
        const realDamage: number = BattleService.hitStrength(playerSkillDamage);

        // 스킬 Cost 적용
        user = await CharacterService.refreshStatus(characterId, 0, cost, +monsterId);

        tempScript += `\n당신의 ${skillName} 스킬이 ${monsterName}에게 적중! => ${realDamage}의 데미지!\n`;

        // 몬스터에게 스킬 데미지 적용 
        const isDead = await MonsterService.refreshStatus(+monsterId, realDamage, characterId);
        if (!isDead) throw new Error('몬스터 정보를 찾을 수 없습니다');

        if (isDead === 'dead') {
            console.log('몬스터 사망');

            console.log('LOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOP CLEARED');

            return await battle.resultMonsterDead(monster, tempScript);
        }

        const script = tempScript;
        return { script, user, field, dead };

    }
}


export default new BattleAction();