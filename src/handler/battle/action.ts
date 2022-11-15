import { socket } from '../../socket.routes';
import { BattleService, CharacterService, MonsterService } from '../../services';
import { battleCache, redis } from '../../db/cache';
import { Skills } from '../../db/models';
import { battle, dungeon } from '../../handler'
import { UserSession } from '../../interfaces/user';
import { ReturnScript, CommandRouter } from '../../interfaces/socket';


class BattleAction {
    attack = async(CMD: string | undefined, user: UserSession) => {
        const whoIsDead: CommandRouter = {
            // back to dungeon list when player died
            player: dungeon.getDungeonList,
            // back to encounter phase when monster died
            monster: battle.reEncounter,
        }
        const characterId = user.characterId.toString();

        const autoAttackId = setInterval(async () => {
            battleCache.set(characterId, { autoAttackId });
            const { script, field, user: newUser, error } = await battle.autoAttack(CMD, user);
            if (error) return;
            socket.emit('printBattle', { script, field, user: newUser });

            // const { dead } = battleCache.get(characterId);
            const { dead } = await redis.hGetAll(characterId);
            // dead = 'moster'|'player'|undefined
            if (dead) {
                redis.hDelResetCache(characterId);
                const { autoAttackId } = battleCache.get(characterId)
                clearInterval(autoAttackId);
                battleCache.delete(characterId);

                const result = await whoIsDead[dead]('', newUser);
                socket.emit('print', result);

                return;
            }
        }, 1500);

        return { script: '', user, field: 'action', cooldown: Date.now()-2000 }
    }

    actionSkill = async(CMD: string, user: UserSession): Promise<ReturnScript> => {
        let tempScript = '';
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
        const { monsterId } = await redis.hGetAll(characterId);
        // const { monsterId } = battleCache.get(characterId);
        const monster = await MonsterService.findByPk(monsterId);
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
        user = await CharacterService.refreshStatus(characterId, 0, cost, monsterId);

        tempScript += `\n당신의 ${skillName} 스킬이 ${monsterName}에게 적중! => ${realDamage}의 데미지!\n`;

        // 몬스터에게 스킬 데미지 적용 
        const isDead = await MonsterService.refreshStatus(monsterId, realDamage, characterId);
        if (!isDead) throw new Error('몬스터 정보를 찾을 수 없습니다');

        if (isDead === 'dead') {
            console.log('몬스터 사망');
            // battleCache.set(characterId, { dead: 'monster' });
            await redis.hSet(characterId, { dead: 'monster' });
            return await battle.resultMonsterDead(monster, tempScript);
        }

        // isDead === 'alive'
        const script = tempScript;
        return { script, user, field };
    }

    autoBattleSkill = async (user: UserSession) => {
        const { characterId, mp } = user
        let field = 'autoBattle';
        let tempScript = '';

        // 스킬 정보 가져오기 & 사용할 스킬 선택 (cost 반비례 확률)
        const { attack, skill } = await CharacterService.findByPk(characterId);
        const selectedSkill = battle.skillSelector(skill);
        const { name: skillName, cost: skillCost, multiple } = selectedSkill;

        // 몬스터 정보 가져오기
        const { monsterId } = await redis.hGetAll(characterId);
        const monster = await MonsterService.findByPk(monsterId);
        if (!monster) throw new Error('몬스터 정보가 없습니다.');
        const { name: monsterName, hp: monsterHp, exp: monsterExp } = monster;

        // 마나 잔여량 확인
        if (mp - skillCost < 0) {
            tempScript += `??? : 비전력이 부조카당.\n`;
            const script = tempScript;
            return { script, user, field };
        }

        // 스킬 데미지 계산 & 마나 cost 소모
        const playerSkillDamage: number = Math.floor(
            (attack * multiple) / 100,
        );
        const realDamage: number = BattleService.hitStrength(playerSkillDamage);
        user = await CharacterService.refreshStatus(characterId, 0, skillCost, monsterId);

        // 몬스터에게 스킬 데미지 적중
        const isDead = await MonsterService.refreshStatus(monsterId, realDamage, characterId);
        if (!isDead) throw new Error('몬스터 정보를 찾을 수 없습니다');
        tempScript += `\n당신의 ${skillName} 스킬이 ${monsterName}에게 적중! => ${realDamage}의 데미지!\n`;

        if (isDead === 'dead') {
            console.log('몬스터 사망');
            // battleCache.set(characterId, { dead: 'monster' });
            await redis.hSet(characterId, { dead: 'monster' });
            return await battle.resultMonsterDead(monster, tempScript);
        }

        // isDead === 'alive'
        const script = tempScript;
        return { script, user, field };
    }

    skillSelector = (skill: Skills[]) => {
        const skillCounts = skill.length;
        const skillCosts = skill.map((s: Skills)=>s.cost);        
        const costSum = skillCosts.reduce((a: number, b: number)=>a+b, 0);
        const chanceSum = skillCosts.reduce((a: number, b: number) => {
            return a + costSum/b
        }, 0);

        const chance = Math.random();
        let skillIndex = 0;
        let cumChance =  0;
        for (let i=0; i<skillCounts; i++) {
            const singleChance = (costSum / skillCosts[i]) / chanceSum
            cumChance += singleChance;
            console.log(chance, cumChance)
            if (chance <= cumChance) {
                skillIndex = i;
                break;
            }
        }

        return skill[skillIndex];
    }

    run = async (CMD: string | undefined, user: UserSession) => {
        console.log('도망 실행');
        const characterId = user.characterId.toString();
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        tempScript += `... 몬스터와 눈이 마주친 순간,\n`;
        tempScript += `당신은 던전 입구를 향해 필사적으로 뒷걸음질쳤습니다.\n\n`;
        tempScript += `??? : 하남자특. 도망감.\n\n`;
        tempScript += `목록 - 던전 목록을 불러옵니다.\n`;
        tempScript += `입장 [number] - 선택한 번호의 던전에 입장합니다.\n\n`;

        // 몬스터 삭제
        // await MonsterService.destroyMonster(Number(dungeonSession.monsterId));
        redis.hDelBattleCache(characterId);
        battleCache.delete(characterId);

        const script = tempLine + tempScript;
        const field = 'dungeon';
        return { script, user, field };
    }
}


export default new BattleAction();